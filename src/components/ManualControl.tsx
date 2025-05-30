
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useMQTT } from '@/hooks/useMQTT';
import { useBackendSync } from '@/hooks/useBackendSync';
import { useToast } from '@/hooks/use-toast';
import { backendService } from '@/services/backendService';

export const ManualControl = () => {
  const [manualDuration, setManualDuration] = useState({ hours: '1', minutes: '30' });
  const [isManualActive, setIsManualActive] = useState(false);
  
  const { publishMessage, isConnected, setManualMode } = useMQTT();
  const { isBackendConnected } = useBackendSync();
  const { toast } = useToast();

  const toggleManualIrrigation = async (enabled: boolean) => {
    if (enabled) {
      const response = await backendService.startManualIrrigation(
        parseInt(manualDuration.hours),
        parseInt(manualDuration.minutes)
      );

      if (response.success) {
        setIsManualActive(true);
        setManualMode(true);
        
        const message = {
          type: "JOIN",
          fcnt: 0,
          json: {
            switch_relay: {
              device: 1
            }
          }
        };

        publishMessage("data/PulsarInfinite/swr", JSON.stringify(message), { qos: 1, retain: true });
        
        toast({
          title: "Irrigation manuelle activée",
          description: `L'arrosage démarrera pour ${manualDuration.hours}h${manualDuration.minutes}min`,
        });
      } else {
        toast({
          title: "Erreur",
          description: response.message,
          variant: "destructive"
        });
      }
    } else {
      setIsManualActive(false);
      setManualMode(false);
      
      const message = {
        type: "JOIN",
        fcnt: 0,
        json: {
          switch_relay: {
            device: 0
          }
        }
      };

      publishMessage("data/PulsarInfinite/swr", JSON.stringify(message), { qos: 1, retain: true });
      
      toast({
        title: "Irrigation manuelle désactivée",
        description: "L'arrosage a été arrêté",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Arrosage Manuel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <Switch 
            checked={isManualActive}
            onCheckedChange={toggleManualIrrigation}
            disabled={!isConnected || !isBackendConnected}
          />
          <Label className="text-sm">
            {isManualActive ? "Irrigation manuelle active" : "Irrigation manuelle arrêtée"}
          </Label>
          <div className={`w-3 h-3 rounded-full ${
            isConnected && isBackendConnected ? 'bg-green-500' : 'bg-red-500'
          }`} />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm">Durée (heures)</Label>
            <Input
              type="number"
              min="0"
              max="23"
              value={manualDuration.hours}
              onChange={(e) => setManualDuration(prev => ({ ...prev, hours: e.target.value }))}
              className="h-8"
              disabled={isManualActive}
            />
          </div>
          <div>
            <Label className="text-sm">Durée (minutes)</Label>
            <Input
              type="number"
              min="0"
              max="59"
              value={manualDuration.minutes}
              onChange={(e) => setManualDuration(prev => ({ ...prev, minutes: e.target.value }))}
              className="h-8"
              disabled={isManualActive}
            />
          </div>
        </div>

        {!isBackendConnected && (
          <p className="text-sm text-orange-600">
            ⚠️ Connexion Flask API requise pour l'irrigation
          </p>
        )}
      </CardContent>
    </Card>
  );
};
