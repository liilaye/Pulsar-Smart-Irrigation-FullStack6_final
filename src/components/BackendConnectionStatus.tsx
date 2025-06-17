
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import { useBackendConnection } from '@/hooks/useBackendConnection';

export const BackendConnectionStatus = () => {
  const { isConnected, isLoading, error, lastChecked, checkConnection } = useBackendConnection();

  const getStatusIcon = () => {
    if (isLoading) return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />;
    if (isConnected) return <CheckCircle className="h-4 w-4 text-green-500" />;
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusColor = () => {
    if (isLoading) return 'border-blue-200 bg-blue-50';
    if (isConnected) return 'border-green-200 bg-green-50';
    return 'border-red-200 bg-red-50';
  };

  const getStatusText = () => {
    if (isLoading) return 'Vérification...';
    if (isConnected) return 'Backend Flask connecté';
    return 'Backend Flask déconnecté';
  };

  return (
    <Card className={`${getStatusColor()} border-2`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <span className="font-medium text-sm">{getStatusText()}</span>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={checkConnection}
            disabled={isLoading}
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Tester
          </Button>
        </div>
        
        {error && (
          <div className="mt-2 flex items-start space-x-2">
            <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-orange-700">
              <p className="font-medium">Erreur de connexion:</p>
              <p>{error}</p>
              <p className="text-xs mt-1">
                Vérifiez que le serveur Flask fonctionne sur http://localhost:5002
              </p>
            </div>
          </div>
        )}
        
        {lastChecked && (
          <p className="text-xs text-gray-500 mt-2">
            Dernière vérification: {lastChecked.toLocaleTimeString('fr-FR')}
          </p>
        )}
        
        {!isConnected && !isLoading && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800 font-medium">📋 Instructions de démarrage:</p>
            <ol className="text-xs text-yellow-700 mt-1 space-y-1 list-decimal list-inside">
              <li>Naviguez vers le dossier backend: <code className="bg-yellow-100 px-1 rounded">cd backend</code></li>
              <li>Installez les dépendances: <code className="bg-yellow-100 px-1 rounded">pip install -r requirements.txt</code></li>
              <li>Démarrez le serveur: <code className="bg-yellow-100 px-1 rounded">python app.py</code></li>
            </ol>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
