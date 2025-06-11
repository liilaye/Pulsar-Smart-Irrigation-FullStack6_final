import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, Wheat, Play, Square, Zap } from 'lucide-react';
import { api } from '@/services/apiService';
import { irrigationSyncService } from '@/services/irrigationSyncService';
import { irrigationDataService } from '@/services/irrigationDataService';
import { useToast } from '@/hooks/use-toast';

interface MLIrrigationStatus {
  isActive: boolean;
  currentRecommendation?: {
    duree_minutes: number;
    volume_eau_m3: number;
    type_culture: string;
    perimetre_m2: number;
  };
}

export const MLIrrigationControl = () => {
  const [mlStatus, setMLStatus] = useState<MLIrrigationStatus>({
    isActive: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [conflictMessage, setConflictMessage] = useState<string>('');
  const [activeDuration, setActiveDuration] = useState<number>(0);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // S'abonner aux changements d'état global
    const unsubscribe = irrigationSyncService.subscribe((state) => {
      setMLStatus(prev => ({
        ...prev,
        isActive: state.isActive && state.type === 'ml'
      }));
      
      if (state.isActive && state.type === 'ml') {
        setActiveDuration(irrigationSyncService.getActiveDuration());
      } else {
        setActiveDuration(0);
      }
      
      // Effacer le message de conflit si irrigation arrêtée
      if (!state.isActive) {
        setConflictMessage('');
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    // Mettre à jour la durée active toutes les secondes
    const interval = setInterval(() => {
      if (mlStatus.isActive) {
        setActiveDuration(irrigationSyncService.getActiveDuration());
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [mlStatus.isActive]);

  const startMLIrrigation = async () => {
    // Vérifier si on peut démarrer
    const { canStart, reason } = irrigationSyncService.canStartIrrigation('ml');
    if (!canStart) {
      setConflictMessage(reason || 'Irrigation déjà active');
      toast({
        title: "Conflit d'irrigation",
        description: reason,
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // ✅ Envoyer un TABLEAU ordonné de 15 valeurs comme attendu par XGBoost
      const featuresArray = [
        29, 0, 62, 4, 1, 600, 26, 40, 0.9, 6.5, 10, 15, 20, 4, 2
      ];

      console.log("Envoi des features ML (tableau ordonné de 15 valeurs):", featuresArray);

      // Utiliser le service API avec le nouveau format incluant MQTT automatique
      const data = await api.arroserAvecML(featuresArray);

      console.log("Réponse ML + MQTT automatique :", data);
      
      // Mettre à jour les données du graphique immédiatement
      irrigationDataService.addMLPrediction({
        duree_minutes: data.duree_minutes,
        volume_eau_m3: data.volume_eau_m3
      });

      if (irrigationSyncService.startIrrigation('ml', 'ML_Auto', data.duree_minutes)) {
        // Démarrer une session de données pour ML
        const sessionId = irrigationDataService.startIrrigationSession('ml', 'ML_Auto');
        setCurrentSessionId(sessionId);
        
        setMLStatus(prev => ({
          ...prev,
          isActive: true,
          currentRecommendation: {
            duree_minutes: data.duree_minutes,
            volume_eau_m3: data.volume_eau_m3,
            type_culture: 'Arachide',
            perimetre_m2: 25000
          }
        }));
        
        // 🚀 Timer automatique pour l'arrêt (basé sur la prédiction ML)
        setTimeout(() => {
          if (sessionId) {
            irrigationDataService.endIrrigationSession(sessionId, data.duree_minutes);
            setCurrentSessionId(null);
          }
          irrigationSyncService.stopIrrigation('ML_Auto_Complete');
          setMLStatus(prev => ({ ...prev, isActive: false }));
          
          toast({
            title: "Irrigation ML terminée automatiquement",
            description: `Arrosage complété en ${data.duree_minutes.toFixed(1)} min`
          });
        }, data.duree_minutes * 60 * 1000);
        
        // 🚀 Notification de démarrage
        if (data.mqtt_started && data.auto_irrigation) {
          toast({
            title: "Irrigation ML AUTO démarrée",
            description: `${data.duree_minutes.toFixed(1)} min - ${data.volume_eau_m3.toFixed(3)} m³ - MQTT connecté`
          });
        } else {
          toast({
            title: "Recommandation IA reçue",
            description: `${data.duree_minutes.toFixed(1)} min, ${data.volume_eau_m3.toFixed(3)} m³ ${data.mqtt_started ? '' : '(MQTT échec)'}`
          });
        }
      }

    } catch (error) {
      console.error("Erreur ML automatique :", error);
      toast({
        title: "Erreur ML",
        description: "L'irrigation ML automatique a échoué",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const stopMLIrrigation = () => {
    if (irrigationSyncService.stopIrrigation('ML_Manual')) {
      // Terminer la session de données
      if (currentSessionId) {
        irrigationDataService.endIrrigationSession(currentSessionId, activeDuration / 60);
        setCurrentSessionId(null);
      }
      
      setMLStatus(prev => ({ ...prev, isActive: false }));
      
      toast({
        title: "Irrigation ML arrêtée manuellement",
        description: `Durée: ${(activeDuration / 60).toFixed(1)} min`,
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>Irrigation ML Automatique - XGBoost</span>
          {mlStatus.isActive && (
            <div className="flex items-center space-x-1 ml-auto">
              <Zap className="h-4 w-4 text-green-600 animate-pulse" />
              <span className="text-sm text-green-600">EN COURS</span>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-4">
            <div className={`w-4 h-4 rounded-full ${
              mlStatus.isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
            }`}></div>
            
            <Badge className={mlStatus.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}>
              {mlStatus.isActive ? 'ACTIF' : 'ARRÊTÉ'}
            </Badge>
          </div>
        </div>

        {conflictMessage && (
          <div className="p-3 bg-red-50 rounded-lg border border-red-200">
            <p className="text-sm text-red-700">
              {conflictMessage}
            </p>
          </div>
        )}

        <div className="flex space-x-2">
          <Button 
            onClick={startMLIrrigation}
            disabled={isLoading || mlStatus.isActive}
            size="sm"
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700"
          >
            <Play className="h-4 w-4" />
            <span>{isLoading ? 'Analyse IA...' : 'Irrigation ML Automatique'}</span>
          </Button>
          
          <Button 
            onClick={stopMLIrrigation}
            disabled={!mlStatus.isActive}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            <Square className="h-4 w-4" />
            <span>Arrêter</span>
          </Button>
        </div>

        {mlStatus.currentRecommendation && (
          <div className="space-y-3">
            <div className={`p-4 rounded-lg border ${
              mlStatus.isActive ? 'bg-green-50 border-green-200' : 'bg-purple-50 border-purple-200'
            }`}>
              <h4 className={`font-semibold flex items-center space-x-2 mb-2 ${
                mlStatus.isActive ? 'text-green-800' : 'text-purple-800'
              }`}>
                <span>Prédiction ML XGBoost</span>
                {mlStatus.isActive && (
                  <span className="text-sm font-normal">
                    - {(activeDuration / 60).toFixed(1)} min
                  </span>
                )}
              </h4>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center space-x-2">
                  <Clock className={`h-4 w-4 ${mlStatus.isActive ? 'text-green-600' : 'text-purple-600'}`} />
                  <span className={mlStatus.isActive ? 'text-green-700' : 'text-purple-700'}>
                    Durée: {Math.floor(mlStatus.currentRecommendation.duree_minutes)} min
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={mlStatus.isActive ? 'text-green-700' : 'text-purple-700'}>
                    Volume: {mlStatus.currentRecommendation.volume_eau_m3.toFixed(3)} m³
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Wheat className="h-4 w-4 text-green-600" />
                  <span className={mlStatus.isActive ? 'text-green-700' : 'text-purple-700'}>
                    Culture: {mlStatus.currentRecommendation.type_culture}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-orange-600" />
                  <span className={mlStatus.isActive ? 'text-green-700' : 'text-purple-700'}>
                    Surface: {(mlStatus.currentRecommendation.perimetre_m2 / 10000).toFixed(1)} ha
                  </span>
                </div>
              </div>

              {mlStatus.isActive && (
                <div className="mt-3 pt-3 border-t border-green-200">
                  <div className="flex items-center justify-between text-xs text-green-600">
                    <span>Temps écoulé: {(activeDuration / 60).toFixed(1)} min</span>
                    <span>
                      {Math.round((activeDuration / 60 / mlStatus.currentRecommendation.duree_minutes) * 100)}% complété
                    </span>
                  </div>
                  <div className="w-full bg-green-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-1000"
                      style={{ 
                        width: `${Math.min((activeDuration / 60 / mlStatus.currentRecommendation.duree_minutes) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
              Irrigation 100% automatisée : Prédiction IA → Déclenchement MQTT → Arrêt automatique | Session: {currentSessionId?.slice(-8) || 'N/A'}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
