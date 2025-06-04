
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
  const maxRetries = 3;

  // Configuration pour votre broker JHipster spécifique
  const brokerConfig = {
    url: 'ws://217.182.210.54:8080/mqtt', // WebSocket endpoint pour JHipster
    options: {
      connectTimeout: 15000,
      keepalive: 30,
      clean: true,
      reconnectPeriod: 5000,
      username: 'infinite', // Remplacez par vos identifiants
      password: 'infinite_password', // Remplacez par votre mot de passe
      protocolVersion: 4,
      clientId: `pulsar_web_${Math.random().toString(16).substr(2, 8)}`
    }
  };

  // Topics spécifiques à votre système
  const topics = {
    control: 'infinite/irrigation/control',
    status: 'infinite/irrigation/status', 
    commands: 'infinite/commands/relay',
    data: 'infinite/data/sensors'
  };

  const publishMessage = useCallback((topic: string, message: string, options?: { qos?: 0 | 1 | 2; retain?: boolean }) => {
    console.log('📤 [MQTT PUBLISH] Tentative de publication...');
    console.log('🌐 Statut connexion:', isConnected);
    console.log('🔗 Client existe:', !!clientRef.current);
    console.log('🎯 Topic:', topic);
    console.log('📄 Message:', message);
    
    if (!isConnected || !clientRef.current) {
      console.error('❌ [MQTT ERROR] Non connecté au broker JHipster');
      return false;
    }

    try {
      const publishOptions = {
        qos: (options?.qos || 1) as 0 | 1 | 2,
        retain: options?.retain || false
      };
      
      console.log('📤 [MQTT PUBLISH] Options:', publishOptions);
      
      clientRef.current.publish(topic, message, publishOptions, (error) => {
        if (error) {
          console.error('❌ [MQTT ERROR] Erreur publication:', error);
        } else {
          console.log('✅ [MQTT SUCCESS] Message publié avec succès!');
          const newMessage = { topic, message };
          setMessages(prev => [...prev.slice(-9), newMessage]);
        }
      });
      
      return true;
    } catch (error) {
      console.error('❌ [MQTT EXCEPTION] Exception lors de la publication:', error);
      return false;
    }
  }, [isConnected]);

  const setManualMode = useCallback((mode: boolean) => {
    console.log('🔄 [MODE] Changement mode manuel:', mode);
    setIsManualMode(mode);
  }, []);

  const updateIrrigationFromBackend = useCallback((status: boolean) => {
    setIrrigationStatus(status);
  }, []);

  const connectToMQTT = useCallback(async () => {
    if (connectionAttempts >= maxRetries) {
      console.error('❌ [MQTT] Limite de tentatives atteinte');
      return;
    }

    console.log(`🔄 [MQTT] Tentative ${connectionAttempts + 1}/${maxRetries}`);
    console.log('🌐 [MQTT] Connexion à:', brokerConfig.url);
    console.log('👤 [MQTT] Client ID:', brokerConfig.options.clientId);
    
    setConnectionAttempts(prev => prev + 1);

    // Nettoyer la connexion précédente
    if (clientRef.current) {
      try {
        clientRef.current.removeAllListeners();
        clientRef.current.end(true);
      } catch (error) {
        console.error('⚠️ [MQTT] Erreur fermeture précédente:', error);
      }
    }

    try {
      const client = mqtt.connect(brokerConfig.url, brokerConfig.options);
      clientRef.current = client;

      const connectTimeout = setTimeout(() => {
        console.log('⏰ [MQTT] Timeout de connexion');
        if (connectionAttempts < maxRetries - 1) {
          setTimeout(() => connectToMQTT(), 3000);
        }
      }, 20000);

      client.on('connect', () => {
        clearTimeout(connectTimeout);
        console.log('✅ [MQTT] Connecté au broker JHipster!');
        console.log('🔗 [MQTT] URL:', brokerConfig.url);
        setIsConnected(true);
        setConnectionAttempts(0);
        
        // S'abonner aux topics avec QoS approprié
        const subscriptions = [
          { topic: topics.status, qos: 1 },
          { topic: topics.control, qos: 1 },
          { topic: topics.data, qos: 0 },
          { topic: 'infinite/+/+', qos: 0 } // Wildcard pour tous les topics infinite
        ];

        subscriptions.forEach(sub => {
          client.subscribe(sub.topic, { qos: sub.qos }, (err) => {
            if (err) {
              console.error(`❌ [MQTT] Erreur abonnement ${sub.topic}:`, err);
            } else {
              console.log(`📡 [MQTT] Abonné à ${sub.topic} (QoS: ${sub.qos})`);
            }
          });
        });
      });

      client.on('message', (topic, message) => {
        const messageStr = message.toString();
        console.log(`📨 [MQTT MESSAGE] Topic: ${topic}`);
        console.log(`📨 [MQTT MESSAGE] Contenu:`, messageStr);
        
        try {
          // Tenter de parser en JSON
          const data = JSON.parse(messageStr);
          console.log('📄 [MQTT] Data parsée:', data);
          
          // Traitement selon le topic
          if (topic.includes('status') || topic.includes('irrigation')) {
            if (data.irrigation !== undefined) {
              console.log('💧 [IRRIGATION] Statut reçu:', data.irrigation);
              setIrrigationStatus(data.irrigation);
            }
            if (data.relay !== undefined) {
              console.log('🔌 [RELAY] Statut reçu:', data.relay);
              setIrrigationStatus(data.relay === 1);
            }
          }
          
          const newMessage = { topic, message: messageStr };
          setMessages(prev => [...prev.slice(-9), newMessage]);
        } catch (error) {
          console.log('📄 [MQTT] Message non-JSON:', messageStr);
          // Traitement des messages non-JSON
          if (messageStr.toLowerCase().includes('on') || messageStr === '1') {
            setIrrigationStatus(true);
          } else if (messageStr.toLowerCase().includes('off') || messageStr === '0') {
            setIrrigationStatus(false);
          }
          
          const newMessage = { topic, message: messageStr };
          setMessages(prev => [...prev.slice(-9), newMessage]);
        }
      });

      client.on('error', (error) => {
        clearTimeout(connectTimeout);
        console.error(`❌ [MQTT ERROR] Erreur connexion:`, error);
        setIsConnected(false);
        
        if (connectionAttempts < maxRetries - 1) {
          console.log('🔄 [MQTT] Retry dans 3 secondes...');
          setTimeout(() => connectToMQTT(), 3000);
        }
      });

      client.on('offline', () => {
        console.log('📴 [MQTT] Client hors ligne');
        setIsConnected(false);
      });

      client.on('close', () => {
        console.log('🔌 [MQTT] Connexion fermée');
        setIsConnected(false);
      });

      client.on('reconnect', () => {
        console.log('🔄 [MQTT] Tentative de reconnexion...');
      });

    } catch (error) {
      console.error('❌ [MQTT] Erreur création client:', error);
      if (connectionAttempts < maxRetries - 1) {
        setTimeout(() => connectToMQTT(), 3000);
      }
    }
  }, [connectionAttempts, maxRetries, topics]);

  const retryConnection = useCallback(() => {
    console.log('🔄 [MQTT] Retry manuel demandé');
    setConnectionAttempts(0);
    connectToMQTT();
  }, [connectToMQTT]);

  useEffect(() => {
    console.log('🚀 [MQTT INIT] Initialisation du hook MQTT');
    console.log('🌐 [MQTT INIT] Broker cible:', brokerConfig.url);
    connectToMQTT();
    
    return () => {
      console.log('🧹 [MQTT CLEANUP] Nettoyage du hook');
      if (clientRef.current) {
        try {
          clientRef.current.removeAllListeners();
          clientRef.current.end(true);
        } catch (error) {
          console.error('⚠️ [CLEANUP] Erreur:', error);
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
    maxRetries,
    topics // Exposer les topics pour utilisation dans les composants
  };
};
