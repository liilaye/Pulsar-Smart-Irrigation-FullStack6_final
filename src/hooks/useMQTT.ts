
import { useState, useEffect, useCallback } from 'react';
import { useMQTTConnection } from './useMQTTConnection';
import { useMQTTPublisher } from './useMQTTPublisher';
import { mqttConfig } from '@/utils/mqttConfig';

export const useMQTT = () => {
  const [isManualMode, setIsManualMode] = useState(false);
  
  const {
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
  } = useMQTTConnection();

  const { publishMessage } = useMQTTPublisher(isConnected, clientRef, setMessages);

  const setManualMode = useCallback((mode: boolean) => {
    console.log('🔄 [MQTT DEBUG] Changement mode manuel:', mode);
    setIsManualMode(mode);
  }, []);

  const updateIrrigationFromBackend = useCallback((status: boolean) => {
    setIrrigationStatus(status);
  }, [setIrrigationStatus]);

  useEffect(() => {
    console.log('🚀 [MQTT DEBUG] INITIALISATION du hook MQTT');
    connectToMQTT();
    
    return cleanup;
  }, [connectToMQTT, cleanup]);

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
    maxRetries: mqttConfig.maxRetries
  };
};
