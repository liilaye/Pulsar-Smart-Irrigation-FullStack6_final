
import React from 'react';
import { QuickControl } from '../QuickControl';
import { IrrigationStatus } from '../IrrigationStatus';
import { AgroClimateParams } from '../AgroClimateParams';
import { WeatherSection } from './WeatherSection';
import { AnalyticsSection } from './AnalyticsSection';
import { WeatherData } from '@/services/weatherService';

interface IrrigationAnalysisData {
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
}

interface DashboardSectionsProps {
  selectedLocation: 'thies' | 'taiba-ndiaye' | 'hann-maristes' | 'dakar' | 'bargny';
  setSelectedLocation: (location: 'thies' | 'taiba-ndiaye' | 'hann-maristes' | 'dakar' | 'bargny') => void;
  weatherData: WeatherData | null;
  isLoading: boolean;
  error: string | null;
  locationName: string;
  irrigationAnalysis: IrrigationAnalysisData | null;
}

export const DashboardSections = ({
  selectedLocation,
  setSelectedLocation,
  weatherData,
  isLoading,
  error,
  locationName,
  irrigationAnalysis
}: DashboardSectionsProps) => {
  return (
    <>
      {/* Section Contrôles d'irrigation - Pleine largeur */}
      <section id="dashboard" className="scroll-mt-6">
        <QuickControl />
      </section>
      
      {/* Section Zone d'Irrigation - Séparée */}
      <section className="scroll-mt-6">
        <IrrigationStatus />
      </section>
      
      {/* Section Paramètres Agro-climatiques */}
      <section id="sensors" className="scroll-mt-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Paramètres Agro-climatiques</h2>
        <AgroClimateParams onLocationChange={setSelectedLocation} />
      </section>

      {/* Section Conditions Météo */}
      <WeatherSection 
        weatherData={weatherData}
        isLoading={isLoading}
        error={error}
        locationName={locationName}
      />
      
      {/* Section Analyses et Graphiques */}
      <AnalyticsSection irrigationAnalysis={irrigationAnalysis} />
    </>
  );
};
