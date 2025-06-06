
import React, { useState, useEffect } from 'react';
import { QuickControl } from './QuickControl';
import { AgroClimateParams } from './AgroClimateParams';
import { IrrigationStatus } from './IrrigationStatus';
import { WaterChart } from './WaterChart';
import { Recommendations } from './Recommendations';
import { IrrigationSystemConfig } from './IrrigationSystemConfig';
import { DeviceLocation } from './DeviceLocation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Brain, Cloud } from 'lucide-react';
import { backendService, TrendAnalysis, MLPredictionAnalysis } from '@/services/backendService';
import { useWeather } from '@/hooks/useWeather';

export const Dashboard = () => {
  const [trendAnalysis, setTrendAnalysis] = useState<TrendAnalysis | null>(null);
  const [mlPredictions, setMLPredictions] = useState<MLPredictionAnalysis | null>(null);
  const { weatherData } = useWeather('thies');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // Récupérer les analyses en temps réel
        const trends = await backendService.getTrendAnalysis();
        const predictions = await backendService.getMLPredictionAnalysis();
        
        setTrendAnalysis(trends);
        setMLPredictions(predictions);
      } catch (error) {
        console.error('❌ Erreur chargement analytics:', error);
      }
    };

    fetchAnalytics();
    
    // Actualiser toutes les 5 minutes
    const interval = setInterval(fetchAnalytics, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8">
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
        <AgroClimateParams />
      </section>
      
      {/* Section Analyses */}
      <section id="analytics" className="scroll-mt-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Analyses et Graphiques</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WaterChart />
          <div className="space-y-6">
            {/* Analyse des Tendances connectée aux données Flask */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span>Analyse des Tendances</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {trendAnalysis ? (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Consommation d'eau:</span>
                      <span className="font-medium">{trendAnalysis.waterConsumption.toFixed(2)} m³</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Humidité du sol:</span>
                      <span className="font-medium">{trendAnalysis.soilMoisture}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Efficacité système:</span>
                      <span className="font-medium">{trendAnalysis.efficiency}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tendance:</span>
                      <span className={`font-medium capitalize ${
                        trendAnalysis.trend === 'increasing' ? 'text-red-600' :
                        trendAnalysis.trend === 'decreasing' ? 'text-blue-600' : 'text-green-600'
                      }`}>
                        {trendAnalysis.trend === 'increasing' ? 'Croissante' :
                         trendAnalysis.trend === 'decreasing' ? 'Décroissante' : 'Stable'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600">Chargement des données d'analyse...</p>
                )}
              </CardContent>
            </Card>

            {/* Prédictions ML connectées aux données Flask */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  <span>Prédictions ML</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {mlPredictions ? (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Prochain arrosage:</span>
                      <span className="font-medium">Dans {mlPredictions.nextIrrigationHours}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Durée recommandée:</span>
                      <span className="font-medium">{mlPredictions.recommendedDuration} min</span>
                    </div>
                    <div className="flex justify-between">
                      <span>État du sol:</span>
                      <span className="font-medium text-green-600">{mlPredictions.soilCondition}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Impact météo:</span>
                      <span className="font-medium text-blue-600">{mlPredictions.weatherImpact}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600">Chargement des prédictions ML...</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Section Recommandations avec météo connectée */}
      <section id="recommendations" className="scroll-mt-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Recommandations</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Recommendations />
          
          {/* Conditions Météo en temps réel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Cloud className="h-5 w-5 text-blue-600" />
                <span>Conditions Météo - Thiès</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
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
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">
                      🌤️ Données météo en temps réel depuis le serveur Flask
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600">Chargement des conditions météo...</p>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
      
      {/* Section Système d'Irrigation avec Géolocalisation */}
      <section id="irrigation-system" className="scroll-mt-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Système d'Irrigation</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="max-w-md">
            <IrrigationSystemConfig />
          </div>
          <DeviceLocation />
        </div>
      </section>
    </div>
  );
};
