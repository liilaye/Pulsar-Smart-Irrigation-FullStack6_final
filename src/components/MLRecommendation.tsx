
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wifi, WifiOff, Bot } from 'lucide-react';
import { useBackendSync } from '@/hooks/useBackendSync';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/services/apiService';
import { irrigationDataService } from '@/services/irrigationDataService';

export const MLRecommendation = () => {
  const { isBackendConnected } = useBackendSync();
  const { toast } = useToast();
  const [prediction, setPrediction] = useState<{ durationHours: number, durationMinutes: number, volumeEauM3: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleMLRequest = async () => {
    setIsLoading(true);
    try {
      // ✅ CORRECTION: Envoyer un TABLEAU ordonné de 15 valeurs comme attendu par XGBoost
      const featuresArray = [
        29,    // Température_air_(°C)
        0,     // Précipitation_(mm)
        62,    // Humidité_air_(%)
        4,     // Vent_moyen_(km/h)
        1,     // Type_culture
        600,   // Périmètre_agricole_(m2)
        26,    // Température_sol_(°C)
        40,    // Humidité_sol_(%)
        0.9,   // EC_(dS/m)
        6.5,   // pH_sol
        10,    // Azote_(mg/kg)
        15,    // Phosphore_(mg/kg)
        20,    // Potassium_(mg/kg)
        4,     // Fertilité_(score)
        2      // Type_sol
      ];

      console.log("🤖 Envoi des features ML (tableau ordonné de 15 valeurs):", featuresArray);

      // Utiliser le service API avec le bon format
      const data = await api.arroserAvecML(featuresArray);

      console.log("✅ Réponse ML :", data);
      
      // Mettre à jour les données du graphique immédiatement
      irrigationDataService.addMLPrediction({
        duree_minutes: data.duree_minutes,
        volume_eau_m3: data.volume_eau_m3
      });
      
      setPrediction({
        durationHours: Math.floor(data.duree_minutes / 60),
        durationMinutes: data.duree_minutes % 60,
        volumeEauM3: data.volume_eau_m3
      });

      toast({
        title: "✅ Recommandation IA reçue",
        description: `Arrosage ${data.duree_minutes.toFixed(1)} min, volume ${data.volume_eau_m3.toFixed(3)} m³`
      });

    } catch (error) {
      console.error("❌ Erreur ML :", error);
      toast({
        title: "❌ Erreur ML",
        description: "La prédiction IA a échoué",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-indigo-200 bg-indigo-50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-indigo-800">
          <Bot className="h-5 w-5" />
          <span>Recommandation d'Arrosage IA</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <Button 
          onClick={handleMLRequest} 
          disabled={isLoading} 
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          {isLoading ? 'Chargement...' : 'Déclencher Recommandation IA'}
        </Button>

        {prediction && (
          <div className="bg-white p-3 rounded-lg shadow border border-indigo-200">
            <p className="text-sm text-indigo-700">
              ⏱️ Durée recommandée : <strong>{prediction.durationHours}h {prediction.durationMinutes}min</strong>
            </p>
            <p className="text-sm text-indigo-700">
              💧 Volume estimé : <strong>{prediction.volumeEauM3.toFixed(3)} m³</strong>
            </p>
          </div>
        )}

        <div className="flex items-center space-x-2 pt-3 border-t border-indigo-100">
          {isBackendConnected ? (
            <Wifi className="h-4 w-4 text-green-600" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-600" />
          )}
          <span className="text-xs">
            {isBackendConnected ? 'API Flask connectée' : 'API Flask non disponible'}
          </span>
        </div>

        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
          📊 Format: Tableau ordonné de 15 paramètres agro-climatiques | Graphiques mis à jour automatiquement
        </div>
      </CardContent>
    </Card>
  );
};
