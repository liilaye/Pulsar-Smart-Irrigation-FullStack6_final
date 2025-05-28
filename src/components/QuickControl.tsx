
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Droplets, Power, Clock } from 'lucide-react';
import { useMQTT } from '@/hooks/useMQTT';
import { useToast } from '@/hooks/use-toast';

export const QuickControl = () => {
  const [duration, setDuration] = useState<number>(30);
  const [isIrrigating, setIsIrrigating] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const { publishMessage, isConnected } = useMQTT();
  const { toast } = useToast();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isIrrigating && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            stopIrrigation();
            return 0;
          }
          return prev - 1;
        });
      }, 60000); // Décrément chaque minute
    }
    return () => clearInterval(interval);
  }, [isIrrigating, timeRemaining]);

  const startIrrigation = () => {
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
    setIsIrrigating(true);
    setTimeRemaining(duration);
    toast({
      title: "Irrigation démarrée",
      description: `Arrosage programmé pour ${duration} minutes`,
    });
  };

  const stopIrrigation = () => {
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
    setIsIrrigating(false);
    setTimeRemaining(0);
    toast({
      title: "Irrigation arrêtée",
      description: "L'arrosage a été interrompu",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Droplets className="h-5 w-5 text-blue-600" />
          <span>Contrôle Rapide</span>
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="duration">Durée d'irrigation (minutes)</Label>
          <Input
            id="duration"
            type="number"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            min={1}
            max={180}
            disabled={isIrrigating}
          />
        </div>

        {isIrrigating && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Temps restant: {timeRemaining} minutes</span>
            </div>
          </div>
        )}

        <div className="flex space-x-2">
          <Button 
            onClick={startIrrigation} 
            disabled={isIrrigating || !isConnected}
            className="flex-1"
            style={{ backgroundColor: '#0505FB' }}
          >
            <Power className="h-4 w-4 mr-2" />
            Démarrer
          </Button>
          <Button 
            onClick={stopIrrigation} 
            disabled={!isIrrigating}
            variant="destructive"
            className="flex-1"
          >
            <Power className="h-4 w-4 mr-2" />
            Arrêter
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
