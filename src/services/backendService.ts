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
  mqtt_started?: boolean;
  mqtt_message?: string;
  auto_irrigation?: boolean;
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
    // En local, utiliser le proxy Vite qui redirige vers localhost:5002
    return '/api';
  }

  private async makeRequest(url: string, options: RequestInit = {}): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

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
        throw new Error('Timeout: Le serveur Flask ne répond pas (15s)');
      }
      throw error;
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

  async publishMQTTCommand(device: 0 | 1): Promise<BackendResponse> {
    try {
      console.log(`📡 Envoi commande MQTT via Flask: device=${device}`);
      const response = await this.makeRequest('/mqtt/test-publish', {
        method: 'POST',
        body: JSON.stringify({ device })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Commande MQTT envoyée:', data);
        return { success: true, message: 'Commande MQTT envoyée', data };
      } else {
        const error = await response.text();
        console.error('❌ Erreur commande MQTT:', error);
        return { success: false, message: `Erreur HTTP ${response.status}: ${error}` };
      }
    } catch (error) {
      console.error('❌ Erreur requête MQTT Flask:', error);
      return { success: false, message: `Erreur de connexion: ${error}` };
    }
  }

  async arroserAvecML(features: number[]): Promise<MLPrediction> {
    try {
      console.log('🤖 Envoi des features pour arrosage IA (ML) AUTO vers Flask...');
      console.log('📊 Features (tableau ordonné):', features);
      const response = await this.makeRequest('/arroser', {
        method: 'POST',
        body: JSON.stringify({ features })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Recommandation IA + MQTT AUTO reçue depuis Flask:', data);

      if (data.status === 'ok') {
        irrigationDataService.addIrrigation({
          timestamp: new Date(),
          volume_m3: data.volume_eau_m3,
          duree_minutes: data.duree_minutes,
          source: 'ml',
          type: 'ml'
        });
        
        // 🚀 Log spécial pour irrigation automatique ML
        if (data.auto_irrigation && data.mqtt_started) {
          console.log('🚿 IRRIGATION ML AUTO DÉMARRÉE ! Durée:', data.duree_minutes, 'min');
        }
      }

      return data;
    } catch (error) {
      console.error('❌ Erreur lors de la requête ML AUTO:', error);
      throw error;
    }
  }

  async getMLRecommendation(soilClimateFeatures: number[]): Promise<MLPrediction | null> {
    try {
      console.log('🤖 Envoi requête ML vers Flask backend...');
      console.log('📊 Features envoyées:', soilClimateFeatures);
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
        irrigationDataService.addIrrigation({
          timestamp: new Date(),
          volume_m3: data.volume_eau_m3,
          duree_minutes: data.duree_minutes,
          source: 'ml',
          type: 'ml'
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
        irrigationDataService.addIrrigation({
          timestamp: new Date(),
          volume_m3: estimatedVolume,
          duree_minutes: totalMinutes,
          source: 'manual',
          type: 'manual'
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
      const response = await this.makeRequest('/irrigation/stop', {
        method: 'POST'
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
      const response = await this.makeRequest('/mqtt/command', {
        method: 'POST',
        body: JSON.stringify({ device })
      });

      const data = await response.json();
      console.log('Réponse commande MQTT Flask:', data);
      return data;
    } catch (error) {
      console.error('❌ Erreur commande MQTT Flask:', error);
      return { success: false, message: 'Erreur de connexion au backend Flask' };
    }
  }

  async getIrrigationStatus(): Promise<any> {
    try {
      const response = await this.makeRequest('/irrigation/status');
      
      if (!response.ok) {
        console.error(`❌ Erreur HTTP ${response.status} lors de la récupération du statut`);
        return null;
      }

      // Vérifier si la réponse contient du JSON valide
      const text = await response.text();
      if (!text.trim()) {
        console.error('❌ Réponse vide du serveur');
        return null;
      }

      try {
        const data = JSON.parse(text);
        return data;
      } catch (parseError) {
        console.error('❌ Erreur parsing JSON:', parseError, 'Réponse:', text);
        return null;
      }
    } catch (error) {
      console.error('❌ Erreur statut irrigation Flask:', error);
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

  getDefaultSoilClimateFeatures(): number[] {
    // ✅ CORRECTION: Retourner un tableau ordonné de 15 valeurs
    return [
      25.0,   // Température_air_(°C)
      0,      // Précipitation_(mm)
      65,     // Humidité_air_(%)
      12.0,   // Vent_moyen_(km/h)
      1,      // Type_culture
      10000,  // Périmètre_agricole_(m2)
      26.0,   // Température_sol_(°C)
      42,     // Humidité_sol_(%)
      1.2,    // EC_(dS/m)
      6.8,    // pH_sol
      45,     // Azote_(mg/kg)
      38,     // Phosphore_(mg/kg)
      152,    // Potassium_(mg/kg)
      3,      // Fertilité_(score)
      2       // Type_sol
    ];
  }
}

export const backendService = new BackendService();
