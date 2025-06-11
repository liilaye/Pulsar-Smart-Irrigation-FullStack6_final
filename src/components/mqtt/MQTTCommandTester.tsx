
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMQTT } from '@/hooks/useMQTT';
import { useToast } from '@/hooks/use-toast';
import { Send, Power, PowerOff, Zap } from 'lucide-react';

export const MQTTCommandTester = () => {
  const [customTopic, setCustomTopic] = useState('data/PulsarInfinite/test');
  const [customMessage, setCustomMessage] = useState('{"test": true, "timestamp": ' + Date.now() + '}');
  const [isPublishing, setIsPublishing] = useState(false);
  const { isConnected, publishMessage, publishIrrigationCommand } = useMQTT();
  const { toast } = useToast();

  const sendCustomMessage = async () => {
    if (!isConnected) {
      toast({
        title: "❌ Erreur",
        description: "MQTT non connecté",
        variant: "destructive"
      });
      return;
    }

    setIsPublishing(true);
    try {
      const success = publishMessage(customTopic, customMessage);
      if (success) {
        toast({
          title: "✅ Message envoyé",
          description: `Topic: ${customTopic}`,
        });
      } else {
        throw new Error('Échec publication');
      }
    } catch (error) {
      toast({
        title: "❌ Erreur envoi",
        description: `Erreur: ${error}`,
        variant: "destructive"
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const sendIrrigationCommand = async (state: 0 | 1) => {
    if (!isConnected) {
      toast({
        title: "❌ Erreur",
        description: "MQTT non connecté",
        variant: "destructive"
      });
      return;
    }

    setIsPublishing(true);
    try {
      const success = await publishIrrigationCommand(state);
      if (success) {
        toast({
          title: `✅ Irrigation ${state ? 'ON' : 'OFF'}`,
          description: "Commande envoyée avec succès",
        });
      } else {
        throw new Error('Échec commande irrigation');
      }
    } catch (error) {
      toast({
        title: "❌ Erreur irrigation",
        description: `Erreur: ${error}`,
        variant: "destructive"
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const quickTests = [
    {
      name: 'Ping',
      topic: 'data/PulsarInfinite/ping',
      message: JSON.stringify({ type: 'ping', timestamp: Date.now() })
    },
    {
      name: 'Status',
      topic: 'data/PulsarInfinite/status',
      message: JSON.stringify({ device: 'test', timestamp: Date.now() })
    },
    {
      name: 'Control Test',
      topic: 'data/PulsarInfinite/control',
      message: JSON.stringify({ command: 'test', value: 1, timestamp: Date.now() })
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Zap className="h-5 w-5 text-yellow-600" />
          <span>Testeur de Commandes MQTT</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tests rapides d'irrigation */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Tests Irrigation</Label>
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => sendIrrigationCommand(1)}
              disabled={!isConnected || isPublishing}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
            >
              <Power className="h-4 w-4" />
              <span>Irrigation ON</span>
            </Button>
            <Button
              onClick={() => sendIrrigationCommand(0)}
              disabled={!isConnected || isPublishing}
              variant="destructive"
              className="flex items-center space-x-2"
            >
              <PowerOff className="h-4 w-4" />
              <span>Irrigation OFF</span>
            </Button>
          </div>
        </div>

        {/* Tests rapides */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Tests Rapides</Label>
          <div className="grid grid-cols-3 gap-2">
            {quickTests.map((test, index) => (
              <Button
                key={index}
                size="sm"
                variant="outline"
                onClick={() => {
                  setCustomTopic(test.topic);
                  setCustomMessage(test.message);
                }}
                disabled={isPublishing}
              >
                {test.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Message personnalisé */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Message Personnalisé</Label>
          <div className="space-y-3">
            <div>
              <Label htmlFor="topic" className="text-xs">Topic</Label>
              <Input
                id="topic"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                placeholder="data/PulsarInfinite/test"
                disabled={isPublishing}
              />
            </div>
            <div>
              <Label htmlFor="message" className="text-xs">Message JSON</Label>
              <Textarea
                id="message"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder='{"test": true}'
                rows={3}
                disabled={isPublishing}
              />
            </div>
            <Button
              onClick={sendCustomMessage}
              disabled={!isConnected || isPublishing || !customTopic || !customMessage}
              className="w-full flex items-center space-x-2"
            >
              <Send className="h-4 w-4" />
              <span>{isPublishing ? 'Envoi...' : 'Envoyer Message'}</span>
            </Button>
          </div>
        </div>

        {/* Statut */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span>Statut MQTT:</span>
            <span className={`font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
              {isConnected ? 'Connecté' : 'Déconnecté'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
