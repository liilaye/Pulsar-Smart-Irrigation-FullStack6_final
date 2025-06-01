
import React, { useState, useEffect } from 'react';
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
  const [lastMLRecommendation, setLastMLRecommendation] = useState<any>(null);
  
  const { publishMessage, isConnected, setManualMode, irrigationStatus, connectionAttempts } = useMQTT();
  const { isBackendConnected } = useBackendSync();
  const { toast } = useToast();

  const toggleManualIrrigation = async (enabled: boolean) => {
    if (enabled) {
      // Commande pour allumer l'irrigation
      const command = {
        type: "JOIN",
        fcnt: 0,
        json: {
          switch_relay: {
            device: 1
          }
        }
      };

      const success = publishMessage("data/PulsarInfinite/swr", JSON.stringify(command), { 
        qos: 1, 
        retain: true 
      });

      if (success) {
        setIsManualActive(true);
        setManualMode(true);
        
        toast({
          title: "Irrigation manuelle activée",
          description: `L'arrosage démarrera pour ${manualDuration.hours}h${manualDuration.minutes}min`,
        });

        // Programmer l'arrêt automatique
        const totalMinutes = parseInt(manualDuration.hours) * 60 + parseInt(manualDuration.minutes);
        setTimeout(() => {
          toggleManualIrrigation(false);
        }, totalMinutes * 60000);

      } else {
        toast({
          title: "Erreur",
          description: "Impossible d'envoyer la commande MQTT",
          variant: "destructive"
        });
      }
    } else {
      // Commande pour arrêter l'irrigation
      const command = {
        type: "JOIN",
        fcnt: 0,
        json: {
          switch_relay: {
            device: 0
          }
        }
      };

      const success = publishMessage("data/PulsarInfinite/swr", JSON.stringify(command), { 
        qos: 1, 
        retain: true 
      });

      if (success) {
        setIsManualActive(false);
        setManualMode(false);
        
        toast({
          title: "Irrigation manuelle désactivée",
          description: "L'arrosage a été arrêté",
        });
      }
    }
  };

  const getMLRecommendation = async () => {
    const features = backendService.getDefaultSoilClimateFeatures();
    features.push("tomate" as any); // Type de culture
    features.push("fergileux" as any); // Type de sol
    
    const recommendation = await backendService.getMLRecommendation(features);
    
    if (recommendation && recommendation.status === "ok") {
      setLastMLRecommendation(recommendation);
      setManualDuration({
        hours: Math.floor(recommendation.duree_minutes / 60).toString(),
        minutes: Math.floor(recommendation.duree_minutes % 60).toString()
      });
      
      toast({
        title: "Recommandation ML reçue",
        description: `Durée suggérée: ${Math.floor(recommendation.duree_minutes)} minutes`,
      });
    } else {
      toast({
        title: "Erreur ML",
        description: "Impossible d'obtenir une recommandation",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Arrosage Manuel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Switch 
              checked={isManualActive}
              onCheckedChange={toggleManualIrrigation}
              disabled={!isConnected}
            />
            <Label className="text-sm">
              {isManualActive ? "Irrigation manuelle active" : "Irrigation manuelle arrêtée"}
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <span className="text-xs">
              {isConnected ? 'MQTT Connecté' : `Tentatives: ${connectionAttempts}`}
            </span>
          </div>
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

        <Button 
          onClick={getMLRecommendation}
          className="w-full"
          variant="outline"
          disabled={!isBackendConnected}
        >
          Obtenir Recommandation IA
        </Button>

        {lastMLRecommendation && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800">Dernière Recommandation ML</h4>
            <p className="text-sm text-blue-700">
              Durée: {Math.floor(lastMLRecommendation.duree_minutes)} minutes
            </p>
            <p className="text-sm text-blue-700">
              Volume: {lastMLRecommendation.volume_eau_m3?.toFixed(2)} m³
            </p>
            <p className="text-xs text-blue-600">
              {lastMLRecommendation.matt}
            </p>
          </div>
        )}

        {!isConnected && (
          <p className="text-sm text-orange-600">
            ⚠️ Connexion MQTT requise pour l'irrigation
          </p>
        )}
      </CardContent>
    </Card>
  );
};
