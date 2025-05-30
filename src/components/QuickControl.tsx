
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Clock, Brain, Wifi, WifiOff } from 'lucide-react';
import { useMQTT } from '@/hooks/useMQTT';
import { useBackendSync } from '@/hooks/useBackendSync';
import { useToast } from '@/hooks/use-toast';
import { backendService } from '@/services/backendService';
import { IrrigationSystemConfig } from './IrrigationSystemConfig';

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

export const QuickControl = () => {
  const [schedules, setSchedules] = useState(
    DAYS.reduce((acc, day) => ({
      ...acc,
      [day]: { enabled: false, startTime: '06:00', endTime: '18:00' }
    }), {})
  );
  const [manualDuration, setManualDuration] = useState({ hours: '1', minutes: '30' });
  const [isManualActive, setIsManualActive] = useState(false);
  
  const { publishMessage, isConnected, irrigationStatus, setManualMode } = useMQTT();
  const { lastMLRecommendation, isBackendConnected } = useBackendSync();
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
    <div className="space-y-6">
      {/* Backend & ML Status */}
      {lastMLRecommendation && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-blue-800">
              <Brain className="h-5 w-5" />
              <span>Dernière Recommandation ML</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700">
                  Durée recommandée: {lastMLRecommendation.durationHours}h {lastMLRecommendation.durationMinutes}min
                </p>
                <p className="text-xs text-blue-600">
                  Basé sur l'analyse de 15 paramètres agro-environnementaux
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {isBackendConnected ? (
                  <Wifi className="h-4 w-4 text-green-600" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-600" />
                )}
                <span className="text-xs">
                  {isBackendConnected ? 'Flask API connecté' : 'Flask API déconnecté'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Irrigation System Configuration */}
      <IrrigationSystemConfig />

      {/* Manual Control */}
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

      {/* Programmed Control */}
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
    </div>
  );
};
