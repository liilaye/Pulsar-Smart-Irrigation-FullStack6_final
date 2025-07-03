
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useMQTT } from '@/hooks/useMQTT';
import { backendService } from '@/services/backendService';
import { toast } from "sonner";

interface MLRecommendation {
  duree_minutes: number;
  volume_eau_m3: number;
  matt: string;
  status: string;
  mqtt_started?: boolean;
  auto_irrigation?: boolean;
}

export const MLIrrigationControl = () => {
  const [lastMLRecommendation, setLastMLRecommendation] = useState<MLRecommendation | null>(null);
  const [isMLActive, setIsMLActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastMLCommand, setLastMLCommand] = useState<string | null>(null);
  const { isConnected } = useMQTT();

  const handleMLRecommendation = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setLastMLCommand('Génération recommandation ML via Backend Flask...');

    try {
      console.log('🤖 Demande recommandation ML via Backend Flask...');
      const features = backendService.getDefaultSoilClimateFeatures();
      const prediction = await backendService.getMLRecommendation(features);
      
      if (prediction && prediction.status === 'ok') {
        setLastMLRecommendation(prediction);
        setLastMLCommand(`ML via Backend Flask: ${Math.floor(prediction.duree_minutes)} min recommandées`);
        toast.success("Recommandation ML générée via Backend Flask!", {
          description: `Durée: ${Math.floor(prediction.duree_minutes)} minutes`
        });
      } else {
        throw new Error('Erreur dans la réponse ML');
      }
    } catch (error) {
      console.error("❌ Erreur recommandation ML Backend Flask:", error);
      setLastMLCommand('Erreur génération ML Backend Flask');
      toast.error("Erreur ML Backend Flask", {
        description: "Impossible de générer la recommandation ML via Backend Flask"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMLAutoIrrigation = async () => {
    if (isLoading) return;
    setIsLoading(true);
    
    const action = isMLActive ? 'ARRÊT' : 'DÉMARRAGE';
    console.log(`🤖 Action irrigation ML via Backend Flask: ${action}`);

    try {
      if (isMLActive) {
        // ARRÊTER l'irrigation ML via Backend Flask
        console.log('📤 Envoi commande ARRÊT ML via Backend Flask...');
        setLastMLCommand('Arrêt ML via Backend Flask...');
        
        const response = await backendService.stopIrrigation();
        
        if (response.success) {
          setIsMLActive(false);
          setLastMLCommand('Irrigation ML arrêtée via Backend Flask');
          toast.success("Irrigation ML arrêtée via Backend Flask", {
            description: "Commande STOP ML envoyée via Backend Flask"
          });
        } else {
          setLastMLCommand('Erreur arrêt ML Backend Flask');
          toast.error("Erreur arrêt ML Backend Flask", {
            description: response.message || "Impossible d'arrêter l'irrigation ML"
          });
        }
      } else {
        // DÉMARRER l'irrigation ML AVEC VALIDATION ADMIN EXPLICITE
        if (!lastMLRecommendation) {
          setLastMLCommand('Aucune recommandation ML disponible');
          toast.error("Aucune recommandation ML", {
            description: "Générez d'abord une recommandation ML"
          });
          return;
        }

        console.log('🚿 DÉMARRAGE IRRIGATION ML AVEC VALIDATION ADMIN...');
        setLastMLCommand('Démarrage ML avec validation admin...');
        
        const mlStartResponse = await backendService.startMLIrrigationWithAdminValidation({
          duration_minutes: lastMLRecommendation.duree_minutes,
          volume_m3: lastMLRecommendation.volume_eau_m3
        });
        
        if (mlStartResponse.success && mlStartResponse.admin_validated && mlStartResponse.mqtt_started) {
          setIsMLActive(true);
          setLastMLCommand(`ML VALIDÉ ADMIN actif: ${Math.floor(lastMLRecommendation.duree_minutes)} min`);
          toast.success("Irrigation ML démarrée avec validation admin", {
            description: `✅ Admin a validé: ${Math.floor(lastMLRecommendation.duree_minutes)} min automatique`
          });
        } else {
          setLastMLCommand('Erreur validation admin ML Backend Flask');
          toast.error("Erreur validation admin ML", {
            description: mlStartResponse.message || "Impossible de démarrer l'irrigation ML avec validation admin"
          });
        }
      }
    } catch (error) {
      console.error('❌ Erreur irrigation ML Backend Flask:', error);
      setLastMLCommand('Erreur ML système Backend Flask');
      toast.error("Erreur système ML Backend Flask", {
        description: "Problème de communication avec le Backend Flask ML"
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
              {isConnected ? 'Backend Flask ML' : 'Backend Flask ML Indisponible'}
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Dernière recommandation ML */}
        {lastMLRecommendation && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800">Recommandation ML Active (Backend Flask)</h4>
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
                <span>{isMLActive ? '🛑 Arrêter ML' : '✅ DÉMARRER ML (Validation Admin)'}</span>
              )}
            </Button>
          </div>

          {/* Avertissement validation admin */}
          {lastMLRecommendation && !isMLActive && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>⚠️ Validation Admin Requise:</strong> La prédiction ML est prête. 
                Cliquez sur "DÉMARRER ML" pour lancer l'irrigation avec validation admin.
              </p>
            </div>
          )}
        </div>

        {/* Statut détaillé du système */}
        <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex justify-between">
              <span>Mode:</span>
              <span className="text-blue-600">Backend Flask ML</span>
            </div>
            <div className="flex justify-between">
              <span>Backend Flask:</span>
              <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
                {isConnected ? 'Connecté' : 'Déconnecté'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>ML Engine:</span>
              <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
                {isConnected ? 'Backend Flask Prêt' : 'Indisponible'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>État ML:</span>
              <span className={isMLActive ? 'text-blue-600' : 'text-gray-600'}>
                {isMLActive ? 'AUTO Actif' : 'Inactif'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
