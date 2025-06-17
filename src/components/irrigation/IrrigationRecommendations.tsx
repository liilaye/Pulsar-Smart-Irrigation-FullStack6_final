import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Droplets, Cloud, Leaf } from 'lucide-react';
import { useWeather } from '@/hooks/useWeather';
import { backendService } from '@/services/backendService';

interface NPKRecommendation {
  nitrogen: string;
  phosphorus: string;
  potassium: string;
  fertilizerAdvice: string;
}

interface IrrigationAdvice {
  recommendedDuration: string;
  recommendedVolume: string;
  npkAdvice: NPKRecommendation;
}

export const IrrigationRecommendations = () => {
  const { weatherData } = useWeather('taiba-ndiaye');
  const [advice, setAdvice] = useState<IrrigationAdvice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(0);

  // Générer les features en temps réel selon les données disponibles
  const generateCurrentFeatures = () => {
    const features = backendService.getDefaultSoilClimateFeatures();
    
    if (weatherData) {
      const temp = parseFloat(weatherData.temperature.replace('°C', ''));
      const humidity = parseFloat(weatherData.humidity.replace('%', ''));
      const windSpeed = parseFloat(weatherData.windSpeed.replace(' km/h', ''));
      const precipitation = parseFloat(weatherData.precipitation.replace(' mm', ''));
      
      features[0] = temp;        // Température_air_(°C)
      features[1] = precipitation; // Précipitation_(mm)
      features[2] = humidity;     // Humidité_air_(%)
      features[3] = windSpeed;    // Vent_moyen_(km/h)
    }
    
    return features;
  };

  const generateAdvice = async () => {
    setIsLoading(true);
    
    try {
      console.log('🔄 Génération recommandation ML temps réel...');
      const features = generateCurrentFeatures();
      
      // Utiliser getMLRecommendation au lieu de arroserAvecML pour éviter démarrage auto
      const mlResult = await backendService.getMLRecommendation(features);
      
      if (mlResult && mlResult.status === 'ok') {
        const nitrogen = features[10];
        const phosphorus = features[11];
        const potassium = features[12];
        
        const npkAdvice = getNPKAdvice(nitrogen, phosphorus, potassium);
        
        setAdvice({
          recommendedDuration: `${Math.round(mlResult.duree_minutes)} minutes`,
          recommendedVolume: `${(mlResult.volume_eau_m3 * 1000).toFixed(0)} litres`,
          npkAdvice
        });
        
        setLastUpdateTime(Date.now());
        console.log('✅ Recommandations ML mises à jour:', mlResult);
      } else {
        throw new Error('Réponse ML invalide');
      }
    } catch (error) {
      console.error('❌ Erreur génération recommandations ML:', error);
      // Fallback avec valeurs par défaut
      setAdvice({
        recommendedDuration: '25-35 minutes',
        recommendedVolume: '400-600 litres',
        npkAdvice: {
          nitrogen: 'N: 45 mg/kg',
          phosphorus: 'P: 35 mg/kg',
          potassium: 'K: 150 mg/kg',
          fertilizerAdvice: 'Apport NPK 15-15-15: 200g/m² recommandé pour Taïba Ndiaye'
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getNPKAdvice = (nitrogen: number, phosphorus: number, potassium: number): NPKRecommendation => {
    // Calcul des déficits pour Taïba Ndiaye (zone côtière)
    const nDeficit = Math.max(0, 50 - nitrogen);
    const pDeficit = Math.max(0, 40 - phosphorus);
    const kDeficit = Math.max(0, 160 - potassium);
    
    let fertilizerAdvice = '';
    if (nDeficit > 0 || pDeficit > 0 || kDeficit > 0) {
      const npkAmount = Math.max(150, (nDeficit + pDeficit + kDeficit) * 3);
      fertilizerAdvice = `Apport NPK 15-15-15: ${npkAmount}g/m² recommandé pour Taïba Ndiaye`;
    } else {
      fertilizerAdvice = 'Équilibre nutritif optimal - maintenir apports actuels';
    }

    return {
      nitrogen: `N: ${nitrogen.toFixed(0)} mg/kg${nDeficit > 0 ? ` (déficit: ${nDeficit.toFixed(0)})` : ''}`,
      phosphorus: `P: ${phosphorus.toFixed(0)} mg/kg${pDeficit > 0 ? ` (déficit: ${pDeficit.toFixed(0)})` : ''}`,
      potassium: `K: ${potassium.toFixed(0)} mg/kg${kDeficit > 0 ? ` (déficit: ${kDeficit.toFixed(0)})` : ''}`,
      fertilizerAdvice
    };
  };

  // Générer les recommandations au chargement et quand les données météo changent
  useEffect(() => {
    generateAdvice();
  }, [weatherData]);

  // Rafraîchir automatiquement toutes les 2 minutes pour synchronisation temps réel
  useEffect(() => {
    const interval = setInterval(() => {
      generateAdvice();
    }, 120000); // 2 minutes

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            <span>Recommandations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-gradient-to-br from-blue-50 to-green-50 border-blue-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            <span className="text-lg">Recommandations d'Arrosage</span>
          </div>
          <Badge variant="secondary">Taïba Ndiaye</Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Recommandations d'arrosage */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3 p-4 bg-white rounded-lg border shadow-sm">
            <Droplets className="h-6 w-6 text-blue-500" />
            <div>
              <div className="text-sm font-medium text-gray-700">Durée recommandée</div>
              <div className="text-xl font-bold text-blue-600">{advice?.recommendedDuration}</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-4 bg-white rounded-lg border shadow-sm">
            <Cloud className="h-6 w-6 text-green-500" />
            <div>
              <div className="text-sm font-medium text-gray-700">Volume estimé</div>
              <div className="text-xl font-bold text-green-600">{advice?.recommendedVolume}</div>
            </div>
          </div>
        </div>

        {/* Analyse Nutritive NPK */}
        <div className="p-4 bg-white rounded-lg border shadow-sm">
          <div className="flex items-start space-x-2 mb-3">
            <Leaf className="h-5 w-5 text-green-500 mt-1" />
            <div className="text-sm font-medium text-gray-700">Analyse Nutritive (NPK)</div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
            <span className="px-3 py-2 bg-blue-100 text-blue-800 rounded text-sm">
              {advice?.npkAdvice.nitrogen}
            </span>
            <span className="px-3 py-2 bg-green-100 text-green-800 rounded text-sm">
              {advice?.npkAdvice.phosphorus}
            </span>
            <span className="px-3 py-2 bg-orange-100 text-orange-800 rounded text-sm">
              {advice?.npkAdvice.potassium}
            </span>
          </div>
          
          <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm font-medium text-yellow-800">
              {advice?.npkAdvice.fertilizerAdvice}
            </p>
          </div>
        </div>

        {/* Note informative avec timestamp */}
        <div className="text-xs text-gray-500 text-center pt-2 border-t">
          Recommandations ML optimisées en temps réel pour Taïba Ndiaye
          {lastUpdateTime > 0 && (
            <span className="block text-green-600 mt-1">
              Dernière mise à jour: {new Date(lastUpdateTime).toLocaleTimeString()}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
