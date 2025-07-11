// Service API simulé pour la démo - remplace apiService.ts
interface MockMLRecommendation {
  status: string;
  duree_minutes: number;
  volume_m3: number;
  volume_litres: number;
  duree_sec: number;
  matt: string;
  auto_irrigation?: boolean;
}

interface MockIrrigationStatus {
  isActive: boolean;
  startTime?: string;
  duration?: number;
  type?: string;
  remainingTime?: number;
}

class MockApiService {
  private isConnected = true;
  private irrigationStatus: MockIrrigationStatus = { isActive: false };
  private lastMLRecommendation: MockMLRecommendation | null = null;

  // Simule une latence réseau réaliste
  private async simulateDelay(ms: number = 500 + Math.random() * 1000) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async checkHealth() {
    await this.simulateDelay(300);
    console.log('🟢 [DEMO] Backend simulé - connexion OK');
    
    return {
      status: "ok",
      message: "Backend simulé DEMO opérationnel",
      mode: "demo_simulation",
      endpoints: [
        "/api/arroser",
        "/api/mqtt/test-publish",
        "/api/irrigation/status",
        "/api/actors/register",
        "/api/actors/list"
      ]
    };
  }

  async registerActor(actorData: any) {
    await this.simulateDelay(800);
    console.log('🟢 [DEMO] Enregistrement acteur simulé:', actorData);
    
    return {
      success: true,
      message: "Acteur enregistré avec succès (DEMO)",
      actor: {
        ...actorData,
        id: `demo_${Date.now()}`,
        registeredAt: new Date().toISOString()
      }
    };
  }

  async getIrrigationStatus() {
    await this.simulateDelay(200);
    console.log('🟢 [DEMO] Statut irrigation simulé');
    
    return {
      ...this.irrigationStatus,
      lastMLRecommendation: this.lastMLRecommendation
    };
  }

  async startManualIrrigation(durationHours: number, durationMinutes: number) {
    await this.simulateDelay(600);
    console.log(`🟢 [DEMO] Irrigation manuelle démarrée: ${durationHours}h ${durationMinutes}min`);
    
    this.irrigationStatus = {
      isActive: true,
      startTime: new Date().toISOString(),
      duration: (durationHours * 60 + durationMinutes) * 60 * 1000,
      type: 'MANUAL',
      remainingTime: (durationHours * 60 + durationMinutes) * 60
    };

    return {
      success: true,
      message: "Irrigation manuelle démarrée (DEMO)",
      status: this.irrigationStatus
    };
  }

  async stopIrrigation() {
    await this.simulateDelay(400);
    console.log('🟢 [DEMO] Irrigation arrêtée');
    
    this.irrigationStatus = { isActive: false };
    
    return {
      success: true,
      message: "Irrigation arrêtée (DEMO)"
    };
  }

  async getMLRecommendation(features: number[]) {
    await this.simulateDelay(1200); // Plus long pour simuler l'IA
    console.log('🟢 [DEMO] Génération recommandation ML simulée avec features:', features);
    
    // Simulation intelligente basée sur les features
    const temp = features[0] || 25;
    const humidity = features[2] || 60;
    const soilMoisture = features[7] || 50;
    const area = features[5] || 1000;
    
    // Calcul simulé intelligent
    let baseVolume = 0.4; // 400L de base
    
    if (temp > 30) baseVolume += 0.2;
    if (humidity < 50) baseVolume += 0.15;
    if (soilMoisture < 40) baseVolume += 0.25;
    if (area > 5000) baseVolume += 0.1;
    
    // Ajouter de la variabilité réaliste
    baseVolume += (Math.random() - 0.5) * 0.1;
    baseVolume = Math.max(0.3, Math.min(2.0, baseVolume));
    
    const volumeLitres = baseVolume * 1000;
    const dureeMinutes = volumeLitres / 15; // 15L/min débit simulé
    const dureeSec = Math.floor(dureeMinutes * 60);
    
    this.lastMLRecommendation = {
      status: "ok",
      duree_minutes: Math.round(dureeMinutes * 100) / 100,
      volume_m3: Math.round(baseVolume * 1000) / 1000,
      volume_litres: Math.round(volumeLitres * 100) / 100,
      duree_sec: dureeSec,
      matt: `Recommandation IA simulée: ${Math.round(dureeMinutes)}min pour ${Math.round(volumeLitres)}L`,
      auto_irrigation: false
    };
    
    console.log('🟢 [DEMO] Recommandation ML générée:', this.lastMLRecommendation);
    return this.lastMLRecommendation;
  }

