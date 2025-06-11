import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wifi, WifiOff, Bot } from 'lucide-react';
import { useBackendSync } from '@/hooks/useBackendSync';
import { useToast } from '@/hooks/use-toast';

export const MLRecommendation = () => {
  const { isBackendConnected } = useBackendSync();
  const { toast } = useToast();
  const [prediction, setPrediction] = useState<{ durationHours: number, durationMinutes: number, volumeEauM3: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleMLRequest = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:5002/api/arroser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          features: {
            "Température_air_(°C)": 29,
            "Précipitation_(mm)": 0,
            "Humidité_air_(%)": 62,
            "Vent_moyen_(km/h)": 4,
            "Type_culture": 1,
            "Périmètre_agricole_(m2)": 600,
            "Température_sol_(°C)": 26,
            "Humidité_sol_(%)": 40,
            "EC_(dS/m)": 0.9,
            "pH_sol": 6.5,
            "Azote_(mg/kg)": 10,
            "Phosphore_(mg/kg)": 15,
            "Potassium_(mg/kg)": 20,
            "Fertilité_(score)": 4,
            "Type_sol": 2
          }
        })
      });

      if (!response.ok) throw new Error("Erreur réponse serveur");

      const data = await response.json();
      console.log("✅ Réponse ML :", data);
      setPrediction({
        durationHours: Math.floor(data.duree_minutes / 60),
        durationMinutes: data.duree_minutes % 60,
        volumeEauM3: data.volume_eau_m3
      });

      toast({
        title: "✅ Recommandation IA reçue",
        description: `Arrosage ${data.duree_minutes} min, volume ${data.volume_eau_m3} m³`
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
              💧 Volume estimé : <strong>{prediction.volumeEauM3} m³</strong>
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
      </CardContent>
    </Card>
  );
};
