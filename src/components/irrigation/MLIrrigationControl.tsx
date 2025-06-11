
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
}

interface IrrigationStatus {
  isActive: boolean;
  type: 'manual' | 'ml';
}

export const MLIrrigationControl = () => {
  const [lastMLRecommendation, setLastMLRecommendation] = useState<MLRecommendation | null>(null);
  const [isMLActive, setIsMLActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const { isConnected, publishIrrigationCommand } = useMQTT();

  // État pour suivre si le ML peut être utilisé
  const [canUseML, setCanUseML] = useState(false);

  // Charger la dernière recommandation ML au montage
  useEffect(() => {
    const loadLastMLRecommendation = async () => {
      try {
        const features = backendService.getDefaultSoilClimateFeatures();
        const recommendation = await backendService.getMLRecommendation(features);
        if (recommendation) {
          setLastMLRecommendation(recommendation);
        }
      } catch (error) {
        console.error("Erreur lors du chargement de la dernière recommandation ML:", error);
      }
    };

    loadLastMLRecommendation();
  }, []);

  // Vérifier l'état de l'irrigation périodiquement
  useEffect(() => {
    const checkIrrigationStatus = async () => {
      try {
        const status = await backendService.getIrrigationStatus();
        if (status && typeof status === 'object') {
          setIsMLActive(status.isActive && status.type === 'ml');
        }
      } catch (error) {
        // Ignorer les erreurs de statut pour éviter les logs répétitifs
      }
    };

    checkIrrigationStatus();
    const interval = setInterval(checkIrrigationStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  // Vérifier la connexion backend au montage et à chaque changement de connexion MQTT
  useEffect(() => {
    const checkBackendConnection = async () => {
      try {
        // Utiliser testConnection au lieu de healthCheck
        const isConnected = await backendService.testConnection();
        setIsBackendConnected(isConnected);
      } catch (error) {
        console.error("Backend non connecté:", error);
        setIsBackendConnected(false);
      }
    };

    checkBackendConnection();
    // Définir un intervalle pour vérifier périodiquement la connexion backend
    const intervalId = setInterval(checkBackendConnection, 15000); // Vérifie toutes les 15 secondes

    return () => clearInterval(intervalId); // Nettoyer l'intervalle lors du démontage du composant
  }, [isConnected]);

  // Mettre à jour l'état de disponibilité du ML
  useEffect(() => {
    setCanUseML(isBackendConnected && isConnected);
  }, [isBackendConnected, isConnected]);

  const handleMLRecommendation = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const features = backendService.getDefaultSoilClimateFeatures();
      const recommendation = await backendService.getMLRecommendation(features);
      if (recommendation) {
        setLastMLRecommendation(recommendation);
        toast.success("Recommandation ML reçue!", {
          description: `Durée: ${Math.floor(recommendation.duree_minutes)} minutes`
        });
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de la recommandation ML:", error);
      toast.error("Erreur ML", {
        description: "Impossible de récupérer la recommandation ML."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMLAutoIrrigation = async () => {
    if (isLoading) return;
    setIsLoading(true);
    console.log(`Action irrigation ML auto: ${isMLActive ? 'ARRÊT' : 'DÉMARRAGE'}`);

    try {
      if (isMLActive) {
        // ARRÊTER l'irrigation ML
        console.log('Envoi commande ARRÊT irrigation ML...');
        
        // Méthode 1: Via backend Flask
        const backendResult = await backendService.stopIrrigation();
        console.log('Backend STOP result:', backendResult);
        
        // Méthode 2: Direct MQTT en parallèle pour assurer l'arrêt
        const mqttResult = await publishIrrigationCommand(0);
        console.log('MQTT STOP result:', mqttResult);
        
        if (backendResult.success || mqttResult) {
          setIsMLActive(false);
          toast.success("Irrigation ML arrêtée", {
            description: "Commande STOP envoyée au broker MQTT"
          });
        } else {
          toast.error("Erreur lors de l'arrêt", {
            description: backendResult.message || "Vérifiez la connexion MQTT"
          });
        }
      } else {
        // DÉMARRER l'irrigation ML
        console.log('Envoi commande DÉMARRAGE irrigation ML...');
        
        // Récupérer la recommandation ML actuelle
        if (!lastMLRecommendation) {
          toast.error("Aucune recommandation ML", {
            description: "Veuillez d'abord obtenir une recommandation ML."
          });
          return;
        }

        // Utiliser arroserAvecML au lieu de startMLIrrigation
        const features = backendService.getDefaultSoilClimateFeatures();
        const backendResult = await backendService.arroserAvecML(features);
        console.log('Backend START result:', backendResult);
        
        if (backendResult.status === 'ok') {
          setIsMLActive(true);
          toast.success("Irrigation ML démarrée", {
            description: `Durée: ${Math.floor(backendResult.duree_minutes)} minutes - MQTT activé`
          });
        } else {
          // Méthode 2: Fallback direct MQTT si backend échoue
          console.log('Fallback: commande MQTT directe...');
          const mqttResult = await publishIrrigationCommand(1);
          
          if (mqttResult) {
            setIsMLActive(true);
            toast.success("Irrigation ML démarrée (MQTT direct)", {
              description: `Durée estimée basée sur la dernière recommandation`
            });
          } else {
            toast.error("Erreur de démarrage", {
              description: "Vérifiez la connexion MQTT"
            });
          }
        }
      }
    } catch (error) {
      console.error('Erreur irrigation ML auto:', error);
      toast.error("Erreur de connexion", {
        description: "Impossible de communiquer avec le système"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Irrigation Intelligent basé sur ML</span>
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
            <h4 className="font-semibold text-blue-800">Dernière Recommandation ML</h4>
            <p className="text-sm text-blue-700">
              Durée: {Math.floor(lastMLRecommendation.duree_minutes)} minutes
            </p>
            <p className="text-sm text-blue-700">
              Volume: {lastMLRecommendation.volume_eau_m3?.toFixed(2)} m³
            </p>
            <p className="text-xs text-blue-600">
              {lastMLRecommendation.matt}
            </p>
          </div>
        )}

        {/* Alerte si ML non disponible */}
        {!canUseML && (
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-700">
              ML non disponible. Vérifiez les connexions backend et MQTT.
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
                <span>Obtenir Recommandation ML</span>
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
                <span>Irrigation ML automatisé</span>
              )}
            </Button>
          </div>
        </div>

        {/* Statut détaillé */}
        <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
          <div className="flex items-center justify-between">
            <span>Statut ML:</span>
            <span className={canUseML ? 'text-green-600' : 'text-red-600'}>
              {canUseML ? 'Système opérationnel' : 'Système indisponible'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Backend:</span>
            <span className={isBackendConnected ? 'text-green-600' : 'text-red-600'}>
              {isBackendConnected ? 'Connecté' : 'Déconnecté'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>MQTT:</span>
            <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
              {isConnected ? 'Connecté' : 'Déconnecté'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
