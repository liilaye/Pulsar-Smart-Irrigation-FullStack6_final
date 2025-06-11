
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { backendService } from '@/services/backendService';
import { useMQTT } from '@/hooks/useMQTT';
import { toast } from "sonner";

interface MLRecommendation {
  duree_minutes: number;
  volume_eau_m3: number;
  matt: string;
  status: string;
}

export const MLIrrigationControl = () => {
  const [lastMLRecommendation, setLastMLRecommendation] = useState<MLRecommendation | null>(null);
  const [isMLActive, setIsMLActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [lastMLCommand, setLastMLCommand] = useState<string | null>(null);
  const { isConnected, publishIrrigationCommand } = useMQTT();

  // État combiné pour l'utilisation du ML
  const canUseML = isBackendConnected && isConnected;

  // Chargement initial de la recommandation ML
  useEffect(() => {
    const loadInitialMLRecommendation = async () => {
      try {
        const features = backendService.getDefaultSoilClimateFeatures();
        const recommendation = await backendService.getMLRecommendation(features);
        if (recommendation && recommendation.status === 'ok') {
          setLastMLRecommendation(recommendation);
          setLastMLCommand('Recommandation ML chargée');
        }
      } catch (error) {
        console.log("Première recommandation ML en attente du backend");
      }
    };

    loadInitialMLRecommendation();
  }, []);

  // Vérification de l'état de l'irrigation ML
  useEffect(() => {
    const checkMLIrrigationStatus = async () => {
      try {
        const status = await backendService.getIrrigationStatus();
        if (status && typeof status === 'object' && 'isActive' in status) {
          const newMLState = status.isActive && status.type === 'ml';
          if (newMLState !== isMLActive) {
            setIsMLActive(newMLState);
          }
        }
      } catch (error) {
        // Silencieux pour éviter les logs répétitifs
      }
    };

    checkMLIrrigationStatus();
    const interval = setInterval(checkMLIrrigationStatus, 8000);
    return () => clearInterval(interval);
  }, [isMLActive]);

  // Vérification de la connexion backend
  useEffect(() => {
    const checkBackendConnection = async () => {
      try {
        const isConnected = await backendService.testConnection();
        setIsBackendConnected(isConnected);
      } catch (error) {
        setIsBackendConnected(false);
      }
    };

    checkBackendConnection();
    const interval = setInterval(checkBackendConnection, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleMLRecommendation = async () => {
    if (isLoading || !canUseML) return;
    setIsLoading(true);
    setLastMLCommand('Génération recommandation ML...');

    try {
      const features = backendService.getDefaultSoilClimateFeatures();
      const recommendation = await backendService.getMLRecommendation(features);
      
      if (recommendation && recommendation.status === 'ok') {
        setLastMLRecommendation(recommendation);
        setLastMLCommand(`ML: ${Math.floor(recommendation.duree_minutes)} min recommandées`);
        toast.success("Recommandation ML générée!", {
          description: `Durée: ${Math.floor(recommendation.duree_minutes)} minutes`
        });
      } else {
        throw new Error('Réponse ML invalide');
      }
    } catch (error) {
      console.error("❌ Erreur recommandation ML:", error);
      setLastMLCommand('Erreur génération ML');
      toast.error("Erreur ML", {
        description: "Impossible de générer la recommandation ML"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMLAutoIrrigation = async () => {
    if (isLoading || !canUseML) return;
    setIsLoading(true);
    
    const action = isMLActive ? 'ARRÊT' : 'DÉMARRAGE';
    console.log(`🤖 Action irrigation ML: ${action}`);

    try {
      if (isMLActive) {
        // ARRÊTER l'irrigation ML
        console.log('📤 Envoi commande ARRÊT ML...');
        setLastMLCommand('Arrêt ML en cours...');
        
        // Méthode 1: Backend Flask
        let backendSuccess = false;
        try {
          const backendResult = await backendService.stopIrrigation();
          backendSuccess = backendResult.success;
          console.log('🔧 Backend ML STOP:', backendSuccess ? 'OK' : 'ÉCHEC');
        } catch (error) {
          console.log('⚠️ Backend non disponible pour ML STOP');
        }
        
        // Méthode 2: MQTT direct pour assurer l'arrêt
        const mqttSuccess = await publishIrrigationCommand(0);
        console.log('📡 MQTT ML STOP:', mqttSuccess ? 'OK' : 'ÉCHEC');
        
        if (backendSuccess || mqttSuccess) {
          setIsMLActive(false);
          setLastMLCommand('Irrigation ML arrêtée');
          toast.success("Irrigation ML arrêtée", {
            description: "Commande STOP ML envoyée"
          });
        } else {
          setLastMLCommand('Erreur arrêt ML');
          toast.error("Erreur lors de l'arrêt ML", {
            description: "Impossible d'arrêter l'irrigation ML"
          });
        }
      } else {
        // DÉMARRER l'irrigation ML
        console.log('📤 Démarrage irrigation ML auto...');
        setLastMLCommand('Démarrage ML auto...');
        
        // Méthode 1: Backend Flask avec ML intégré
        let backendSuccess = false;
        try {
          const features = backendService.getDefaultSoilClimateFeatures();
          const mlResult = await backendService.arroserAvecML(features);
          
          if (mlResult && mlResult.status === 'ok') {
            backendSuccess = true;
            setLastMLRecommendation(mlResult);
            console.log('🔧 Backend ML AUTO START: OK');
          }
        } catch (error) {
          console.log('⚠️ Backend ML auto non disponible');
        }
        
        if (backendSuccess) {
          setIsMLActive(true);
          setLastMLCommand(`ML actif: ${Math.floor(lastMLRecommendation?.duree_minutes || 0)} min`);
          toast.success("Irrigation ML démarrée", {
            description: "IA activée via backend Flask"
          });
        } else {
          // Méthode 2: Fallback MQTT avec dernière recommandation
          if (!lastMLRecommendation) {
            setLastMLCommand('Aucune recommandation ML disponible');
            toast.error("Aucune recommandation ML", {
              description: "Générez d'abord une recommandation ML"
            });
            return;
          }

          console.log('🔄 Fallback: MQTT direct avec dernière recommandation ML...');
          const mqttSuccess = await publishIrrigationCommand(1);
          
          if (mqttSuccess) {
            setIsMLActive(true);
            setLastMLCommand(`ML actif (MQTT): ${Math.floor(lastMLRecommendation.duree_minutes)} min`);
            toast.success("Irrigation ML démarrée", {
              description: "Basée sur la dernière recommandation ML"
            });
          } else {
            setLastMLCommand('Erreur démarrage ML');
            toast.error("Erreur de démarrage ML", {
              description: "Impossible de démarrer l'irrigation ML"
            });
          }
        }
      }
    } catch (error) {
      console.error('❌ Erreur irrigation ML:', error);
      setLastMLCommand('Erreur ML système');
      toast.error("Erreur système ML", {
        description: "Problème de communication avec le système ML"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Irrigation Intelligente ML</span>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              canUseML ? 'bg-green-500 animate-pulse' : 'bg-red-500'
            }`}></div>
            <span className="text-sm text-gray-600">
              {canUseML ? 'ML Disponible' : 'ML Indisponible'}
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Dernière recommandation ML */}
        {lastMLRecommendation && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800">Recommandation ML Active</h4>
            <div className="grid grid-cols-2 gap-2 text-sm text-blue-700 mt-2">
              <div>Durée: {Math.floor(lastMLRecommendation.duree_minutes)} min</div>
              <div>Volume: {lastMLRecommendation.volume_eau_m3?.toFixed(2)} m³</div>
            </div>
            <p className="text-xs text-blue-600 mt-1">
              {lastMLRecommendation.matt}
            </p>
          </div>
        )}

        {/* Statut de la dernière commande */}
        {lastMLCommand && (
          <div className="p-2 bg-gray-50 rounded border text-sm text-gray-700">
            <strong>Dernière action:</strong> {lastMLCommand}
          </div>
        )}

        {/* Alerte si ML non disponible */}
        {!canUseML && (
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-700">
              {!isBackendConnected ? "⚠️ Backend Flask déconnecté" : "⚠️ Connexion MQTT indisponible"}
            </p>
          </div>
        )}

        <Separator />

        {/* Contrôles ML */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={handleMLRecommendation}
              disabled={!canUseML || isLoading}
              variant="outline"
              className="h-12 flex items-center justify-center"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>🤖 Générer Recommandation ML</span>
              )}
            </Button>

            <Button
              onClick={handleMLAutoIrrigation}
              disabled={!canUseML || isLoading}
              className={`h-12 flex items-center justify-center space-x-2 ${
                isMLActive 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>{isMLActive ? '🛑 Arrêter ML' : '🚀 Irrigation ML Auto'}</span>
              )}
            </Button>
          </div>
        </div>

        {/* Statut détaillé du système */}
        <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex justify-between">
              <span>Backend Flask:</span>
              <span className={isBackendConnected ? 'text-green-600' : 'text-red-600'}>
                {isBackendConnected ? 'Connecté' : 'Déconnecté'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>MQTT:</span>
              <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
                {isConnected ? 'Connecté' : 'Déconnecté'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>ML Engine:</span>
              <span className={canUseML ? 'text-green-600' : 'text-red-600'}>
                {canUseML ? 'Opérationnel' : 'Indisponible'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>État ML:</span>
              <span className={isMLActive ? 'text-blue-600' : 'text-gray-600'}>
                {isMLActive ? 'Actif' : 'Inactif'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
