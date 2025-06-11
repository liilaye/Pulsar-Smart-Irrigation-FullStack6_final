
import mqtt from 'mqtt';

interface MQTTConfig {
  url: string;
  options: mqtt.IClientOptions;
  priority: number;
}

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
  connectionHealth: number; // 0-100%
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
  
  private brokers: MQTTConfig[] = [
    // Broker principal PulsarInfinite
    {
      url: 'ws://217.182.210.54:8080/mqtt',
      options: {
        clientId: `PulsarInfinite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        connectTimeout: 10000,
        keepalive: 30,
        clean: true,
        reconnectPeriod: 0, // Géré manuellement
        will: {
          topic: 'data/PulsarInfinite/status',
          payload: JSON.stringify({ device: 'disconnected', timestamp: Date.now() }),
          qos: 1,
          retain: true
        }
      },
      priority: 1
    },
    // Broker de fallback 1
    {
      url: 'wss://broker.emqx.io:8084/mqtt',
      options: {
        clientId: `PulsarInfinite_Fallback1_${Date.now()}`,
        connectTimeout: 8000,
        keepalive: 60,
        clean: true,
        reconnectPeriod: 0
      },
      priority: 2
    },
    // Broker de fallback 2
    {
      url: 'wss://mqtt.eclipseprojects.io:443/mqtt',
      options: {
        clientId: `PulsarInfinite_Fallback2_${Date.now()}`,
        connectTimeout: 8000,
        keepalive: 60,
        clean: true,
        reconnectPeriod: 0
      },
      priority: 3
    }
  ];
  
  private listeners: ((state: MQTTServiceState) => void)[] = [];
  private messageListeners: ((message: MQTTMessage) => void)[] = [];
  private connectionTimeout: NodeJS.Timeout | null = null;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000;

  constructor() {
    this.startHealthCheck();
  }

  async connect(brokerIndex = 0): Promise<boolean> {
    if (brokerIndex >= this.brokers.length) {
      console.error('❌ Tous les brokers MQTT ont échoué');
      return false;
    }

    const config = this.brokers[brokerIndex];
    console.log(`🔄 Connexion au broker MQTT ${config.url} (priorité ${config.priority})`);

    // Nettoyer la connexion précédente
    this.cleanup();

    try {
      this.client = mqtt.connect(config.url, config.options);
      this.state.currentBroker = config.url;
      this.state.reconnectAttempts++;

      // Timeout de connexion
      this.connectionTimeout = setTimeout(() => {
        console.log(`⏰ Timeout connexion ${config.url}`);
        this.connect(brokerIndex + 1);
      }, config.options.connectTimeout || 10000);

      this.client.on('connect', () => {
        if (this.connectionTimeout) {
          clearTimeout(this.connectionTimeout);
          this.connectionTimeout = null;
        }

        console.log(`✅ Connecté au broker MQTT: ${config.url}`);
        this.state.isConnected = true;
        this.state.reconnectAttempts = 0;
        this.state.connectionHealth = 100;
        this.notifyListeners();

        // S'abonner aux topics essentiels
        this.subscribeToTopics();
        
        // Publier un message de présence
        this.publishPresence();
      });

      this.client.on('message', (topic, message) => {
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
        console.error(`❌ Erreur MQTT ${config.url}:`, error);
        this.state.connectionHealth = Math.max(0, this.state.connectionHealth - 20);
        
        if (this.connectionTimeout) {
          clearTimeout(this.connectionTimeout);
        }
        
        // Tentative avec le broker suivant
        setTimeout(() => this.connect(brokerIndex + 1), this.reconnectDelay);
      });

      this.client.on('offline', () => {
        console.log('📴 Client MQTT hors ligne');
        this.state.isConnected = false;
        this.state.connectionHealth = 0;
        this.notifyListeners();
        this.attemptReconnection();
      });

      this.client.on('close', () => {
        console.log('🔌 Connexion MQTT fermée');
        this.state.isConnected = false;
        this.notifyListeners();
      });

      return true;
    } catch (error) {
      console.error(`❌ Erreur création client MQTT ${config.url}:`, error);
      return this.connect(brokerIndex + 1);
    }
  }

  private async attemptReconnection() {
    if (this.state.reconnectAttempts < this.maxReconnectAttempts) {
      console.log(`🔄 Tentative de reconnexion ${this.state.reconnectAttempts + 1}/${this.maxReconnectAttempts}`);
      setTimeout(() => this.connect(0), this.reconnectDelay * this.state.reconnectAttempts);
    } else {
      console.error('❌ Nombre maximum de tentatives de reconnexion atteint');
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

    topics.forEach(topic => {
      this.client!.subscribe(topic, { qos: 1 }, (err) => {
        if (err) {
          console.error(`❌ Erreur abonnement ${topic}:`, err);
        } else {
          console.log(`📡 Abonné au topic: ${topic}`);
        }
      });
    });
  }

  private publishPresence() {
    this.publish('data/PulsarInfinite/status', JSON.stringify({
      device: 'connected',
      timestamp: Date.now(),
      client: 'PulsarInfinite_Frontend'
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

  // Commande d'irrigation avec retry automatique
  async publishIrrigationCommand(deviceState: 0 | 1, retries = 3): Promise<boolean> {
    const payload = {
      type: "IRRIGATION_COMMAND",
      timestamp: Date.now(),
      json: {
        switch_relay: {
          device: deviceState
        }
      },
      source: "manual_direct"
    };

    for (let attempt = 1; attempt <= retries; attempt++) {
      console.log(`🚿 Tentative ${attempt}/${retries} - Commande irrigation: ${deviceState ? 'ON' : 'OFF'}`);
      
      const success = this.publish('data/PulsarInfinite/swr', JSON.stringify(payload), { qos: 1, retain: true });
      
      if (success) {
        // Attendre une confirmation ou un timeout
        return await this.waitForConfirmation(deviceState, 5000);
      }
      
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
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
          if (message.topic.includes('status') && data.irrigation === (expectedState === 1)) {
            clearTimeout(timer);
            console.log('✅ Confirmation irrigation reçue');
            resolve(true);
          }
        } catch (error) {
          // Ignorer les messages non-JSON
        }
      };

      this.messageListeners.push(messageListener);
      
      // Nettoyer le listener après le timeout
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
      if (this.state.isConnected) {
        // Diminuer légèrement la santé si pas de messages récents
        if (this.state.lastMessage && 
            Date.now() - this.state.lastMessage.timestamp.getTime() > 30000) {
          this.state.connectionHealth = Math.max(0, this.state.connectionHealth - 5);
        }
        
        // Ping test
        this.publish('data/PulsarInfinite/ping', JSON.stringify({
          timestamp: Date.now(),
          type: 'healthcheck'
        }), { qos: 0 });
      } else {
        this.state.connectionHealth = 0;
      }
      
      this.notifyListeners();
    }, 10000); // Toutes les 10 secondes
  }

  private cleanup() {
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }

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

  // Méthodes de debugging
  getBrokerInfo() {
    return {
      current: this.state.currentBroker,
      available: this.brokers.map(b => ({ url: b.url, priority: b.priority })),
      health: this.state.connectionHealth,
      reconnectAttempts: this.state.reconnectAttempts
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
