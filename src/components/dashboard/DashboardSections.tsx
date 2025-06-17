
import React from 'react';
import { QuickControl } from '../QuickControl';
import { IrrigationStatus } from '../IrrigationStatus';
import { AgroClimateParams } from '../AgroClimateParams';
import { WeatherSection } from './WeatherSection';
import { AnalyticsSection } from './AnalyticsSection';
import { WeatherData } from '@/services/weatherService';
import { IrrigationRecommendations } from '../irrigation/IrrigationRecommendations';
import { SimpleManualControl } from '../irrigation/SimpleManualControl';
import { SimpleMLControl } from '../irrigation/SimpleMLControl';

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
      {/* Section Recommandations d'Arrosage */}
      <section id="recommendations" className="scroll-mt-6">
        <IrrigationRecommendations />
      </section>
      
      {/* Section Zone d'Irrigation - Juste après recommandations */}
      <section className="scroll-mt-6">
        <IrrigationStatus />
      </section>
      
      {/* Section Arrosage Manuel */}
      <section id="manual-irrigation" className="scroll-mt-6">
        <SimpleManualControl />
      </section>
      
      {/* Section Irrigation Intelligente ML */}
      <section id="ml-irrigation" className="scroll-mt-6">
        <SimpleMLControl />
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
