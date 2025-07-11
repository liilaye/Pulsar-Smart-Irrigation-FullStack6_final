// Service MQTT simulé pour la démo
export interface MockMQTTMessage {
  topic: string;
  payload: string;
  timestamp: Date;
  qos: 0 | 1 | 2;
}

export interface MockMQTTServiceState {
  isConnected: boolean;
  currentBroker: string;
  connectionHealth: 'excellent' | 'good' | 'poor' | 'disconnected';
  reconnectAttempts: number;
  lastError: string | null;
}

class MockMQTTService {
  private state: MockMQTTServiceState = {
    isConnected: false,
    currentBroker: 'demo-broker.pulsar.local',
    connectionHealth: 'disconnected',
    reconnectAttempts: 0,
    lastError: null
  };

  private subscribers: ((state: MockMQTTServiceState) => void)[] = [];
  private messageSubscribers: ((message: MockMQTTMessage) => void)[] = [];
  private connectionTimer: NodeJS.Timeout | null = null;
  private messageTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.startSimulation();
  }

  private startSimulation() {
    // Simule une connexion après 2 secondes
    this.connectionTimer = setTimeout(() => {
      this.state = {
        ...this.state,
        isConnected: true,
        connectionHealth: 'excellent',
        lastError: null
      };
      console.log('🟢 [DEMO] MQTT Broker simulé connecté');
      this.notifySubscribers();
      this.startMessageSimulation();
    }, 2000);
  }

  private startMessageSimulation() {
    // Simule des messages périodiques du système
    const sendPeriodicMessage = () => {
      if (this.state.isConnected) {
        const topics = [
          'pulsar/sensors/temperature',
          'pulsar/sensors/humidity', 
          'pulsar/sensors/soil_moisture',
          'pulsar/system/status'
        ];
        
        const randomTopic = topics[Math.floor(Math.random() * topics.length)];
        let payload = '';
        
        switch (randomTopic) {
          case 'pulsar/sensors/temperature':
            payload = JSON.stringify({ 
              temperature: Math.round((20 + Math.random() * 15) * 10) / 10,
              timestamp: new Date().toISOString()
            });
            break;
          case 'pulsar/sensors/humidity':
            payload = JSON.stringify({ 
              humidity: Math.round((40 + Math.random() * 40) * 10) / 10,
              timestamp: new Date().toISOString()
            });
            break;
          case 'pulsar/sensors/soil_moisture':
            payload = JSON.stringify({ 
              soilMoisture: Math.round((30 + Math.random() * 50) * 10) / 10,
              timestamp: new Date().toISOString()
            });
            break;
          case 'pulsar/system/status':
            payload = JSON.stringify({ 
              status: 'operational',
              uptime: Math.floor(Date.now() / 1000),
              irrigation: false,
              timestamp: new Date().toISOString()
            });
            break;
        }

        this.notifyMessageSubscribers({
          topic: randomTopic,
          payload,
          timestamp: new Date(),
          qos: 0
        });
      }
    };

    // Messages toutes les 5-15 secondes
    const scheduleNext = () => {
      const delay = 5000 + Math.random() * 10000;
      this.messageTimer = setTimeout(() => {
        sendPeriodicMessage();
        scheduleNext();
      }, delay);
    };

    scheduleNext();
  }

  connect() {
    console.log('🟢 [DEMO] Connexion au broker MQTT simulé...');
    if (!this.state.isConnected) {
      this.startSimulation();
    }
  }

  getState(): MockMQTTServiceState {
    return { ...this.state };
  }

  subscribe(callback: (state: MockMQTTServiceState) => void) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  subscribeToMessages(callback: (message: MockMQTTMessage) => void) {
    this.messageSubscribers.push(callback);
    return () => {
      this.messageSubscribers = this.messageSubscribers.filter(sub => sub !== callback);
    };
  }

  async publish(topic: string, message: string, options?: { qos?: 0 | 1 | 2; retain?: boolean }) {
    if (!this.state.isConnected) {
      console.log('❌ [DEMO] MQTT non connecté pour publier');
      return false;
    }

    console.log(`🟢 [DEMO] Message MQTT publié sur ${topic}:`, message);
    
    // Simule la latence réseau
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 300));
    
    // Echo du message publié
    this.notifyMessageSubscribers({
      topic: `${topic}/echo`,
      payload: JSON.stringify({ 
        original: message, 
        status: 'received',
        timestamp: new Date().toISOString()
      }),
      timestamp: new Date(),
      qos: options?.qos || 0
    });

    return true;
  }

  async publishIrrigationCommand(deviceState: 0 | 1) {
    const topic = 'pulsar/irrigation/command';
    const message = JSON.stringify({
      device: deviceState,
      command: deviceState ? 'START' : 'STOP',
      timestamp: new Date().toISOString(),
      source: 'demo_interface'
    });

    console.log(`🟢 [DEMO] Commande irrigation ${deviceState ? 'START' : 'STOP'}`);
    
    const success = await this.publish(topic, message);
    
    if (success) {
      // Simule la réponse du système d'irrigation
      setTimeout(() => {
        this.notifyMessageSubscribers({
          topic: 'pulsar/irrigation/status',
          payload: JSON.stringify({
            irrigation: deviceState === 1,
            device: deviceState,
            status: deviceState ? 'RUNNING' : 'STOPPED',
            timestamp: new Date().toISOString()
          }),
          timestamp: new Date(),
          qos: 0
        });
      }, 500);
    }
    
    return success;
  }

  forceReconnect() {
    console.log('🟢 [DEMO] Reconnexion MQTT simulée...');
    this.state = {
      ...this.state,
      isConnected: false,
      connectionHealth: 'disconnected',
      reconnectAttempts: this.state.reconnectAttempts + 1
    };
    this.notifySubscribers();
    
    // Reconnexion après 1 seconde
    setTimeout(() => {
      this.state = {
        ...this.state,
        isConnected: true,
        connectionHealth: 'excellent',
        lastError: null
      };
      this.notifySubscribers();
    }, 1000);
  }

  getBrokerInfo() {
    return {
      brokerUrl: 'demo-broker.pulsar.local:1883',
      clientId: `demo_client_${Date.now()}`,
      protocol: 'MQTT 3.1.1',
      keepAlive: 60,
      topics: [
        'pulsar/sensors/+',
        'pulsar/irrigation/+',
        'pulsar/system/+'
      ]
    };
  }

  async testConnection() {
    console.log('🟢 [DEMO] Test connexion MQTT...');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      latency: Math.round(50 + Math.random() * 100),
      broker: this.state.currentBroker,
      timestamp: new Date().toISOString()
    };
  }

  private notifySubscribers() {
    this.subscribers.forEach(callback => {
      try {
        callback(this.state);
      } catch (error) {
        console.error('Erreur notification subscriber MQTT:', error);
      }
    });
  }

  private notifyMessageSubscribers(message: MockMQTTMessage) {
    this.messageSubscribers.forEach(callback => {
      try {
        callback(message);
      } catch (error) {
        console.error('Erreur notification message subscriber MQTT:', error);
      }
    });
  }

  disconnect() {
    console.log('🟢 [DEMO] Déconnexion MQTT simulée');
    if (this.connectionTimer) {
      clearTimeout(this.connectionTimer);
    }
    if (this.messageTimer) {
      clearTimeout(this.messageTimer);
    }
    
    this.state = {
      ...this.state,
      isConnected: false,
      connectionHealth: 'disconnected'
    };
    this.notifySubscribers();
  }
}

export const mockMqttService = new MockMQTTService();