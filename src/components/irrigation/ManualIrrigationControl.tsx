
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useMQTT } from '@/hooks/useMQTT';
import { useToast } from '@/hooks/use-toast';
import { irrigationSyncService } from '@/services/irrigationSyncService';
import { Wifi, WifiOff, Activity, AlertTriangle, Info } from 'lucide-react';

export const ManualIrrigationControl = () => {
  const [isManualActive, setIsManualActive] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [conflictMessage, setConflictMessage] = useState<string>('');
  const [isPublishing, setIsPublishing] = useState(false);
  const { 
    isConnected, 
    currentBroker, 
    connectionHealth, 
    irrigationStatus, 
    publishIrrigationCommand,
    retryConnection,
    getBrokerInfo 
  } = useMQTT();
  const { toast } = useToast();

  useEffect(() => {
    // S'abonner aux changements d'état global
    const unsubscribe = irrigationSyncService.subscribe((state) => {
      setIsManualActive(state.isActive && state.type === 'manual');
      setStartTime(state.startTime);
      
      // Effacer le message de conflit si irrigation arrêtée
      if (!state.isActive) {
        setConflictMessage('');
      }
    });

    return unsubscribe;
  }, []);

  const toggleManualIrrigation = async (enabled: boolean) => {
    console.log('🔄 Toggle irrigation MQTT robuste:', enabled);
    
    if (!isConnected) {
      toast({
        title: "❌ Erreur de connexion",
        description: "Broker MQTT non connecté",
        variant: "destructive"
      });
      return;
    }

    if (connectionHealth < 50) {
      toast({
        title: "⚠️ Connexion instable",
        description: `Santé connexion: ${connectionHealth}% - Recommandé de retry`,
        variant: "destructive"
      });
      return;
    }

    setIsPublishing(true);

    try {
      if (enabled) {
        // Vérifier si on peut démarrer
        const { canStart, reason } = irrigationSyncService.canStartIrrigation('manual');
        if (!canStart) {
          setConflictMessage(reason || 'Irrigation déjà active');
          toast({
            title: "⚠️ Conflit d'irrigation",
            description: reason,
            variant: "destructive"
          });
          return;
        }

        // Démarrer irrigation manuelle
        if (irrigationSyncService.startIrrigation('manual', 'MQTT_Direct_Robust')) {
          const success = await publishIrrigationCommand(1);

          if (success) {
            toast({
              title: "🚿 Irrigation manuelle démarrée",
              description: "Commande envoyée avec confirmation reçue",
            });
          } else {
            // Annuler le démarrage en cas d'échec
            irrigationSyncService.stopIrrigation('MQTT_Error');
            toast({
              title: "❌ Échec irrigation",
              description: "Impossible de démarrer l'irrigation - Retry recommandé",
              variant: "destructive"
            });
          }
        }
      } else {
        // Arrêter irrigation
        const success = await publishIrrigationCommand(0);

        if (success) {
          const duration = startTime ? (new Date().getTime() - startTime.getTime()) / 1000 / 60 : 0;
          const volume = (duration * 20) / 1000; // 20L/min converti en m³
          
          // Envoyer les données au backend pour logging
          try {
            await fetch('/api/irrigation/log-manual', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                duration_minutes: duration,
                volume_m3: volume,
                start_time: startTime?.toISOString(),
                end_time: new Date().toISOString()
              })
            });
          } catch (error) {
            console.warn('⚠️ Erreur logging backend:', error);
          }
          
          irrigationSyncService.stopIrrigation('MQTT_Manual_Robust');
          
          toast({
            title: "⏹️ Irrigation manuelle arrêtée",
            description: `Durée: ${duration.toFixed(1)} min - Volume: ${volume.toFixed(3)} m³`,
          });
        } else {
          toast({
            title: "❌ Erreur arrêt",
            description: "Impossible d'arrêter l'irrigation - Vérifiez la connexion",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('❌ Erreur toggle irrigation:', error);
      toast({
        title: "❌ Erreur système",
        description: "Erreur lors de la commande d'irrigation",
        variant: "destructive"
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleRetryConnection = () => {
    toast({
      title: "🔄 Reconnexion en cours",
      description: "Tentative de reconnexion au broker MQTT...",
    });
    retryConnection();
  };

  const brokerInfo = getBrokerInfo();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Arrosage Manuel - Direct MQTT Robuste</span>
          <Button
            size="sm"
            variant="outline"
            onClick={handleRetryConnection}
            disabled={isConnected && connectionHealth > 70}
          >
            🔄 Retry
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status de connexion détaillé */}
        <div className="p-4 bg-gray-50 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {isConnected ? (
                <Wifi className="h-5 w-5 text-green-500" />
              ) : (
                <WifiOff className="h-5 w-5 text-red-500" />
              )}
              <div>
                <div className="font-medium">
                  {isConnected ? 'Connecté' : 'Déconnecté'}
                </div>
                <div className="text-xs text-gray-500">
                  {currentBroker || 'Aucun broker'}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <div className={`px-2 py-1 rounded text-xs font-medium ${
                connectionHealth > 80 ? 'bg-green-100 text-green-800' :
                connectionHealth > 50 ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {connectionHealth}%
              </div>
            </div>
          </div>

          {/* Barre de santé visuelle */}
          <div className="w-full bg-gray-200 rounded-full h-2">
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

        {/* Contrôle d'irrigation */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-4">
            <Switch
              checked={isManualActive}
              onCheckedChange={toggleManualIrrigation}
              disabled={!isConnected || isPublishing || connectionHealth < 30}
            />
            
            <div className="text-sm font-medium">
              {isPublishing ? "🔄 Commande en cours..." :
               isManualActive ? "💧 Irrigation activée" : "⏸️ Irrigation désactivée"}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              irrigationStatus ? 'bg-blue-500 animate-pulse' : 'bg-gray-400'
            }`}></div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              irrigationStatus ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
            }`}>
              {irrigationStatus ? 'ACTIF' : 'INACTIF'}
            </div>
          </div>
        </div>

        {/* Messages d'alerte */}
        {conflictMessage && (
          <div className="flex items-start space-x-2 p-3 bg-red-50 rounded-lg border border-red-200">
            <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
            <p className="text-sm text-red-700">{conflictMessage}</p>
          </div>
        )}

        {connectionHealth < 50 && isConnected && (
          <div className="flex items-start space-x-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
            <p className="text-sm text-yellow-700">
              Connexion instable ({connectionHealth}%). Recommandé de retry avant commande critique.
            </p>
          </div>
        )}

        {/* Information session active */}
        {isManualActive && startTime && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700">
              ⏱️ Démarré à: {startTime.toLocaleTimeString()}
            </p>
            <p className="text-xs text-blue-600">
              Débit: 20 L/min - Calcul automatique du volume
            </p>
          </div>
        )}

        {/* Informations de debugging */}
        <div className="flex items-start space-x-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <Info className="h-4 w-4 text-gray-500 mt-0.5" />
          <div className="text-xs text-gray-600 space-y-1">
            <div>Broker actuel: {brokerInfo.current || 'Aucun'}</div>
            <div>Tentatives reconnexion: {brokerInfo.reconnectAttempts}</div>
            <div>Brokers disponibles: {brokerInfo.available.length}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
