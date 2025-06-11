
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
    isConnected: true, // Simulation locale pour l'instant
    currentBroker: 'Simulation Locale',
    reconnectAttempts: 0,
    lastMessage: null,
    connectionHealth: 100,
    lastError: null,
    debugLogs: []
  };
  
  private listeners: ((state: MQTTServiceState) => void)[] = [];
  private messageListeners: ((message: MQTTMessage) => void)[] = [];
  private healthCheckInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.addDebugLog('🚀 Service MQTT en mode simulation locale');
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

  async connect(): Promise<boolean> {
    this.addDebugLog('🔄 Connexion simulée au broker MQTT...');
    
    // Simulation d'une connexion réussie
    await new Promise(resolve => setTimeout(resolve, 500));
    
    this.state.isConnected = true;
    this.state.reconnectAttempts = 0;
    this.state.connectionHealth = 100;
    this.state.lastError = null;
    this.addDebugLog('✅ Broker MQTT simulé connecté');
    this.notifyListeners();
    
    return true;
  }

  publish(topic: string, message: string, options: { qos?: 0 | 1 | 2; retain?: boolean } = {}): boolean {
    if (!this.state.isConnected) {
      this.addDebugLog('❌ Publication impossible: broker déconnecté');
      return false;
    }

    this.addDebugLog(`📤 Publication simulée: ${topic} → ${message.substring(0, 50)}...`);
    this.state.connectionHealth = Math.min(100, this.state.connectionHealth + 1);
    this.notifyListeners();
    return true;
  }

  async publishIrrigationCommand(deviceState: 0 | 1): Promise<boolean> {
    this.addDebugLog(`🚿 Commande irrigation: ${deviceState ? 'ON' : 'OFF'}`);
    
    if (!this.state.isConnected) {
      this.addDebugLog('❌ Broker non connecté');
      return false;
    }

    // Simulation d'un délai réseau
    await new Promise(resolve => setTimeout(resolve, 200));

    try {
      // Simulation de l'envoi MQTT
      const topic = 'cmd/PulsarInfinite/swr';
      const payload = JSON.stringify({
        cmd: 'switch_relay',
        device: deviceState
      });

      this.addDebugLog(`📡 Envoi MQTT simulé: ${topic} → ${payload}`);
      
      // Simulation d'un message de confirmation
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
      
      this.addDebugLog(`✅ Commande irrigation ${deviceState ? 'ON' : 'OFF'} envoyée avec succès`);
      return true;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erreur inconnue';
      this.addDebugLog(`❌ Erreur publication: ${errorMsg}`);
      return false;
    }
  }

  private startHealthCheck() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    this.healthCheckInterval = setInterval(() => {
      if (this.state.isConnected) {
        // Simulation du health check
        this.state.connectionHealth = Math.max(95, this.state.connectionHealth - 1);
      }
      this.notifyListeners();
    }, 10000);
  }

  forceReconnect() {
    this.addDebugLog('🔄 Reconnexion forcée demandée');
    this.state.reconnectAttempts = 0;
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
      available: [{ url: 'Simulation Locale', priority: 1 }],
      health: this.state.connectionHealth,
      reconnectAttempts: this.state.reconnectAttempts,
      clientId: 'Frontend_Simulator',
      lastError: this.state.lastError,
      debugLogs: this.getDebugLogs()
    };
  }

  async testConnection(): Promise<{ success: boolean; details: string[] }> {
    const details: string[] = [];
    
    details.push('🔍 Test connexion broker simulé...');
    details.push('✅ Broker simulé accessible');
    details.push('✅ Commandes MQTT simulées');
    details.push('✅ Mode développement actif');
    
    return { success: true, details };
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
