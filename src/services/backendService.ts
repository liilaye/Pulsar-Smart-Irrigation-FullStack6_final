// Types et interfaces
export interface IrrigationRequest {
  durationHours: number;
  durationMinutes: number;
  scheduledBy: 'ML' | 'MANUAL';
  timestamp: string;
}

export interface MLPrediction {
  duree_minutes: number;
  volume_eau_m3: number;
  matt: string;
  status: string;
}

export interface BackendResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface IrrigationSystem {
  type: string;
  name: string;
}

export interface TrendAnalysis {
  waterConsumption: number;
  soilMoisture: number;
  efficiency: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface MLPredictionAnalysis {
  nextIrrigationHours: number;
  recommendedDuration: number;
  soilCondition: string;
  weatherImpact: string;
}

import { irrigationDataService } from './irrigationDataService';

class BackendService {
  private getBaseUrl(): string {
  return '/api'; // Toujours utiliser le proxy Vite (dev ou prod)
  }
  // private getBaseUrl(): string {
  //   if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  //     return 'http://localhost:5002/api';
  //   }
  //   return '/api';
  // }

  private async makeRequest(url: string, options: RequestInit = {}): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const fullUrl = url.startsWith('http') ? url : `${this.getBaseUrl()}${url.startsWith('/') ? url : `/${url}`}`;
      console.log(`🔄 Requête vers: ${fullUrl}`);
      const response = await fetch(fullUrl, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);
      console.log(`✅ Réponse reçue: ${response.status} ${response.statusText}`);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Timeout: Le serveur Flask ne répond pas (10s)');
      }
      throw error;
    }
  }

  async arroserAvecML(features: Record<string, number>): Promise<MLPrediction> {
    try {
      console.log('🤖 Envoi des features pour arrosage IA (ML) vers Flask...');
      const response = await this.makeRequest('/arroser', {
        method: 'POST',
        body: JSON.stringify({ features })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Recommandation IA reçue depuis Flask:', data);

      if (data.status === 'ok') {
        irrigationDataService.addIrrigationData({
          timestamp: new Date().toISOString(),
          volume_m3: data.volume_eau_m3,
          duree_minutes: data.duree_minutes,
          source: 'ML',
          status: 'ok'
        });
      }

      return data;
    } catch (error) {
      console.error('❌ Erreur lors de la requête ML:', error);
      throw error;
    }
  }

  async getMLRecommendation(soilClimateFeatures: number[]): Promise<MLPrediction | null> {
    try {
      console.log('🤖 Envoi requête ML vers Flask backend...');
      const response = await this.makeRequest('/arroser', {
        method: 'POST',
        body: JSON.stringify({
          features: soilClimateFeatures
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Réponse ML Flask reçue:', data);

      if (data.status === 'ok') {
        irrigationDataService.addIrrigationData({
          timestamp: new Date().toISOString(),
          volume_m3: data.volume_eau_m3,
          duree_minutes: data.duree_minutes,
          source: 'ML',
          status: data.status
        });
      }

      return data;
    } catch (error) {
      console.error('❌ Erreur requête ML Flask:', error);
      throw error;
    }
  }

  async startManualIrrigation(durationHours: number, durationMinutes: number): Promise<BackendResponse> {
    try {
      console.log('🚿 Démarrage irrigation manuelle via Flask...');
      const response = await this.makeRequest('/irrigation/manual', {
        method: 'POST',
        body: JSON.stringify({
          durationHours,
          durationMinutes,
          scheduledBy: 'MANUAL',
          timestamp: new Date().toISOString()
        }),
      });

      const data = await response.json();
      console.log('✅ Réponse irrigation manuelle Flask:', data);

      if (data.success) {
        const totalMinutes = (durationHours * 60) + durationMinutes;
        const estimatedVolume = (totalMinutes * 20) / 1000;
        irrigationDataService.addIrrigationData({
          timestamp: new Date().toISOString(),
          volume_m3: estimatedVolume,
          duree_minutes: totalMinutes,
          source: 'MANUAL',
          status: 'ok'
        });
      }

      return data;
    } catch (error) {
      console.error('❌ Erreur irrigation manuelle Flask:', error);
      return { success: false, message: `Erreur de connexion: ${error}` };
    }
  }

  async stopIrrigation(): Promise<BackendResponse> {
    try {
      console.log('⏹️ Arrêt irrigation via Flask...');
      const response = await fetch(`${this.getBaseUrl()}/irrigation/stop`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();
      console.log('✅ Réponse arrêt irrigation Flask:', data);
      return data;
    } catch (error) {
      console.error('❌ Erreur arrêt irrigation Flask:', error);
      return { success: false, message: 'Erreur de connexion au backend Flask' };
    }
  }

  async sendMQTTCommand(device: 0 | 1): Promise<BackendResponse> {
    try {
      console.log(`📡 Envoi commande MQTT via Flask: device=${device}`);
      const response = await fetch(`${this.getBaseUrl()}/mqtt/command`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ device })
      });

      const data = await response.json();
      console.log('Réponse commande MQTT Flask:', data);
      return data;
    } catch (error) {
      console.error(' Erreur commande MQTT Flask:', error);
      return { success: false, message: 'Erreur de connexion au backend Flask' };
    }
  }

  async getIrrigationStatus(): Promise<any> {
    try {
      const response = await fetch(`${this.getBaseUrl()}/irrigation/status`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erreur statut irrigation Flask:', error);
      return null;
    }
  }

  async updateIrrigationSystem(systemType: string): Promise<BackendResponse> {
    try {
      console.log('🔧 Mise à jour système irrigation via Flask...');
      const response = await fetch(`${this.getBaseUrl()}/irrigation/system`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ systemType })
      });

      const data = await response.json();
      console.log('Réponse système irrigation Flask:', data);
      return data;
    } catch (error) {
      console.error('Erreur système irrigation Flask:', error);
      return { success: false, message: 'Erreur de connexion au backend Flask' };
    }
  }

  async sendSchedulesToBackend(schedules: any): Promise<BackendResponse> {
    try {
      console.log('Envoi planning vers Flask backend...');
      const response = await fetch(`${this.getBaseUrl()}/irrigation/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ schedules })
      });

      const data = await response.json();
      console.log('Réponse planning Flask:', data);
      return data;
    } catch (error) {
      console.error('Erreur planning Flask:', error);
      return { success: false, message: 'Erreur de connexion au backend Flask' };
    }
  }

  async getTrendAnalysis(): Promise<TrendAnalysis | null> {
    try {
      console.log('Récupération analyse des tendances Flask...');
      const response = await this.makeRequest('/analytics/trends');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Analyse des tendances reçue:', data);
      return data;
    } catch (error) {
      console.error('Erreur analyse tendances Flask:', error);
      return {
        waterConsumption: 0.85,
        soilMoisture: 42,
        efficiency: 88,
        trend: 'stable'
      };
    }
  }

  async getMLPredictionAnalysis(): Promise<MLPredictionAnalysis | null> {
    try {
      console.log('🧠 Récupération prédictions ML Flask...');
      const response = await this.makeRequest('/analytics/ml-predictions');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Prédictions ML reçues:', data);
      return data;
    } catch (error) {
      console.error('❌ Erreur prédictions ML Flask:', error);
      return {
        nextIrrigationHours: 6,
        recommendedDuration: 30,
        soilCondition: 'Optimal',
        weatherImpact: 'Favorable'
      };
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      console.log('🔍 Test de connexion Flask...');
      const response = await this.makeRequest('/health');
      const isConnected = response.ok;
      console.log(`${isConnected ? '✅' : '❌'} Test connexion Flask: ${isConnected ? 'OK' : 'ÉCHEC'}`);
      return isConnected;
    } catch (error) {
      console.error('❌ Test connexion Flask échoué:', error);
      return false;
    }
  }

  getDefaultSoilClimateFeatures(): number[] {
    return [
      25.0, 0, 65, 12.0, 1, 10000,
      26.0, 42, 1.2, 6.8, 45, 38, 152, 3, 2
    ];
  }
}

export const backendService = new BackendService();
