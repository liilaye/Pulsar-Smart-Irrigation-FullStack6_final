
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
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxRetries = 3;
  const isConnectingRef = useRef(false);

  // URLs alternatives pour JHipster broker
  const brokerUrls = [
    'ws://217.182.210.54:8080/',
    'ws://217.182.210.54:9001/',
    'wss://217.182.210.54:8080/',
    'mqtt://217.182.210.54:1883',
    'ws://217.182.210.54:8083/',
  ];

  const publishMessage = useCallback((topic: string, message: string, options?: { qos?: 0 | 1 | 2; retain?: boolean }) => {
    if (!isConnected || !clientRef.current) {
      console.error('Non connecté au broker MQTT');
      return false;
    }

    try {
      console.log(`Publication sur ${topic}:`, message);
      
      clientRef.current.publish(topic, message, {
        qos: (options?.qos || 1) as 0 | 1 | 2,
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

  const cleanupConnection = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (clientRef.current) {
      try {
        clientRef.current.removeAllListeners();
        clientRef.current.end(true);
      } catch (error) {
        console.error('Erreur lors de la fermeture:', error);
      }
      clientRef.current = null;
    }
    
    setIsConnected(false);
    isConnectingRef.current = false;
  }, []);

  const connectToMQTT = useCallback(async (urlIndex = 0) => {
    // Éviter les connexions multiples simultanées
    if (isConnectingRef.current || connectionAttempts >= maxRetries) {
      return;
    }

    if (urlIndex >= brokerUrls.length) {
      console.error('Toutes les URLs ont échoué, arrêt des tentatives');
      setConnectionAttempts(maxRetries);
      return;
    }

    isConnectingRef.current = true;
    const brokerUrl = brokerUrls[urlIndex];
    console.log(`Tentative ${connectionAttempts + 1}/${maxRetries} - URL ${urlIndex + 1}: ${brokerUrl}`);
    
    setConnectionAttempts(prev => prev + 1);

    // Nettoyer la connexion précédente
    cleanupConnection();

    const options: MQTTOptions = {
      reconnectPeriod: 0, // Désactiver la reconnexion automatique
      connectTimeout: 8000,
      keepalive: 30,
      clean: true,
      resubscribe: false
    };

    try {
      const client = mqtt.connect(brokerUrl, options);
      clientRef.current = client;

      const connectTimeout = setTimeout(() => {
        console.log('Timeout de connexion pour:', brokerUrl);
        cleanupConnection();
        isConnectingRef.current = false;
        
        // Essayer l'URL suivante
        if (urlIndex + 1 < brokerUrls.length && connectionAttempts < maxRetries) {
          reconnectTimeoutRef.current = setTimeout(() => {
            connectToMQTT(urlIndex + 1);
          }, 2000);
        }
      }, 10000);

      client.on('connect', () => {
        clearTimeout(connectTimeout);
        console.log('✅ Connecté au broker MQTT:', brokerUrl);
        setIsConnected(true);
        setConnectionAttempts(0);
        isConnectingRef.current = false;
        
        // S'abonner aux topics
        client.subscribe('data/PulsarInfinite/switch_relay', { qos: 1 });
        client.subscribe('data/PulsarInfinite/status', { qos: 1 });
      });

      client.on('message', (topic, message) => {
        const messageStr = message.toString();
        console.log(`📨 Message reçu sur ${topic}:`, messageStr);
        
        try {
          const data = JSON.parse(messageStr);
          
          if (topic.includes('switch_relay') || topic.includes('status')) {
            if (data.device !== undefined) {
              setIrrigationStatus(data.device === 1);
            } else if (data.irrigation !== undefined) {
              setIrrigationStatus(data.irrigation);
            }
          }
          
          const newMessage = { topic, message: messageStr };
          setMessages(prev => [...prev.slice(-9), newMessage]);
        } catch (error) {
          console.error('Erreur parsing JSON:', error);
        }
      });

      client.on('error', (error) => {
        clearTimeout(connectTimeout);
        console.error('❌ Erreur MQTT pour', brokerUrl, ':', error);
        cleanupConnection();
        
        // Essayer l'URL suivante
        if (urlIndex + 1 < brokerUrls.length && connectionAttempts < maxRetries) {
          reconnectTimeoutRef.current = setTimeout(() => {
            connectToMQTT(urlIndex + 1);
          }, 3000);
        }
      });

      client.on('offline', () => {
        clearTimeout(connectTimeout);
        console.log('📴 Client MQTT hors ligne');
        setIsConnected(false);
      });

      client.on('close', () => {
        clearTimeout(connectTimeout);
        console.log('🔌 Connexion MQTT fermée');
        setIsConnected(false);
        isConnectingRef.current = false;
      });

    } catch (error) {
      console.error('Erreur lors de la création du client:', error);
      isConnectingRef.current = false;
      
      if (urlIndex + 1 < brokerUrls.length && connectionAttempts < maxRetries) {
        reconnectTimeoutRef.current = setTimeout(() => {
          connectToMQTT(urlIndex + 1);
        }, 2000);
      }
    }
  }, [connectionAttempts, cleanupConnection]);

  // Fonction pour relancer manuellement la connexion
  const retryConnection = useCallback(() => {
    setConnectionAttempts(0);
    connectToMQTT();
  }, [connectToMQTT]);

  useEffect(() => {
    connectToMQTT();
    
    return () => {
      cleanupConnection();
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
    updateIrrigationFromBackend,
    retryConnection,
    maxRetries
  };
};
