
import React from 'react';
import { WeatherSection } from './WeatherSection';
import { AnalyticsSection } from './AnalyticsSection';

interface DashboardSectionsProps {
  weatherData: any;
  irrigationAnalysis: any;
}

export const DashboardSections = ({ weatherData }: DashboardSectionsProps) => {
  return (
    <div className="space-y-8">
      {/* Section Météo */}
      <WeatherSection weatherData={weatherData} />
      
      {/* Section Analytics - plus besoin de passer irrigationAnalysis */}
      <AnalyticsSection />
    </div>
  );
};
