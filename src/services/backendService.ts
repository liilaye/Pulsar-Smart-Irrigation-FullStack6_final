
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

class BackendService {
  private baseUrl = 'http://localhost:5002/api';

  async getMLRecommendation(soilClimateFeatures: number[]): Promise<MLPrediction | null> {
    try {
      console.log('🤖 Envoi requête ML vers Flask backend...');
      const response = await fetch(`${this.baseUrl}/arroser`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          features: soilClimateFeatures
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Réponse ML Flask reçue:', data);
      return data;
    } catch (error) {
      console.error('❌ Erreur requête ML Flask:', error);
      return null;
    }
  }

  async startManualIrrigation(durationHours: number, durationMinutes: number): Promise<BackendResponse> {
    try {
      console.log('🚿 Démarrage irrigation manuelle via Flask...');
      const response = await fetch(`${this.baseUrl}/irrigation/manual`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          durationHours,
          durationMinutes,
          scheduledBy: 'MANUAL',
          timestamp: new Date().toISOString()
        }),
      });

      const data = await response.json();
      console.log('✅ Réponse irrigation manuelle Flask:', data);
      return data;
    } catch (error) {
      console.error('❌ Erreur irrigation manuelle Flask:', error);
      return { success: false, message: 'Erreur de connexion au backend Flask' };
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
