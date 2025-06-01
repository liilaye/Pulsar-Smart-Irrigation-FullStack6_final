
import { useState, useEffect, useCallback, useRef } from 'react';
import mqtt from 'mqtt';

interface MQTTMessage {
  topic: string;
  message: string;
}

interface MQTTOptions {
  reconnectPeriod: number;
  connectTimeout: number;
  keepalive: number;
  clean: boolean;
  resubscribe: boolean;
}

export const useMQTT = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<MQTTMessage[]>([]);
  const [irrigationStatus, setIrrigationStatus] = useState(false);
  const [isManualMode, setIsManualMode] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const clientRef = useRef<mqtt.MqttClient | null>(null);
  const maxRetries = 5;

  const brokerUrls = [
    'ws://217.182.210.54:8080/',
    'wss://217.182.210.54:8080/',
    'mqtt://217.182.210.54:1883',
    'ws://217.182.210.54:9001/',
  ];

  const publishMessage = useCallback((topic: string, message: string, options?: { qos?: number; retain?: boolean }) => {
    if (!isConnected || !clientRef.current) {
      console.error('Non connecté au broker MQTT');
      return false;
    }

    try {
      console.log(`Publication sur ${topic}:`, message);
      console.log('Options:', options);
      
      clientRef.current.publish(topic, message, {
        qos: options?.qos || 1,
        retain: options?.retain || true
      }, (error) => {
        if (error) {
          console.error('Erreur lors de la publication:', error);
        } else {
          console.log('Message publié avec succès');
          const newMessage = { topic, message };
          setMessages(prev => [...prev.slice(-9), newMessage]);
        }
      });
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la publication:', error);
      return false;
    }
  }, [isConnected]);

  const setManualMode = useCallback((mode: boolean) => {
    setIsManualMode(mode);
  }, []);

  const updateIrrigationFromBackend = useCallback((status: boolean) => {
    setIrrigationStatus(status);
  }, []);

  const connectToMQTT = useCallback(async (urlIndex = 0) => {
    if (urlIndex >= brokerUrls.length) {
      console.error('Toutes les tentatives de connexion ont échoué');
      return;
    }

    const brokerUrl = brokerUrls[urlIndex];
    console.log(`Tentative ${connectionAttempts + 1}/${maxRetries} - Connexion à: ${brokerUrl}`);
    
    setConnectionAttempts(prev => prev + 1);

    const options: MQTTOptions = {
      reconnectPeriod: 5000,
      connectTimeout: 10000,
      keepalive: 60,
      clean: true,
      resubscribe: true
    };

    try {
      const client = mqtt.connect(brokerUrl, options);
      clientRef.current = client;

      client.on('connect', () => {
        console.log('Connecté au broker MQTT:', brokerUrl);
        setIsConnected(true);
        setConnectionAttempts(0);
        
        // S'abonner aux topics nécessaires
        client.subscribe('data/PulsarInfinite/swr', { qos: 1 });
        client.subscribe('data/PulsarInfinite/status', { qos: 1 });
      });

      client.on('message', (topic, message) => {
        const messageStr = message.toString();
        console.log(`Message reçu sur ${topic}:`, messageStr);
        
        try {
          const data = JSON.parse(messageStr);
          
          // Traiter les messages de statut
          if (topic.includes('status') && data.irrigation !== undefined) {
            setIrrigationStatus(data.irrigation);
          }
          
          const newMessage = { topic, message: messageStr };
          setMessages(prev => [...prev.slice(-9), newMessage]);
        } catch (error) {
          console.error('Erreur parsing JSON:', error);
        }
      });

      client.on('error', (error) => {
        console.error('Erreur MQTT:', error);
        setIsConnected(false);
        
        // Essayer l'URL suivante après un délai
        setTimeout(() => {
          if (connectionAttempts < maxRetries) {
            connectToMQTT(urlIndex + 1);
          }
        }, 2000);
      });

      client.on('offline', () => {
        console.log('Client MQTT hors ligne');
        setIsConnected(false);
      });

      client.on('close', () => {
        console.log('Connexion MQTT fermée');
        setIsConnected(false);
        
        // Tentative de reconnexion si pas déjà en cours
        if (connectionAttempts < maxRetries) {
          setTimeout(() => {
            connectToMQTT(urlIndex);
          }, 3000);
        }
      });

    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      if (connectionAttempts < maxRetries) {
        setTimeout(() => {
          connectToMQTT(urlIndex + 1);
        }, 2000);
      }
    }
  }, [connectionAttempts]);

  useEffect(() => {
    connectToMQTT();
    
    return () => {
      if (clientRef.current) {
        clientRef.current.end();
      }
    };
  }, []);

  return {
    isConnected,
    messages,
    irrigationStatus,
    isManualMode,
    connectionAttempts,
    publishMessage,
    setManualMode,
    updateIrrigationFromBackend
  };
};
