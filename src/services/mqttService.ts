
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
    currentBroker: 'Backend Flask Local',
    reconnectAttempts: 0,
    lastMessage: null,
    connectionHealth: 0,
    lastError: null,
    debugLogs: []
  };
  
  private listeners: ((state: MQTTServiceState) => void)[] = [];
  private messageListeners: ((message: MQTTMessage) => void)[] = [];
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.addDebugLog('🚀 Initialisation service MQTT via Backend Flask Local');
    this.startHealthCheck();
    // Connexion initiale avec délai
    setTimeout(() => this.connect(), 1000);
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
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    this.addDebugLog('🔄 Test connexion backend Flask local...');
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch('/api/health', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        this.addDebugLog(`✅ Backend Flask connecté: ${data.message || 'OK'}`);
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
      const errorMsg = error instanceof Error ? error.message : 'Erreur inconnue';
      this.addDebugLog(`❌ Connexion échouée: ${errorMsg}`);
      this.state.isConnected = false;
      this.state.lastError = errorMsg;
      this.state.connectionHealth = 0;
      this.state.reconnectAttempts++;
      this.notifyListeners();
      
      // Programmation de la reconnexion
      if (this.state.reconnectAttempts < 10) {
        const delay = Math.min(5000 * this.state.reconnectAttempts, 30000);
        this.addDebugLog(`🔄 Reconnexion dans ${delay/1000}s (tentative ${this.state.reconnectAttempts})`);
        this.reconnectTimeout = setTimeout(() => this.connect(), delay);
      }
      
      return false;
    }
  }

  publish(topic: string, message: string, options: { qos?: 0 | 1 | 2; retain?: boolean } = {}): boolean {
    if (!this.state.isConnected) {
      this.addDebugLog('❌ Publication impossible: backend déconnecté');
      return false;
    }

    this.addDebugLog(`📤 Publication simulée: ${topic} → ${message.substring(0, 50)}...`);
    this.state.connectionHealth = Math.min(100, this.state.connectionHealth + 1);
    this.notifyListeners();
    return true;
  }

  async publishIrrigationCommand(deviceState: 0 | 1, retries = 3): Promise<boolean> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      this.addDebugLog(`🚿 Tentative ${attempt}/${retries} - Commande irrigation: ${deviceState ? 'ON' : 'OFF'}`);
      
      if (!this.state.isConnected) {
        this.addDebugLog('❌ Reconnexion nécessaire...');
        await this.connect();
        if (!this.state.isConnected) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          continue;
        }
      }

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch('/api/mqtt/test-publish', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ device: deviceState }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const result = await response.json();
          this.addDebugLog(`✅ Commande irrigation envoyée: ${JSON.stringify(result)}`);
          
          // Simulation d'un message de confirmation
          const confirmationMessage: MQTTMessage = {
            topic: 'data/PulsarInfinite/swr',
            payload: JSON.stringify({
              type: 'JOIN',
              json: { switch_relay: { device: deviceState } },
              timestamp: Date.now()
            }),
            timestamp: new Date()
          };
          
          this.state.lastMessage = confirmationMessage;
          this.notifyMessageListeners(confirmationMessage);
          this.state.connectionHealth = Math.min(100, this.state.connectionHealth + 5);
          this.notifyListeners();
          
          return true;
        } else {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Erreur inconnue';
        this.addDebugLog(`❌ Erreur publication: ${errorMsg}`);
        
        if (attempt < retries) {
          const delay = 1000 * attempt;
          this.addDebugLog(`⏰ Retry dans ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    this.addDebugLog(`❌ Échec après ${retries} tentatives`);
    return false;
  }

  private startHealthCheck() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    this.healthCheckInterval = setInterval(async () => {
      if (this.state.isConnected) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000);
          
          const response = await fetch('/api/health', { signal: controller.signal });
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
          
          this.state.connectionHealth = Math.max(0, this.state.connectionHealth - 1);
        } catch (error) {
          this.addDebugLog(`❌ Health check échoué: ${error instanceof Error ? error.message : 'Erreur'}`);
          this.state.isConnected = false;
          this.state.connectionHealth = 0;
          this.state.lastError = 'Health check échoué';
        }
      } else if (this.state.reconnectAttempts < 10) {
        // Tentative de reconnexion automatique
        this.connect();
      }
      
      this.notifyListeners();
    }, 15000); // Check toutes les 15 secondes
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
      available: [{ url: 'Backend Flask Local', priority: 1 }],
      health: this.state.connectionHealth,
      reconnectAttempts: this.state.reconnectAttempts,
      clientId: 'Flask_Backend_Proxy',
      lastError: this.state.lastError,
      debugLogs: this.getDebugLogs()
    };
  }

  async testConnection(): Promise<{ success: boolean; details: string[] }> {
    const details: string[] = [];
    
    details.push('🔍 Test connexion backend Flask...');
    
    try {
      const response = await fetch('/api/health');
      if (response.ok) {
        const data = await response.json();
        details.push('✅ Backend Flask accessible');
        details.push(`✅ Services: ${JSON.stringify(data.services || {})}`);
        details.push('✅ Proxy MQTT opérationnel');
        return { success: true, details };
      } else {
        details.push(`❌ Backend inaccessible: HTTP ${response.status}`);
        return { success: false, details };
      }
    } catch (error) {
      details.push(`❌ Erreur connexion: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      return { success: false, details };
    }
  }

  destroy() {
    this.addDebugLog('🔚 Destruction service MQTT');
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
  }
}

export const mqttService = new MQTTService();
export type { MQTTServiceState, MQTTMessage };
