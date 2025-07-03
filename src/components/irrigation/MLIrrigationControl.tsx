
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowDown, ArrowUp } from "lucide-react";
import { useMQTT } from '@/hooks/useMQTT';
import { backendService } from '@/services/backendService';
import { toast } from "sonner";
import { useEffect } from 'react';
import { activeUserService } from '@/services/activeUserService';

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
  const [mlInputFeatures, setMLInputFeatures] = useState<number[] | null>(null);
  const { isConnected } = useMQTT();

  // SÉCURITÉ CRITIQUE: Réinitialisation complète de l'état ML lors du changement d'acteur
  useEffect(() => {
    const resetMLState = () => {
      console.log('🔄 RESET COMPLET état ML pour nouvel acteur');
      setLastMLRecommendation(null);
      setIsMLActive(false); // TOUJOURS inactif par défaut
      setIsLoading(false);
      setLastMLCommand(null);
      setMLInputFeatures(null);
    };

    // S'abonner aux changements d'utilisateur actif pour reset automatique
    const unsubscribe = activeUserService.subscribe((user) => {
      if (user) {
        resetMLState();
      }
    });

    // Reset initial
    resetMLState();

    return unsubscribe;
  }, []);

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
        setMLInputFeatures(features); // Sauvegarder les paramètres utilisés
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
          setMLInputFeatures(null); // Réinitialiser les paramètres
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

        {/* Affichage en temps réel pendant l'irrigation ML active */}
        {isMLActive && lastMLRecommendation && mlInputFeatures && (
          <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 flex items-center gap-2">
              🚿 Irrigation ML en Cours d'Exécution
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* INPUTS - Paramètres Agro-climatiques */}
              <div className="bg-white p-3 rounded-lg border border-blue-100">
                <h5 className="font-medium text-blue-800 flex items-center gap-2 mb-3">
                  <ArrowDown className="w-4 h-4" />
                  Paramètres Agro-climatiques (Inputs)
                </h5>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>Temp. Air: <span className="font-medium">{mlInputFeatures[0]}°C</span></div>
                  <div>Précipitation: <span className="font-medium">{mlInputFeatures[1]}mm</span></div>
                  <div>Humidité Air: <span className="font-medium">{mlInputFeatures[2]}%</span></div>
                  <div>Vent: <span className="font-medium">{mlInputFeatures[3]}km/h</span></div>
                  <div>Type Culture: <span className="font-medium">{mlInputFeatures[4]}</span></div>
                  <div>Superficie: <span className="font-medium">{mlInputFeatures[5]}m²</span></div>
                  <div>Temp. Sol: <span className="font-medium">{mlInputFeatures[6]}°C</span></div>
                  <div>Humidité Sol: <span className="font-medium">{mlInputFeatures[7]}%</span></div>
                  <div>EC: <span className="font-medium">{mlInputFeatures[8]}dS/m</span></div>
                  <div>pH Sol: <span className="font-medium">{mlInputFeatures[9]}</span></div>
                  <div>Azote: <span className="font-medium">{mlInputFeatures[10]}mg/kg</span></div>
                  <div>Phosphore: <span className="font-medium">{mlInputFeatures[11]}mg/kg</span></div>
                  <div>Potassium: <span className="font-medium">{mlInputFeatures[12]}mg/kg</span></div>
                  <div>Fertilité: <span className="font-medium">{mlInputFeatures[13]}/5</span></div>
                  <div>Type Sol: <span className="font-medium">{mlInputFeatures[14]}</span></div>
                </div>
              </div>

              {/* OUTPUTS - Résultats ML */}
              <div className="bg-white p-3 rounded-lg border border-green-100">
                <h5 className="font-medium text-green-800 flex items-center gap-2 mb-3">
                  <ArrowUp className="w-4 h-4" />
                  Prédiction ML Appliquée (Outputs)
                </h5>
                <div className="space-y-3">
                  <div className="p-2 bg-green-50 rounded border border-green-200">
                    <div className="text-sm font-medium text-green-900">Durée d'irrigation</div>
                    <div className="text-lg font-bold text-green-700">
                      {Math.floor(lastMLRecommendation.duree_minutes)} minutes
                    </div>
                  </div>
                  <div className="p-2 bg-blue-50 rounded border border-blue-200">
                    <div className="text-sm font-medium text-blue-900">Volume d'eau</div>
                    <div className="text-lg font-bold text-blue-700">
                      {lastMLRecommendation.volume_eau_m3?.toFixed(3)} m³
                    </div>
                    <div className="text-xs text-blue-600">
                      ({(lastMLRecommendation.volume_eau_m3 * 1000)?.toFixed(0)} litres)
                    </div>
                  </div>
                  <div className="p-2 bg-amber-50 rounded border border-amber-200">
                    <div className="text-xs text-amber-700">
                      <strong>IA Active:</strong> Système applique automatiquement les paramètres optimaux calculés
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-center p-2 bg-gradient-to-r from-blue-100 to-green-100 rounded border border-blue-200">
              <div className="text-sm text-blue-800">
                <strong>🤖 Intelligence Artificielle en Action</strong> - Système d'irrigation optimisé basé sur l'analyse des 15 paramètres agro-climatiques
              </div>
            </div>
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
              <span className="text-blue-600">Backend Flask ML SÉCURISÉ</span>
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
                {isConnected ? 'Prédiction Seule' : 'Indisponible'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Auto-Start:</span>
              <span className="text-red-600 font-semibold">DÉSACTIVÉ ✓</span>
            </div>
            <div className="flex justify-between">
              <span>État ML:</span>
              <span className={isMLActive ? 'text-blue-600' : 'text-gray-600'}>
                {isMLActive ? 'ADMIN VALIDÉ' : 'Inactif'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Validation:</span>
              <span className="text-amber-600 font-semibold">ADMIN REQUIS ✓</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
