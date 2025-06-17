
import React, { useEffect } from 'react';
import { BackendConnectionStatus } from './BackendConnectionStatus';
import { WelcomeBanner } from './WelcomeBanner';
import { ActorRegistrationButton } from './ActorRegistrationButton';
import { ActiveUserSelector } from './ActiveUserSelector';
import { Footer } from './Footer';
import { DashboardSections } from './dashboard/DashboardSections';
import { activeUserService } from '@/services/activeUserService';

export const Dashboard = () => {
  useEffect(() => {
    // Charger l'utilisateur actif au démarrage si disponible
    activeUserService.loadActiveUserFromAPI();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 space-y-8">
        {/* Bannière de bienvenue */}
        <WelcomeBanner />
        
        {/* Sélecteur d'utilisateur actif */}
        <section className="mb-6">
          <ActiveUserSelector />
        </section>
        
        {/* Bouton d'enregistrement d'acteur */}
        <section className="mb-6">
          <ActorRegistrationButton />
        </section>
        
        {/* Section Statut Backend */}
        <section className="mb-6">
          <BackendConnectionStatus />
        </section>
        
        {/* Toutes les sections principales - maintenant dynamiques */}
        <DashboardSections />
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};
