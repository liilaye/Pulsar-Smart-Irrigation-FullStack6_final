import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Power, PowerOff } from 'lucide-react';
import { useMQTT } from '@/hooks/useMQTT';
import { useIrrigationStatus } from '@/hooks/useIrrigationStatus';
import { backendService } from '@/services/backendService';
import { toast } from "sonner";

export const SimpleManualControl = () => {
  const [duration, setDuration] = useState({ hours: '0', minutes: '30' });
  const [isLoading, setIsLoading] = useState(false);
  const [lastAction, setLastAction] = useState<string>('');
  const { isConnected } = useMQTT();
  const irrigationStatus = useIrrigationStatus();

  // Synchroniser l'état local avec le statut du backend
  const isActive = irrigationStatus.isActive && irrigationStatus.type === 'manual';

  useEffect(() => {
    if (!irrigationStatus.isActive && isActive !== irrigationStatus.isActive) {
      setLastAction('Irrigation terminée automatiquement');
    }
  }, [irrigationStatus.isActive, isActive]);

  const getTotalMinutes = () => {
    const hours = parseInt(duration.hours) || 0;
    const minutes = parseInt(duration.minutes) || 0;
    return (hours * 60) + minutes;
  };

  const handleStart = async () => {
    const totalMinutes = getTotalMinutes();
    
    if (totalMinutes <= 0) {
      toast.error("Durée invalide", {
        description: "Veuillez spécifier une durée supérieure à 0"
      });
      return;
    }

    setIsLoading(true);
    setLastAction('Démarrage irrigation manuelle...');
    
    try {
      console.log(`🚿 Démarrage irrigation manuelle: ${totalMinutes} minutes`);
      const response = await backendService.startManualIrrigation(
        parseInt(duration.hours) || 0,
        parseInt(duration.minutes) || 0
      );
      
      if (response.success) {
        setLastAction(`Irrigation active: ${totalMinutes} minutes`);
        toast.success("Irrigation démarrée", {
          description: `Durée: ${totalMinutes} minutes`
        });
      } else {
        setLastAction('Erreur de démarrage');
        toast.error("Erreur", {
          description: response.message || "Impossible de démarrer l'irrigation"
        });
      }
    } catch (error) {
      console.error('❌ Erreur irrigation manuelle:', error);
      setLastAction('Erreur de communication');
      toast.error("Erreur de communication", {
        description: "Impossible de communiquer avec le backend"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStop = async () => {
    setIsLoading(true);
    setLastAction('Arrêt irrigation...');
    
    try {
      console.log('⏹️ Arrêt irrigation manuelle');
      const response = await backendService.stopIrrigation();
      
      if (response.success) {
        setLastAction('Irrigation arrêtée');
        toast.success("Irrigation arrêtée");
      } else {
        setLastAction('Erreur d\'arrêt');
        toast.error("Erreur", {
          description: response.message || "Impossible d'arrêter l'irrigation"
        });
      }
    } catch (error) {
      console.error('❌ Erreur arrêt irrigation:', error);
      setLastAction('Erreur de communication');
      toast.error("Erreur de communication");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Arrosage Manuel</span>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
            }`}></div>
            <span className="text-sm text-gray-600">
              {isConnected ? 'Connecté' : 'Déconnecté'}
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Configuration de la durée */}
        <div className="space-y-4">
          <Label className="text-base font-medium">Durée d'arrosage</Label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm">Heures</Label>
              <Input
                type="number"
                min="0"
                max="23"
                value={duration.hours}
                onChange={(e) => setDuration({ ...duration, hours: e.target.value })}
                disabled={isActive || isLoading}
                className="h-12 text-center text-lg"
              />
            </div>
            <div>
              <Label className="text-sm">Minutes</Label>
              <Input
                type="number"
                min="0"
                max="59"
                value={duration.minutes}
                onChange={(e) => setDuration({ ...duration, minutes: e.target.value })}
                disabled={isActive || isLoading}
                className="h-12 text-center text-lg"
              />
            </div>
          </div>
          
          {getTotalMinutes() > 0 && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-blue-700">Durée totale:</span>
                <span className="font-medium">{getTotalMinutes()} minutes</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-blue-700">Volume estimé:</span>
                <span className="font-medium">{((getTotalMinutes() * 20) / 1000).toFixed(2)} m³</span>
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Contrôles */}
        <div className="space-y-4">
          <div className="flex gap-4">
            <Button
              onClick={handleStart}
              disabled={!isConnected || isLoading || getTotalMinutes() === 0 || isActive}
              variant="default"
              size="lg"
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {isLoading && !isActive ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Power className="h-4 w-4 mr-2" />
              )}
              Démarrer
            </Button>
            
            <Button
              onClick={handleStop}
              disabled={!isConnected || isLoading || !isActive}
              variant="destructive"
              size="lg"
              className="flex-1"
            >
              {isLoading && isActive ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <PowerOff className="h-4 w-4 mr-2" />
              )}
              Arrêter
            </Button>
          </div>
          
          {/* Statut */}
          <div className="text-center">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
            }`}>
              {isActive ? 'IRRIGATION EN COURS' : 'IRRIGATION ARRÊTÉE'}
            </div>
            {lastAction && (
              <div className="text-xs text-gray-500 mt-2">
                {lastAction}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
