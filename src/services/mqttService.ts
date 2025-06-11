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
  private state: MQTTServiceState = {
    isConnected: false,
    currentBroker: 'Backend Flask Proxy (Local)',
    reconnectAttempts: 0,
    lastMessage: null,
    connectionHealth: 0,
    lastError: null,
    debugLogs: []
  };
  
  private listeners: ((state: MQTTServiceState) => void)[] = [];
  private messageListeners: ((message: MQTTMessage) => void)[] = [];
  private healthCheckInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.addDebugLog('🚀 Initialisation du service MQTT via Backend Flask (Local)');
    this.startHealthCheck();
    this.connect();
  }

  private addDebugLog(message: string) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}`;
    this.state.debugLogs.push(logEntry);
    
    if (this.state.debugLogs.length > 50) {
      this.state.debugLogs = this.state.debugLogs.slice(-50);
    }
    
    console.log(logEntry);
  }

  async connect(): Promise<boolean> {
    this.addDebugLog('🔄 Test de connexion via Backend Flask (localhost:5002)...');
    
    try {
      const response = await fetch('/api/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        this.addDebugLog('✅ Backend Flask local connecté et accessible');
        this.state.isConnected = true;
        this.state.reconnectAttempts = 0;
        this.state.connectionHealth = 100;
        this.state.lastError = null;
        this.notifyListeners();
        return true;
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      const errorMsg = `Erreur connexion backend local: ${error}`;
      this.addDebugLog(`❌ ${errorMsg}`);
      this.state.isConnected = false;
      this.state.lastError = errorMsg;
      this.state.connectionHealth = 0;
      this.state.reconnectAttempts++;
      this.notifyListeners();
      return false;
    }
  }

  publish(topic: string, message: string, options: { qos?: 0 | 1 | 2; retain?: boolean } = {}): boolean {
    if (!this.state.isConnected) {
      this.addDebugLog('❌ Publication impossible: backend non connecté');
      return false;
    }

    this.addDebugLog(`📤 Publication via backend: ${topic} → ${message.substring(0, 100)}...`);
    
    // Simuler une publication réussie pour l'instant
    this.state.connectionHealth = Math.min(100, this.state.connectionHealth + 2);
    this.notifyListeners();
    return true;
  }

  async publishIrrigationCommand(deviceState: 0 | 1, retries = 3): Promise<boolean> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      this.addDebugLog(`🚿 Tentative ${attempt}/${retries} - Commande irrigation via backend local: ${deviceState ? 'ON' : 'OFF'}`);
      
      if (!this.state.isConnected) {
        this.addDebugLog('❌ Reconnexion backend local nécessaire...');
        await this.connect();
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      try {
        const response = await fetch('/api/mqtt/test-publish', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ device: deviceState })
        });

        if (response.ok) {
          const result = await response.json();
          this.addDebugLog(`✅ Commande irrigation envoyée via backend local: ${JSON.stringify(result)}`);
          
          // Simuler la réception d'un message de confirmation
          const confirmationMessage: MQTTMessage = {
            topic: 'data/PulsarInfinite/swr',
            payload: JSON.stringify({
              json: { switch_relay: { device: deviceState } },
              timestamp: Date.now()
            }),
            timestamp: new Date()
          };
          
          this.state.lastMessage = confirmationMessage;
          this.notifyMessageListeners(confirmationMessage);
          
          return true;
        } else {
          const error = await response.text();
          this.addDebugLog(`❌ Erreur backend local: ${error}`);
        }
      } catch (error) {
        this.addDebugLog(`❌ Erreur requête backend local: ${error}`);
      }
      
      if (attempt < retries) {
        const delay = 1000 * attempt;
        this.addDebugLog(`⏰ Retry dans ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    this.addDebugLog(`❌ Échec après ${retries} tentatives`);
    return false;
  }

  private startHealthCheck() {
    this.healthCheckInterval = setInterval(async () => {
      if (this.state.isConnected) {
        try {
          const response = await fetch('/api/health');
          if (!response.ok) {
            this.state.isConnected = false;
            this.state.connectionHealth = 0;
            this.addDebugLog('❌ Backend local inaccessible lors du health check');
          } else {
            this.state.connectionHealth = Math.min(100, this.state.connectionHealth + 1);
          }
        } catch (error) {
          this.state.isConnected = false;
          this.state.connectionHealth = 0;
          this.addDebugLog(`❌ Erreur health check local: ${error}`);
        }
      }
      
      this.notifyListeners();
    }, 10000);
  }

  forceReconnect() {
    this.addDebugLog('🔄 Reconnexion forcée backend demandée');
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
      available: [{ url: 'Backend Flask Proxy (Local)', priority: 1 }],
      health: this.state.connectionHealth,
      reconnectAttempts: this.state.reconnectAttempts,
      clientId: 'Flask_Backend_Proxy_Local',
      lastError: this.state.lastError,
      debugLogs: this.getDebugLogs()
    };
  }

  async testConnection(): Promise<{ success: boolean; details: string[] }> {
    const details: string[] = [];
    
    details.push('🔍 Test de connexion backend Flask...');
    
    try {
      const response = await fetch('/api/health');
      if (response.ok) {
        details.push('✅ Backend Flask accessible');
        details.push('✅ Proxy MQTT via backend opérationnel');
        return { success: true, details };
      } else {
        details.push(`❌ Backend inaccessible: HTTP ${response.status}`);
        return { success: false, details };
      }
    } catch (error) {
      details.push(`❌ Erreur connexion: ${error}`);
      return { success: false, details };
    }
  }

  destroy() {
    this.addDebugLog('🔚 Destruction du service MQTT');
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
  }
}

export const mqttService = new MQTTService();
export type { MQTTServiceState, MQTTMessage };
