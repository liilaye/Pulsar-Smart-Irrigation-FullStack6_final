
import { useState, useRef, useCallback } from 'react';
import mqtt from 'mqtt';
import { mqttConfig, getClientOptions } from '@/utils/mqttConfig';
import { MQTTMessage } from '@/types/mqtt';

export const useMQTTConnection = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [messages, setMessages] = useState<MQTTMessage[]>([]);
  const [irrigationStatus, setIrrigationStatus] = useState(false);
  const clientRef = useRef<mqtt.MqttClient | null>(null);

  const connectToMQTT = useCallback(async (urlIndex = 0) => {
    if (urlIndex >= mqttConfig.brokerUrls.length || connectionAttempts >= mqttConfig.maxRetries) {
      console.error('❌ [MQTT DEBUG] TOUTES les tentatives ont échoué');
      console.error('❌ [MQTT DEBUG] URLIndex:', urlIndex, 'ConnectionAttempts:', connectionAttempts);
      return;
    }

    const brokerUrl = mqttConfig.brokerUrls[urlIndex];
    console.log(`🔄 [MQTT DEBUG] Tentative ${connectionAttempts + 1}/${mqttConfig.maxRetries}`);
    console.log(`🔄 [MQTT DEBUG] Connexion à:`, brokerUrl);
    
    setConnectionAttempts(prev => prev + 1);

    // Nettoyer la connexion précédente
    if (clientRef.current) {
      try {
        console.log('🧹 [MQTT DEBUG] Nettoyage connexion précédente...');
        clientRef.current.removeAllListeners();
        clientRef.current.end(true);
      } catch (error) {
        console.error('⚠️ [MQTT DEBUG] Erreur nettoyage:', error);
      }
    }

    try {
      const clientOptions = getClientOptions();
      console.log('🔗 [MQTT DEBUG] Options de connexion:', clientOptions);
      const client = mqtt.connect(brokerUrl, clientOptions);
      clientRef.current = client;
      
      console.log('🔗 [MQTT DEBUG] Client MQTT créé pour:', brokerUrl);

      const connectTimeout = setTimeout(() => {
        console.log('⏰ [MQTT DEBUG] TIMEOUT pour:', brokerUrl);
        if (urlIndex + 1 < mqttConfig.brokerUrls.length) {
          console.log('🔄 [MQTT DEBUG] Tentative broker suivant...');
          connectToMQTT(urlIndex + 1);
        }
      }, 12000);

      client.on('connect', () => {
        clearTimeout(connectTimeout);
        console.log('✅ [MQTT DEBUG] CONNEXION RÉUSSIE:', brokerUrl);
        console.log('🎯 [MQTT DEBUG] PRÊT à publier sur data/PulsarInfinite/swr!');
        setIsConnected(true);
        setConnectionAttempts(0);
        
        // S'abonner aux topics
        const topics = [
          mqttConfig.topics.status,
          mqttConfig.topics.control,
          mqttConfig.topics.data
        ];
        
        console.log('📡 [MQTT DEBUG] Abonnement aux topics:', topics);
        topics.forEach(topic => {
          client.subscribe(topic, { qos: 1 }, (err) => {
            if (err) {
              console.error(`❌ [MQTT DEBUG] Erreur abonnement ${topic}:`, err);
            } else {
              console.log(`✅ [MQTT DEBUG] Abonné à ${topic}`);
            }
          });
        });
      });

      client.on('message', (topic, message) => {
        const messageStr = message.toString();
        console.log(`📨 [MQTT DEBUG] MESSAGE REÇU:`, { topic, message: messageStr });
        
        try {
          const data = JSON.parse(messageStr);
          console.log(`📨 [MQTT DEBUG] JSON parsé:`, data);
          
          if (topic.includes('status') && data.irrigation !== undefined) {
            console.log(`🔄 [MQTT DEBUG] Mise à jour irrigation status:`, data.irrigation);
            setIrrigationStatus(data.irrigation);
          }
          
          const newMessage = { topic, message: messageStr };
          setMessages(prev => [...prev.slice(-9), newMessage]);
        } catch (error) {
          console.error('❌ [MQTT DEBUG] Erreur parsing JSON:', error);
        }
      });

      client.on('error', (error) => {
        clearTimeout(connectTimeout);
        console.error(`❌ [MQTT DEBUG] ERREUR CONNEXION ${brokerUrl}:`, error);
        setIsConnected(false);
        
        if (urlIndex + 1 < mqttConfig.brokerUrls.length) {
          setTimeout(() => {
            console.log('🔄 [MQTT DEBUG] Retry dans 2s...');
            connectToMQTT(urlIndex + 1);
          }, 2000);
        }
      });

      client.on('offline', () => {
        console.log('📴 [MQTT DEBUG] Client hors ligne');
        setIsConnected(false);
      });

      client.on('close', () => {
        console.log('🔌 [MQTT DEBUG] Connexion fermée');
        setIsConnected(false);
      });

    } catch (error) {
      console.error('❌ [MQTT DEBUG] Erreur création client:', error);
      if (urlIndex + 1 < mqttConfig.brokerUrls.length) {
        setTimeout(() => connectToMQTT(urlIndex + 1), 2000);
      }
    }
  }, [connectionAttempts]);

  const retryConnection = useCallback(() => {
    console.log('🔄 [MQTT DEBUG] RETRY MANUEL demandé');
    setConnectionAttempts(0);
    connectToMQTT();
  }, [connectToMQTT]);

  const cleanup = useCallback(() => {
    console.log('🧹 [MQTT DEBUG] NETTOYAGE du hook MQTT');
    if (clientRef.current) {
      try {
        clientRef.current.removeAllListeners();
        clientRef.current.end(true);
      } catch (error) {
        console.error('⚠️ [MQTT DEBUG] Erreur fermeture:', error);
      }
    }
  }, []);

  return {
    isConnected,
    connectionAttempts,
    messages,
    irrigationStatus,
    clientRef,
    connectToMQTT,
    retryConnection,
    cleanup,
    setMessages,
    setIrrigationStatus
  };
};
