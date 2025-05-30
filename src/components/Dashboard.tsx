
import React from 'react';
import { QuickControl } from './QuickControl';
import { AgroClimateParams } from './AgroClimateParams';
import { IrrigationStatus } from './IrrigationStatus';
import { WaterChart } from './WaterChart';
import { Recommendations } from './Recommendations';
import { IrrigationSystemConfig } from './IrrigationSystemConfig';

export const Dashboard = () => {
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
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Analyse des Tendances</h3>
              <p className="text-gray-600">Évolution de la consommation d'eau et des paramètres du sol sur les 30 derniers jours.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Prédictions ML</h3>
              <p className="text-gray-600">Recommandations basées sur l'analyse des 15 paramètres agro-environnementaux.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Section Recommandations */}
      <section id="recommendations" className="scroll-mt-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Recommandations</h2>
        <Recommendations />
      </section>
      
      {/* Section Système d'Irrigation */}
      <section id="irrigation-system" className="scroll-mt-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Système d'Irrigation</h2>
        <div className="max-w-md">
          <IrrigationSystemConfig />
        </div>
      </section>
    </div>
  );
};
