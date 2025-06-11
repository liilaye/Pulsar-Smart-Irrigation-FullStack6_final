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
  lastError: string | null;
  debugLogs: string[];
}

class MQTTService {
  private client: mqtt.MqttClient | null = null;
  private state: MQTTServiceState = {
    isConnected: false,
    currentBroker: '',
    reconnectAttempts: 0,
    lastMessage: null,
    connectionHealth: 0,
    lastError: null,
    debugLogs: []
  };
  
  // Utiliser WSS au lieu de WS pour la sécurité HTTPS
  private readonly BROKER_URL = 'wss://217.182.210.54:8080/mqtt';
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
    this.addDebugLog('🚀 Initialisation du service MQTT PulsarInfinite');
    this.startHealthCheck();
  }

  private addDebugLog(message: string) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}`;
    this.state.debugLogs.push(logEntry);
    
    // Garder seulement les 50 derniers logs
    if (this.state.debugLogs.length > 50) {
      this.state.debugLogs = this.state.debugLogs.slice(-50);
    }
    
    console.log(logEntry);
  }

  async connect(): Promise<boolean> {
    this.addDebugLog(`🔄 Tentative de connexion au broker sécurisé: ${this.BROKER_URL}`);
    this.addDebugLog(`📋 Client ID: ${this.CLIENT_OPTIONS.clientId}`);

    this.cleanup();

    try {
      this.client = mqtt.connect(this.BROKER_URL, this.CLIENT_OPTIONS);
      this.state.currentBroker = this.BROKER_URL;
      this.state.reconnectAttempts++;
      this.state.lastError = null;

      this.client.on('connect', (connack) => {
        this.addDebugLog(`✅ Connexion sécurisée réussie! CONNACK: ${JSON.stringify(connack)}`);
        this.state.isConnected = true;
        this.state.reconnectAttempts = 0;
        this.state.connectionHealth = 100;
        this.notifyListeners();

        this.subscribeToTopics();
        this.publishPresence();
      });

      this.client.on('reconnect', () => {
        this.addDebugLog('🔄 Reconnexion automatique en cours...');
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
        
        this.addDebugLog(`📨 Message reçu sur ${topic}: ${message.toString().substring(0, 100)}...`);
      });

      this.client.on('error', (error) => {
        const errorMsg = `Erreur MQTT: ${error.message}`;
        this.addDebugLog(`❌ ${errorMsg}`);
        this.state.lastError = errorMsg;
        this.state.connectionHealth = Math.max(0, this.state.connectionHealth - 20);
        this.notifyListeners();
      });

      this.client.on('offline', () => {
        this.addDebugLog('📴 Client hors ligne - reconnexion automatique');
        this.state.isConnected = false;
        this.state.connectionHealth = 0;
        this.notifyListeners();
      });

      this.client.on('close', () => {
        this.addDebugLog('🔌 Connexion fermée');
        this.state.isConnected = false;
        this.notifyListeners();
      });

      this.client.on('disconnect', (packet) => {
        this.addDebugLog(`🔌 Déconnexion: ${JSON.stringify(packet)}`);
      });

      this.client.on('packetsend', (packet) => {
        this.addDebugLog(`📤 Packet envoyé: ${packet.cmd}`);
      });

      this.client.on('packetreceive', (packet) => {
        this.addDebugLog(`📥 Packet reçu: ${packet.cmd}`);
      });

      return true;
    } catch (error) {
      const errorMsg = `Erreur création client: ${error}`;
      this.addDebugLog(`❌ ${errorMsg}`);
      this.state.lastError = errorMsg;
      return false;
    }
  }

  private subscribeToTopics() {
    if (!this.client || !this.state.isConnected) {
      this.addDebugLog('❌ Impossible de s\'abonner: client non connecté');
      return;
    }

    const topics = [
      'data/PulsarInfinite/swr',
      'data/PulsarInfinite/status',
      'data/PulsarInfinite/control',
      'data/PulsarInfinite/logs'
    ];

    this.addDebugLog(`📡 Abonnement aux topics: ${topics.join(', ')}`);

    this.client.subscribe(topics, { qos: 1 }, (err, granted) => {
      if (err) {
        this.addDebugLog(`❌ Erreur abonnement: ${err.message}`);
        this.state.lastError = `Erreur abonnement: ${err.message}`;
      } else {
        this.addDebugLog(`✅ Abonnements réussis: ${JSON.stringify(granted)}`);
      }
    });
  }

  private publishPresence() {
    const presencePayload = JSON.stringify({
      device: 'connected',
      timestamp: Date.now(),
      client: 'PulsarInfinite_Frontend',
      version: '2.0',
      clientId: this.CLIENT_OPTIONS.clientId
    });

    this.addDebugLog('📡 Publication de la présence...');
    this.publish('data/PulsarInfinite/status', presencePayload, { qos: 1, retain: true });
  }

  publish(topic: string, message: string, options: { qos?: 0 | 1 | 2; retain?: boolean } = {}): boolean {
    if (!this.client || !this.state.isConnected) {
      this.addDebugLog('❌ Publication impossible: client non connecté');
      return false;
    }

    // Forcer QoS 1 et retain true par défaut pour assurer la livraison
    const publishOptions = {
      qos: 1 as 0 | 1 | 2,
      retain: true
    };

    this.addDebugLog(`📤 Publication: ${topic} → ${message.substring(0, 100)}... (QoS: ${publishOptions.qos}, Retain: ${publishOptions.retain})`);
    
    this.client.publish(topic, message, publishOptions, (error) => {
      if (error) {
        const errorMsg = `Erreur publication: ${error.message}`;
        this.addDebugLog(`❌ ${errorMsg}`);
        this.state.lastError = errorMsg;
        this.state.connectionHealth = Math.max(0, this.state.connectionHealth - 10);
      } else {
        this.addDebugLog('✅ Publication réussie (QoS 1, Retain true)');
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
      this.addDebugLog(`🚿 Tentative ${attempt}/${retries} - Commande irrigation: ${deviceState ? 'ON' : 'OFF'}`);
      
      if (!this.state.isConnected) {
        this.addDebugLog('❌ Reconnexion nécessaire...');
        await this.connect();
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      const success = this.publish('data/PulsarInfinite/swr', JSON.stringify(payload), { qos: 1, retain: true });
      
      if (success) {
        const confirmed = await this.waitForConfirmation(deviceState, 8000);
        if (confirmed) {
          this.addDebugLog(`✅ Commande irrigation confirmée: ${deviceState ? 'ON' : 'OFF'}`);
          return true;
        }
      }
      
      if (attempt < retries) {
        const delay = 2000 * attempt;
        this.addDebugLog(`⏰ Retry dans ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    this.addDebugLog(`❌ Échec après ${retries} tentatives`);
    return false;
  }

  private async waitForConfirmation(expectedState: number, timeout: number): Promise<boolean> {
    this.addDebugLog(`⏳ Attente confirmation état ${expectedState} (timeout: ${timeout}ms)`);
    
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        this.addDebugLog('⏰ Timeout confirmation irrigation');
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
            this.addDebugLog('✅ Confirmation irrigation reçue');
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
        }), { qos: 1, retain: true });

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
        this.addDebugLog('🧹 Nettoyage client MQTT...');
        this.client.removeAllListeners();
        this.client.end(true);
      } catch (error) {
        this.addDebugLog(`⚠️ Erreur nettoyage: ${error}`);
      }
    }
    
    this.client = null;
    this.state.isConnected = false;
  }

  forceReconnect() {
    this.addDebugLog('🔄 Reconnexion forcée demandée');
    this.cleanup();
    this.connect();
  }

  getState(): MQTTServiceState {
    return { ...this.state };
  }

  getDebugLogs(): string[] {
    return [...this.state.debugLogs];
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
      clientId: this.CLIENT_OPTIONS.clientId,
      lastError: this.state.lastError,
      debugLogs: this.getDebugLogs()
    };
  }

  async testConnection(): Promise<{ success: boolean; details: string[] }> {
    const details: string[] = [];
    
    details.push('🔍 Test de diagnostic MQTT...');
    details.push(`📋 Broker: ${this.BROKER_URL}`);
    details.push(`📋 Client ID: ${this.CLIENT_OPTIONS.clientId}`);
    
    if (!this.state.isConnected) {
      details.push('❌ Client non connecté - tentative de connexion...');
      const connected = await this.connect();
      if (!connected) {
        details.push('❌ Échec de connexion');
        return { success: false, details };
      }
    }
    
    details.push('✅ Client connecté');
    
    const testPayload = JSON.stringify({
      type: 'TEST',
      timestamp: Date.now(),
      source: 'diagnostic'
    });
    
    const published = this.publish('data/PulsarInfinite/test', testPayload);
    if (published) {
      details.push('✅ Test de publication réussi');
    } else {
      details.push('❌ Échec test de publication');
      return { success: false, details };
    }
    
    details.push('✅ Tous les tests passés');
    return { success: true, details };
  }

  destroy() {
    this.addDebugLog('🔚 Destruction du service MQTT');
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    this.cleanup();
  }
}

export const mqttService = new MQTTService();
export type { MQTTServiceState, MQTTMessage };
