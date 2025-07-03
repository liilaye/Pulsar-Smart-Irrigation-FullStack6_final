import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Power, PowerOff, Brain } from 'lucide-react';
import { useMQTT } from '@/hooks/useMQTT';
import { useIrrigationStatus } from '@/hooks/useIrrigationStatus';
import { backendService } from '@/services/backendService';
import { toast } from "sonner";
import { irrigationDataService } from '@/services/irrigationDataService';

interface MLRecommendation {
  duree_minutes: number;
  volume_eau_m3: number;
  matt: string;
  status: string;
}

export const SimpleMLControl = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastAction, setLastAction] = useState<string>('');
  const [mlRecommendation, setMLRecommendation] = useState<MLRecommendation | null>(null);
  const [mlInputFeatures, setMLInputFeatures] = useState<number[] | null>(null);
  const [isMLActive, setIsMLActive] = useState(false); // État local ML
  const [isStopping, setIsStopping] = useState(false); // Garde contre double arrêt
  const [mlSessionId, setMLSessionId] = useState<string | null>(null); // ID session pour graphiques
  const [autoStopTimer, setAutoStopTimer] = useState<NodeJS.Timeout | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const { isConnected, publishIrrigationCommand } = useMQTT();
  const irrigationStatus = useIrrigationStatus();

  // L'irrigation est active selon notre état local ET le backend
  const isActive = isMLActive || irrigationStatus.isActive;

  useEffect(() => {
    if (!irrigationStatus.isActive && !isMLActive) {
      setLastAction('Irrigation ML terminée automatiquement');
      // Nettoyer TOUT lors de l'arrêt complet
      cleanupMLState();
    }
  }, [irrigationStatus.isActive, isMLActive]);

  // Fonction de nettoyage centralisée
  const cleanupMLState = () => {
    // Terminer la session graphique si active
    if (mlSessionId) {
      irrigationDataService.endIrrigationSession(mlSessionId);
      setMLSessionId(null);
    }
    
    if (autoStopTimer) {
      clearTimeout(autoStopTimer);
      setAutoStopTimer(null);
    }
    setStartTime(null);
    setIsMLActive(false);
    setIsStopping(false);
  };

  const generateMLRecommendation = async () => {
    setIsLoading(true);
    setLastAction('Génération recommandation ML...');
    
    try {
      console.log('🤖 Génération recommandation ML');
      const features = backendService.getDefaultSoilClimateFeatures();
      const prediction = await backendService.getMLRecommendation(features);
      
      if (prediction && prediction.status === 'ok') {
        setMLRecommendation(prediction);
        setMLInputFeatures(features); // SAUVEGARDER les features pour affichage
        setLastAction(`Recommandation ML: ${Math.floor(prediction.duree_minutes)} minutes`);
        toast.success("Recommandation ML générée", {
          description: `Durée: ${Math.floor(prediction.duree_minutes)} minutes`
        });
      } else {
        setLastAction('Erreur génération ML');
        toast.error("Erreur ML", {
          description: "Impossible de générer la recommandation"
        });
      }
    } catch (error) {
      console.error('❌ Erreur ML:', error);
      setLastAction('Erreur communication ML');
      toast.error("Erreur ML", {
        description: "Problème de communication avec le backend"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartML = async () => {
    if (!mlRecommendation) {
      toast.error("Aucune recommandation", {
        description: "Générez d'abord une recommandation ML"
      });
      return;
    }

    setIsLoading(true);
    setLastAction('Démarrage irrigation ML...');
    
    try {
      console.log(`🚿 Démarrage irrigation ML directe: ${mlRecommendation.duree_minutes} minutes`);
      
      // ENVOI DIRECT MQTT device 1 (comme manuel)
      const mqttSuccess = await publishIrrigationCommand(1);
      
      if (mqttSuccess) {
        // DÉMARRER session irrigation dans le service graphique
        const sessionId = irrigationDataService.startIrrigationSession('ml', 'ml_manual');
        setMLSessionId(sessionId);
        
        setIsMLActive(true); // ACTIVER l'état ML local
        setStartTime(new Date());
        setLastAction(`Irrigation ML active: ${Math.floor(mlRecommendation.duree_minutes)} minutes`);
        toast.success("Irrigation ML démarrée", {
          description: `Durée: ${Math.floor(mlRecommendation.duree_minutes)} minutes`
        });
        
        // PROGRAMMATION ARRÊT AUTOMATIQUE après durée ML prédite
        const durationMs = mlRecommendation.duree_minutes * 60 * 1000;
        const timer = setTimeout(async () => {
          console.log('⏰ Timer ML écoulé - Arrêt automatique');
          if (isMLActive && !isStopping) { // Vérifier avant d'arrêter
            await handleStopML(true); // true = arrêt automatique
          }
        }, durationMs);
        setAutoStopTimer(timer);
        
        console.log(`⏰ Arrêt programmé dans ${mlRecommendation.duree_minutes} minutes`);
      } else {
        setLastAction('Erreur envoi MQTT');
        toast.error("Erreur MQTT", {
          description: "Impossible d'envoyer la commande"
        });
      }
    } catch (error) {
      console.error('❌ Erreur démarrage ML:', error);
      setLastAction('Erreur de communication');
      toast.error("Erreur de communication");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopML = async (isAutoStop = false) => {
    // GARDE : Éviter les doubles appels
    if (isStopping || !isMLActive) {
      console.log('⚠️ Arrêt ML déjà en cours ou pas actif, ignoré');
      return;
    }

    setIsStopping(true); // BLOQUER autres appels
    setIsLoading(true);
    const reason = isAutoStop ? 'Timer ML écoulé' : 'Arrêt manuel';
    setLastAction(`${reason} - Arrêt irrigation ML...`);
    
    try {
      console.log(`⏹️ ${reason} - Arrêt irrigation ML directe`);
      
      // PETIT DÉLAI pour éviter conflits buffer MQTT
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // ENVOI DIRECT MQTT device 0 (comme manuel)
      const mqttSuccess = await publishIrrigationCommand(0);
      
      if (mqttSuccess) {
        // TERMINER la session graphique avec la durée ML effective
        if (mlSessionId) {
          const actualDuration = startTime ? (Date.now() - startTime.getTime()) / (1000 * 60) : mlRecommendation?.duree_minutes;
          irrigationDataService.endIrrigationSession(mlSessionId, actualDuration);
          setMLSessionId(null);
        }
        
        // NETTOYER IMMÉDIATEMENT l'état ML pour éviter conflits
        cleanupMLState();
        
        console.log(`📊 Session ML terminée pour graphiques: ${reason}`);
        setLastAction(`Irrigation ML arrêtée (${reason})`);
        
        setLastAction(`Irrigation ML arrêtée (${reason})`);
        toast.success(`Irrigation ML arrêtée`, {
          description: isAutoStop ? "Durée ML terminée automatiquement" : "Arrêt manuel d'urgence"
        });
      } else {
        // En cas d'échec, réinitialiser quand même l'état
        setIsStopping(false);
        setLastAction(`Erreur arrêt MQTT (${reason})`);
        toast.error("Erreur MQTT - Arrêt ML", {
          description: `Impossible d'envoyer commande d'arrêt (${reason})`
        });
      }
    } catch (error) {
      console.error(`❌ Erreur arrêt ML (${reason}):`, error);
      setIsStopping(false);
      setLastAction(`Erreur système arrêt (${reason})`);
      toast.error("Erreur système ML");
    } finally {
      setIsLoading(false);
      // S'assurer que le flag de protection est nettoyé
      setTimeout(() => setIsStopping(false), 500);
    }
  };

  // Nettoyer TOUS les timers au démontage du composant
  useEffect(() => {
    return () => {
      cleanupMLState();
    };
  }, []);

// Composant Timer simple
const MLTimerSimple = ({ startTime, durationMinutes }: { startTime: Date; durationMinutes: number }) => {
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
      const totalSeconds = durationMinutes * 60;
      const remaining = Math.max(0, totalSeconds - elapsed);
      
      if (remaining === 0) {
        setTimeRemaining('Arrêt imminent...');
        return;
      }
      
      const minutes = Math.floor(remaining / 60);
      const seconds = remaining % 60;
      setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [startTime, durationMinutes]);

  return (
    <span className="text-green-700 font-bold">{timeRemaining}</span>
  );
};

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Irrigation Intelligente ML</span>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
            }`}></div>
            <span className="text-sm text-gray-600">
              {isConnected ? 'Connecté' : 'Déconnecté'}
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Recommandation ML + Timer */}
        {mlRecommendation && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800">Recommandation ML Active</h4>
            <div className="grid grid-cols-2 gap-2 text-sm text-blue-700 mt-2">
              <div>Durée: {Math.floor(mlRecommendation.duree_minutes)} min</div>
              <div>Volume: {mlRecommendation.volume_eau_m3?.toFixed(2)} m³</div>
            </div>
            
            {/* Timer en temps réel si irrigation active */}
            {isMLActive && startTime && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-green-700 font-medium">🚿 Irrigation ML en cours</span>
                  <MLTimerSimple 
                    startTime={startTime} 
                    durationMinutes={mlRecommendation.duree_minutes} 
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* AFFICHAGE PARAMÈTRES ML EN TEMPS RÉEL pendant irrigation */}
        {isMLActive && mlRecommendation && mlInputFeatures && (
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-800">📊 Paramètres ML en Temps Réel</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-3">
              <div>
                <strong className="text-gray-700">Données d'Entrée (15 paramètres):</strong>
                <div className="grid grid-cols-3 gap-1 mt-1 text-xs">
                  <div>Temp Air: {mlInputFeatures[0]}°C</div>
                  <div>Précip: {mlInputFeatures[1]}mm</div>
                  <div>Humid Air: {mlInputFeatures[2]}%</div>
                  <div>Vent: {mlInputFeatures[3]}km/h</div>
                  <div>Culture: {mlInputFeatures[4]}</div>
                  <div>Surface: {mlInputFeatures[5]}m²</div>
                  <div>Temp Sol: {mlInputFeatures[6]}°C</div>
                  <div>Humid Sol: {mlInputFeatures[7]}%</div>
                  <div>EC: {mlInputFeatures[8]}dS/m</div>
                  <div>pH: {mlInputFeatures[9]}</div>
                  <div>N: {mlInputFeatures[10]}mg/kg</div>
                  <div>P: {mlInputFeatures[11]}mg/kg</div>
                  <div>K: {mlInputFeatures[12]}mg/kg</div>
                  <div>Fertilité: {mlInputFeatures[13]}</div>
                  <div>Type Sol: {mlInputFeatures[14]}</div>
                </div>
              </div>
              <div>
                <strong className="text-gray-700">Prédiction ML:</strong>
                <div className="mt-1 text-xs">
                  <div>Durée optimisée: {Math.floor(mlRecommendation.duree_minutes)} minutes</div>
                  <div>Volume calculé: {mlRecommendation.volume_eau_m3?.toFixed(3)} m³</div>
                  <div>Débit moyen: 20 L/min</div>
                </div>
              </div>
            </div>
          </div>
        )}

        <Separator />

        {/* Contrôles */}
        <div className="space-y-4">
          {/* Générer recommandation */}
          <Button
            onClick={generateMLRecommendation}
            disabled={!isConnected || isLoading}
            variant="outline"
            className="w-full h-12"
          >
            {isLoading && !isActive ? (
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <Brain className="h-4 w-4 mr-2" />
            )}
            Générer Recommandation ML
          </Button>

          {/* Démarrer/Arrêter */}
          <div className="flex gap-4">
            <Button
              onClick={handleStartML}
              disabled={!isConnected || isLoading || !mlRecommendation || isMLActive}
              variant="default"
              size="lg"
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
            >
            {isLoading && !isMLActive ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Power className="h-4 w-4 mr-2" />
              )}
              Démarrer ML
            </Button>
            
            <Button
              onClick={() => handleStopML()}
              disabled={!isConnected || isLoading || !isMLActive || isStopping}
              variant="destructive"
              size="lg"
              className="flex-1"
            >
              {isLoading && isMLActive ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <PowerOff className="h-4 w-4 mr-2" />
              )}
              Arrêter ML
            </Button>
          </div>
          
          {/* Statut */}
          <div className="text-center">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              isMLActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
            }`}>
              {isMLActive ? 'IRRIGATION ML EN COURS' : 'IRRIGATION ARRÊTÉE'}
            </div>
            {lastAction && (
              <div className="text-xs text-gray-500 mt-2">
                {lastAction}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};