
import mqtt from 'mqtt';

interface MQTTMessage {
  topic: string;
  payload: string;
  timestamp: Date;
}

interface MQTTServiceState {
  isConnected: boolean;
  currentBroker: string;
  reconnectAttempts: number;
  lastMessage: MQTTMessage | null;
  connectionHealth: number;
}

class MQTTService {
  private client: mqtt.MqttClient | null = null;
  private state: MQTTServiceState = {
    isConnected: false,
    currentBroker: '',
    reconnectAttempts: 0,
    lastMessage: null,
    connectionHealth: 0
  };
  
  private readonly BROKER_URL = 'ws://217.182.210.54:8080/mqtt';
  private readonly CLIENT_OPTIONS: mqtt.IClientOptions = {
    clientId: `PulsarInfinite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    connectTimeout: 15000,
    keepalive: 60,
    clean: true,
    reconnectPeriod: 5000,
    will: {
      topic: 'data/PulsarInfinite/status',
      payload: JSON.stringify({ device: 'disconnected', timestamp: Date.now() }),
      qos: 1,
      retain: true
    },
    resubscribe: true,
    queueQoSZero: false,
    properties: {
      sessionExpiryInterval: 300,
      receiveMaximum: 100,
      maximumPacketSize: 65535
    }
  };
  
  private listeners: ((state: MQTTServiceState) => void)[] = [];
  private messageListeners: ((message: MQTTMessage) => void)[] = [];
  private healthCheckInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startHealthCheck();
  }

  async connect(): Promise<boolean> {
    console.log(`🔄 Connexion au broker PulsarInfinite: ${this.BROKER_URL}`);

    this.cleanup();

    try {
      this.client = mqtt.connect(this.BROKER_URL, this.CLIENT_OPTIONS);
      this.state.currentBroker = this.BROKER_URL;
      this.state.reconnectAttempts++;

      this.client.on('connect', (connack) => {
        console.log(`✅ Connecté au broker PulsarInfinite:`, connack);
        this.state.isConnected = true;
        this.state.reconnectAttempts = 0;
        this.state.connectionHealth = 100;
        this.notifyListeners();

        this.subscribeToTopics();
        this.publishPresence();
      });

      this.client.on('reconnect', () => {
        console.log('🔄 Reconnexion au broker PulsarInfinite...');
        this.state.reconnectAttempts++;
        this.notifyListeners();
      });

      this.client.on('message', (topic, message, packet) => {
        const mqttMessage: MQTTMessage = {
          topic,
          payload: message.toString(),
          timestamp: new Date()
        };
        
        this.state.lastMessage = mqttMessage;
        this.state.connectionHealth = Math.min(100, this.state.connectionHealth + 5);
        this.notifyMessageListeners(mqttMessage);
        
        console.log(`📨 Message MQTT reçu sur ${topic}:`, message.toString());
      });

      this.client.on('error', (error) => {
        console.error(`❌ Erreur MQTT PulsarInfinite:`, error);
        this.state.connectionHealth = Math.max(0, this.state.connectionHealth - 20);
        this.notifyListeners();
      });

      this.client.on('offline', () => {
        console.log('📴 Client MQTT hors ligne - reconnexion automatique activée');
        this.state.isConnected = false;
        this.state.connectionHealth = 0;
        this.notifyListeners();
      });

      this.client.on('close', () => {
        console.log('🔌 Connexion MQTT fermée');
        this.state.isConnected = false;
        this.notifyListeners();
      });

      this.client.on('disconnect', (packet) => {
        console.log('🔌 Déconnexion MQTT:', packet);
      });

      this.client.on('packetsend', (packet) => {
        console.log('📤 Packet envoyé:', packet.cmd);
      });

      this.client.on('packetreceive', (packet) => {
        console.log('📥 Packet reçu:', packet.cmd);
      });

      return true;
    } catch (error) {
      console.error(`❌ Erreur création client MQTT:`, error);
      return false;
    }
  }

  private subscribeToTopics() {
    if (!this.client || !this.state.isConnected) return;

    const topics = [
      'data/PulsarInfinite/swr',
      'data/PulsarInfinite/status',
      'data/PulsarInfinite/control',
      'data/PulsarInfinite/logs'
    ];

    // Utiliser le format correct selon la documentation MQTT.js
    this.client.subscribe(topics, { qos: 1 }, (err, granted) => {
      if (err) {
        console.error(`❌ Erreur abonnement topics:`, err);
      } else {
        console.log(`📡 Abonné aux topics:`, granted);
      }
    });
  }

  private publishPresence() {
    this.publish('data/PulsarInfinite/status', JSON.stringify({
      device: 'connected',
      timestamp: Date.now(),
      client: 'PulsarInfinite_Frontend',
      version: '2.0'
    }), { qos: 1, retain: true });
  }

  publish(topic: string, message: string, options: { qos?: 0 | 1 | 2; retain?: boolean } = {}): boolean {
    if (!this.client || !this.state.isConnected) {
      console.error('❌ Client MQTT non connecté pour publication');
      return false;
    }

    const publishOptions = {
      qos: (options.qos || 1) as 0 | 1 | 2,
      retain: options.retain || false
    };

    console.log(`📤 Publication MQTT: ${topic} → ${message}`);
    
    this.client.publish(topic, message, publishOptions, (error) => {
      if (error) {
        console.error('❌ Erreur publication MQTT:', error);
        this.state.connectionHealth = Math.max(0, this.state.connectionHealth - 10);
      } else {
        console.log('✅ Message publié avec succès!');
        this.state.connectionHealth = Math.min(100, this.state.connectionHealth + 2);
      }
      this.notifyListeners();
    });

    return true;
  }

  async publishIrrigationCommand(deviceState: 0 | 1, retries = 3): Promise<boolean> {
    const payload = {
      type: "JOIN",
      fcnt: 0,
      timestamp: Date.now(),
      json: {
        switch_relay: {
          device: deviceState
        }
      },
      mqttHeaders: {
        mqtt_receivedRetained: "false",
        mqtt_id: "0",
        mqtt_duplicate: "false",
        id: `frontend-${Date.now()}`,
        mqtt_receivedTopic: "data/PulsarInfinite/swr",
        mqtt_receivedQos: "1",
        timestamp: Date.now().toString()
      }
    };

    for (let attempt = 1; attempt <= retries; attempt++) {
      console.log(`🚿 Tentative ${attempt}/${retries} - Commande irrigation: ${deviceState ? 'ON' : 'OFF'}`);
      
      if (!this.state.isConnected) {
        console.log('❌ Pas de connexion MQTT, tentative de reconnexion...');
        await this.connect();
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      const success = this.publish('data/PulsarInfinite/swr', JSON.stringify(payload), { qos: 1, retain: true });
      
      if (success) {
        const confirmed = await this.waitForConfirmation(deviceState, 8000);
        if (confirmed) {
          return true;
        }
      }
      
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
      }
    }
    
    return false;
  }

  private async waitForConfirmation(expectedState: number, timeout: number): Promise<boolean> {
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        console.log('⏰ Timeout confirmation irrigation');
        resolve(false);
      }, timeout);

      const messageListener = (message: MQTTMessage) => {
        try {
          const data = JSON.parse(message.payload);
          
          const irrigationActive = 
            data.irrigation === (expectedState === 1) ||
            data.json?.switch_relay?.device === expectedState ||
            data.status === (expectedState ? 'ON' : 'OFF');
            
          if (irrigationActive) {
            clearTimeout(timer);
            console.log('✅ Confirmation irrigation reçue');
            resolve(true);
          }
        } catch (error) {
          // Ignorer les messages non-JSON
        }
      };

      this.messageListeners.push(messageListener);
      
      setTimeout(() => {
        const index = this.messageListeners.indexOf(messageListener);
        if (index > -1) {
          this.messageListeners.splice(index, 1);
        }
      }, timeout + 1000);
    });
  }

  private startHealthCheck() {
    this.healthCheckInterval = setInterval(() => {
      if (this.state.isConnected && this.client) {
        this.publish('data/PulsarInfinite/ping', JSON.stringify({
          timestamp: Date.now(),
          type: 'healthcheck',
          client_id: this.CLIENT_OPTIONS.clientId
        }), { qos: 0 });

        if (this.state.lastMessage && 
            Date.now() - this.state.lastMessage.timestamp.getTime() > 30000) {
          this.state.connectionHealth = Math.max(0, this.state.connectionHealth - 3);
        }
      } else {
        this.state.connectionHealth = 0;
      }
      
      this.notifyListeners();
    }, 15000);
  }

  private cleanup() {
    if (this.client) {
      try {
        this.client.removeAllListeners();
        this.client.end(true);
      } catch (error) {
        console.error('Erreur fermeture client MQTT:', error);
      }
    }
    
    this.client = null;
    this.state.isConnected = false;
  }

  forceReconnect() {
    console.log('🔄 Reconnexion forcée demandée');
    this.cleanup();
    this.connect();
  }

  getState(): MQTTServiceState {
    return { ...this.state };
  }

  subscribe(callback: (state: MQTTServiceState) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  subscribeToMessages(callback: (message: MQTTMessage) => void) {
    this.messageListeners.push(callback);
    return () => {
      this.messageListeners = this.messageListeners.filter(listener => listener !== callback);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.getState()));
  }

  private notifyMessageListeners(message: MQTTMessage) {
    this.messageListeners.forEach(listener => listener(message));
  }

  getBrokerInfo() {
    return {
      current: this.state.currentBroker,
      available: [{ url: this.BROKER_URL, priority: 1 }],
      health: this.state.connectionHealth,
      reconnectAttempts: this.state.reconnectAttempts,
      clientId: this.CLIENT_OPTIONS.clientId
    };
  }

  destroy() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    this.cleanup();
  }
}

export const mqttService = new MQTTService();
export type { MQTTServiceState, MQTTMessage };
