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
  private baseUrl = 'http://localhost:5002/api';

  // Méthode utilitaire pour les requêtes avec gestion d'erreurs améliorée
  private async makeRequest(url: string, options: RequestInit = {}): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 secondes timeout

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Timeout: Le serveur Flask ne répond pas');
      }
      throw error;
    }
  }

  async getMLRecommendation(soilClimateFeatures: number[]): Promise<MLPrediction | null> {
    try {
      console.log('🤖 Envoi requête ML vers Flask backend...');
      const response = await this.makeRequest(`${this.baseUrl}/arroser`, {
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
      
      // Enregistrer les données d'irrigation pour le graphique
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
      throw error; // Rethrow pour permettre une gestion d'erreur appropriée
    }
  }

  async startManualIrrigation(durationHours: number, durationMinutes: number): Promise<BackendResponse> {
    try {
      console.log('🚿 Démarrage irrigation manuelle via Flask...');
      const response = await this.makeRequest(`${this.baseUrl}/irrigation/manual`, {
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
      
      // Enregistrer les données d'irrigation manuelle pour le graphique
      if (data.success) {
        const totalMinutes = (durationHours * 60) + durationMinutes;
        const estimatedVolume = (totalMinutes * 20) / 1000; // Estimation basée sur débit 20L/min
        
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
      const response = await fetch(`${this.baseUrl}/irrigation/stop`, {
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
      const response = await fetch(`${this.baseUrl}/mqtt/command`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ device })
      });

      const data = await response.json();
      console.log('✅ Réponse commande MQTT Flask:', data);
      return data;
    } catch (error) {
      console.error('❌ Erreur commande MQTT Flask:', error);
      return { success: false, message: 'Erreur de connexion au backend Flask' };
    }
  }

  async getIrrigationStatus(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/irrigation/status`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Erreur statut irrigation Flask:', error);
      return null;
    }
  }

  async updateIrrigationSystem(systemType: string): Promise<BackendResponse> {
    try {
      console.log('🔧 Mise à jour système irrigation via Flask...');
      const response = await fetch(`${this.baseUrl}/irrigation/system`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ systemType })
      });

      const data = await response.json();
      console.log('✅ Réponse système irrigation Flask:', data);
      return data;
    } catch (error) {
      console.error('❌ Erreur système irrigation Flask:', error);
      return { success: false, message: 'Erreur de connexion au backend Flask' };
    }
  }

  async sendSchedulesToBackend(schedules: any): Promise<BackendResponse> {
    try {
      console.log('📅 Envoi planning vers Flask backend...');
      const response = await fetch(`${this.baseUrl}/irrigation/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ schedules })
      });

      const data = await response.json();
      console.log('✅ Réponse planning Flask:', data);
      return data;
    } catch (error) {
      console.error('❌ Erreur planning Flask:', error);
      return { success: false, message: 'Erreur de connexion au backend Flask' };
    }
  }

  // Nouvelles méthodes pour les analyses temps réel avec gestion d'erreurs
  async getTrendAnalysis(): Promise<TrendAnalysis | null> {
    try {
      console.log('📊 Récupération analyse des tendances Flask...');
      const response = await this.makeRequest(`${this.baseUrl}/analytics/trends`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Analyse des tendances reçue:', data);
      return data;
    } catch (error) {
      console.error('❌ Erreur analyse tendances Flask:', error);
      // Données de fallback
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
      const response = await this.makeRequest(`${this.baseUrl}/analytics/ml-predictions`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Prédictions ML reçues:', data);
      return data;
    } catch (error) {
      console.error('❌ Erreur prédictions ML Flask:', error);
      // Données de fallback
      return {
        nextIrrigationHours: 6,
        recommendedDuration: 30,
        soilCondition: 'Optimal',
        weatherImpact: 'Favorable'
      };
    }
  }

  // Test de connexion
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.makeRequest(`${this.baseUrl}/health`);
      return response.ok;
    } catch (error) {
      console.error('❌ Test connexion Flask échoué:', error);
      return false;
    }
  }

  // Données d'exemple pour les paramètres agro-climatiques
  getDefaultSoilClimateFeatures(): number[] {
    return [
      25.0,  // Température air
      2.5,   // Précipitations
      65,    // Humidité air
      12.0,  // Vitesse vent
      1,     // Type culture (arachide)
      25000, // Périmètre (2.5 ha = 25000 m²)
      26.0,  // Température sol
      42,    // Humidité sol
      1.2,   // EC
      6.8,   // pH sol
      45,    // Azote
      38,    // Phosphore
      152,   // Potassium
      3,     // Fertilité (score 1-5)
      2      // Type sol (sablo-argileux)
    ];
  }
}

export const backendService = new BackendService();
