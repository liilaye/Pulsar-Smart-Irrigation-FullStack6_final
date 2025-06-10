
import { useState, useEffect, useCallback, useRef } from 'react';
import mqtt from 'mqtt';

interface MQTTMessage {
  topic: string;
  message: string;
}

export const useMQTT = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<MQTTMessage[]>([]);
  const [irrigationStatus, setIrrigationStatus] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const clientRef = useRef<mqtt.MqttClient | null>(null);
  const maxRetries = 3;

  // Configuration broker principal PulsarInfinite
  const primaryBroker = {
    url: 'ws://217.182.210.54:8080/mqtt',
    host: '217.182.210.54',
    port: 8080
  };

  // Brokers de fallback pour tests
  const fallbackBrokers = [
    'wss://broker.emqx.io:8084/mqtt',
    'wss://mqtt.eclipseprojects.io:443/mqtt'
  ];

  const publishMessage = useCallback((topic: string, message: string, options?: { qos?: 0 | 1 | 2; retain?: boolean }) => {
    console.log('📤 Publication MQTT vers broker PulsarInfinite...');
    console.log('🌐 Statut connexion:', isConnected);
    console.log('🔗 Client existe:', !!clientRef.current);
    console.log('📍 Topic:', topic);
    console.log('📄 Message:', message);
    
    if (!isConnected || !clientRef.current) {
      console.error('❌ Non connecté au broker MQTT PulsarInfinite');
      return false;
    }

    try {
      const publishOptions = {
        qos: (options?.qos || 1) as 0 | 1 | 2,
        retain: options?.retain || true
      };
      
      console.log('📤 Options publication:', publishOptions);
      
      clientRef.current.publish(topic, message, publishOptions, (error) => {
        if (error) {
          console.error('❌ Erreur publication MQTT:', error);
        } else {
          console.log('✅ Message publié avec succès vers broker PulsarInfinite!');
          const newMessage = { topic, message };
          setMessages(prev => [...prev.slice(-9), newMessage]);
        }
      });
      
      return true;
    } catch (error) {
      console.error('❌ Exception publication MQTT:', error);
      return false;
    }
  }, [isConnected]);

  const connectToMQTT = useCallback(async (useFallback = false) => {
    if (connectionAttempts >= maxRetries) {
      console.error('❌ Nombre maximum de tentatives atteint');
      return;
    }

    const brokerUrl = useFallback ? fallbackBrokers[0] : primaryBroker.url;
    console.log(`🔄 Connexion au broker: ${brokerUrl} (tentative ${connectionAttempts + 1}/${maxRetries})`);
    
    setConnectionAttempts(prev => prev + 1);

    // Nettoyer la connexion précédente
    if (clientRef.current) {
      try {
        clientRef.current.removeAllListeners();
        clientRef.current.end(true);
      } catch (error) {
        console.error('Erreur fermeture connexion précédente:', error);
      }
    }

    try {
      const client = mqtt.connect(brokerUrl, {
        connectTimeout: 10000,
        keepalive: 60,
        clean: true,
        reconnectPeriod: 0,
        clientId: `PulsarInfinite_Frontend_${Date.now()}`
      });

      clientRef.current = client;
      console.log('🔗 Client MQTT créé pour broker PulsarInfinite');

      const connectTimeout = setTimeout(() => {
        console.log('⏰ Timeout connexion broker PulsarInfinite');
        if (!useFallback) {
          console.log('🔄 Tentative avec broker de fallback...');
          connectToMQTT(true);
        }
      }, 12000);

      client.on('connect', () => {
        clearTimeout(connectTimeout);
        console.log('✅ Connecté au broker PulsarInfinite:', brokerUrl);
        console.log('🎯 Prêt pour l\'irrigation directe!');
        setIsConnected(true);
        setConnectionAttempts(0);
        
        // S'abonner aux topics PulsarInfinite
        const topics = [
          'data/PulsarInfinite/swr',
          'data/PulsarInfinite/status',
          'data/PulsarInfinite/control'
        ];
        
        topics.forEach(topic => {
          client.subscribe(topic, { qos: 1 }, (err) => {
            if (err) {
              console.error(`❌ Erreur abonnement ${topic}:`, err);
            } else {
              console.log(`📡 Abonné au topic: ${topic}`);
            }
          });
        });
      });

      client.on('message', (topic, message) => {
        const messageStr = message.toString();
        console.log(`📨 Message reçu sur ${topic}:`, messageStr);
        
        try {
          const data = JSON.parse(messageStr);
          
          // Gérer les messages de statut d'irrigation
          if (topic.includes('status') && data.irrigation !== undefined) {
            setIrrigationStatus(data.irrigation);
          }
          
          // Traiter les messages de contrôle
          if (topic.includes('control') && data.switch_relay) {
            setIrrigationStatus(data.switch_relay.device === 1);
          }
          
          const newMessage = { topic, message: messageStr };
          setMessages(prev => [...prev.slice(-9), newMessage]);
        } catch (error) {
          console.error('❌ Erreur parsing message JSON:', error);
          // Ajouter le message brut même s'il n'est pas JSON
          const newMessage = { topic, message: messageStr };
          setMessages(prev => [...prev.slice(-9), newMessage]);
        }
      });

      client.on('error', (error) => {
        clearTimeout(connectTimeout);
        console.error(`❌ Erreur MQTT pour ${brokerUrl}:`, error);
        setIsConnected(false);
        
        if (!useFallback && connectionAttempts < maxRetries) {
          setTimeout(() => connectToMQTT(true), 2000);
        }
      });

      client.on('offline', () => {
        console.log('📴 Client MQTT hors ligne');
        setIsConnected(false);
      });

      client.on('close', () => {
        console.log('🔌 Connexion MQTT fermée');
        setIsConnected(false);
      });

    } catch (error) {
      console.error('❌ Erreur création client MQTT:', error);
      if (!useFallback && connectionAttempts < maxRetries) {
        setTimeout(() => connectToMQTT(true), 2000);
      }
    }
  }, [connectionAttempts]);

  const retryConnection = useCallback(() => {
    console.log('🔄 Retry manuel de la connexion au broker PulsarInfinite');
    setConnectionAttempts(0);
    connectToMQTT();
  }, [connectToMQTT]);

  useEffect(() => {
    console.log('🚀 Initialisation connexion broker MQTT PulsarInfinite');
    connectToMQTT();
    
    return () => {
      console.log('🧹 Nettoyage connexion MQTT PulsarInfinite');
      if (clientRef.current) {
        try {
          clientRef.current.removeAllListeners();
          clientRef.current.end(true);
        } catch (error) {
          console.error('Erreur fermeture:', error);
        }
      }
    };
  }, []);

  return {
    isConnected,
    messages,
    irrigationStatus,
    connectionAttempts,
    publishMessage,
    retryConnection,
    maxRetries
  };
};
