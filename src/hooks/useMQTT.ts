
import { useState, useEffect, useCallback } from 'react';

interface MQTTMessage {
  topic: string;
  message: string;
}

export const useMQTT = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<MQTTMessage[]>([]);
  const [irrigationStatus, setIrrigationStatus] = useState(false);

  useEffect(() => {
    // Simulation de connexion MQTT
    const connectToMQTT = () => {
      console.log('Tentative de connexion au broker MQTT: http://217.182.210.54:8080/');
      
      // Simulation d'une connexion réussie après 2 secondes
      setTimeout(() => {
        setIsConnected(true);
        console.log('Connecté au broker MQTT');
        
        // Simulation de réception de messages périodiques
        const interval = setInterval(() => {
          const randomStatus = Math.random() > 0.5;
          setIrrigationStatus(randomStatus);
          
          const message = {
            topic: "data/PulsarInfinite/swr",
            message: JSON.stringify({
              type: "STATUS",
              irrigation: randomStatus,
              timestamp: new Date().toISOString()
            })
          };
          
          setMessages(prev => [...prev.slice(-9), message]);
        }, 5000);

        return () => clearInterval(interval);
      }, 2000);
    };

    connectToMQTT();
  }, []);

  const publishMessage = useCallback((topic: string, message: string, options?: { qos?: number; retain?: boolean }) => {
    if (!isConnected) {
      console.error('Non connecté au broker MQTT');
      return;
    }

    console.log(`Publication sur ${topic}:`, message);
    console.log('Options:', options);
    
    // Simulation de l'envoi du message
    const newMessage = {
      topic,
      message
    };
    
    setMessages(prev => [...prev.slice(-9), newMessage]);
    
    // Mettre à jour le statut d'irrigation basé sur le message
    try {
      const parsedMessage = JSON.parse(message);
      if (parsedMessage.json?.switch_relay?.device !== undefined) {
        setIrrigationStatus(parsedMessage.json.switch_relay.device === 1);
      }
    } catch (error) {
      console.error('Erreur lors du parsing du message:', error);
    }
  }, [isConnected]);

  return {
    isConnected,
    messages,
    irrigationStatus,
    publishMessage
  };
};
