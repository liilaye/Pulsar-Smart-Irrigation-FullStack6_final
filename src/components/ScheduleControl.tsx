
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Clock } from 'lucide-react';
import { useBackendSync } from '@/hooks/useBackendSync';
import { useToast } from '@/hooks/use-toast';
import { backendService } from '@/services/backendService';

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

export const ScheduleControl = () => {
  const [schedules, setSchedules] = useState(
    DAYS.reduce((acc, day) => ({
      ...acc,
      [day]: { enabled: false, startTime: '06:00', endTime: '18:00' }
    }), {})
  );
  
  const { isBackendConnected } = useBackendSync();
  const { toast } = useToast();

  const updateSchedule = (day: string, field: string, value: any) => {
    setSchedules(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  const saveSchedule = async () => {
    const response = await backendService.sendSchedulesToBackend(schedules);
    
    if (response.success) {
      toast({
        title: "Planning sauvegardé",
        description: "Le planning a été envoyé au backend Flask pour analyse ML.",
      });
    } else {
      toast({
        title: "Erreur",
        description: response.message,
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contrôle Programmé</CardTitle>
        <p className="text-sm text-gray-600">
          Les plannings seront analysés par l'IA Flask pour optimiser l'irrigation
        </p>
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
          disabled={!isBackendConnected}
        >
          <Clock className="h-4 w-4 mr-2" />
          Envoyer au Backend Flask
        </Button>
      </CardContent>
    </Card>
  );
};
