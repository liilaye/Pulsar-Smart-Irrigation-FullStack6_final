
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

  // Analyse simple des max et min
  const [irrigationAnalysis, setIrrigationAnalysis] = useState<{
    manual: {
      max: number;
      min: number;
      current: number;
    };
    ml: {
      max: number;
      min: number;
      current: number;
    };
  } | null>(null);

  useEffect(() => {
    // Analyser les données d'irrigation - valeurs max et min seulement
    const analyzeMinMax = () => {
      const chartData = irrigationDataService.generateChartData();
      const dailyData = chartData.daily;
      
      // Récupérer toutes les valeurs non-nulles
      const manualValues = dailyData.map(d => d.manualQuantity).filter(v => v > 0);
      const mlValues = dailyData.map(d => d.mlQuantity).filter(v => v > 0);
      
      // Calculer max et min pour chaque type
      const manualMax = manualValues.length > 0 ? Math.max(...manualValues) : 0;
      const manualMin = manualValues.length > 0 ? Math.min(...manualValues) : 0;
      const manualCurrent = dailyData[dailyData.length - 1]?.manualQuantity || 0;
      
      const mlMax = mlValues.length > 0 ? Math.max(...mlValues) : 0;
      const mlMin = mlValues.length > 0 ? Math.min(...mlValues) : 0;
      const mlCurrent = dailyData[dailyData.length - 1]?.mlQuantity || 0;
      
      setIrrigationAnalysis({
        manual: {
          max: Math.round(manualMax * 1000) / 1000,
          min: Math.round(manualMin * 1000) / 1000,
          current: Math.round(manualCurrent * 1000) / 1000
        },
        ml: {
          max: Math.round(mlMax * 1000) / 1000,
          min: Math.round(mlMin * 1000) / 1000,
          current: Math.round(mlCurrent * 1000) / 1000
        }
      });
    };

    analyzeMinMax();
    const interval = setInterval(analyzeMinMax, 5 * 60 * 1000); // Analyse toutes les 5 minutes
    
    return () => clearInterval(interval);
  }, []);

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
          
          {/* Analyse Min/Max des Tendances */}
          <div className="mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span>Analyse Min/Max des Tendances d'Irrigation</span>
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Analyse dynamique des valeurs maximales et minimales pour chaque type d'irrigation
                </p>
              </CardHeader>
              <CardContent>
                {irrigationAnalysis ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Irrigation Manuelle */}
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-center space-x-2 mb-4">
                        <Droplets className="h-5 w-5 text-red-600" />
                        <span className="font-medium text-red-800">Irrigation Manuelle</span>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-red-700">Maximum:</span>
                          <span className="font-bold text-red-600">{irrigationAnalysis.manual.max} m³</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-red-700">Minimum:</span>
                          <span className="font-bold text-red-600">{irrigationAnalysis.manual.min} m³</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-red-700">Actuel:</span>
                          <span className="font-bold text-red-600">{irrigationAnalysis.manual.current} m³</span>
                        </div>
                        
                        <div className="pt-2 border-t border-red-200">
                          <span className="text-xs text-red-600">
                            Écart: {((irrigationAnalysis.manual.max - irrigationAnalysis.manual.min) * 1000).toFixed(0)} L
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Irrigation ML */}
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center space-x-2 mb-4">
                        <BarChart3 className="h-5 w-5 text-blue-600" />
                        <span className="font-medium text-blue-800">Irrigation ML</span>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-blue-700">Maximum:</span>
                          <span className="font-bold text-blue-600">{irrigationAnalysis.ml.max} m³</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-blue-700">Minimum:</span>
                          <span className="font-bold text-blue-600">{irrigationAnalysis.ml.min} m³</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-blue-700">Actuel:</span>
                          <span className="font-bold text-blue-600">{irrigationAnalysis.ml.current} m³</span>
                        </div>
                        
                        <div className="pt-2 border-t border-blue-200">
                          <span className="text-xs text-blue-600">
                            Écart: {((irrigationAnalysis.ml.max - irrigationAnalysis.ml.min) * 1000).toFixed(0)} L
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">Analyse des données min/max en cours...</p>
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
