// Service Backend simulé pour remplacer backendService.ts en mode démo
import { mockApi } from './mockApiService';

export interface IrrigationRequest {
  duree_minutes: number;
  volume_eau_m3: number;
  matt: string;
  status: string;
  scheduledBy?: string;
  timestamp?: string;
}

class MockBackendService {
  private defaultFeatures = [
    25.5,    // Température_air_(°C)
    2.3,     // Précipitation_(mm)  
    65.2,    // Humidité_air_(%)
    8.7,     // Vent_moyen_(km/h)
    1,       // Type_culture (1=légumes)
    3500,    // Périmètre_agricole_(m2)
    22.1,    // Température_sol_(°C)
    45.8,    // Humidité_sol_(%)
    1.2,     // EC_(dS/m)
    6.8,     // pH_sol
    120,     // Azote_(mg/kg)
    85,      // Phosphore_(mg/kg)
    95,      // Potassium_(mg/kg)
    78,      // Fertilité_(score)
    2        // Type_sol (2=limoneux)
  ];

  async checkConnection() {
    console.log('🟢 [DEMO] Vérification connexion backend simulé...');
    try {
      const result = await mockApi.checkHealth();
      return {
        isConnected: true,
        data: result,
        error: null
      };
    } catch (error) {
      return {
        isConnected: false,
        data: null,
        error: 'Erreur connexion backend simulé'
      };
    }
  }

  async getMLRecommendation(features: number[] = this.defaultFeatures): Promise<IrrigationRequest> {
    console.log('🟢 [DEMO] Génération recommandation ML simulée...');
    
    const result = await mockApi.getMLRecommendation(features);
    
    return {
      duree_minutes: result.duree_minutes,
      volume_eau_m3: result.volume_m3,
      matt: result.matt,
      status: result.status,
      scheduledBy: 'ML_DEMO',
      timestamp: new Date().toISOString()
    };
  }

  async startManualIrrigation(durationHours: number, durationMinutes: number) {
    console.log(`🟢 [DEMO] Démarrage irrigation manuelle: ${durationHours}h ${durationMinutes}min`);
    
    const result = await mockApi.startManualIrrigation(durationHours, durationMinutes);
    
    return {
      success: result.success,
      message: result.message,
      irrigation: {
        isActive: true,
        startTime: new Date().toISOString(),
        duration: (durationHours * 60 + durationMinutes),
        type: 'MANUAL_DEMO'
      }
    };
  }

  async stopIrrigation() {
    console.log('🟢 [DEMO] Arrêt irrigation simulé');
    
    const result = await mockApi.stopIrrigation();
    
    return {
      success: result.success,
      message: result.message,
      irrigation: {
        isActive: false,
        stopTime: new Date().toISOString()
      }
    };
  }

  async getIrrigationStatus() {
    console.log('🟢 [DEMO] Récupération statut irrigation simulé');
    
    const result = await mockApi.getIrrigationStatus();
    
    return {
      isActive: result.isActive,
      startTime: result.startTime,
      duration: result.duration,
      type: result.type,
      remainingTime: result.remainingTime,
      lastMLRecommendation: result.lastMLRecommendation
    };
  }

  async testMQTT(device: 0 | 1) {
    console.log(`🟢 [DEMO] Test MQTT device ${device}`);
    
    const result = await mockApi.testMQTT(device);
    
    return {
      success: result.success,
      message: result.message,
      device: result.device,
      timestamp: result.timestamp
    };
  }

  async registerActor(actorData: any) {
    console.log('🟢 [DEMO] Enregistrement acteur simulé:', actorData);
    
    const result = await mockApi.registerActor(actorData);
    
    return {
      success: result.success,
      message: result.message,
      actor: result.actor
    };
  }

  async getWeatherData(location: string) {
    console.log(`🟢 [DEMO] Données météo simulées pour ${location}`);
    
    const result = await mockApi.getWeather(location);
    
    return {
      success: true,
      location: result.location,
      current: result.current,
      forecast: result.forecast
    };
  }

  async getAnalyticsTrends() {
    console.log('🟢 [DEMO] Tendances analytiques simulées');
    
    const result = await mockApi.getTrends();
    
    return {
      success: true,
      data: result
    };
  }

  async getMLPredictions() {
    console.log('🟢 [DEMO] Prédictions ML simulées');
    
    const result = await mockApi.getMLPredictions();
    
    return {
      success: true,
      predictions: result
    };
  }

  // Méthodes utilitaires
  getDefaultSoilClimateFeatures(): number[] {
    // Ajoute de la variabilité réaliste aux features par défaut
    return this.defaultFeatures.map((value, index) => {
      const variation = index < 4 ? 0.1 : (index < 8 ? 0.05 : 0.02); // Plus de variation pour météo
      const randomFactor = 1 + (Math.random() - 0.5) * variation;
      return Math.round(value * randomFactor * 100) / 100;
    });
  }

  generateRealisticFeatures(baseTemperature?: number, baseHumidity?: number): number[] {
    const temp = baseTemperature || (20 + Math.random() * 15);
    const humidity = baseHumidity || (40 + Math.random() * 40);
    
    return [
      Math.round(temp * 10) / 10,           // Température_air_(°C)
      Math.round(Math.random() * 5 * 10) / 10,  // Précipitation_(mm)
      Math.round(humidity * 10) / 10,       // Humidité_air_(%)
      Math.round((5 + Math.random() * 15) * 10) / 10,  // Vent_moyen_(km/h)
      Math.floor(Math.random() * 3) + 1,    // Type_culture (1-3)
      Math.round((2000 + Math.random() * 6000) * 10) / 10, // Périmètre_agricole_(m2)
      Math.round((temp - 3 + Math.random() * 6) * 10) / 10, // Température_sol_(°C)
      Math.round((30 + Math.random() * 50) * 10) / 10,  // Humidité_sol_(%)
      Math.round((0.8 + Math.random() * 1.5) * 100) / 100, // EC_(dS/m)
      Math.round((6.0 + Math.random() * 2.0) * 10) / 10,   // pH_sol
      Math.round((80 + Math.random() * 80)),     // Azote_(mg/kg)
      Math.round((60 + Math.random() * 60)),     // Phosphore_(mg/kg)
      Math.round((70 + Math.random() * 70)),     // Potassium_(mg/kg)
      Math.round((60 + Math.random() * 35)),     // Fertilité_(score)
      Math.floor(Math.random() * 4) + 1          // Type_sol (1-4)
    ];
  }
}

export const mockBackendService = new MockBackendService();