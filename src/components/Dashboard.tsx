
import React, { useState, useEffect } from 'react';
import { BackendConnectionStatus } from './BackendConnectionStatus';
import { WelcomeBanner } from './WelcomeBanner';
import { Footer } from './Footer';
import { DashboardSections } from './dashboard/DashboardSections';
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
        
        {/* Toutes les sections principales */}
        <DashboardSections
          selectedLocation={selectedLocation}
          setSelectedLocation={setSelectedLocation}
          weatherData={weatherData}
          isLoading={isLoading}
          error={error}
          locationName={getLocationName()}
          irrigationAnalysis={irrigationAnalysis}
        />
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};
