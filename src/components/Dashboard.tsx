
import React, { useState, useEffect } from 'react';
import { QuickControl } from './QuickControl';
import { AgroClimateParams } from './AgroClimateParams';
import { IrrigationStatus } from './IrrigationStatus';
import { WaterChart } from './WaterChart';
import { IrrigationRecommendations } from './irrigation/IrrigationRecommendations';
import { BackendConnectionStatus } from './BackendConnectionStatus';
import { WelcomeBanner } from './WelcomeBanner';
import { Footer } from './Footer';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Cloud } from 'lucide-react';
import { useWeather } from '@/hooks/useWeather';

export const Dashboard = () => {
  const [selectedLocation, setSelectedLocation] = useState<'thies' | 'taiba-ndiaye' | 'hann-maristes' | 'dakar' | 'bargny'>('thies');
  const { weatherData, isLoading, error } = useWeather(selectedLocation);

  // Analyse des tendances basée sur les données du graphique
  const [chartTrend, setChartTrend] = useState<{
    trend: 'increasing' | 'decreasing' | 'stable';
    peakTime: string;
  }>({
    trend: 'stable',
    peakTime: '14h00'
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

        {/* Section Conditions Météo - Déplacée ici */}
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
          
          {/* Analyse des Tendances simplifiée */}
          <div className="mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span>Analyse des Tendances</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Tendance courbe:</span>
                    <span className={`font-medium capitalize ${
                      chartTrend.trend === 'increasing' ? 'text-red-600' :
                      chartTrend.trend === 'decreasing' ? 'text-blue-600' : 'text-green-600'
                    }`}>
                      {chartTrend.trend === 'increasing' ? 'Croissante' :
                       chartTrend.trend === 'decreasing' ? 'Décroissante' : 'Stable'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pic d'utilisation:</span>
                    <span className="font-medium">{chartTrend.peakTime}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Section Recommandations IA - Version simplifiée */}
        <section id="recommendations" className="scroll-mt-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Recommandations IA</h2>
          <IrrigationRecommendations />
        </section>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};
