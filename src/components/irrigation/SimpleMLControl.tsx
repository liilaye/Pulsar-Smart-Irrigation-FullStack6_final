import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Power, PowerOff, Brain } from 'lucide-react';
import { useMQTT } from '@/hooks/useMQTT';
import { useIrrigationStatus } from '@/hooks/useIrrigationStatus';
import { backendService } from '@/services/backendService';
import { toast } from "sonner";

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
  const { isConnected, publishIrrigationCommand } = useMQTT();
  const irrigationStatus = useIrrigationStatus();

  // L'irrigation est active si elle vient du ML ou manuelle
  const isActive = irrigationStatus.isActive;

  useEffect(() => {
    if (!irrigationStatus.isActive && isActive !== irrigationStatus.isActive) {
      setLastAction('Irrigation ML terminée automatiquement');
    }
  }, [irrigationStatus.isActive, isActive]);

  const generateMLRecommendation = async () => {
    setIsLoading(true);
    setLastAction('Génération recommandation ML...');
    
    try {
      console.log('🤖 Génération recommandation ML');
      const features = backendService.getDefaultSoilClimateFeatures();
      const prediction = await backendService.getMLRecommendation(features);
      
      if (prediction && prediction.status === 'ok') {
        setMLRecommendation(prediction);
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
        setLastAction(`Irrigation ML active: ${Math.floor(mlRecommendation.duree_minutes)} minutes`);
        toast.success("Irrigation ML démarrée", {
          description: `Durée: ${Math.floor(mlRecommendation.duree_minutes)} minutes`
        });
        
        // Programmer l'arrêt automatique
        setTimeout(async () => {
          await handleStopML();
        }, mlRecommendation.duree_minutes * 60 * 1000);
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

  const handleStopML = async () => {
    setIsLoading(true);
    setLastAction('Arrêt irrigation ML...');
    
    try {
      console.log('⏹️ Arrêt irrigation ML directe');
      
      // ENVOI DIRECT MQTT device 0 (comme manuel)
      const mqttSuccess = await publishIrrigationCommand(0);
      
      if (mqttSuccess) {
        setLastAction('Irrigation ML arrêtée');
        toast.success("Irrigation ML arrêtée");
      } else {
        setLastAction('Erreur arrêt MQTT');
        toast.error("Erreur MQTT", {
          description: "Impossible d'envoyer la commande d'arrêt"
        });
      }
    } catch (error) {
      console.error('❌ Erreur arrêt ML:', error);
      setLastAction('Erreur de communication');
      toast.error("Erreur de communication");
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
              isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
            }`}></div>
            <span className="text-sm text-gray-600">
              {isConnected ? 'Connecté' : 'Déconnecté'}
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Recommandation ML */}
        {mlRecommendation && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800">Recommandation ML Active</h4>
            <div className="grid grid-cols-2 gap-2 text-sm text-blue-700 mt-2">
              <div>Durée: {Math.floor(mlRecommendation.duree_minutes)} min</div>
              <div>Volume: {mlRecommendation.volume_eau_m3?.toFixed(2)} m³</div>
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
              disabled={!isConnected || isLoading || !mlRecommendation || isActive}
              variant="default"
              size="lg"
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {isLoading && !isActive ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Power className="h-4 w-4 mr-2" />
              )}
              Démarrer ML
            </Button>
            
            <Button
              onClick={handleStopML}
              disabled={!isConnected || isLoading || !isActive}
              variant="destructive"
              size="lg"
              className="flex-1"
            >
              {isLoading && isActive ? (
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
              isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
            }`}>
              {isActive ? 'IRRIGATION EN COURS' : 'IRRIGATION ARRÊTÉE'}
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