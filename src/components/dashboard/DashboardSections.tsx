
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
      {/* Section Tableau de bord principal avec nouvelle disposition */}
      <section id="dashboard" className="scroll-mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Section de contrôle occupe 2/3 de l'espace */}
          <div className="lg:col-span-2">
            <QuickControl />
          </div>
          {/* Section de statut occupe 1/3 de l'espace */}
          <div className="lg:col-span-1">
            <IrrigationStatus />
          </div>
        </div>
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
