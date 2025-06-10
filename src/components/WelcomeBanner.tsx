
import React from 'react';

export const WelcomeBanner = () => {
  return (
    <div className="mb-8">
      <div 
        className="relative overflow-hidden rounded-xl shadow-lg p-8 text-center bg-white border-2 border-blue-500"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&w=1920&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Overlay pour améliorer la lisibilité */}
        <div className="absolute inset-0 bg-white/85 backdrop-blur-sm"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-center mb-4">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-blue-600 mb-2">
                Bienvenue sur la plateforme
              </h1>
              <h2 className="text-4xl font-extrabold text-blue-700 mb-2">
                Pulsar Smart Irrigation
              </h2>
              <p className="text-xl text-blue-500 font-medium">
                La Plateforme Agricole Intelligente
              </p>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-lg text-blue-700">🌱 Agriculture Smart</h3>
              <p className="text-sm text-blue-600">Irrigation intelligente basée sur l'IA</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-lg text-blue-700">📊 Données Temps Réel</h3>
              <p className="text-sm text-blue-600">Monitoring en continu des cultures</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-lg text-blue-700">⚡ Contrôle MQTT</h3>
              <p className="text-sm text-blue-600">Gestion à distance optimisée</p>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full -translate-y-16 translate-x-16 opacity-30"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-100 rounded-full translate-y-12 -translate-x-12 opacity-30"></div>
      </div>
    </div>
  );
};
