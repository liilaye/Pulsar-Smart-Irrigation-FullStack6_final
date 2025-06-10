
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
  const [isManualMode, setIsManualMode] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const clientRef = useRef<mqtt.MqttClient | null>(null);
  const maxRetries = 5;

  // URLs de broker MQTT publics pour test
  const brokerUrls = [
    'wss://broker.emqx.io:8084/mqtt',
    'wss://mqtt.eclipseprojects.io:443/mqtt',
    'ws://broker.emqx.io:8083/mqtt',
    'ws://mqtt.eclipseprojects.io:80/mqtt'
  ];

  const publishMessage = useCallback((topic: string, message: string, options?: { qos?: 0 | 1 | 2; retain?: boolean }) => {
    console.log('📤 Tentative de publication...');
    console.log('🌐 Statut connexion MQTT:', isConnected);
    console.log('🔗 Client MQTT existe:', !!clientRef.current);
    
    if (!isConnected || !clientRef.current) {
      console.error('❌ Non connecté au broker MQTT - isConnected:', isConnected, 'client:', !!clientRef.current);
      return false;
    }

    try {
      console.log(`📤 Publication sur topic: ${topic}`);
      console.log('📤 Message à publier:', message);
      console.log('📤 Options:', { qos: options?.qos || 1, retain: options?.retain || false });
      
      clientRef.current.publish(topic, message, {
        qos: (options?.qos || 1) as 0 | 1 | 2,
        retain: options?.retain || false
      }, (error) => {
        if (error) {
          console.error('❌ Erreur lors de la publication:', error);
        } else {
          console.log('✅ Message publié avec succès sur le broker!');
          const newMessage = { topic, message };
          setMessages(prev => [...prev.slice(-9), newMessage]);
        }
      });
      
      return true;
    } catch (error) {
      console.error('❌ Exception lors de la publication:', error);
      return false;
    }
  }, [isConnected]);

  const setManualMode = useCallback((mode: boolean) => {
    console.log('🔄 Changement mode manuel:', mode);
    setIsManualMode(mode);
  }, []);

  const updateIrrigationFromBackend = useCallback((status: boolean) => {
    setIrrigationStatus(status);
  }, []);

  const connectToMQTT = useCallback(async (urlIndex = 0) => {
    if (urlIndex >= brokerUrls.length || connectionAttempts >= maxRetries) {
      console.error('❌ Toutes les tentatives de connexion ont échoué');
      return;
    }

    const brokerUrl = brokerUrls[urlIndex];
    console.log(`🔄 Tentative ${connectionAttempts + 1}/${maxRetries} - Connexion à: ${brokerUrl}`);
    
    setConnectionAttempts(prev => prev + 1);

    // Nettoyer la connexion précédente
    if (clientRef.current) {
      try {
        clientRef.current.removeAllListeners();
        clientRef.current.end(true);
      } catch (error) {
        console.error('Erreur lors de la fermeture:', error);
      }
    }

    try {
      const client = mqtt.connect(brokerUrl, {
        connectTimeout: 10000,
        keepalive: 60,
        clean: true,
        reconnectPeriod: 0
      });

      clientRef.current = client;
      console.log('🔗 Client MQTT créé pour:', brokerUrl);

      const connectTimeout = setTimeout(() => {
        console.log('⏰ Timeout de connexion pour:', brokerUrl);
        if (urlIndex + 1 < brokerUrls.length) {
          connectToMQTT(urlIndex + 1);
        }
      }, 12000);

      client.on('connect', () => {
        clearTimeout(connectTimeout);
        console.log('✅ Connecté au broker MQTT:', brokerUrl);
        console.log('🎯 Prêt à publier des messages!');
        setIsConnected(true);
        setConnectionAttempts(0);
        
        // S'abonner aux topics
        client.subscribe('irrigation/PulsarInfinite/status', { qos: 1 });
        client.subscribe('irrigation/PulsarInfinite/control', { qos: 1 });
        client.subscribe('data/PulsarInfinite/swr', { qos: 1 }); // Ajout du topic principal
        console.log('📡 Abonnement aux topics effectué');
      });

      client.on('message', (topic, message) => {
        const messageStr = message.toString();
        console.log(`📨 Message reçu sur ${topic}:`, messageStr);
        
        try {
          const data = JSON.parse(messageStr);
          
          if (topic.includes('status') && data.irrigation !== undefined) {
            setIrrigationStatus(data.irrigation);
          }
          
          const newMessage = { topic, message: messageStr };
          setMessages(prev => [...prev.slice(-9), newMessage]);
        } catch (error) {
          console.error('❌ Erreur parsing JSON:', error);
        }
      });

      client.on('error', (error) => {
        clearTimeout(connectTimeout);
        console.error(`❌ Erreur MQTT pour ${brokerUrl}:`, error);
        setIsConnected(false);
        
        if (urlIndex + 1 < brokerUrls.length) {
          setTimeout(() => connectToMQTT(urlIndex + 1), 2000);
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
      console.error('❌ Erreur lors de la création du client:', error);
      if (urlIndex + 1 < brokerUrls.length) {
        setTimeout(() => connectToMQTT(urlIndex + 1), 2000);
      }
    }
  }, [connectionAttempts]);

  const retryConnection = useCallback(() => {
    console.log('🔄 Retry manuel de la connexion');
    setConnectionAttempts(0);
    connectToMQTT();
  }, [connectToMQTT]);

  useEffect(() => {
    console.log('🚀 Initialisation du hook MQTT');
    connectToMQTT();
    
    return () => {
      console.log('🧹 Nettoyage du hook MQTT');
      if (clientRef.current) {
        try {
          clientRef.current.removeAllListeners();
          clientRef.current.end(true);
        } catch (error) {
          console.error('Erreur lors de la fermeture:', error);
        }
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
    updateIrrigationFromBackend,
    retryConnection,
    maxRetries
  };
};
