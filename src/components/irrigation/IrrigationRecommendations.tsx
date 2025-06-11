
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Droplets, Thermometer, Wind, Cloud, Leaf } from 'lucide-react';
import { useWeather } from '@/hooks/useWeather';
import { backendService } from '@/services/backendService';

interface NPKRecommendation {
  nitrogen: string;
  phosphorus: string;
  potassium: string;
  status: 'optimal' | 'low' | 'high';
}

interface IrrigationAdvice {
  recommendedDuration: string;
  recommendedVolume: string;
  weatherImpact: string;
  soilCondition: string;
  npkAdvice: NPKRecommendation;
}

export const IrrigationRecommendations = () => {
  const { weatherData } = useWeather('thies');
  const [advice, setAdvice] = useState<IrrigationAdvice | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const generateAdvice = async () => {
      setIsLoading(true);
      
      try {
        // Utiliser les données par défaut ou les données météo réelles
        const features = backendService.getDefaultSoilClimateFeatures();
        
        // Si on a des données météo, les intégrer
        if (weatherData) {
          const temp = parseFloat(weatherData.temperature.replace('°C', ''));
          const humidity = parseFloat(weatherData.humidity.replace('%', ''));
          const windSpeed = parseFloat(weatherData.windSpeed.replace(' km/h', ''));
          const precipitation = parseFloat(weatherData.precipitation.replace(' mm', ''));
          
          features[0] = temp; // Température air
          features[1] = precipitation; // Précipitation
          features[2] = humidity; // Humidité air
          features[3] = windSpeed; // Vent moyen
        }

        // Obtenir une recommandation ML
        const mlResult = await backendService.getMLRecommendation(features);
        
        // Générer des conseils basés sur les conditions
        const temperature = features[0];
        const humidity = features[2];
        const soilMoisture = features[7];
        const nitrogen = features[10];
        const phosphorus = features[11];
        const potassium = features[12];

        const weatherImpact = getWeatherImpact(temperature, humidity, features[1]);
        const soilCondition = getSoilCondition(soilMoisture, features[9]);
        const npkAdvice = getNPKAdvice(nitrogen, phosphorus, potassium);
        
        setAdvice({
          recommendedDuration: `${Math.round(mlResult.duree_minutes)} minutes`,
          recommendedVolume: `${(mlResult.volume_eau_m3 * 1000).toFixed(0)} litres`,
          weatherImpact,
          soilCondition,
          npkAdvice
        });
      } catch (error) {
        console.error('Erreur génération conseils:', error);
        // Conseils par défaut en cas d'erreur
        setAdvice({
          recommendedDuration: '25-35 minutes',
          recommendedVolume: '400-600 litres',
          weatherImpact: 'Conditions modérées - arrosage standard recommandé',
          soilCondition: 'Sol en bon état - surveillance régulière conseillée',
          npkAdvice: {
            nitrogen: 'Niveau modéré',
            phosphorus: 'Niveau acceptable',
            potassium: 'Niveau optimal',
            status: 'optimal'
          }
        });
      } finally {
        setIsLoading(false);
      }
    };

    generateAdvice();
  }, [weatherData]);

  const getWeatherImpact = (temp: number, humidity: number, precipitation: number): string => {
    if (temp > 30 && humidity < 50) {
      return 'Conditions chaudes et sèches - augmenter la durée d\'arrosage de 20%';
    } else if (temp < 20 && humidity > 80) {
      return 'Conditions fraîches et humides - réduire la durée d\'arrosage de 15%';
    } else if (precipitation > 5) {
      return 'Pluie récente détectée - reporter ou réduire l\'arrosage';
    } else {
      return 'Conditions météo favorables pour un arrosage standard';
    }
  };

  const getSoilCondition = (soilMoisture: number, pH: number): string => {
    let condition = '';
    
    if (soilMoisture < 30) {
      condition += 'Sol sec - arrosage nécessaire. ';
    } else if (soilMoisture > 70) {
      condition += 'Sol saturé - éviter le sur-arrosage. ';
    } else {
      condition += 'Humidité du sol correcte. ';
    }

    if (pH < 6.0) {
      condition += 'pH acide - considérer un amendement calcaire.';
    } else if (pH > 8.0) {
      condition += 'pH basique - surveiller l\'absorption des nutriments.';
    } else {
      condition += 'pH optimal pour la croissance.';
    }

    return condition;
  };

  const getNPKAdvice = (nitrogen: number, phosphorus: number, potassium: number): NPKRecommendation => {
    const nStatus = nitrogen < 30 ? 'Faible' : nitrogen > 80 ? 'Élevé' : 'Optimal';
    const pStatus = phosphorus < 25 ? 'Faible' : phosphorus > 60 ? 'Élevé' : 'Optimal';
    const kStatus = potassium < 100 ? 'Faible' : potassium > 200 ? 'Élevé' : 'Optimal';
    
    const overallStatus = (nStatus === 'Optimal' && pStatus === 'Optimal' && kStatus === 'Optimal') 
      ? 'optimal' 
      : (nStatus === 'Faible' || pStatus === 'Faible' || kStatus === 'Faible') 
        ? 'low' 
        : 'high';

    return {
      nitrogen: `N: ${nStatus} (${nitrogen.toFixed(0)} mg/kg)`,
      phosphorus: `P: ${pStatus} (${phosphorus.toFixed(0)} mg/kg)`,
      potassium: `K: ${kStatus} (${potassium.toFixed(0)} mg/kg)`,
      status: overallStatus
    };
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            <span>Recommandations IA</span>
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
            <span className="text-lg">Recommandations IA Prédictive</span>
          </div>
          <Badge variant={advice?.npkAdvice.status === 'optimal' ? 'default' : 'secondary'}>
            {advice?.npkAdvice.status === 'optimal' ? 'Optimal' : 'À surveiller'}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Recommandations d'arrosage */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border">
            <Droplets className="h-5 w-5 text-blue-500" />
            <div>
              <div className="text-sm font-medium text-gray-700">Durée recommandée</div>
              <div className="text-lg font-bold text-blue-600">{advice?.recommendedDuration}</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border">
            <Cloud className="h-5 w-5 text-green-500" />
            <div>
              <div className="text-sm font-medium text-gray-700">Volume estimé</div>
              <div className="text-lg font-bold text-green-600">{advice?.recommendedVolume}</div>
            </div>
          </div>
        </div>

        {/* Impact météorologique */}
        <div className="p-3 bg-white rounded-lg border">
          <div className="flex items-start space-x-2">
            <Thermometer className="h-5 w-5 text-orange-500 mt-1" />
            <div>
              <div className="text-sm font-medium text-gray-700 mb-1">Impact Météorologique</div>
              <div className="text-sm text-gray-600">{advice?.weatherImpact}</div>
            </div>
          </div>
        </div>

        {/* Condition du sol */}
        <div className="p-3 bg-white rounded-lg border">
          <div className="flex items-start space-x-2">
            <Leaf className="h-5 w-5 text-green-500 mt-1" />
            <div>
              <div className="text-sm font-medium text-gray-700 mb-1">Condition du Sol</div>
              <div className="text-sm text-gray-600">{advice?.soilCondition}</div>
            </div>
          </div>
        </div>

        {/* Analyse NPK */}
        <div className="p-3 bg-white rounded-lg border">
          <div className="flex items-start space-x-2">
            <Wind className="h-5 w-5 text-purple-500 mt-1" />
            <div className="w-full">
              <div className="text-sm font-medium text-gray-700 mb-2">Analyse Nutritive (NPK)</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                  {advice?.npkAdvice.nitrogen}
                </span>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
                  {advice?.npkAdvice.phosphorus}
                </span>
                <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded">
                  {advice?.npkAdvice.potassium}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Note informative */}
        <div className="text-xs text-gray-500 text-center pt-2 border-t">
          💡 Recommandations basées sur l'analyse prédictive IA et les conditions agro-climatiques actuelles
        </div>
      </CardContent>
    </Card>
  );
};
