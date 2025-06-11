
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useMQTT } from '@/hooks/useMQTT';
import { useToast } from '@/hooks/use-toast';
import { irrigationSyncService } from '@/services/irrigationSyncService';

export const ManualIrrigationControl = () => {
  const [isManualActive, setIsManualActive] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [conflictMessage, setConflictMessage] = useState<string>('');
  const { isConnected, publishMessage, irrigationStatus } = useMQTT();
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
    console.log('🔄 Toggle irrigation MQTT direct:', enabled);
    
    if (!isConnected) {
      toast({
        title: "❌ Erreur de connexion",
        description: "Broker MQTT non connecté",
        variant: "destructive"
      });
      return;
    }

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
      if (irrigationSyncService.startIrrigation('manual', 'MQTT_Direct')) {
        try {
          const payload = {
            switch_relay: {
              device: 1
            }
          };

          const success = publishMessage(
            'data/PulsarInfinite/swr',
            JSON.stringify(payload),
            { qos: 1, retain: true }
          );

          if (success) {
            toast({
              title: "🚿 Irrigation manuelle démarrée",
              description: "Commande envoyée directement au broker MQTT",
            });
          } else {
            // Annuler le démarrage en cas d'échec MQTT
            irrigationSyncService.stopIrrigation('MQTT_Error');
            throw new Error('Échec de publication MQTT');
          }
        } catch (error) {
          irrigationSyncService.stopIrrigation('MQTT_Error');
          throw error;
        }
      }
    } else {
      // Arrêter irrigation
      try {
        const payload = {
          switch_relay: {
            device: 0
          }
        };

        const success = publishMessage(
          'data/PulsarInfinite/swr',
          JSON.stringify(payload),
          { qos: 1, retain: true }
        );

        if (success) {
          const duration = startTime ? (new Date().getTime() - startTime.getTime()) / 1000 / 60 : 0;
          const volume = (duration * 20) / 1000; // 20L/min converti en m³
          
          // Envoyer les données au backend pour logging
          fetch('/api/irrigation/log-manual', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              duration_minutes: duration,
              volume_m3: volume,
              start_time: startTime?.toISOString(),
              end_time: new Date().toISOString()
            })
          }).catch(console.error);
          
          irrigationSyncService.stopIrrigation('MQTT_Manual');
          
          toast({
            title: "⏹️ Irrigation manuelle arrêtée",
            description: `Durée: ${duration.toFixed(1)} min - Volume: ${volume.toFixed(3)} m³`,
          });
        }
      } catch (error) {
        console.error('❌ Erreur arrêt irrigation MQTT:', error);
        toast({
          title: "❌ Erreur",
          description: "Impossible d'arrêter l'irrigation",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Arrosage Manuel - Direct MQTT
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-4">
            <Switch
              checked={isManualActive}
              onCheckedChange={toggleManualIrrigation}
              disabled={!isConnected}
            />
            
            <div className="text-sm font-medium">
              {isManualActive ? "💧 Irrigation activée" : "⏸️ Irrigation désactivée"}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
            }`}></div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              irrigationStatus ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
            }`}>
              {irrigationStatus ? 'ACTIF' : 'INACTIF'}
            </div>
          </div>
        </div>

        {conflictMessage && (
          <div className="p-3 bg-red-50 rounded-lg border border-red-200">
            <p className="text-sm text-red-700">
              ⚠️ {conflictMessage}
            </p>
          </div>
        )}

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

        {!isConnected && (
          <div className="flex items-center space-x-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-700">
              ⚠️ Broker MQTT déconnecté. Vérifiez la connexion au broker 217.182.210.54
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
