
import React from 'react';

export const WelcomeBanner = () => {
  return (
    <div className="mb-8">
      <div 
        className="relative overflow-hidden rounded-xl shadow-lg p-8 text-center bg-white border-2 border-blue-500"
        style={{
          backgroundImage: 'url(/lovable-uploads/83f13bec-c4eb-4abd-9ae6-af3242260bd8.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Overlay réduit pour mieux voir l'image */}
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px]"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-center mb-4">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-blue-700 mb-2 drop-shadow-sm">
                Bienvenue sur la plateforme
              </h1>
              <h2 className="text-4xl font-extrabold text-blue-800 mb-2 drop-shadow-sm">
                Pulsar Smart Irrigation
              </h2>
              <p className="text-xl text-blue-600 font-medium drop-shadow-sm">
                La Plateforme Agricole Intelligente
              </p>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50/90 border border-blue-200 rounded-lg p-4 backdrop-blur-sm">
              <h3 className="font-semibold text-lg text-blue-700">🌱 Agriculture Smart</h3>
              <p className="text-sm text-blue-600">Irrigation intelligente basée sur l'IA</p>
            </div>
            <div className="bg-blue-50/90 border border-blue-200 rounded-lg p-4 backdrop-blur-sm">
              <h3 className="font-semibold text-lg text-blue-700">📊 Données Temps Réel</h3>
              <p className="text-sm text-blue-600">Monitoring en continu des cultures</p>
            </div>
            <div className="bg-blue-50/90 border border-blue-200 rounded-lg p-4 backdrop-blur-sm">
              <h3 className="font-semibold text-lg text-blue-700">⚡ Contrôle MQTT</h3>
              <p className="text-sm text-blue-600">Gestion à distance optimisée</p>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/30 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-100/30 rounded-full translate-y-12 -translate-x-12"></div>
      </div>
    </div>
  );
};
