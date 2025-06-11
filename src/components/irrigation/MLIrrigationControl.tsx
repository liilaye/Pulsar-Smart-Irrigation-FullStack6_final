
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
  const [lastMLCommand, setLastMLCommand] = useState<string | null>(null);
  const { isConnected, publishIrrigationCommand } = useMQTT();

  const handleMLRecommendation = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setLastMLCommand('Génération recommandation ML...');

    try {
      // Simulation d'une recommandation ML
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const simulatedRecommendation: MLRecommendation = {
        duree_minutes: Math.floor(Math.random() * 30) + 15, // 15-45 minutes
        volume_eau_m3: Math.round((Math.random() * 0.5 + 0.3) * 100) / 100, // 0.3-0.8 m³
        matt: "Recommandation basée sur les conditions simulées du sol et du climat",
        status: "ok"
      };
      
      setLastMLRecommendation(simulatedRecommendation);
      setLastMLCommand(`ML: ${Math.floor(simulatedRecommendation.duree_minutes)} min recommandées`);
      toast.success("Recommandation ML générée!", {
        description: `Durée: ${Math.floor(simulatedRecommendation.duree_minutes)} minutes`
      });
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
    if (isLoading) return;
    setIsLoading(true);
    
    const action = isMLActive ? 'ARRÊT' : 'DÉMARRAGE';
    console.log(`🤖 Action irrigation ML: ${action}`);

    try {
      if (isMLActive) {
        // ARRÊTER l'irrigation ML
        console.log('📤 Envoi commande ARRÊT ML...');
        setLastMLCommand('Arrêt ML en cours...');
        
        const success = await publishIrrigationCommand(0);
        
        if (success) {
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
        if (!lastMLRecommendation) {
          setLastMLCommand('Aucune recommandation ML disponible');
          toast.error("Aucune recommandation ML", {
            description: "Générez d'abord une recommandation ML"
          });
          return;
        }

        console.log('📤 Démarrage irrigation ML auto...');
        setLastMLCommand('Démarrage ML auto...');
        
        const success = await publishIrrigationCommand(1);
        
        if (success) {
          setIsMLActive(true);
          setLastMLCommand(`ML actif: ${Math.floor(lastMLRecommendation.duree_minutes)} min`);
          toast.success("Irrigation ML démarrée", {
            description: "IA activée avec recommandation ML"
          });
        } else {
          setLastMLCommand('Erreur démarrage ML');
          toast.error("Erreur de démarrage ML", {
            description: "Impossible de démarrer l'irrigation ML"
          });
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
              isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
            }`}></div>
            <span className="text-sm text-gray-600">
              {isConnected ? 'ML Simulé' : 'ML Indisponible'}
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

        <Separator />

        {/* Contrôles ML */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={handleMLRecommendation}
              disabled={!isConnected || isLoading}
              variant="outline"
              className="h-12 flex items-center justify-center"
            >
              {isLoading && !isMLActive ? (
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>🤖 Générer Recommandation ML</span>
              )}
            </Button>

            <Button
              onClick={handleMLAutoIrrigation}
              disabled={!isConnected || isLoading}
              className={`h-12 flex items-center justify-center space-x-2 ${
                isMLActive 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isLoading && isMLActive !== undefined ? (
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
              <span>Mode:</span>
              <span className="text-blue-600">Simulation</span>
            </div>
            <div className="flex justify-between">
              <span>MQTT:</span>
              <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
                {isConnected ? 'Connecté' : 'Déconnecté'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>ML Engine:</span>
              <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
                {isConnected ? 'Simulé' : 'Indisponible'}
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
