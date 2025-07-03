import React from 'react';

interface MLConnectionStatusProps {
  isConnected: boolean;
  isMLActive: boolean;
}

export const MLConnectionStatus = ({ isConnected, isMLActive }: MLConnectionStatusProps) => {
  return (
    <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
      <div className="grid grid-cols-2 gap-2">
        <div className="flex justify-between">
          <span>Mode:</span>
          <span className="text-blue-600">Backend Flask ML SÉCURISÉ</span>
        </div>
        <div className="flex justify-between">
          <span>Backend Flask:</span>
          <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
            {isConnected ? 'Connecté' : 'Déconnecté'}
          </span>
        </div>
        <div className="flex justify-between">
          <span>ML Engine:</span>
          <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
            {isConnected ? 'Prédiction Seule' : 'Indisponible'}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Auto-Start:</span>
          <span className="text-red-600 font-semibold">DÉSACTIVÉ ✓</span>
        </div>
        <div className="flex justify-between">
          <span>État ML:</span>
          <span className={isMLActive ? 'text-blue-600' : 'text-gray-600'}>
            {isMLActive ? 'ADMIN VALIDÉ' : 'Inactif'}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Validation:</span>
          <span className="text-amber-600 font-semibold">ADMIN REQUIS ✓</span>
        </div>
      </div>
    </div>
  );
};