
import { useState, useEffect, useCallback } from 'react';

interface MQTTMessage {
  topic: string;
  message: string;
}

export const useMQTT = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<MQTTMessage[]>([]);
  const [irrigationStatus, setIrrigationStatus] = useState(false); // Par défaut arrêté
  const [isManualMode, setIsManualMode] = useState(false);

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
  }, [isConnected]);

  const setManualMode = useCallback((mode: boolean) => {
    setIsManualMode(mode);
  }, []);

  // Fonction pour recevoir les mises à jour du backend
  const updateIrrigationFromBackend = useCallback((status: boolean) => {
    setIrrigationStatus(status);
  }, []);

  useEffect(() => {
    // Simulation de connexion MQTT
    const connectToMQTT = () => {
      console.log('Tentative de connexion au broker MQTT: http://217.182.210.54:8080/');
      
      // Simulation d'une connexion réussie après 2 secondes
      const connectTimer = setTimeout(() => {
        setIsConnected(true);
        console.log('Connecté au broker MQTT');
        
        // Messages de statut périodiques (sans changer l'état automatiquement)
        const interval = setInterval(() => {
          const message = {
            topic: "data/PulsarInfinite/swr",
            message: JSON.stringify({
              type: "STATUS",
              irrigation: irrigationStatus,
              timestamp: new Date().toISOString()
            })
          };
          
          setMessages(prev => [...prev.slice(-9), message]);
        }, 8000);

        return () => {
          clearInterval(interval);
        };
      }, 2000);

      return () => {
        clearTimeout(connectTimer);
      };
    };

    const cleanup = connectToMQTT();
    return cleanup;
  }, [irrigationStatus]);

  return {
    isConnected,
    messages,
    irrigationStatus,
    isManualMode,
    publishMessage,
    setManualMode,
    updateIrrigationFromBackend
  };
};
