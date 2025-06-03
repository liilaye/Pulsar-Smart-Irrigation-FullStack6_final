
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

  // Configuration pour votre broker JHipster local
  const brokerUrls = [
    'ws://localhost:1883',  // Broker JHipster principal
    'ws://127.0.0.1:1883',  // Alternative localhost
    'wss://broker.emqx.io:8084/mqtt'  // Fallback public
  ];

  const publishMessage = useCallback((topic: string, message: string, options?: { qos?: 0 | 1 | 2; retain?: boolean }) => {
    console.log('🚀 [MQTT DEBUG] Début publication...');
    console.log('🌐 [MQTT DEBUG] Statut connexion:', isConnected);
    console.log('🔗 [MQTT DEBUG] Client existe:', !!clientRef.current);
    console.log('📍 [MQTT DEBUG] Topic cible:', topic);
    console.log('📦 [MQTT DEBUG] Message à envoyer:', message);
    
    if (!isConnected || !clientRef.current) {
      console.error('❌ [MQTT DEBUG] ÉCHEC - Pas de connexion au broker');
      console.error('❌ [MQTT DEBUG] isConnected:', isConnected);
      console.error('❌ [MQTT DEBUG] clientRef.current:', !!clientRef.current);
      return false;
    }

    try {
      const publishOptions = {
        qos: (options?.qos || 1) as 0 | 1 | 2,
        retain: options?.retain || false
      };
      
      console.log('📤 [MQTT DEBUG] Options de publication:', publishOptions);
      console.log('📤 [MQTT DEBUG] Tentative d\'envoi vers broker JHipster...');
      
      clientRef.current.publish(topic, message, publishOptions, (error) => {
        if (error) {
          console.error('❌ [MQTT DEBUG] ERREUR lors de la publication:', error);
          console.error('❌ [MQTT DEBUG] Type erreur:', typeof error);
          console.error('❌ [MQTT DEBUG] Message erreur:', error.message);
        } else {
          console.log('✅ [MQTT DEBUG] Message publié avec SUCCÈS!');
          console.log('✅ [MQTT DEBUG] Topic:', topic);
          console.log('✅ [MQTT DEBUG] Contenu:', message);
          const newMessage = { topic, message };
          setMessages(prev => [...prev.slice(-9), newMessage]);
        }
      });
      
      console.log('📤 [MQTT DEBUG] Commande publish() exécutée');
      return true;
    } catch (error) {
      console.error('❌ [MQTT DEBUG] EXCEPTION lors de la publication:', error);
      return false;
    }
  }, [isConnected]);

  const setManualMode = useCallback((mode: boolean) => {
    console.log('🔄 [MQTT DEBUG] Changement mode manuel:', mode);
    setIsManualMode(mode);
  }, []);

  const updateIrrigationFromBackend = useCallback((status: boolean) => {
    setIrrigationStatus(status);
  }, []);

  const connectToMQTT = useCallback(async (urlIndex = 0) => {
    if (urlIndex >= brokerUrls.length || connectionAttempts >= maxRetries) {
      console.error('❌ [MQTT DEBUG] TOUTES les tentatives ont échoué');
      console.error('❌ [MQTT DEBUG] URLIndex:', urlIndex, 'ConnectionAttempts:', connectionAttempts);
      return;
    }

    const brokerUrl = brokerUrls[urlIndex];
    console.log(`🔄 [MQTT DEBUG] Tentative ${connectionAttempts + 1}/${maxRetries}`);
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
      const clientOptions = {
        connectTimeout: 10000,
        keepalive: 60,
        clean: true,
        reconnectPeriod: 0
      };
      
      console.log('🔗 [MQTT DEBUG] Options de connexion:', clientOptions);
      const client = mqtt.connect(brokerUrl, clientOptions);
      clientRef.current = client;
      
      console.log('🔗 [MQTT DEBUG] Client MQTT créé pour:', brokerUrl);

      const connectTimeout = setTimeout(() => {
        console.log('⏰ [MQTT DEBUG] TIMEOUT pour:', brokerUrl);
        if (urlIndex + 1 < brokerUrls.length) {
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
          'irrigation/PulsarInfinite/status',
          'irrigation/PulsarInfinite/control', 
          'data/PulsarInfinite/swr'
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
        
        if (urlIndex + 1 < brokerUrls.length) {
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
      if (urlIndex + 1 < brokerUrls.length) {
        setTimeout(() => connectToMQTT(urlIndex + 1), 2000);
      }
    }
  }, [connectionAttempts]);

  const retryConnection = useCallback(() => {
    console.log('🔄 [MQTT DEBUG] RETRY MANUEL demandé');
    setConnectionAttempts(0);
    connectToMQTT();
  }, [connectToMQTT]);

  useEffect(() => {
    console.log('🚀 [MQTT DEBUG] INITIALISATION du hook MQTT');
    connectToMQTT();
    
    return () => {
      console.log('🧹 [MQTT DEBUG] NETTOYAGE du hook MQTT');
      if (clientRef.current) {
        try {
          clientRef.current.removeAllListeners();
          clientRef.current.end(true);
        } catch (error) {
          console.error('⚠️ [MQTT DEBUG] Erreur fermeture:', error);
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
