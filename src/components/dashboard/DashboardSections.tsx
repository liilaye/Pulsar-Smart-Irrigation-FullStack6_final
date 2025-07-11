
import React from 'react';
import { QuickControl } from '../QuickControl';
import { IrrigationStatus } from '../IrrigationStatus';
import { AgroClimateParams } from '../AgroClimateParams';
import { AnalyticsSection } from './AnalyticsSection';
import { IrrigationRecommendations } from '../irrigation/IrrigationRecommendations';
import { SimpleManualControl } from '../irrigation/SimpleManualControl';
import { SimpleMLControl } from '../irrigation/SimpleMLControl';
import { DeviceLocationMap } from '../DeviceLocationMap';
import { BackendConnectionStatus } from '../BackendConnectionStatus';

export const DashboardSections = () => {
  return (
    <>

      {/* Section Recommandations d'Arrosage */}
      <section id="recommendations" className="scroll-mt-6">
        <IrrigationRecommendations />
      </section>
      
      {/* Section Zone d'Irrigation */}
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
      
      {/* Section Paramètres Agro-climatiques - maintenant dynamique */}
      <section id="sensors" className="scroll-mt-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Paramètres Agro-climatiques</h2>
        <AgroClimateParams />
      </section>
      
      {/* Section Analyses et Graphiques */}
      <AnalyticsSection />
      
      {/* Section Localisation PulsarInfinite - nouvelle section en bas */}
      <section id="device-location" className="scroll-mt-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Localisation du Dispositif</h2>
        <DeviceLocationMap />
      </section>
    </>
  );
};
