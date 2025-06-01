
import React from 'react';
import { Button } from "@/components/ui/button";
import { Wifi, WifiOff, RotateCcw } from 'lucide-react';

interface ConnectionStatusProps {
  isConnected: boolean;
  connectionAttempts: number;
  maxRetries: number;
  onRetry: () => void;
}

export const ConnectionStatus = ({ isConnected, connectionAttempts, maxRetries, onRetry }: ConnectionStatusProps) => {
  const connectionStatusIcon = isConnected ? 
    <Wifi className="h-4 w-4 text-green-500" /> : 
    <WifiOff className="h-4 w-4 text-red-500" />;

  const connectionStatusText = isConnected ? 
    'MQTT Connecté' : 
    connectionAttempts >= maxRetries ? 
      'Connexion échouée' : 
      `Tentative ${connectionAttempts}/${maxRetries}`;

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-3">
        {connectionStatusIcon}
        <span className="text-sm font-medium">{connectionStatusText}</span>
      </div>
      {!isConnected && (
        <Button 
          size="sm" 
          variant="outline" 
          onClick={onRetry}
          className="flex items-center space-x-2"
        >
          <RotateCcw className="h-3 w-3" />
          <span>Retry</span>
        </Button>
      )}
    </div>
  );
};
