
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMQTT } from '@/hooks/useMQTT';
import { mqttService } from '@/services/mqttService';
import { 
  Wifi, 
  WifiOff, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Play,
  RefreshCw,
  Bug
} from 'lucide-react';

export const MQTTDiagnostic = () => {
  const [diagnosticResults, setDiagnosticResults] = useState<{ success: boolean; details: string[] } | null>(null);
  const [isRunningDiagnostic, setIsRunningDiagnostic] = useState(false);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const { 
    isConnected, 
    currentBroker, 
    connectionHealth, 
    reconnectAttempts,
    retryConnection,
    getBrokerInfo 
  } = useMQTT();

  useEffect(() => {
    // Récupérer les logs de debug périodiquement
    const interval = setInterval(() => {
      const brokerInfo = getBrokerInfo();
      if (brokerInfo.debugLogs) {
        setDebugLogs(brokerInfo.debugLogs);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [getBrokerInfo]);

  const runDiagnostic = async () => {
    setIsRunningDiagnostic(true);
    setDiagnosticResults(null);
    
    try {
      const results = await mqttService.testConnection();
      setDiagnosticResults(results);
    } catch (error) {
      setDiagnosticResults({
        success: false,
        details: [`❌ Erreur diagnostic: ${error}`]
      });
    } finally {
      setIsRunningDiagnostic(false);
    }
  };

  const brokerInfo = getBrokerInfo();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center space-x-2">
            <Bug className="h-5 w-5 text-blue-600" />
            <span>Diagnostic MQTT Complet</span>
          </span>
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={retryConnection}
              disabled={isRunningDiagnostic}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Reconnect
            </Button>
            <Button
              size="sm"
              onClick={runDiagnostic}
              disabled={isRunningDiagnostic}
            >
              <Play className="h-4 w-4 mr-1" />
              {isRunningDiagnostic ? 'Test...' : 'Test Complet'}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Statut de connexion */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              {isConnected ? (
                <Wifi className="h-5 w-5 text-green-500" />
              ) : (
                <WifiOff className="h-5 w-5 text-red-500" />
              )}
              <span className="font-medium">Connexion</span>
            </div>
            <div className="text-sm text-gray-600">
              {isConnected ? 'Connecté' : 'Déconnecté'}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Tentatives: {reconnectAttempts}
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="h-5 w-5 text-blue-500" />
              <span className="font-medium">Santé</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-sm font-medium">{connectionHealth}%</div>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    connectionHealth > 80 ? 'bg-green-500' :
                    connectionHealth > 50 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${connectionHealth}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Informations détaillées */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Informations Broker</h4>
          <div className="bg-gray-50 p-3 rounded text-xs font-mono space-y-1">
            <div>🌐 URL: {currentBroker || 'Non connecté'}</div>
            <div>📋 Client ID: {brokerInfo.clientId}</div>
            <div>🔄 Reconnections: {brokerInfo.reconnectAttempts}</div>
            {brokerInfo.lastError && (
              <div className="text-red-600">❌ Dernière erreur: {brokerInfo.lastError}</div>
            )}
          </div>
        </div>

        {/* Résultats du diagnostic */}
        {diagnosticResults && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm flex items-center space-x-2">
              {diagnosticResults.success ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-500" />
              )}
              <span>Résultats du Test</span>
              <Badge variant={diagnosticResults.success ? "default" : "destructive"}>
                {diagnosticResults.success ? 'SUCCÈS' : 'ÉCHEC'}
              </Badge>
            </h4>
            <div className="bg-gray-50 p-3 rounded text-xs font-mono space-y-1 max-h-40 overflow-y-auto">
              {diagnosticResults.details.map((detail, index) => (
                <div key={index}>{detail}</div>
              ))}
            </div>
          </div>
        )}

        {/* Logs de debug en temps réel */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Logs Debug (Temps Réel)</h4>
          <div className="bg-black text-green-400 p-3 rounded text-xs font-mono space-y-1 max-h-60 overflow-y-auto">
            {debugLogs.length > 0 ? (
              debugLogs.slice(-20).map((log, index) => (
                <div key={index}>{log}</div>
              ))
            ) : (
              <div className="text-gray-500">Aucun log disponible...</div>
            )}
          </div>
        </div>

        {/* Actions rapides */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              console.log('📊 État MQTT complet:', mqttService.getState());
            }}
          >
            Logs Console
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const logs = mqttService.getDebugLogs();
              navigator.clipboard.writeText(logs.join('\n'));
            }}
          >
            Copier Logs
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
