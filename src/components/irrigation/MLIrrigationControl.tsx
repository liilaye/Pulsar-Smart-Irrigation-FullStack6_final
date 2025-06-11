
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, Wheat, Play, Square } from 'lucide-react';
import { backendService } from '@/services/backendService';
import { irrigationSyncService } from '@/services/irrigationSyncService';
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
  const [isConnected, setIsConnected] = useState(true);
  const [conflictMessage, setConflictMessage] = useState<string>('');
  const [activeDuration, setActiveDuration] = useState<number>(0);
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

  const updateMLStatus = async () => {
    try {
      const recommendation = await backendService.getMLRecommendation(
        backendService.getDefaultSoilClimateFeatures()
      );
      
      setMLStatus(prev => ({
        ...prev,
        currentRecommendation: recommendation ? {
          duree_minutes: recommendation.duree_minutes,
          volume_eau_m3: recommendation.volume_eau_m3,
          type_culture: 'Arachide',
          perimetre_m2: 25000
        } : undefined
      }));
      
      setIsConnected(true);
    } catch (error) {
      console.error('❌ Erreur status ML:', error);
      setIsConnected(false);
    }
  };

  const startMLIrrigation = async () => {
    // Vérifier si on peut démarrer
    const { canStart, reason } = irrigationSyncService.canStartIrrigation('ml');
    if (!canStart) {
      setConflictMessage(reason || 'Irrigation déjà active');
      toast({
        title: "⚠️ Conflit d'irrigation",
        description: reason,
        variant: "destructive"
      });
      return;
    }

    try {
      const recommendation = await backendService.getMLRecommendation(
        backendService.getDefaultSoilClimateFeatures()
      );
      
      if (recommendation && recommendation.status === 'ok') {
        if (irrigationSyncService.startIrrigation('ml', 'ML_Backend', recommendation.duree_minutes)) {
          setMLStatus(prev => ({
            ...prev,
            isActive: true,
            currentRecommendation: {
              duree_minutes: recommendation.duree_minutes,
              volume_eau_m3: recommendation.volume_eau_m3,
              type_culture: 'Arachide',
              perimetre_m2: 25000
            }
          }));
          
          toast({
            title: "🤖 Irrigation ML démarrée",
            description: `${recommendation.duree_minutes.toFixed(1)} min - ${recommendation.volume_eau_m3.toFixed(3)} m³`,
          });
        }
      }
    } catch (error) {
      console.error('❌ Erreur démarrage ML:', error);
      toast({
        title: "❌ Erreur ML",
        description: "Impossible de démarrer l'irrigation ML",
        variant: "destructive"
      });
    }
  };

  const stopMLIrrigation = () => {
    if (irrigationSyncService.stopIrrigation('ML_Manual')) {
      toast({
        title: "⏹️ Irrigation ML arrêtée",
        description: `Durée: ${activeDuration.toFixed(1)} min`,
      });
    }
  };

  useEffect(() => {
    updateMLStatus();
    const interval = setInterval(updateMLStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Arrosage Basé sur ML - Prédictions XGBoost
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
          
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <span className="text-xs text-gray-500">Backend ML</span>
          </div>
        </div>

        {conflictMessage && (
          <div className="p-3 bg-red-50 rounded-lg border border-red-200">
            <p className="text-sm text-red-700">
              ⚠️ {conflictMessage}
            </p>
          </div>
        )}

        <div className="flex space-x-2">
          <Button 
            onClick={startMLIrrigation}
            disabled={!isConnected || mlStatus.isActive}
            size="sm"
            className="flex items-center space-x-2"
          >
            <Play className="h-4 w-4" />
            <span>Démarrer ML</span>
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
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-800 flex items-center space-x-2 mb-2">
                <span>Recommandation ML</span>
                {mlStatus.isActive && (
                  <span className="text-sm font-normal">
                    - {activeDuration.toFixed(1)} min
                  </span>
                )}
              </h4>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-purple-600" />
                  <span className="text-purple-700">
                    Durée: {Math.floor(mlStatus.currentRecommendation.duree_minutes)} min
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-purple-700">
                    Volume: {mlStatus.currentRecommendation.volume_eau_m3.toFixed(3)} m³
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Wheat className="h-4 w-4 text-green-600" />
                  <span className="text-purple-700">
                    Culture: {mlStatus.currentRecommendation.type_culture}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-orange-600" />
                  <span className="text-purple-700">
                    Surface: {(mlStatus.currentRecommendation.perimetre_m2 / 10000).toFixed(1)} ha
                  </span>
                </div>
              </div>

              {mlStatus.isActive && (
                <div className="mt-3 pt-3 border-t border-purple-200">
                  <div className="flex items-center justify-between text-xs text-purple-600">
                    <span>Temps écoulé: {activeDuration.toFixed(1)} min</span>
                    <span>
                      {Math.round((activeDuration / mlStatus.currentRecommendation.duree_minutes) * 100)}% complété
                    </span>
                  </div>
                  <div className="w-full bg-purple-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-purple-600 h-2 rounded-full transition-all duration-1000"
                      style={{ 
                        width: `${Math.min((activeDuration / mlStatus.currentRecommendation.duree_minutes) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
              🤖 Analyse basée sur 15 paramètres agro-climatiques avec marge d'erreur ±2%
            </div>
          </div>
        )}

        {!isConnected && (
          <div className="flex items-center space-x-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-700">
              ⚠️ Backend ML déconnecté. Vérifiez que le serveur Flask fonctionne sur http://localhost:5002
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
