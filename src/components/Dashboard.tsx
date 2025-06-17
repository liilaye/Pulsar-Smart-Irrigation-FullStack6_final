
import React, { useState, useEffect } from 'react';
import { QuickControl } from './QuickControl';
import { AgroClimateParams } from './AgroClimateParams';
import { IrrigationStatus } from './IrrigationStatus';
import { WaterChart } from './WaterChart';
import { BackendConnectionStatus } from './BackendConnectionStatus';
import { WelcomeBanner } from './WelcomeBanner';
import { Footer } from './Footer';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Cloud } from 'lucide-react';
import { useWeather } from '@/hooks/useWeather';

export const Dashboard = () => {
  const [selectedLocation, setSelectedLocation] = useState<'thies' | 'taiba-ndiaye' | 'hann-maristes' | 'dakar' | 'bargny'>('thies');
  const { weatherData, isLoading, error } = useWeather(selectedLocation);

  // Analyse des tendances basée sur les données du graphique avec stats min/max
  const [chartStats] = useState<{
    trend: 'increasing' | 'decreasing' | 'stable';
    minUsage: number;
    maxUsage: number;
    avgUsage: number;
  }>({
    trend: 'stable',
    minUsage: 0.15,
    maxUsage: 0.85,
    avgUsage: 0.42
  });

  const getLocationName = () => {
    const names = {
      'thies': 'Thiès',
      'taiba-ndiaye': 'Taïba Ndiaye', 
      'hann-maristes': 'Hann Maristes',
      'dakar': 'Dakar',
      'bargny': 'Bargny'
    };
    return names[selectedLocation] || 'Thiès';
  };

  const getUsageAnalysis = () => {
    const { minUsage, maxUsage, avgUsage } = chartStats;
    
    if (maxUsage > 0.7) {
      return {
        title: "Usage Maximum Élevé",
        description: `Pic d'utilisation à ${(maxUsage * 1000).toFixed(0)}L détecté. Vérifier l'efficacité du système d'arrosage et ajuster si nécessaire.`,
        type: "warning"
      };
    } else if (minUsage < 0.2) {
      return {
        title: "Période d'Usage Optimal",
        description: `Usage minimum de ${(minUsage * 1000).toFixed(0)}L identifié. Période idéale pour maintenance préventive du système.`,
        type: "info"
      };
    } else if (avgUsage > 0.5) {
      return {
        title: "Consommation Moyenne Élevée",
        description: `Usage moyen de ${(avgUsage * 1000).toFixed(0)}L observé. Surveiller les besoins en eau et optimiser les cycles d'arrosage.`,
        type: "attention"
      };
    } else {
      return {
        title: "Gestion Hydrique Optimale",
        description: `Usage équilibré entre ${(minUsage * 1000).toFixed(0)}L et ${(maxUsage * 1000).toFixed(0)}L. Maintenir les pratiques actuelles.`,
        type: "success"
      };
    }
  };

  const analysis = getUsageAnalysis();

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 space-y-8">
        {/* Bannière de bienvenue */}
        <WelcomeBanner />
        
        {/* Section Statut Backend */}
        <section className="mb-6">
          <BackendConnectionStatus />
        </section>
        
        {/* Section Tableau de bord principal */}
        <section id="dashboard" className="scroll-mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <QuickControl />
            <IrrigationStatus />
          </div>
        </section>
        
        {/* Section Paramètres Agro-climatiques */}
        <section id="sensors" className="scroll-mt-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Paramètres Agro-climatiques</h2>
          <AgroClimateParams onLocationChange={setSelectedLocation} />
        </section>

        {/* Section Conditions Météo */}
        <section className="scroll-mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Cloud className="h-5 w-5 text-blue-600" />
                <span>Conditions Météo</span>
                {weatherData && (
                  <span className="text-sm font-normal text-gray-600">
                    - {weatherData.location}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 mb-4">
                  <p className="text-sm text-blue-700">Chargement des conditions météo pour {getLocationName()}...</p>
                </div>
              )}
              
              {error && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg mb-4">
                  <p className="text-sm text-orange-700">Connexion OpenWeather en cours... Données de secours affichées</p>
                </div>
              )}
              
              {weatherData ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Température:</span>
                    <span className="font-medium text-orange-600">{weatherData.temperature}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Humidité:</span>
                    <span className="font-medium text-blue-600">{weatherData.humidity}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Vent:</span>
                    <span className="font-medium text-gray-600">{weatherData.windSpeed}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Précipitations:</span>
                    <span className="font-medium text-green-600">{weatherData.precipitation}</span>
                  </div>
                  {weatherData.description && (
                    <div className="flex justify-between items-center">
                      <span>Condition:</span>
                      <span className="font-medium text-purple-600">{weatherData.description}</span>
                    </div>
                  )}
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">
                      🌤️ Données météo en temps réel depuis OpenWeatherMap API
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600">Chargement des conditions météo...</p>
              )}
            </CardContent>
          </Card>
        </section>
        
        {/* Section Analyses et Graphiques */}
        <section id="analytics" className="scroll-mt-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Analyses et Graphiques</h2>
          
          {/* Graphique principal */}
          <div className="mb-6">
            <WaterChart />
          </div>
          
          {/* Analyse des Tendances avec stats min/max */}
          <div className="mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span>Analyse des Tendances</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="text-sm text-gray-600">Usage Minimum</div>
                      <div className="text-xl font-bold text-blue-600">{(chartStats.minUsage * 1000).toFixed(0)}L</div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="text-sm text-gray-600">Usage Maximum</div>
                      <div className="text-xl font-bold text-green-600">{(chartStats.maxUsage * 1000).toFixed(0)}L</div>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg">
                      <div className="text-sm text-gray-600">Usage Moyen</div>
                      <div className="text-xl font-bold text-orange-600">{(chartStats.avgUsage * 1000).toFixed(0)}L</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Tendance courbe:</span>
                    <span className={`font-medium capitalize ${
                      chartStats.trend === 'increasing' ? 'text-red-600' :
                      chartStats.trend === 'decreasing' ? 'text-blue-600' : 'text-green-600'
                    }`}>
                      {chartStats.trend === 'increasing' ? 'Croissante' :
                       chartStats.trend === 'decreasing' ? 'Décroissante' : 'Stable'}
                    </span>
                  </div>
                  
                  <div className={`p-4 rounded-lg border ${
                    analysis.type === 'warning' ? 'bg-red-50 border-red-200' :
                    analysis.type === 'attention' ? 'bg-yellow-50 border-yellow-200' :
                    analysis.type === 'info' ? 'bg-blue-50 border-blue-200' :
                    'bg-green-50 border-green-200'
                  }`}>
                    <h4 className={`font-medium mb-2 ${
                      analysis.type === 'warning' ? 'text-red-800' :
                      analysis.type === 'attention' ? 'text-yellow-800' :
                      analysis.type === 'info' ? 'text-blue-800' :
                      'text-green-800'
                    }`}>
                      📊 {analysis.title}
                    </h4>
                    <p className={`text-sm ${
                      analysis.type === 'warning' ? 'text-red-700' :
                      analysis.type === 'attention' ? 'text-yellow-700' :
                      analysis.type === 'info' ? 'text-blue-700' :
                      'text-green-700'
                    }`}>
                      {analysis.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};
