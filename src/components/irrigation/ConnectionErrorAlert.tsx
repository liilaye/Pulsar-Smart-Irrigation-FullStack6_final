
import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ConnectionErrorAlertProps {
  isConnected: boolean;
  connectionAttempts: number;
  maxRetries: number;
}

export const ConnectionErrorAlert = ({ isConnected, connectionAttempts, maxRetries }: ConnectionErrorAlertProps) => {
  if (isConnected || connectionAttempts < maxRetries) return null;

  return (
    <div className="flex items-center space-x-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
      <AlertCircle className="h-4 w-4 text-orange-500" />
      <p className="text-sm text-orange-700">
        ⚠️ Impossible de se connecter au broker MQTT JHipster. Vérifiez la connexion réseau.
      </p>
    </div>
  );
};
