
import React from 'react';

export const WelcomeBanner = () => {
  return (
    <div className="mb-8">
      <div 
        className="relative overflow-hidden rounded-xl shadow-lg p-8 text-center bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800"
      >
        <div className="relative z-10">
          <div className="flex items-center justify-center mb-4">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-sm">
                Bienvenue sur la plateforme
              </h1>
              <h2 className="text-4xl font-extrabold text-blue-100 mb-2 drop-shadow-sm">
                Pulsar Smart Irrigation
              </h2>
              <p className="text-xl text-blue-200 font-medium drop-shadow-sm">
                La Plateforme Agricole Intelligente
              </p>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 border border-blue-300/30 rounded-lg p-4 backdrop-blur-sm">
              <h3 className="font-semibold text-lg text-white">🌱 Agriculture Smart</h3>
              <p className="text-sm text-blue-100">Irrigation intelligente basée sur l'IA</p>
            </div>
            <div className="bg-white/10 border border-blue-300/30 rounded-lg p-4 backdrop-blur-sm">
              <h3 className="font-semibold text-lg text-white">📊 Données Temps Réel</h3>
              <p className="text-sm text-blue-100">Monitoring en continu des cultures</p>
            </div>
            <div className="bg-white/10 border border-blue-300/30 rounded-lg p-4 backdrop-blur-sm">
              <h3 className="font-semibold text-lg text-white">⚡ Contrôle MQTT</h3>
              <p className="text-sm text-blue-100">Gestion à distance optimisée</p>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
        
        {/* Additional decorative pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full"></div>
          <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-white rounded-full"></div>
          <div className="absolute bottom-1/4 left-1/2 w-1.5 h-1.5 bg-white rounded-full"></div>
        </div>
      </div>
    </div>
  );
};