  async testMQTT(device: 0 | 1) {
    await this.simulateDelay(500);
    console.log(`🟢 [DEMO] Test MQTT simulé - Device ${device}`);
    
    return {
      success: true,
      message: `Test MQTT simulé réussi - Device ${device} ${device ? 'ON' : 'OFF'}`,
      device,
      timestamp: new Date().toISOString()
    };
  }

  async getTrends() {
    await this.simulateDelay(800);
    console.log('🟢 [DEMO] Tendances analytiques simulées');
    
    // Générer des données de tendance réalistes
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });
    
    return {
      waterUsage: days.map((date, i) => ({
        date,
        volume: Math.round((300 + Math.random() * 200) * 100) / 100,
        efficiency: Math.round((85 + Math.random() * 10) * 100) / 100
      })),
      recommendations: days.map((date, i) => ({
        date,
        aiPredicted: Math.round((250 + Math.random() * 300) * 100) / 100,
        actualUsed: Math.round((280 + Math.random() * 240) * 100) / 100
      }))
    };
  }

  async getMLPredictions() {
    await this.simulateDelay(600);
    console.log('🟢 [DEMO] Prédictions ML simulées');
    
    return {
      nextIrrigation: {
        predicted: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        confidence: Math.round((85 + Math.random() * 10) * 100) / 100,
        estimatedVolume: Math.round((400 + Math.random() * 200) * 100) / 100
      },
      weeklyForecast: Array.from({ length: 7 }, (_, i) => ({
        day: i + 1,
        volume: Math.round((300 + Math.random() * 300) * 100) / 100,
        probability: Math.round((70 + Math.random() * 25) * 100) / 100
      }))
    };
  }

  async getWeather(location: string) {
    await this.simulateDelay(400);
    console.log(`🟢 [DEMO] Météo simulée pour ${location}`);
    
    return {
      location,
      current: {
        temperature: Math.round((20 + Math.random() * 15) * 10) / 10,
        humidity: Math.round((40 + Math.random() * 40) * 10) / 10,
        windSpeed: Math.round((5 + Math.random() * 15) * 10) / 10,
        precipitation: Math.round(Math.random() * 10 * 10) / 10,
        description: ["Ensoleillé", "Partiellement nuageux", "Nuageux", "Léger vent"][Math.floor(Math.random() * 4)]
      },
      forecast: Array.from({ length: 5 }, (_, i) => ({
        day: i + 1,
        tempMax: Math.round((25 + Math.random() * 10) * 10) / 10,
        tempMin: Math.round((15 + Math.random() * 8) * 10) / 10,
        humidity: Math.round((45 + Math.random() * 35) * 10) / 10,
        precipitation: Math.round(Math.random() * 15 * 10) / 10
      }))
    };
  }

  // Méthodes génériques pour compatibility
  async get(endpoint: string) {
    await this.simulateDelay();
    console.log(`🟢 [DEMO] GET ${endpoint} simulé`);
    return { success: true, data: `Données simulées pour ${endpoint}` };
  }

  async post(endpoint: string, data: any) {
    await this.simulateDelay();
    console.log(`🟢 [DEMO] POST ${endpoint} simulé avec:`, data);
    return { success: true, data: `Réponse simulée pour ${endpoint}` };
  }
}

export const mockApi = new MockApiService();