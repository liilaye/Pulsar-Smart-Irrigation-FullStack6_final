
import React from 'react';
import { WaterChart } from '../WaterChart';
import { IrrigationAnalysis } from './IrrigationAnalysis';

export const AnalyticsSection = () => {
  return (
    <section id="analytics" className="scroll-mt-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Analyses et Graphiques</h2>
      
      {/* Graphique principal */}
      <div className="mb-6">
        <WaterChart />
      </div>
      
      {/* Analyse Min/Max des Tendances */}
      <IrrigationAnalysis />
    </section>
  );
};
