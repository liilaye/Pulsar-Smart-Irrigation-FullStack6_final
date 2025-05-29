
import React from 'react';
import { QuickControl } from './QuickControl';
import { AgroClimateParams } from './AgroClimateParams';
import { IrrigationStatus } from './IrrigationStatus';
import { WaterChart } from './WaterChart';
import { Recommendations } from './Recommendations';

export const Dashboard = () => {
  return (
    <div className="space-y-8">
      {/* Section Tableau de bord */}
      <section id="dashboard" className="scroll-mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <QuickControl />
          <IrrigationStatus />
        </div>
      </section>
      
      {/* Section Irrigation - Contrôles détaillés */}
      <section id="irrigation" className="scroll-mt-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Contrôle d'Irrigation</h2>
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
      
      {/* Section Paramètres */}
      <section id="settings" className="scroll-mt-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Paramètres du Système</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Configuration</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fréquence de synchronisation ML
                </label>
                <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                  <option>Toutes les 15 minutes</option>
                  <option>Toutes les 30 minutes</option>
                  <option>Toutes les heures</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mode d'irrigation par défaut
                </label>
                <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                  <option>Automatique (ML)</option>
                  <option>Manuel</option>
                  <option>Programmé</option>
                </select>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">État du Système</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Connexion Backend</span>
                <span className="text-sm font-medium text-green-600">Connecté</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Modèle ML</span>
                <span className="text-sm font-medium text-green-600">Actif</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Capteurs</span>
                <span className="text-sm font-medium text-green-600">15/15 Actifs</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
