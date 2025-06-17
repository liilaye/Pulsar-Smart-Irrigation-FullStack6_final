
import React from 'react';
import { WaterChart } from '../WaterChart';
import { IrrigationAnalysis } from './IrrigationAnalysis';

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

interface AnalyticsSectionProps {
  irrigationAnalysis: IrrigationAnalysisData | null;
}

export const AnalyticsSection = ({ irrigationAnalysis }: AnalyticsSectionProps) => {
  return (
    <section id="analytics" className="scroll-mt-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Analyses et Graphiques</h2>
      
      {/* Graphique principal */}
      <div className="mb-6">
        <WaterChart />
      </div>
      
      {/* Analyse Min/Max des Tendances */}
      <IrrigationAnalysis irrigationAnalysis={irrigationAnalysis} />
    </section>
  );
};
