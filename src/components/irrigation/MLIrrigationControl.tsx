
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Droplet, Clock, MapPin, Wheat } from 'lucide-react';
import { backendService } from '@/services/backendService';
import { useToast } from '@/hooks/use-toast';

interface MLIrrigationStatus {
  isActive: boolean;
  status: 'active' | 'pause' | 'stopped';
  currentRecommendation?: {
    duree_minutes: number;
    volume_eau_m3: number;
    type_culture: string;
    perimetre_m2: number;
    remaining_time?: number;
  };
  progress?: number;
}

export const MLIrrigationControl = () => {
  const [mlStatus, setMLStatus] = useState<MLIrrigationStatus>({
    isActive: false,
    status: 'stopped'
  });
  const [isConnected, setIsConnected] = useState(true);
  const { toast } = useToast();

  const updateMLStatus = async () => {
    try {
      const status = await backendService.getIrrigationStatus();
      const recommendation = await backendService.getMLRecommendation(
        backendService.getDefaultSoilClimateFeatures()
      );
      
      setMLStatus({
        isActive: status?.isActive || false,
        status: status?.status || 'stopped',
        currentRecommendation: recommendation,
        progress: status?.progress || 0
      });
      
      setIsConnected(true);
    } catch (error) {
      console.error('❌ Erreur status ML:', error);
      setIsConnected(false);
    }
  };

  useEffect(() => {
    updateMLStatus();
    const interval = setInterval(updateMLStatus, 5000); // Mise à jour toutes les 5s
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pause': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'ACTIF';
      case 'pause': return 'PAUSE';
      default: return 'ARRÊTÉ';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-purple-600" />
          <span>Arrosage Basé sur ML - Prédictions XGBoost</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-4">
            <div className={`w-4 h-4 rounded-full ${
              mlStatus.isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
            }`}></div>
            
            <Badge className={getStatusColor(mlStatus.status)}>
              {getStatusText(mlStatus.status)}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <span className="text-xs text-gray-500">Backend ML</span>
          </div>
        </div>

        {mlStatus.currentRecommendation && (
          <div className="space-y-3">
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-800 flex items-center space-x-2 mb-2">
                <Brain className="h-4 w-4" />
                <span>Recommandation ML en Cours</span>
              </h4>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-purple-600" />
                  <span className="text-purple-700">
                    Durée: {Math.floor(mlStatus.currentRecommendation.duree_minutes)} min
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Droplet className="h-4 w-4 text-blue-600" />
                  <span className="text-purple-700">
                    Volume: {mlStatus.currentRecommendation.volume_eau_m3.toFixed(3)} m³
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Wheat className="h-4 w-4 text-green-600" />
                  <span className="text-purple-700">
                    Culture: {mlStatus.currentRecommendation.type_culture || 'Arachide'}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-orange-600" />
                  <span className="text-purple-700">
                    Surface: {(mlStatus.currentRecommendation.perimetre_m2 / 10000).toFixed(1)} ha
                  </span>
                </div>
              </div>

              {mlStatus.status === 'active' && mlStatus.remaining_time && (
                <div className="mt-3 pt-3 border-t border-purple-200">
                  <div className="flex items-center justify-between text-xs text-purple-600">
                    <span>Temps restant: {Math.floor(mlStatus.remaining_time)} min</span>
                    <span>{Math.round((mlStatus.progress || 0) * 100)}% complété</span>
                  </div>
                  <div className="w-full bg-purple-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-purple-600 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${(mlStatus.progress || 0) * 100}%` }}
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
