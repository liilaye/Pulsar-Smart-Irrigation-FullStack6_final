
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useMQTT } from '@/hooks/useMQTT';
import { useIrrigationStatus } from '@/hooks/useIrrigationStatus';
import { MLParametersDisplay } from './MLParametersDisplay';
import { backendService } from '@/services/backendService';
import { toast } from "sonner";

interface MLRecommendation {
  duree_minutes: number;
  volume_eau_m3: number;
  matt: string;
  status: string;
}

export const SimpleMLControl = () => {
  const [recommendation, setRecommendation] = useState<MLRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastAction, setLastAction] = useState<string>('');
  const { isConnected } = useMQTT();
  const irrigationStatus = useIrrigationStatus();

  // Synchroniser l'état local avec le statut du backend
  const isActive = irrigationStatus.isActive && irrigationStatus.type === 'ml';

  useEffect(() => {
    if (!irrigationStatus.isActive && isActive !== irrigationStatus.isActive) {
      setLastAction('Irrigation ML terminée automatiquement');
    }
  }, [irrigationStatus.isActive, isActive]);

  // Générer une recommandation ML sans démarrer l'irrigation
  const generateMLRecommendation = async () => {
    setIsLoading(true);
    setLastAction('Génération recommandation ML...');

    try {
      console.log('🤖 Génération recommandation ML (sans démarrage)');
      const features = backendService.getDefaultSoilClimateFeatures();
      const response = await backendService.getMLRecommendation(features);
      
      if (response && response.status === 'ok') {
        setRecommendation(response);
        setLastAction(`Recommandation ML générée: ${Math.floor(response.duree_minutes)} min`);
        toast.success("Recommandation ML générée", {
          description: `Durée optimisée: ${Math.floor(response.duree_minutes)} minutes`
        });
      } else {
        throw new Error('Réponse ML invalide');
      }
    } catch (error) {
      console.error('❌ Erreur génération recommandation ML:', error);
      setLastAction('Erreur génération recommandation ML');
      toast.error("Erreur recommandation ML", {
        description: "Impossible de générer la recommandation ML"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Démarrer l'irrigation ML avec la recommandation existante
  const handleStartML = async () => {
    if (!recommendation) {
      // Si pas de recommandation, la générer d'abord
      await generateMLRecommendation();
      return;
    }

    setIsLoading(true);
    setLastAction('Démarrage irrigation ML...');

    try {
      console.log('🤖 Démarrage irrigation ML contrôlé par admin');
      const features = backendService.getDefaultSoilClimateFeatures();
      const response = await backendService.arroserAvecML(features);
      
      if (response && response.status === 'ok') {
        if (response.mqtt_started && response.auto_irrigation) {
          setLastAction(`Irrigation ML active: ${Math.floor(response.duree_minutes)} min`);
          toast.success("Irrigation ML démarrée", {
            description: `Durée optimisée: ${Math.floor(response.duree_minutes)} minutes`
          });
        } else {
          setLastAction('Erreur démarrage ML');
          toast.error("Erreur démarrage ML", {
            description: response.matt || "Impossible de démarrer l'irrigation ML"
          });
        }
      } else {
        throw new Error('Réponse ML invalide');
      }
    } catch (error) {
      console.error('❌ Erreur irrigation ML:', error);
      setLastAction('Erreur système ML');
      toast.error("Erreur système ML", {
        description: "Impossible de démarrer l'irrigation intelligente"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopML = async () => {
    setIsLoading(true);
    setLastAction('Arrêt irrigation ML...');
    
    try {
      console.log('⏹️ Arrêt irrigation ML');
      const response = await backendService.stopIrrigation();
      
      if (response.success) {
        setLastAction('Irrigation ML arrêtée');
        toast.success("Irrigation ML arrêtée");
      } else {
        setLastAction('Erreur d\'arrêt ML');
        toast.error("Erreur", {
          description: response.message || "Impossible d'arrêter l'irrigation ML"
        });
      }
    } catch (error) {
      console.error('❌ Erreur arrêt irrigation ML:', error);
      setLastAction('Erreur de communication');
      toast.error("Erreur de communication");
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-générer une recommandation au chargement si pas encore fait
  useEffect(() => {
    if (isConnected && !recommendation && !isLoading) {
      generateMLRecommendation();
    }
  }, [isConnected]);

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
              {isConnected ? 'IA Connectée' : 'IA Indisponible'}
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Recommandation ML actuelle */}
        {recommendation && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">Recommandation IA</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700">Durée:</span>
                <span className="font-medium">{Math.floor(recommendation.duree_minutes)} min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Volume:</span>
                <span className="font-medium">{recommendation.volume_eau_m3?.toFixed(2)} m³</span>
              </div>
            </div>
            <p className="text-xs text-blue-600 mt-2">
              {recommendation.matt}
            </p>
          </div>
        )}

        {/* Affichage des paramètres agro-climatiques pendant irrigation ML */}
        <MLParametersDisplay isVisible={isActive} />

        <Separator />

        {/* Contrôles ML */}
        <div className="space-y-4">
          <div className="flex gap-4">
            <Button
              onClick={handleStartML}
              disabled={!isConnected || isLoading || isActive}
              variant="default"
              size="lg"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isLoading && !isActive ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <span className="mr-2">🤖</span>
              )}
              {recommendation ? 'Démarrer Irrigation ML' : 'Générer & Démarrer ML'}
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
                <span className="mr-2">🛑</span>
              )}
              Arrêter ML
            </Button>
          </div>
          
          {/* Statut */}
          <div className="text-center">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              isActive ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
            }`}>
              {isActive ? 'IRRIGATION ML ACTIVE' : 'IRRIGATION ML ARRÊTÉE'}
            </div>
            {lastAction && (
              <div className="text-xs text-gray-500 mt-2">
                {lastAction}
              </div>
            )}
          </div>
        </div>

        {/* Informations système */}
        <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex justify-between">
              <span>Backend:</span>
              <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
                {isConnected ? 'Connecté' : 'Déconnecté'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>IA:</span>
              <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
                {isConnected ? 'Prête' : 'Indisponible'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
