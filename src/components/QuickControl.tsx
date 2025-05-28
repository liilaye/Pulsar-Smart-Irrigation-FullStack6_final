
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Power, Clock } from 'lucide-react';
import { useMQTT } from '@/hooks/useMQTT';
import { useToast } from '@/hooks/use-toast';

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

export const QuickControl = () => {
  const [schedules, setSchedules] = useState(
    DAYS.reduce((acc, day) => ({
      ...acc,
      [day]: { enabled: false, startTime: '06:00', endTime: '18:00' }
    }), {})
  );
  const [manualMode, setManualMode] = useState(false);
  const { publishMessage, isConnected, irrigationStatus } = useMQTT();
  const { toast } = useToast();

  const toggleManualIrrigation = (enabled: boolean) => {
    const message = {
      type: "JOIN",
      fcnt: 0,
      json: {
        switch_relay: {
          device: enabled ? 1 : 0
        }
      }
    };

    publishMessage("data/PulsarInfinite/swr", JSON.stringify(message), { qos: 1, retain: true });
    setManualMode(enabled);
    toast({
      title: enabled ? "Irrigation manuelle activée" : "Irrigation manuelle désactivée",
      description: enabled ? "L'arrosage a démarré" : "L'arrosage a été arrêté",
    });
  };

  const updateSchedule = (day: string, field: string, value: any) => {
    setSchedules(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  const saveSchedule = () => {
    // Here you would save the schedule to your backend or local storage
    toast({
      title: "Planning sauvegardé",
      description: "Le planning d'irrigation a été mis à jour",
    });
  };

  return (
    <div className="space-y-6">
      {/* Manual Control */}
      <Card>
        <CardHeader>
          <CardTitle>Arrosage Manuel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Switch 
              checked={manualMode && irrigationStatus}
              onCheckedChange={toggleManualIrrigation}
              disabled={!isConnected}
            />
            <Label className="text-sm">
              {irrigationStatus ? "Irrigation en cours" : "Irrigation arrêtée"}
            </Label>
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          </div>
        </CardContent>
      </Card>

      {/* Programmed Control */}
      <Card>
        <CardHeader>
          <CardTitle>Contrôle Programmé</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            {DAYS.map((day) => (
              <div key={day} className="flex items-center space-x-4 p-3 border rounded-lg">
                <Switch
                  checked={schedules[day].enabled}
                  onCheckedChange={(enabled) => updateSchedule(day, 'enabled', enabled)}
                />
                <Label className="w-20 text-sm font-medium">{day}</Label>
                <div className="flex items-center space-x-2">
                  <Label className="text-xs">Début:</Label>
                  <Input
                    type="time"
                    value={schedules[day].startTime}
                    onChange={(e) => updateSchedule(day, 'startTime', e.target.value)}
                    className="w-24 h-8 text-xs"
                    disabled={!schedules[day].enabled}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Label className="text-xs">Fin:</Label>
                  <Input
                    type="time"
                    value={schedules[day].endTime}
                    onChange={(e) => updateSchedule(day, 'endTime', e.target.value)}
                    className="w-24 h-8 text-xs"
                    disabled={!schedules[day].enabled}
                  />
                </div>
              </div>
            ))}
          </div>
          
          <Button 
            onClick={saveSchedule}
            className="w-full"
            style={{ backgroundColor: '#0505FB' }}
          >
            <Clock className="h-4 w-4 mr-2" />
            Sauvegarder le Planning
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
