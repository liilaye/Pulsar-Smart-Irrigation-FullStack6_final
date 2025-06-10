import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Power, PowerOff } from 'lucide-react';
import { useMQTT } from '@/hooks/useMQTT';
import { useToast } from '@/hooks/use-toast';

export const ManualIrrigationControl = () => {
  const [isManualActive, setIsManualActive] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const { isConnected, publishMessage, irrigationStatus } = useMQTT();
  const { toast } = useToast();

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

    try {
      const payload = {
        switch_relay: {
          device: enabled ? 1 : 0
        }
      };

      const success = publishMessage(
        'data/PulsarInfinite/swr',
        JSON.stringify(payload),
        { qos: 1, retain: true }
      );

      if (success) {
        setIsManualActive(enabled);
        
        if (enabled) {
          setStartTime(new Date());
          toast({
            title: "🚿 Irrigation manuelle démarrée",
            description: "Commande envoyée directement au broker MQTT",
          });
        } else {
          if (startTime) {
            const duration = (new Date().getTime() - startTime.getTime()) / 1000 / 60; // en minutes
            const volume = (duration * 20) / 1000; // 20L/min converti en m³
            
            // Envoyer les données au backend pour logging
            fetch('/api/irrigation/log-manual', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                duration_minutes: duration,
                volume_m3: volume,
                start_time: startTime.toISOString(),
                end_time: new Date().toISOString()
              })
            }).catch(console.error);
            
            toast({
              title: "⏹️ Irrigation manuelle arrêtée",
              description: `Durée: ${duration.toFixed(1)} min - Volume: ${volume.toFixed(3)} m³`,
            });
          }
          setStartTime(null);
        }
      } else {
        throw new Error('Échec de publication MQTT');
      }
    } catch (error) {
      console.error('❌ Erreur irrigation MQTT:', error);
      toast({
        title: "❌ Erreur",
        description: `Impossible de ${enabled ? 'démarrer' : 'arrêter'} l'irrigation`,
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <span>Arrosage Manuel - Direct MQTT</span>
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
