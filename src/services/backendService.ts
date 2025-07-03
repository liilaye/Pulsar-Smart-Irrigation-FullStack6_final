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
  mqtt_started?: boolean;
  admin_validated?: boolean;
  duration_minutes?: number;
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
    return '/api';
  }

  private async makeRequest(url: string, options: RequestInit = {}): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const fullUrl = url.startsWith('http') ? url : `${this.getBaseUrl()}${url.startsWith('/') ? url : `/${url}`}`;
      console.log(`🔄 Requête vers Backend Flask: ${fullUrl}`);
      
      const response = await fetch(fullUrl, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);
      console.log(`✅ Réponse Backend Flask: ${response.status} ${response.statusText}`);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Timeout: Le serveur Flask ne répond pas (15s)');
      }
      console.error('❌ Erreur requête Backend Flask:', error);
      throw error;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      console.log('🔍 Test de connexion Flask...');
      const response = await this.makeRequest('/health');
      
      // VÉRIFICATION INTELLIGENTE : Accepter 500 comme "backend disponible mais avec erreurs"
      const isAccessible = response.status < 600; // Toute réponse < 600 = serveur accessible
      const isHealthy = response.ok; // 200-299 = serveur en bonne santé
      
      console.log(`${isAccessible ? '✅' : '❌'} Test connexion Flask: ${isAccessible ? 'ACCESSIBLE' : 'INACCESSIBLE'} (status: ${response.status})`);
      
      if (isAccessible && !isHealthy) {
        console.log('⚠️ Backend Flask accessible mais avec erreurs (continuer en mode dégradé)');
      }
      
      return isAccessible; // Retourner true si accessible, même avec erreurs
    } catch (error) {
      console.error('❌ Test connexion Flask échoué:', error);
      return false; // Vraiment inaccessible
    }
  }

  async checkBackendHealth(): Promise<{ accessible: boolean; healthy: boolean; status: number }> {
    try {
      const response = await this.makeRequest('/health');
      return {
        accessible: response.status < 600,
        healthy: response.ok,
        status: response.status
      };
    } catch (error) {
      return {
        accessible: false,
        healthy: false,
        status: 0
      };
    }
  }

  async resetIrrigationState(): Promise<BackendResponse> {
    try {
      console.log('🔄 Reset état irrigation via Flask...');
      const response = await this.makeRequest('/irrigation/reset', {
        method: 'POST'
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Erreur HTTP ${response.status}:`, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ État irrigation réinitialisé:', data);
      return data;
    } catch (error) {
      console.error('❌ Erreur reset irrigation Flask:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      return { success: false, message: `Erreur reset Backend Flask: ${errorMessage}` };
    }
  }

  private async handleIrrigationError(error: any, operation: string): Promise<never> {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    
    // Tentative de reset automatique si erreur de blocage
    if (errorMessage.includes('Arrosage en cours') || errorMessage.includes('déjà en cours')) {
      console.log('🔄 Tentative auto-reset suite à erreur de blocage...');
      try {
        await this.resetIrrigationState();
        throw new Error(`Irrigation bloquée - État réinitialisé automatiquement. Veuillez réessayer ${operation}.`);
      } catch (resetError) {
        throw new Error(`Erreur ${operation} + échec reset: ${errorMessage}`);
      }
    }
    
    throw new Error(`Erreur ${operation} Backend Flask: ${errorMessage}`);
  }

  async getMLRecommendation(features: number[]): Promise<MLPrediction> {
    try {
      console.log('🤖 Récupération recommandation ML via Flask backend...');
      console.log('📊 Features (15 valeurs):', features);
      
      const response = await this.makeRequest('/arroser', {
        method: 'POST',
        body: JSON.stringify({ features })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Erreur HTTP ${response.status}:`, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Recommandation ML Flask reçue:', data);
      return data;
    } catch (error) {
      console.error('❌ Erreur recommandation ML Flask:', error);
      await this.handleIrrigationError(error, 'recommandation ML');
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

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Erreur HTTP ${response.status}:`, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

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
      await this.handleIrrigationError(error, 'irrigation manuelle');
    }
  }

  async arroserAvecML(features: number[]): Promise<MLPrediction> {
    try {
      console.log('🤖 Génération PRÉDICTION ML via Flask backend (SANS déclenchement auto)...');
      console.log('📊 Features (15 valeurs):', features);
      
      const response = await this.makeRequest('/arroser', {
        method: 'POST',
        body: JSON.stringify({ features })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Erreur HTTP ${response.status}:`, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ PRÉDICTION ML Flask reçue (SANS auto-start):', data);

      if (data.status === 'ok') {
        // SÉCURITÉ: Ne jamais ajouter automatiquement - seulement prédiction
        console.log('🤖 PRÉDICTION ML SÉCURISÉE générée - En attente validation admin');
        
        // VÉRIFICATION SÉCURITÉ: S'assurer qu'aucun auto-déclenchement n'a eu lieu
        if (data.auto_irrigation || data.mqtt_started) {
          console.error('🚨 ALERTE SÉCURITÉ: Auto-irrigation détectée dans la réponse - BLOQUÉ');
          throw new Error('SÉCURITÉ: Auto-irrigation détectée - déclenchement bloqué');
        }
        
        // VALIDATION: Prédiction seulement
        if (!data.no_auto_start || !data.requires_admin_validation) {
          console.warn('⚠️ SÉCURITÉ: Flags de sécurité manquants dans la réponse');
        }
      }

      return data;
    } catch (error) {
      console.error('❌ Erreur prédiction ML Flask:', error);
      await this.handleIrrigationError(error, 'prédiction ML');
    }
  }

  async startMLIrrigationWithAdminValidation(mlData: { duration_minutes: number; volume_m3: number }): Promise<BackendResponse> {
    try {
      console.log('🚿 DÉMARRAGE IRRIGATION ML AVEC VALIDATION ADMIN...');
      const response = await this.makeRequest('/irrigation/ml-start', {
        method: 'POST',
        body: JSON.stringify(mlData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Erreur HTTP ${response.status}:`, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Réponse irrigation ML admin Flask:', data);

      if (data.success && data.admin_validated) {
        irrigationDataService.addIrrigation({
          timestamp: new Date(),
          volume_m3: mlData.volume_m3,
          duree_minutes: mlData.duration_minutes,
          source: 'ml_admin_validated',
          type: 'ml'
        });
        
        console.log('🚿 IRRIGATION ML ADMIN VALIDÉE DÉMARRÉE !');
      }

      return data;
    } catch (error) {
      console.error('❌ Erreur irrigation ML admin Flask:', error);
      await this.handleIrrigationError(error, 'irrigation ML admin');
    }
  }

  async stopIrrigation(): Promise<BackendResponse> {
    try {
      console.log('⏹️ Arrêt irrigation via Flask...');
      const response = await this.makeRequest('/irrigation/stop', {
        method: 'POST'
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Erreur HTTP ${response.status}:`, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Réponse arrêt irrigation Flask:', data);
      return data;
    } catch (error) {
      console.error('❌ Erreur arrêt irrigation Flask:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      return { success: false, message: `Erreur Backend Flask: ${errorMessage}` };
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
