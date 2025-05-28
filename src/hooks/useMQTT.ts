
import { useState, useEffect, useCallback } from 'react';

interface MQTTMessage {
  topic: string;
  message: string;
}

export const useMQTT = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<MQTTMessage[]>([]);
  const [irrigationStatus, setIrrigationStatus] = useState(false);
  const [isManualMode, setIsManualMode] = useState(false);
  const [manualOverride, setManualOverride] = useState(false);

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
        const newStatus = parsedMessage.json.switch_relay.device === 1;
        setIrrigationStatus(newStatus);
        // Si on active/désactive manuellement, passer en mode manuel
        setIsManualMode(true);
        setManualOverride(true);
        
        // Revenir en mode automatique après 30 secondes d'inactivité
        setTimeout(() => {
          setIsManualMode(false);
          setManualOverride(false);
        }, 30000);
      }
    } catch (error) {
      console.error('Erreur lors du parsing du message:', error);
    }
  }, [isConnected]);

  useEffect(() => {
    // Simulation de connexion MQTT
    const connectToMQTT = () => {
      console.log('Tentative de connexion au broker MQTT: http://217.182.210.54:8080/');
      
      // Simulation d'une connexion réussie après 2 secondes
      const connectTimer = setTimeout(() => {
        setIsConnected(true);
        console.log('Connecté au broker MQTT');
        
        // Simulation de réception de messages périodiques
        const interval = setInterval(() => {
          // Ne pas changer l'état automatiquement si en mode manuel
          if (!isManualMode && !manualOverride) {
            const randomStatus = Math.random() > 0.7; // Moins fréquent
            setIrrigationStatus(randomStatus);
          }
          
          const message = {
            topic: "data/PulsarInfinite/swr",
            message: JSON.stringify({
              type: "STATUS",
              irrigation: irrigationStatus,
              timestamp: new Date().toISOString()
            })
          };
          
          setMessages(prev => [...prev.slice(-9), message]);
        }, 8000); // Plus espacé

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
  }, [isManualMode, manualOverride, irrigationStatus]);

  return {
    isConnected,
    messages,
    irrigationStatus,
    isManualMode,
    publishMessage,
    setManualMode: setIsManualMode
  };
};
