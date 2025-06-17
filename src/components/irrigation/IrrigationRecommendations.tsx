
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Droplets, Cloud, Leaf, User } from 'lucide-react';
import { useWeather } from '@/hooks/useWeather';
import { backendService } from '@/services/backendService';
import { activeUserService, ActiveUser } from '@/services/activeUserService';
import { dynamicWeatherService } from '@/services/dynamicWeatherService';

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
  const [activeUser, setActiveUser] = useState<ActiveUser | null>(null);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [advice, setAdvice] = useState<IrrigationAdvice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(0);

  // S'abonner aux changements d'utilisateur actif
  useEffect(() => {
    const unsubscribe = activeUserService.subscribe((user) => {
      setActiveUser(user);
    });

    setActiveUser(activeUserService.getActiveUser());
    return unsubscribe;
  }, []);

  // Charger les données météo de l'utilisateur actif
  useEffect(() => {
    const loadUserWeatherData = async () => {
      if (!activeUser) {
        setWeatherData(null);
        return;
      }

      try {
        console.log(`🌤️ Chargement météo pour ${activeUser.prenom} ${activeUser.nom} à ${activeUser.localite}`);
        const data = await dynamicWeatherService.getCurrentUserWeather();
        setWeatherData(data);
        console.log('✅ Données météo chargées:', data);
      } catch (error) {
        console.error('❌ Erreur chargement météo utilisateur:', error);
      }
    };

    loadUserWeatherData();
  }, [activeUser]);

  // Générer les features en temps réel selon l'utilisateur actif et les données météo
  const generateCurrentFeatures = () => {
    const features = backendService.getDefaultSoilClimateFeatures();
    
    if (activeUser) {
      // Adapter selon le type de sol de l'utilisateur
      const typeSolMapping: { [key: string]: number } = {
        'sableux': 1,
        'argileux': 2,
        'limoneux': 3,
        'humifère': 4
      };
      features[14] = typeSolMapping[activeUser.type_sol.toLowerCase()] || 2;
      
      // Adapter selon le type de culture
      const typeCultureMapping: { [key: string]: number } = {
        '1': 1, // Légumes maraîchers
        '2': 2, // Céréales
        '3': 3, // Légumineuses
        '4': 4  // Cultures fruitières
      };
      features[4] = typeCultureMapping[activeUser.type_culture] || 1;
      
      // Adapter la superficie (convertir en m²)
      features[5] = activeUser.superficie;
    }
    
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
    if (!activeUser) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    try {
      console.log(`🔄 Génération recommandation ML pour ${activeUser.prenom} ${activeUser.nom}...`);
      const features = generateCurrentFeatures();
      
      const mlResult = await backendService.getMLRecommendation(features);
      
      if (mlResult && mlResult.status === 'ok') {
        const nitrogen = features[10];
        const phosphorus = features[11];
        const potassium = features[12];
        
        const npkAdvice = getNPKAdvice(nitrogen, phosphorus, potassium, activeUser);
        
        setAdvice({
          recommendedDuration: `${Math.round(mlResult.duree_minutes)} minutes`,
          recommendedVolume: `${(mlResult.volume_eau_m3 * 1000).toFixed(0)} litres`,
          npkAdvice
        });
        
        setLastUpdateTime(Date.now());
        console.log(`✅ Recommandations ML mises à jour pour ${activeUser.localite}:`, mlResult);
      } else {
        throw new Error('Réponse ML invalide');
      }
    } catch (error) {
      console.error('❌ Erreur génération recommandations ML:', error);
      // Fallback avec valeurs adaptées à l'utilisateur
      const fallbackAdvice = getFallbackAdvice(activeUser);
      setAdvice(fallbackAdvice);
    } finally {
      setIsLoading(false);
    }
  };

  const getFallbackAdvice = (user: ActiveUser): IrrigationAdvice => {
    // Adapter les recommandations par défaut selon la région et le type de culture
    const regionFactors: { [key: string]: number } = {
      'thiès': 1.0,
      'dakar': 0.9,
      'fatick': 1.1,
      'kaolack': 1.2,
      'louga': 1.3
    };
    
    const baseDuration = 30;
    const baseVolume = 500;
    const factor = regionFactors[user.region.toLowerCase()] || 1.0;
    
    return {
      recommendedDuration: `${Math.round(baseDuration * factor)} minutes`,
      recommendedVolume: `${Math.round(baseVolume * factor)} litres`,
      npkAdvice: {
        nitrogen: 'N: 45 mg/kg',
        phosphorus: 'P: 35 mg/kg',
        potassium: 'K: 150 mg/kg',
        fertilizerAdvice: `Apport NPK 15-15-15: 200g/m² recommandé pour ${user.localite}`
      }
    };
  };

  const getNPKAdvice = (nitrogen: number, phosphorus: number, potassium: number, user: ActiveUser): NPKRecommendation => {
    // Calcul des déficits selon la région et le type de sol
    const regionTargets: { [key: string]: { n: number, p: number, k: number } } = {
      'thiès': { n: 50, p: 40, k: 160 },
      'dakar': { n: 45, p: 35, k: 150 },
      'fatick': { n: 55, p: 45, k: 170 },
      'kaolack': { n: 60, p: 50, k: 180 },
      'louga': { n: 65, p: 55, k: 190 }
    };
    
    const targets = regionTargets[user.region.toLowerCase()] || regionTargets['thiès'];
    
    const nDeficit = Math.max(0, targets.n - nitrogen);
    const pDeficit = Math.max(0, targets.p - phosphorus);
    const kDeficit = Math.max(0, targets.k - potassium);
    
    let fertilizerAdvice = '';
    if (nDeficit > 0 || pDeficit > 0 || kDeficit > 0) {
      const npkAmount = Math.max(150, (nDeficit + pDeficit + kDeficit) * 3);
      fertilizerAdvice = `Apport NPK 15-15-15: ${npkAmount}g/m² recommandé pour ${user.localite} (${user.speculation})`;
    } else {
      fertilizerAdvice = `Équilibre nutritif optimal pour ${user.speculation} à ${user.localite}`;
    }

    return {
      nitrogen: `N: ${nitrogen.toFixed(0)} mg/kg${nDeficit > 0 ? ` (déficit: ${nDeficit.toFixed(0)})` : ''}`,
      phosphorus: `P: ${phosphorus.toFixed(0)} mg/kg${pDeficit > 0 ? ` (déficit: ${pDeficit.toFixed(0)})` : ''}`,
      potassium: `K: ${potassium.toFixed(0)} mg/kg${kDeficit > 0 ? ` (déficit: ${kDeficit.toFixed(0)})` : ''}`,
      fertilizerAdvice
    };
  };

  // Générer les recommandations quand l'utilisateur ou les données météo changent
  useEffect(() => {
    if (activeUser) {
      generateAdvice();
    }
  }, [activeUser, weatherData]);

  // Rafraîchir automatiquement toutes les 2 minutes
  useEffect(() => {
    if (!activeUser) return;
    
    const interval = setInterval(() => {
      generateAdvice();
    }, 120000); // 2 minutes

    return () => clearInterval(interval);
  }, [activeUser, weatherData]);

  if (!activeUser) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            <span>Recommandations d'Arrosage</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun utilisateur sélectionné
            </h3>
            <p className="text-gray-600">
              Sélectionnez un acteur agricole pour voir les recommandations personnalisées
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            <span>Recommandations</span>
            <Badge variant="secondary">{activeUser.localite}</Badge>
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
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">{activeUser.localite}</Badge>
            <Badge variant="outline">{activeUser.speculation}</Badge>
          </div>
        </CardTitle>
        <p className="text-sm text-gray-600">
          Pour {activeUser.prenom} {activeUser.nom} - {(activeUser.superficie / 10000).toFixed(2)} ha - Sol {activeUser.type_sol}
        </p>
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
            <div className="text-sm font-medium text-gray-700">Analyse Nutritive (NPK) - {activeUser.region}</div>
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

        {/* Conditions météo actuelles */}
        {weatherData && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-sm text-blue-700">
              <strong>Conditions météo {activeUser.localite}:</strong> {weatherData.temperature}, 
              Humidité: {weatherData.humidity}, Précipitations: {weatherData.precipitation}
            </div>
          </div>
        )}

        {/* Note informative avec timestamp */}
        <div className="text-xs text-gray-500 text-center pt-2 border-t">
          Recommandations ML personnalisées pour {activeUser.prenom} {activeUser.nom} à {activeUser.localite}
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
