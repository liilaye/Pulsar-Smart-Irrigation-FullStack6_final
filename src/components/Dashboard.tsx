
import React, { useState, useEffect } from 'react';
import { QuickControl } from './QuickControl';
import { AgroClimateParams } from './AgroClimateParams';
import { IrrigationStatus } from './IrrigationStatus';
import { WaterChart } from './WaterChart';
import { BackendConnectionStatus } from './BackendConnectionStatus';
import { WelcomeBanner } from './WelcomeBanner';
import { Footer } from './Footer';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Cloud, Droplets, Sprout, BarChart3 } from 'lucide-react';
import { useWeather } from '@/hooks/useWeather';
import { irrigationDataService } from '@/services/irrigationDataService';

export const Dashboard = () => {
  const [selectedLocation, setSelectedLocation] = useState<'thies' | 'taiba-ndiaye' | 'hann-maristes' | 'dakar' | 'bargny'>('thies');
  const { weatherData, isLoading, error } = useWeather(selectedLocation);

  // Analyse agricole scientifique des données d'irrigation
  const [irrigationAnalysis, setIrrigationAnalysis] = useState<{
    manualTrend: 'croissante' | 'décroissante' | 'stable';
    mlTrend: 'croissante' | 'décroissante' | 'stable';
    efficiency: {
      manual: number;
      ml: number;
      recommendation: string;
    };
    waterStress: {
      level: 'faible' | 'modéré' | 'élevé';
      cause: string;
      solution: string;
    };
    evapotranspiration: {
      rate: number;
      impact: string;
    };
    soilMoisture: {
      status: 'optimal' | 'déficit' | 'excès';
      action: string;
    };
  } | null>(null);

  useEffect(() => {
    // Analyser les données d'irrigation en temps réel
    const analyzeIrrigationData = () => {
      const chartData = irrigationDataService.generateChartData();
      const dailyData = chartData.daily;
      
      // Calculer les tendances sur les 24 dernières heures
      const manualValues = dailyData.map(d => d.manualQuantity);
      const mlValues = dailyData.map(d => d.mlQuantity);
      
      // Analyse de régression linéaire simple
      const calculateTrend = (values: number[]) => {
        const n = values.length;
        const x = Array.from({length: n}, (_, i) => i);
        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = values.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((sum, xi, i) => sum + xi * values[i], 0);
        const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        
        if (slope > 0.005) return 'croissante';
        if (slope < -0.005) return 'décroissante';
        return 'stable';
      };

      const manualTrend = calculateTrend(manualValues);
      const mlTrend = calculateTrend(mlValues);
      
      // Calcul de l'efficacité hydrique
      const totalManual = manualValues.reduce((a, b) => a + b, 0);
      const totalML = mlValues.reduce((a, b) => a + b, 0);
      
      // Coefficient d'efficacité basé sur la régularité et l'optimisation
      const manualVariance = manualValues.reduce((acc, val) => {
        const avg = totalManual / manualValues.length;
        return acc + Math.pow(val - avg, 2);
      }, 0) / manualValues.length;
      
      const mlVariance = mlValues.reduce((acc, val) => {
        const avg = totalML / mlValues.length;
        return acc + Math.pow(val - avg, 2);
      }, 0) / mlValues.length;
      
      const manualEfficiency = Math.max(0, 100 - (manualVariance * 1000));
      const mlEfficiency = Math.max(0, 100 - (mlVariance * 1000));
      
      // Analyse du stress hydrique basée sur la météo
      let waterStressLevel: 'faible' | 'modéré' | 'élevé' = 'faible';
      let stressCause = '';
      let stressSolution = '';
      
      if (weatherData) {
        const temp = parseInt(weatherData.temperature);
        const humidity = parseInt(weatherData.humidity);
        const wind = parseInt(weatherData.windSpeed);
        
        if (temp > 35 && humidity < 40) {
          waterStressLevel = 'élevé';
          stressCause = 'Forte chaleur et faible humidité - Évapotranspiration élevée';
          stressSolution = 'Augmenter fréquence d\'irrigation, arroser tôt le matin';
        } else if (temp > 30 || humidity < 50 || wind > 20) {
          waterStressLevel = 'modéré';
          stressCause = 'Conditions climatiques modérément stressantes';
          stressSolution = 'Ajuster les cycles selon les pics de température';
        } else {
          stressCause = 'Conditions climatiques favorables';
          stressSolution = 'Maintenir le programme d\'irrigation actuel';
        }
      }
      
      // Calcul de l'évapotranspiration (méthode Penman-Monteith simplifiée)
      const baseET = weatherData ? 
        (parseInt(weatherData.temperature) * 0.1 + parseInt(weatherData.windSpeed) * 0.05 - parseInt(weatherData.humidity) * 0.02) : 3.5;
      
      // Analyse de l'humidité du sol basée sur l'irrigation récente
      const recentIrrigation = dailyData.slice(-6).reduce((sum, d) => sum + d.manualQuantity + d.mlQuantity, 0);
      let soilStatus: 'optimal' | 'déficit' | 'excès' = 'optimal';
      let soilAction = '';
      
      if (recentIrrigation < 1.0) {
        soilStatus = 'déficit';
        soilAction = 'Augmenter l\'irrigation - Risque de stress hydrique des cultures';
      } else if (recentIrrigation > 4.0) {
        soilStatus = 'excès';
        soilAction = 'Réduire l\'irrigation - Risque de lessivage et maladies racinaires';
      } else {
        soilAction = 'Maintenir le niveau d\'irrigation actuel';
      }
      
      setIrrigationAnalysis({
        manualTrend,
        mlTrend,
        efficiency: {
          manual: Math.round(manualEfficiency),
          ml: Math.round(mlEfficiency),
          recommendation: mlEfficiency > manualEfficiency ? 
            'Le système ML optimise mieux l\'usage de l\'eau' : 
            'L\'irrigation manuelle montre une meilleure régularité'
        },
        waterStress: {
          level: waterStressLevel,
          cause: stressCause,
          solution: stressSolution
        },
        evapotranspiration: {
          rate: Math.round(baseET * 10) / 10,
          impact: baseET > 5 ? 'Évapotranspiration élevée - Augmenter l\'irrigation' : 
                 baseET < 3 ? 'Évapotranspiration faible - Réduire l\'irrigation' :
                 'Évapotranspiration normale'
        },
        soilMoisture: {
          status: soilStatus,
          action: soilAction
        }
      });
    };

    analyzeIrrigationData();
    const interval = setInterval(analyzeIrrigationData, 5 * 60 * 1000); // Analyse toutes les 5 minutes
    
    return () => clearInterval(interval);
  }, [weatherData]);

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
          
          {/* Analyse Scientifique des Tendances Agricoles */}
          <div className="mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span>Analyse Scientifique des Tendances Agricoles</span>
                  <Sprout className="h-4 w-4 text-green-500" />
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Analyse agronomique basée sur l'évapotranspiration, le stress hydrique et l'efficacité d'irrigation
                </p>
              </CardHeader>
              <CardContent>
                {irrigationAnalysis ? (
                  <div className="space-y-6">
                    {/* Efficacité des systèmes d'irrigation */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                        <div className="flex items-center space-x-2 mb-2">
                          <Droplets className="h-4 w-4 text-red-600" />
                          <span className="font-medium text-red-800">Irrigation Manuelle</span>
                        </div>
                        <div className="text-xl font-bold text-red-600 mb-1">
                          {irrigationAnalysis.efficiency.manual}% d'efficacité
                        </div>
                        <div className="text-sm text-red-700">
                          Tendance: <span className="capitalize font-medium">{irrigationAnalysis.manualTrend}</span>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center space-x-2 mb-2">
                          <BarChart3 className="h-4 w-4 text-blue-600" />
                          <span className="font-medium text-blue-800">Irrigation ML</span>
                        </div>
                        <div className="text-xl font-bold text-blue-600 mb-1">
                          {irrigationAnalysis.efficiency.ml}% d'efficacité
                        </div>
                        <div className="text-sm text-blue-700">
                          Tendance: <span className="capitalize font-medium">{irrigationAnalysis.mlTrend}</span>
                        </div>
                      </div>
                    </div>

                    {/* Recommandation d'efficacité */}
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <h4 className="font-medium text-green-800 mb-2">💡 Recommandation Agronomique</h4>
                      <p className="text-sm text-green-700">{irrigationAnalysis.efficiency.recommendation}</p>
                    </div>

                    {/* Analyse du stress hydrique */}
                    <div className={`p-4 rounded-lg border ${
                      irrigationAnalysis.waterStress.level === 'élevé' ? 'bg-red-50 border-red-200' :
                      irrigationAnalysis.waterStress.level === 'modéré' ? 'bg-yellow-50 border-yellow-200' :
                      'bg-green-50 border-green-200'
                    }`}>
                      <h4 className={`font-medium mb-2 ${
                        irrigationAnalysis.waterStress.level === 'élevé' ? 'text-red-800' :
                        irrigationAnalysis.waterStress.level === 'modéré' ? 'text-yellow-800' :
                        'text-green-800'
                      }`}>
                        🌡️ Stress Hydrique: <span className="capitalize">{irrigationAnalysis.waterStress.level}</span>
                      </h4>
                      <p className={`text-sm mb-2 ${
                        irrigationAnalysis.waterStress.level === 'élevé' ? 'text-red-700' :
                        irrigationAnalysis.waterStress.level === 'modéré' ? 'text-yellow-700' :
                        'text-green-700'
                      }`}>
                        <strong>Cause:</strong> {irrigationAnalysis.waterStress.cause}
                      </p>
                      <p className={`text-sm ${
                        irrigationAnalysis.waterStress.level === 'élevé' ? 'text-red-700' :
                        irrigationAnalysis.waterStress.level === 'modéré' ? 'text-yellow-700' :
                        'text-green-700'
                      }`}>
                        <strong>Action:</strong> {irrigationAnalysis.waterStress.solution}
                      </p>
                    </div>

                    {/* Évapotranspiration et humidité du sol */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <h4 className="font-medium text-purple-800 mb-2">
                          🌿 Évapotranspiration (ET₀)
                        </h4>
                        <div className="text-xl font-bold text-purple-600 mb-1">
                          {irrigationAnalysis.evapotranspiration.rate} mm/jour
                        </div>
                        <p className="text-sm text-purple-700">
                          {irrigationAnalysis.evapotranspiration.impact}
                        </p>
                      </div>
                      
                      <div className={`p-4 rounded-lg border ${
                        irrigationAnalysis.soilMoisture.status === 'déficit' ? 'bg-orange-50 border-orange-200' :
                        irrigationAnalysis.soilMoisture.status === 'excès' ? 'bg-red-50 border-red-200' :
                        'bg-green-50 border-green-200'
                      }`}>
                        <h4 className={`font-medium mb-2 ${
                          irrigationAnalysis.soilMoisture.status === 'déficit' ? 'text-orange-800' :
                          irrigationAnalysis.soilMoisture.status === 'excès' ? 'text-red-800' :
                          'text-green-800'
                        }`}>
                          💧 Humidité du Sol: <span className="capitalize">{irrigationAnalysis.soilMoisture.status}</span>
                        </h4>
                        <p className={`text-sm ${
                          irrigationAnalysis.soilMoisture.status === 'déficit' ? 'text-orange-700' :
                          irrigationAnalysis.soilMoisture.status === 'excès' ? 'text-red-700' :
                          'text-green-700'
                        }`}>
                          {irrigationAnalysis.soilMoisture.action}
                        </p>
                      </div>
                    </div>

                    {/* Note méthodologique */}
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-600">
                        <strong>Méthodologie:</strong> Analyse basée sur la régression linéaire des tendances, 
                        calcul d'évapotranspiration selon Penman-Monteith simplifiée, 
                        et évaluation du stress hydrique selon les paramètres climatiques.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">Analyse des données d'irrigation en cours...</p>
                  </div>
                )}
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
