
import React from 'react';

export const WelcomeBanner = () => {
  return (
    <div className="mb-8">
      <div 
        className="relative overflow-hidden rounded-xl shadow-lg p-8 text-center"
        style={{ 
          background: 'linear-gradient(135deg, #0505FB 0%, #3B82F6 50%, #60A5FA 100%)'
        }}
      >
        <div className="relative z-10">
          <div className="flex items-center justify-center mb-4">
            <img 
              src="/lovable-uploads/6def057b-4ec6-4316-8956-65d39f2ffa31.png" 
              alt="PulsarInfinite Logo" 
              className="h-16 w-auto object-contain mr-4"
            />
            <div className="text-left">
              <h1 className="text-3xl font-bold text-white mb-2">
                Bienvenue sur la plateforme
              </h1>
              <h2 className="text-4xl font-extrabold text-white mb-2">
                Pulsar Smart Irrigation
              </h2>
              <p className="text-xl text-blue-100 font-medium">
                La Plateforme Agricole Intelligente
              </p>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-white">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <h3 className="font-semibold text-lg">🌱 Agriculture Smart</h3>
              <p className="text-sm text-blue-100">Irrigation intelligente basée sur l'IA</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <h3 className="font-semibold text-lg">📊 Données Temps Réel</h3>
              <p className="text-sm text-blue-100">Monitoring en continu des cultures</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <h3 className="font-semibold text-lg">⚡ Contrôle MQTT</h3>
              <p className="text-sm text-blue-100">Gestion à distance optimisée</p>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
      </div>
    </div>
  );
};
