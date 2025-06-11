
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Power, PowerOff, Clock, Droplets } from 'lucide-react';
import { backendService } from '@/services/backendService';
import { useMQTT } from '@/hooks/useMQTT';
import { toast } from "sonner";

export const ManualIrrigationControl = () => {
  const [manualDuration, setManualDuration] = useState({ hours: '0', minutes: '30' });
  const [isManualActive, setIsManualActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { isConnected, publishIrrigationCommand } = useMQTT();

  // Vérifier l'état de l'irrigation périodiquement
  useEffect(() => {
    const checkIrrigationStatus = async () => {
      try {
        const status = await backendService.getIrrigationStatus();
        if (status && typeof status === 'object') {
          setIsManualActive(status.isActive && status.type === 'manual');
        }
      } catch (error) {
        // Ignorer les erreurs de statut pour éviter les logs répétitifs
      }
    };

    checkIrrigationStatus();
    const interval = setInterval(checkIrrigationStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleManualIrrigation = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    console.log(`Action irrigation manuelle: ${isManualActive ? 'ARRÊT' : 'DÉMARRAGE'}`);

    try {
      if (isManualActive) {
        // ARRÊTER l'irrigation
        console.log('Envoi commande ARRÊT irrigation...');
        
        // Méthode 1: Via backend Flask
        const backendResult = await backendService.stopIrrigation();
        console.log('Backend STOP result:', backendResult);
        
        // Méthode 2: Direct MQTT en parallèle pour assurer l'arrêt
        const mqttResult = await publishIrrigationCommand(0);
        console.log('MQTT STOP result:', mqttResult);
        
        if (backendResult.success || mqttResult) {
          setIsManualActive(false);
          toast.success("Irrigation arrêtée", {
            description: "Commande STOP envoyée au broker MQTT"
          });
        } else {
          toast.error("Erreur lors de l'arrêt", {
            description: backendResult.message || "Vérifiez la connexion MQTT"
          });
        }
      } else {
        // DÉMARRER l'irrigation
        const hours = parseInt(manualDuration.hours) || 0;
        const minutes = parseInt(manualDuration.minutes) || 0;
        
        if (hours === 0 && minutes === 0) {
          toast.error("Durée invalide", {
            description: "Veuillez spécifier une durée supérieure à 0"
          });
          return;
        }

        console.log(`Démarrage irrigation: ${hours}h ${minutes}min`);
        
        // Méthode 1: Via backend Flask  
        const backendResult = await backendService.startManualIrrigation(hours, minutes);
        console.log('Backend START result:', backendResult);
        
        if (backendResult.success) {
          setIsManualActive(true);
          toast.success("Irrigation démarrée", {
            description: `Durée: ${hours}h ${minutes}min - MQTT activé`
          });
        } else {
          // Méthode 2: Fallback direct MQTT si backend échoue
          console.log('Fallback: commande MQTT directe...');
          const mqttResult = await publishIrrigationCommand(1);
          
          if (mqttResult) {
            setIsManualActive(true);
            toast.success("Irrigation démarrée (MQTT direct)", {
              description: `Durée: ${hours}h ${minutes}min`
            });
          } else {
            toast.error("Erreur de démarrage", {
              description: backendResult.message || "Vérifiez la connexion MQTT"
            });
          }
        }
      }
    } catch (error) {
      console.error('Erreur irrigation manuelle:', error);
      toast.error("Erreur de connexion", {
        description: "Impossible de communiquer avec le système"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTotalMinutes = () => {
    const hours = parseInt(manualDuration.hours) || 0;
    const minutes = parseInt(manualDuration.minutes) || 0;
    return (hours * 60) + minutes;
  };

  const getEstimatedVolume = () => {
    const totalMinutes = getTotalMinutes();
    return ((totalMinutes * 20) / 1000).toFixed(2); // 20L/min → m³
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Droplets className="h-5 w-5 text-blue-600" />
            <span>Contrôle Manuel de l'Irrigation</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
            }`}></div>
            <span className="text-sm text-gray-600">
              {isConnected ? 'MQTT Connecté' : 'MQTT Déconnecté'}
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Configuration de la durée */}
        <div className="space-y-4">
          <Label className="text-base font-medium">Configuration de la durée</Label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm">Heures</Label>
              <Input
                type="number"
                min="0"
                max="23"
                value={manualDuration.hours}
                onChange={(e) => setManualDuration({ ...manualDuration, hours: e.target.value })}
                disabled={isManualActive || isLoading}
                className="h-12 text-center text-lg"
              />
            </div>
            <div>
              <Label className="text-sm">Minutes</Label>
              <Input
                type="number"
                min="0"
                max="59"
                value={manualDuration.minutes}
                onChange={(e) => setManualDuration({ ...manualDuration, minutes: e.target.value })}
                disabled={isManualActive || isLoading}
                className="h-12 text-center text-lg"
              />
            </div>
          </div>
          
          {/* Informations estimées */}
          {getTotalMinutes() > 0 && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-blue-700">Durée totale:</span>
                <span className="font-medium">{getTotalMinutes()} minutes</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-blue-700">Volume estimé:</span>
                <span className="font-medium">{getEstimatedVolume()} m³</span>
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Contrôles d'irrigation */}
        <div className="space-y-4">
          <Label className="text-base font-medium">Contrôles</Label>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleManualIrrigation}
                disabled={!isConnected || isLoading || (getTotalMinutes() === 0 && !isManualActive)}
                variant={isManualActive ? "destructive" : "default"}
                size="lg"
                className={`flex items-center space-x-2 min-w-[160px] ${
                  isManualActive 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : isManualActive ? (
                  <PowerOff className="h-4 w-4" />
                ) : (
                  <Power className="h-4 w-4" />
                )}
                <span>
                  {isLoading ? 'En cours...' : isManualActive ? 'ARRÊTER' : 'DÉMARRER'}
                </span>
              </Button>
              
              <div className="text-sm font-medium">
                {isManualActive ? (
                  <span className="text-red-600">Irrigation en cours</span>
                ) : (
                  <span className="text-gray-600">Irrigation arrêtée</span>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                isManualActive ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'
              }`}>
                {isManualActive ? 'ACTIF' : 'INACTIF'}
              </div>
            </div>
          </div>

          {/* Statut de connexion détaillé */}
          <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
            <div className="flex items-center justify-between">
              <span>Statut MQTT:</span>
              <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
                {isConnected ? 'Connecté au broker PulsarInfinite' : 'Déconnecté'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
