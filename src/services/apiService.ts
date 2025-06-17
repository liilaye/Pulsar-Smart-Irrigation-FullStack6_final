// Service API pour développement local uniquement
class ApiService {
  private baseUrl = '/api';

  async checkHealth() {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      if (!response.ok) {
        throw new Error(`Backend local non accessible: HTTP ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('❌ Backend Flask local non disponible:', error);
      throw new Error('Backend Flask doit être démarré sur localhost:5002');
    }
  }

  async registerActor(actorData: any) {
    try {
      console.log('📝 Enregistrement acteur via API service:', actorData);
      const response = await fetch(`${this.baseUrl}/actors/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(actorData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Erreur HTTP ${response.status}:`, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('❌ Erreur enregistrement acteur:', error);
      throw error;
    }
  }

  async get(endpoint: string) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`❌ GET ${endpoint} échoué:`, error);
      throw error;
    }
  }

  async post(endpoint: string, data: any) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`❌ POST ${endpoint} échoué:`, error);
      throw error;
    }
  }

  // Méthodes spécifiques
  async testMQTT(device: 0 | 1) {
    return this.post('/mqtt/test-publish', { device });
  }

  async getIrrigationStatus() {
    return this.get('/irrigation/status');
  }

  async startManualIrrigation(durationHours: number, durationMinutes: number) {
    return this.post('/irrigation/manual', {
      durationHours,
      durationMinutes,
      scheduledBy: 'MANUAL',
      timestamp: new Date().toISOString()
    });
  }

  async stopIrrigation() {
    return this.post('/irrigation/stop', {});
  }

  async getMLRecommendation(features: number[]) {
    return this.post('/arroser', { features });
  }

  async getTrends() {
    return this.get('/analytics/trends');
  }

  async getMLPredictions() {
    return this.get('/analytics/ml-predictions');
  }

  async getWeather(location: string) {
    return this.get(`/weather/${location}`);
  }
}

export const api = new ApiService();
