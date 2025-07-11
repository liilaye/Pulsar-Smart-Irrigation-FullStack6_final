// Service API pour développement local uniquement
class ApiService {
  private baseUrl = import.meta.env.PROD 
    ? 'https://votre-backend-url.railway.app/api'  // Remplacez par votre URL backend
    : '/api';

  async checkHealth() {
    try {
      console.log('🔍 Test connexion backend Flask sur:', `${this.baseUrl}/health`);
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('📡 Réponse backend status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Backend Flask erreur HTTP ${response.status}:`, errorText);
        throw new Error(`Backend Flask erreur HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('✅ Backend Flask connecté:', data);
      return data;
    } catch (error) {
      console.error('❌ Erreur connexion backend Flask:', error);
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          throw new Error('Backend Flask non accessible. Vérifiez que le serveur Flask fonctionne sur localhost:5002');
        }
        throw error;
      }
      throw new Error('Erreur de connexion backend Flask');
    }
  }

  async registerActor(actorData: any) {
    try {
      console.log('📝 Enregistrement acteur via API service:', actorData);
      console.log('🔗 URL cible:', `${this.baseUrl}/actors/register`);
      
      const response = await fetch(`${this.baseUrl}/actors/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(actorData),
      });
      
      console.log('📡 Réponse enregistrement status:', response.status);
      console.log('📡 Réponse headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Erreur HTTP ${response.status}:`, errorText);
        
        // Messages d'erreur spécifiques selon le statut
        if (response.status === 500) {
          throw new Error(`Erreur serveur Flask (500): ${errorText}. Vérifiez les logs du serveur Flask.`);
        } else if (response.status === 404) {
          throw new Error(`Endpoint non trouvé (404): ${errorText}. Vérifiez que le serveur Flask a bien les routes acteurs.`);
        } else if (response.status === 400) {
          throw new Error(`Données invalides (400): ${errorText}`);
        } else {
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
      }
      
      const data = await response.json();
      console.log('✅ Acteur enregistré avec succès:', data);
      return data;
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
