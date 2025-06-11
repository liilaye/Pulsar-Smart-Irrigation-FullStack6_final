
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Clock, Bot, CheckCircle } from 'lucide-react';
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
  
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
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
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/irrigation/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ schedules })
      });

      const data = await response.json();

      if (data.success) {
        setAiAnalysis(data.analyzed_schedules);
        toast({
          title: "✅ Planning optimisé par IA",
          description: "Le planning a été analysé et optimisé automatiquement par l'IA Flask.",
        });
      } else {
        toast({
          title: "❌ Erreur",
          description: data.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('❌ Erreur envoi planning:', error);
      toast({
        title: "❌ Erreur de connexion",
        description: "Impossible de communiquer avec le backend Flask",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="h-5 w-5" />
          <span>Contrôle Programmé</span>
          <Bot className="h-4 w-4 text-blue-600" />
        </CardTitle>
        <p className="text-sm text-gray-600">
          Les plannings sont automatiquement optimisés par l'IA Flask et exécutés via le broker MQTT
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
              
              {/* Affichage de l'analyse IA */}
              {aiAnalysis && aiAnalysis[day] && (
                <div className="flex items-center space-x-2 text-xs bg-blue-50 px-2 py-1 rounded">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span className="text-blue-700">
                    IA: {aiAnalysis[day].ai_duration_minutes?.toFixed(1)}min | {aiAnalysis[day].ai_volume_m3?.toFixed(3)}m³
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <Button 
          onClick={saveSchedule}
          className="w-full"
          style={{ backgroundColor: '#0505FB' }}
          disabled={!isBackendConnected || isLoading}
        >
          <Clock className="h-4 w-4 mr-2" />
          {isLoading ? 'Analyse IA en cours...' : 'Optimiser par IA et Programmer'}
        </Button>

        {/* Statut de surveillance */}
        {aiAnalysis && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2 text-green-800">
              <Bot className="h-4 w-4" />
              <span className="text-sm font-medium">Planning actif et surveillé</span>
            </div>
            <p className="text-xs text-green-600 mt-1">
              Le backend surveille automatiquement les créneaux et déclenche l'irrigation via MQTT
            </p>
          </div>
        )}

        {/* Statut de connexion */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Backend Flask: {isBackendConnected ? '🟢 Connecté' : '🔴 Déconnecté'}</span>
          <span>Analyse IA: {aiAnalysis ? '✅ Configurée' : '⏸️ En attente'}</span>
        </div>
      </CardContent>
    </Card>
  );
};
