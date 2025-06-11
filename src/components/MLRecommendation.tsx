
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wifi, WifiOff, Bot, Zap, Clock } from 'lucide-react';
import { useBackendSync } from '@/hooks/useBackendSync';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/services/apiService';
import { irrigationDataService } from '@/services/irrigationDataService';

export const MLRecommendation = () => {
  const { isBackendConnected } = useBackendSync();
  const { toast } = useToast();
  const [prediction, setPrediction] = useState<{ 
    durationHours: number, 
    durationMinutes: number, 
    volumeEauM3: number,
    mqttStarted?: boolean,
    autoIrrigation?: boolean
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isIrrigating, setIsIrrigating] = useState(false);

  const handleMLRequest = async () => {
    setIsLoading(true);
    try {
      // ✅ Envoyer un TABLEAU ordonné de 15 valeurs comme attendu par XGBoost
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

      // Utiliser le service API avec le nouveau format incluant MQTT
      const data = await api.arroserAvecML(featuresArray);

      console.log("✅ Réponse ML + MQTT :", data);
      
      // Mettre à jour les données du graphique immédiatement
      irrigationDataService.addMLPrediction({
        duree_minutes: data.duree_minutes,
        volume_eau_m3: data.volume_eau_m3
      });
      
      setPrediction({
        durationHours: Math.floor(data.duree_minutes / 60),
        durationMinutes: data.duree_minutes % 60,
        volumeEauM3: data.volume_eau_m3,
        mqttStarted: data.mqtt_started,
        autoIrrigation: data.auto_irrigation
      });

      // 🚀 Démarrer le suivi d'irrigation si MQTT activé
      if (data.mqtt_started && data.auto_irrigation) {
        setIsIrrigating(true);
        
        // Timer automatique pour l'arrêt
        setTimeout(() => {
          setIsIrrigating(false);
          toast({
            title: "✅ Irrigation ML terminée",
            description: `Arrosage automatique complété en ${data.duree_minutes.toFixed(1)} min`
          });
        }, data.duree_minutes * 60 * 1000);
        
        toast({
          title: "🚀 Irrigation ML AUTO démarrée !",
          description: `${data.duree_minutes.toFixed(1)} min - ${data.volume_eau_m3.toFixed(3)} m³ - MQTT ✅`
        });
      } else {
        toast({
          title: "✅ Recommandation IA reçue",
          description: `${data.duree_minutes.toFixed(1)} min, ${data.volume_eau_m3.toFixed(3)} m³ ${data.mqtt_started ? '' : '(MQTT échec)'}`
        });
      }

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
          <span>Irrigation ML Automatique</span>
          {isIrrigating && (
            <div className="flex items-center space-x-1 ml-auto">
              <Zap className="h-4 w-4 text-green-600 animate-pulse" />
              <span className="text-sm text-green-600">EN COURS</span>
            </div>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <Button 
          onClick={handleMLRequest} 
          disabled={isLoading || isIrrigating} 
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          {isLoading ? (
            'Analyse IA en cours...'
          ) : isIrrigating ? (
            'Irrigation Auto Active...'
          ) : (
            '🤖 Déclencher Irrigation ML AUTO'
          )}
        </Button>

        {prediction && (
          <div className={`p-3 rounded-lg shadow border ${
            prediction.autoIrrigation ? 'bg-green-50 border-green-200' : 'bg-white border-indigo-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-indigo-700">
                ⏱️ Durée: <strong>{prediction.durationHours}h {prediction.durationMinutes}min</strong>
              </p>
              {prediction.autoIrrigation && (
                <div className="flex items-center space-x-1">
                  <Zap className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-green-600">AUTO</span>
                </div>
              )}
            </div>
            
            <p className="text-sm text-indigo-700">
              💧 Volume: <strong>{prediction.volumeEauM3.toFixed(3)} m³</strong>
            </p>
            
            {prediction.autoIrrigation && (
              <div className="mt-2 pt-2 border-t border-green-200">
                <div className="flex items-center space-x-2">
                  <Clock className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-green-700">
                    {prediction.mqttStarted ? '✅ MQTT démarré' : '❌ MQTT échec'} - 
                    Arrêt automatique programmé
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center space-x-2 pt-3 border-t border-indigo-100">
          {isBackendConnected ? (
            <Wifi className="h-4 w-4 text-green-600" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-600" />
          )}
          <span className="text-xs">
            {isBackendConnected ? 'API Flask + MQTT connectés' : 'API Flask non disponible'}
          </span>
        </div>

        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
          🤖 Irrigation 100% automatisée : Prédiction IA → Déclenchement MQTT → Arrêt automatique | Graphiques temps réel
        </div>
      </CardContent>
    </Card>
  );
};
