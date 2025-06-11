
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMQTT } from '@/hooks/useMQTT';
import { useToast } from '@/hooks/use-toast';
import { irrigationSyncService } from '@/services/irrigationSyncService';
import { Power, PowerOff } from 'lucide-react';

export const ManualIrrigationControl = () => {
  const [isManualActive, setIsManualActive] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const { 
    isConnected, 
    irrigationStatus, 
    publishIrrigationCommand
  } = useMQTT();
  const { toast } = useToast();

  useEffect(() => {
    // S'abonner aux changements d'état global
    const unsubscribe = irrigationSyncService.subscribe((state) => {
      setIsManualActive(state.isActive && state.type === 'manual');
      setStartTime(state.startTime);
    });

    return unsubscribe;
  }, []);

  const startIrrigation = async () => {
    console.log('🚿 Démarrage irrigation MQTT');
    
    if (!isConnected) {
      toast({
        title: "❌ Erreur de connexion",
        description: "Broker MQTT non connecté",
        variant: "destructive"
      });
      return;
    }

    setIsPublishing(true);

    try {
      // Vérifier si on peut démarrer
      const { canStart, reason } = irrigationSyncService.canStartIrrigation('manual');
      if (!canStart) {
        toast({
          title: "⚠️ Conflit d'irrigation",
          description: reason,
          variant: "destructive"
        });
        return;
      }

      // Démarrer irrigation manuelle
      if (irrigationSyncService.startIrrigation('manual', 'MQTT_Direct')) {
        const success = await publishIrrigationCommand(1);

        if (success) {
          toast({
            title: "🚿 Irrigation démarrée",
            description: "Commande envoyée avec succès",
          });
        } else {
          // Annuler le démarrage en cas d'échec
          irrigationSyncService.stopIrrigation('MQTT_Error');
          toast({
            title: "❌ Échec irrigation",
            description: "Impossible de démarrer l'irrigation",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('❌ Erreur démarrage irrigation:', error);
      toast({
        title: "❌ Erreur système",
        description: "Erreur lors du démarrage de l'irrigation",
        variant: "destructive"
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const stopIrrigation = async () => {
    console.log('⏹️ Arrêt irrigation MQTT');
    
    if (!isConnected) {
      toast({
        title: "❌ Erreur de connexion",
        description: "Broker MQTT non connecté",
        variant: "destructive"
      });
      return;
    }

    setIsPublishing(true);

    try {
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
        
        irrigationSyncService.stopIrrigation('MQTT_Manual');
        
        toast({
          title: "⏹️ Irrigation arrêtée",
          description: `Durée: ${duration.toFixed(1)} min - Volume: ${volume.toFixed(3)} m³`,
        });
      } else {
        toast({
          title: "❌ Erreur arrêt",
          description: "Impossible d'arrêter l'irrigation",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('❌ Erreur arrêt irrigation:', error);
      toast({
        title: "❌ Erreur système",
        description: "Erreur lors de l'arrêt de l'irrigation",
        variant: "destructive"
      });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Arrosage Manuel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Statut de connexion simple */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium">
            Statut MQTT: {isConnected ? '🟢 Connecté' : '🔴 Déconnecté'}
          </span>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            irrigationStatus ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
          }`}>
            {irrigationStatus ? 'ACTIF' : 'INACTIF'}
          </div>
        </div>

        {/* Boutons irrigation */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={startIrrigation}
            disabled={!isConnected || isPublishing || isManualActive}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
          >
            <Power className="h-4 w-4" />
            <span>{isPublishing ? 'Envoi...' : 'IRRIGATION ON'}</span>
          </Button>
          
          <Button
            onClick={stopIrrigation}
            disabled={!isConnected || isPublishing || !isManualActive}
            variant="destructive"
            className="flex items-center space-x-2"
          >
            <PowerOff className="h-4 w-4" />
            <span>{isPublishing ? 'Envoi...' : 'IRRIGATION OFF'}</span>
          </Button>
        </div>

        {/* Information session active */}
        {isManualActive && startTime && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700">
              ⏱️ Irrigation active depuis: {startTime.toLocaleTimeString()}
            </p>
            <p className="text-xs text-blue-600">
              Débit: 20 L/min
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
