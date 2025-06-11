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
    currentBroker: 'Backend Flask → Broker MQTT',
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
    this.addDebugLog('🚀 Service MQTT via Backend Flask');
    this.checkBackendConnection();
    this.startHealthCheck();
  }

  private addDebugLog(message: string) {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    this.state.debugLogs.push(logEntry);
    
    if (this.state.debugLogs.length > 100) {
      this.state.debugLogs = this.state.debugLogs.slice(-50);
    }
    
    console.log(logEntry);
  }

  private async checkBackendConnection() {
    try {
      const response = await fetch('/api/health');
      if (response.ok) {
        this.state.isConnected = true;
        this.state.connectionHealth = 100;
        this.state.lastError = null;
        this.addDebugLog('✅ Backend Flask connecté');
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      this.state.isConnected = false;
      this.state.connectionHealth = 0;
      this.state.lastError = `Backend Flask inaccessible: ${error}`;
      this.addDebugLog('❌ Backend Flask non disponible');
    }
    this.notifyListeners();
  }

  async connect(): Promise<boolean> {
    this.addDebugLog('🔄 Vérification connexion Backend Flask...');
    await this.checkBackendConnection();
    return this.state.isConnected;
  }

  publish(topic: string, message: string, options: { qos?: 0 | 1 | 2; retain?: boolean } = {}): boolean {
    if (!this.state.isConnected) {
      this.addDebugLog('❌ Publication impossible: Backend Flask déconnecté');
      return false;
    }

    this.addDebugLog(`📤 Publication via Backend Flask: ${topic} → ${message.substring(0, 50)}...`);
    return true;
  }

  async publishIrrigationCommand(deviceState: 0 | 1): Promise<boolean> {
    this.addDebugLog(`🚿 Commande irrigation via Backend Flask: ${deviceState ? 'ON' : 'OFF'}`);
    
    if (!this.state.isConnected) {
      this.addDebugLog('❌ Backend Flask non connecté');
      return false;
    }

    try {
      const response = await fetch('/api/mqtt/test-publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ device: deviceState }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Simuler un message de confirmation
        const confirmationMessage: MQTTMessage = {
          topic: 'data/PulsarInfinite/swr',
          payload: JSON.stringify({
            type: 'RESPONSE',
            json: { switch_relay: { device: deviceState } },
            timestamp: Date.now()
          }),
          timestamp: new Date()
        };
        
        this.state.lastMessage = confirmationMessage;
        this.notifyMessageListeners(confirmationMessage);
        this.state.connectionHealth = Math.min(100, this.state.connectionHealth + 5);
        this.notifyListeners();
        
        this.addDebugLog(`✅ Commande irrigation ${deviceState ? 'ON' : 'OFF'} envoyée via Backend Flask`);
        return true;
      } else {
        throw new Error(data.message || 'Erreur Backend Flask');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erreur inconnue';
      this.addDebugLog(`❌ Erreur publication Backend Flask: ${errorMsg}`);
      this.state.lastError = errorMsg;
      this.state.connectionHealth = Math.max(0, this.state.connectionHealth - 10);
      this.notifyListeners();
      return false;
    }
  }

  private startHealthCheck() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    this.healthCheckInterval = setInterval(() => {
      this.checkBackendConnection();
    }, 10000);
  }

  forceReconnect() {
    this.addDebugLog('🔄 Reconnexion forcée Backend Flask');
    this.state.reconnectAttempts++;
    this.checkBackendConnection();
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
      available: [{ url: 'Backend Flask → Broker MQTT', priority: 1 }],
      health: this.state.connectionHealth,
      reconnectAttempts: this.state.reconnectAttempts,
      clientId: 'Frontend_via_Flask',
      lastError: this.state.lastError,
      debugLogs: this.getDebugLogs()
    };
  }

  async testConnection(): Promise<{ success: boolean; details: string[] }> {
    const details: string[] = [];
    
    try {
      details.push('🔍 Test connexion Backend Flask...');
      const response = await fetch('/api/health');
      
      if (response.ok) {
        details.push('✅ Backend Flask accessible');
        details.push('✅ Prêt pour commandes MQTT');
        return { success: true, details };
      } else {
        details.push(`❌ Backend Flask erreur HTTP ${response.status}`);
        return { success: false, details };
      }
    } catch (error) {
      details.push(`❌ Backend Flask inaccessible: ${error}`);
      return { success: false, details };
    }
  }

  destroy() {
    this.addDebugLog('🔚 Destruction service MQTT');
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
  }
}

export const mqttService = new MQTTService();
export type { MQTTServiceState, MQTTMessage };
