
import { useState, useEffect, useCallback } from 'react';
import { mqttService, type MQTTServiceState, type MQTTMessage } from '@/services/mqttService';

export const useMQTT = () => {
  const [state, setState] = useState<MQTTServiceState>(mqttService.getState());
  const [recentMessages, setRecentMessages] = useState<MQTTMessage[]>([]);
  const [irrigationStatus, setIrrigationStatus] = useState(false);
  const [isManualMode, setIsManualMode] = useState(false);

  useEffect(() => {
    // S'abonner aux changements d'état
    const unsubscribeState = mqttService.subscribe((newState) => {
      setState(newState);
    });

    // S'abonner aux messages
    const unsubscribeMessages = mqttService.subscribeToMessages((message) => {
      setRecentMessages(prev => [...prev.slice(-9), message]);
      
      // Traiter les messages d'irrigation
      try {
        const data = JSON.parse(message.payload);
        
        if (message.topic.includes('status') && data.irrigation !== undefined) {
          setIrrigationStatus(data.irrigation);
        }
        
        if (message.topic.includes('swr') && data.json?.switch_relay) {
          setIrrigationStatus(data.json.switch_relay.device === 1);
          setIsManualMode(true);
        }
      } catch (error) {
        // Ignorer les messages non-JSON
      }
    });

    // Démarrer la connexion au broker PulsarInfinite
    mqttService.connect();

    return () => {
      unsubscribeState();
      unsubscribeMessages();
    };
  }, []);

  const publishMessage = useCallback((topic: string, message: string, options?: { qos?: 0 | 1 | 2; retain?: boolean }) => {
    return mqttService.publish(topic, message, options);
  }, []);

  const publishIrrigationCommand = useCallback(async (deviceState: 0 | 1) => {
    console.log(`🚿 Commande irrigation PulsarInfinite: ${deviceState ? 'ON' : 'OFF'}`);
    const success = await mqttService.publishIrrigationCommand(deviceState);
    
    if (success) {
      setIrrigationStatus(deviceState === 1);
      setIsManualMode(true);
    }
    
    return success;
  }, []);

  const retryConnection = useCallback(() => {
    console.log('🔄 Retry connexion PulsarInfinite demandé');
    mqttService.forceReconnect();
  }, []);

  const getBrokerInfo = useCallback(() => {
    return mqttService.getBrokerInfo();
  }, []);

  return {
    isConnected: state.isConnected,
    currentBroker: state.currentBroker,
    connectionHealth: state.connectionHealth,
    reconnectAttempts: state.reconnectAttempts,
    messages: recentMessages,
    irrigationStatus,
    isManualMode,
    publishMessage,
    publishIrrigationCommand,
    retryConnection,
    getBrokerInfo,
    maxRetries: 5 // Pour compatibility
  };
};
