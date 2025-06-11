
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Brain, Zap, Droplets, Clock } from 'lucide-react';
import { backendService } from '@/services/backendService';
import { useMQTT } from '@/hooks/useMQTT';
import { toast } from "sonner";

interface MLRecommendation {
  duree_minutes: number;
  volume_eau_m3: number;
  matt: string;
  status: string;
  mqtt_started?: boolean;
  mqtt_message?: string;
  auto_irrigation?: boolean;
}

export const MLIrrigationControl = () => {
  const [lastMLRecommendation, setLastMLRecommendation] = useState<MLRecommendation | null>(null);
  const [isMLActive, setIsMLActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [backendConnected, setBackendConnected] = useState(false);
  const { isConnected } = useMQTT();

  // Vérifier la connexion backend
  useEffect(() => {
    const checkBackendConnection = async () => {
      try {
        const isConnected = await backendService.testConnection();
        setBackendConnected(isConnected);
      } catch (error) {
        setBackendConnected(false);
      }
    };

    checkBackendConnection();
    const interval = setInterval(checkBackendConnection, 10000);
    return () => clearInterval(interval);
  }, []);

  // Vérifier l'état ML périodiquement
  useEffect(() => {
    const checkMLStatus = async () => {
      try {
        const status = await backendService.getIrrigationStatus();
        if (status && typeof status === 'object') {
          setIsMLActive(status.isActive && status.type === 'ml');
        }
      } catch (error) {
        // Ignorer les erreurs silencieuses
      }
    };

    checkMLStatus();
    const interval = setInterval(checkMLStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleMLRecommendation = async () => {
    if (isLoading || !backendConnected) return;
    
    setIsLoading(true);
    console.log('🤖 Demande de recommandation ML...');

    try {
      // Utiliser les features par défaut depuis backendService
      const features = backendService.getDefaultSoilClimateFeatures();
      console.log('📊 Features envoyées au ML:', features);
      
      const result = await backendService.arroserAvecML(features);
      console.log('🤖 Résultat ML reçu:', result);
      
      setLastMLRecommendation(result);
      
      if (result.status === 'ok') {
        if (result.mqtt_started) {
          setIsMLActive(true);
          toast.success("🤖 Irrigation ML AUTO démarrée !", {
            description: `Durée: ${result.duree_minutes} min | Volume: ${result.volume_eau_m3?.toFixed(3)} m³`
          });
        } else {
          toast.warning("🤖 Recommandation ML reçue", {
            description: result.mqtt_message || `${result.duree_minutes} min recommandées`
          });
        }
      } else {
        toast.error("❌ Erreur ML", {
          description: result.matt || "Impossible d'obtenir une recommandation"
        });
      }
      
    } catch (error) {
      console.error('❌ Erreur ML:', error);
      toast.error("❌ Erreur de connexion ML", {
        description: "Vérifiez que le backend Flask est démarré"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMLAutoIrrigation = async () => {
    if (isLoading || !backendConnected) return;
    
    setIsLoading(true);
    console.log('🚀 Déclenchement irrigation ML AUTO...');

    try {
      // Forcer l'irrigation automatique avec ML
      const features = backendService.getDefaultSoilClimateFeatures();
      const result = await backendService.arroserAvecML(features);
      
      setLastMLRecommendation(result);
      
      if (result.status === 'ok' && result.mqtt_started) {
        setIsMLActive(true);
        toast.success("🚀 Irrigation ML AUTO lancée !", {
          description: `${result.duree_minutes} min | ${result.volume_eau_m3?.toFixed(3)} m³ | MQTT activé`
        });
      } else {
        toast.error("❌ Échec démarrage ML AUTO", {
          description: result.mqtt_message || "Impossible de démarrer l'irrigation automatique"
        });
      }
      
    } catch (error) {
      console.error('❌ Erreur ML AUTO:', error);
      toast.error("❌ Erreur ML AUTO", {
        description: "Vérifiez la connexion backend et MQTT"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const canUseML = backendConnected && isConnected;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <span>Irrigation Intelligente - XGBoost ML</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              canUseML ? 'bg-green-500 animate-pulse' : 'bg-red-500'
            }`}></div>
            <span className="text-sm text-gray-600">
              {canUseML ? 'ML Prêt' : 'ML Indisponible'}
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Statut des connexions */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-3 rounded-lg border ${
            backendConnected ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                backendConnected ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span className="text-sm font-medium">Backend Flask</span>
            </div>
            <span className="text-xs text-gray-600">
              {backendConnected ? 'Connecté' : 'Déconnecté'}
            </span>
          </div>
          
          <div className={`p-3 rounded-lg border ${
            isConnected ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span className="text-sm font-medium">MQTT Broker</span>
            </div>
            <span className="text-xs text-gray-600">
              {isConnected ? 'PulsarInfinite OK' : 'Déconnecté'}
            </span>
          </div>
        </div>

        <Separator />

        {/* Contrôles ML */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Brain className="h-4 w-4 text-purple-600" />
            <span className="font-medium">Intelligence Artificielle</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={handleMLRecommendation}
              disabled={!canUseML || isLoading}
              variant="outline"
              className="h-12 flex items-center space-x-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Brain className="h-4 w-4" />
              )}
              <span>Obtenir Recommandation</span>
            </Button>
            
            <Button
              onClick={handleMLAutoIrrigation}
              disabled={!canUseML || isLoading}
              className="h-12 bg-purple-600 hover:bg-purple-700 flex items-center space-x-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Zap className="h-4 w-4" />
              )}
              <span>🚀 Démarrer ML AUTO</span>
            </Button>
          </div>
        </div>

        {/* Affichage de la dernière recommandation */}
        {lastMLRecommendation && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Droplets className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Dernière Recommandation ML</span>
              </div>
              
              <div className={`p-4 rounded-lg border ${
                lastMLRecommendation.mqtt_started 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-blue-50 border-blue-200'
              }`}>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">⏱️ Durée:</span>
                    <span className="font-medium">{Math.floor(lastMLRecommendation.duree_minutes)} min</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">💧 Volume:</span>
                    <span className="font-medium">{lastMLRecommendation.volume_eau_m3?.toFixed(3)} m³</span>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-700 mb-2">{lastMLRecommendation.matt}</p>
                  
                  {lastMLRecommendation.mqtt_started !== undefined && (
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        lastMLRecommendation.mqtt_started 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        MQTT: {lastMLRecommendation.mqtt_started ? '✅ Activé' : '❌ Échec'}
                      </span>
                      {lastMLRecommendation.auto_irrigation && (
                        <span className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-700">
                          🤖 AUTO
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Statut irrigation ML */}
        {isMLActive && (
          <>
            <Separator />
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-purple-800">
                  🤖 Irrigation ML AUTO en cours
                </span>
              </div>
              <div className="text-xs text-purple-600">
                Gestion automatique par IA
              </div>
            </div>
          </>
        )}

        {/* Avertissement si services indisponibles */}
        {!canUseML && (
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-700">
              ⚠️ Services ML indisponibles. Vérifiez que le backend Flask est démarré et que MQTT est connecté.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
