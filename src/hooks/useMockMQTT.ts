// Hook MQTT simulé pour la démo - remplace useMQTT.ts
import { useState, useEffect, useCallback } from 'react';
import { mockMqttService, type MockMQTTServiceState, type MockMQTTMessage } from '@/services/mockMQTTService';

export const useMockMQTT = () => {
  const [state, setState] = useState<MockMQTTServiceState>(mockMqttService.getState());
  const [recentMessages, setRecentMessages] = useState<MockMQTTMessage[]>([]);
  const [irrigationStatus, setIrrigationStatus] = useState(false);
  const [isManualMode, setIsManualMode] = useState(false);

  useEffect(() => {
    console.log('🟢 [DEMO] Initialisation hook MQTT simulé');
    
    // S'abonner aux changements d'état
    const unsubscribeState = mockMqttService.subscribe((newState) => {
      setState(newState);
      console.log('🟢 [DEMO] État MQTT mis à jour:', newState);
    });

    // S'abonner aux messages
    const unsubscribeMessages = mockMqttService.subscribeToMessages((message) => {
      setRecentMessages(prev => [...prev.slice(-9), message]);
      console.log('🟢 [DEMO] Nouveau message MQTT:', message);
      
      // Traiter les messages d'irrigation
      try {
        const data = JSON.parse(message.payload);
        
        if (message.topic.includes('status') && data.irrigation !== undefined) {
          setIrrigationStatus(data.irrigation);
          console.log(`🟢 [DEMO] Statut irrigation mis à jour: ${data.irrigation ? 'ON' : 'OFF'}`);
        }
        
        if (message.topic.includes('irrigation') && data.device !== undefined) {
          setIrrigationStatus(data.device === 1);
          setIsManualMode(true);
          console.log(`🟢 [DEMO] Commande irrigation: Device ${data.device}`);
        }
      } catch (error) {
        // Ignorer les messages non-JSON
        console.log('🟢 [DEMO] Message non-JSON reçu:', message.payload);
      }
    });

    // Démarrer la connexion au broker simulé
    mockMqttService.connect();

    return () => {
      unsubscribeState();
      unsubscribeMessages();
      console.log('🟢 [DEMO] Nettoyage hook MQTT simulé');
    };
  }, []);

  const publishMessage = useCallback((topic: string, message: string, options?: { qos?: 0 | 1 | 2; retain?: boolean }) => {
    console.log(`🟢 [DEMO] Publication message sur ${topic}:`, message);
    return mockMqttService.publish(topic, message, options);
  }, []);

  const publishIrrigationCommand = useCallback(async (deviceState: 0 | 1) => {
    console.log(`🟢 [DEMO] Commande irrigation PulsarInfinite: ${deviceState ? 'ON' : 'OFF'}`);
    const success = await mockMqttService.publishIrrigationCommand(deviceState);
    
    if (success) {
      setIrrigationStatus(deviceState === 1);
      setIsManualMode(true);
      console.log(`🟢 [DEMO] Irrigation ${deviceState ? 'démarrée' : 'arrêtée'} avec succès`);
    } else {
      console.log('❌ [DEMO] Échec commande irrigation');
    }
    
    return success;
  }, []);

  const retryConnection = useCallback(() => {
    console.log('🟢 [DEMO] Retry connexion PulsarInfinite demandé');
    mockMqttService.forceReconnect();
  }, []);

  const getBrokerInfo = useCallback(() => {
    const info = mockMqttService.getBrokerInfo();
    console.log('🟢 [DEMO] Info broker:', info);
    return info;
  }, []);

  const testConnection = useCallback(async () => {
    console.log('🟢 [DEMO] Test connexion MQTT...');
    const result = await mockMqttService.testConnection();
    console.log('🟢 [DEMO] Résultat test connexion:', result);
    return result;
  }, []);

  // Simulation des données de capteurs en temps réel
  const getSensorData = useCallback(() => {
    return {
      temperature: Math.round((20 + Math.random() * 15) * 10) / 10,
      humidity: Math.round((40 + Math.random() * 40) * 10) / 10,
      soilMoisture: Math.round((30 + Math.random() * 50) * 10) / 10,
      lastUpdate: new Date().toISOString()
    };
  }, []);

  // Simuler l'état du système d'irrigation
  const getSystemStatus = useCallback(() => {
    return {
      isOnline: state.isConnected,
      irrigationActive: irrigationStatus,
      mode: isManualMode ? 'MANUAL' : 'AUTO',
      lastCommunication: new Date().toISOString(),
      signalStrength: state.connectionHealth === 'excellent' ? 100 : 
                     state.connectionHealth === 'good' ? 75 : 
                     state.connectionHealth === 'poor' ? 50 : 0
    };
  }, [state.isConnected, state.connectionHealth, irrigationStatus, isManualMode]);

  return {
    // État de connexion
    isConnected: state.isConnected,
    currentBroker: state.currentBroker,
    connectionHealth: state.connectionHealth,
    reconnectAttempts: state.reconnectAttempts,
    lastError: state.lastError,
    
    // Messages et données
    messages: recentMessages,
    irrigationStatus,
    isManualMode,
    
    // Actions
    publishMessage,
    publishIrrigationCommand,
    retryConnection,
    getBrokerInfo,
    testConnection,
    
    // Nouvelles fonctions pour la démo
    getSensorData,
    getSystemStatus,
    
    // Compatibilité
    maxRetries: 5
  };
};