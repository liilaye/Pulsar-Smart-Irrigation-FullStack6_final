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

export interface SoilClimateData {
  features: number[];
}

export interface ScheduleData {
  [day: string]: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
}

export interface BackendResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface IrrigationSystem {
  type: 'goutte-a-goutte' | 'aspersion' | 'micro-aspersion' | 'tourniquet' | 'laser' | 'submersion';
  name: string;
  flowRate?: number;
  coverage?: number;
}

class BackendService {
  private baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://your-deployed-api.com/api' 
    : 'http://localhost:5002';

  async getMLRecommendation(soilClimateFeatures: number[]): Promise<MLPrediction | null> {
    try {
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
      console.log('Réponse ML reçue:', data);
      return data;
    } catch (error) {
      console.error('Erreur lors de la requête ML:', error);
      return null;
    }
  }

  async sendSchedulesToBackend(schedules: ScheduleData, irrigationSystem?: string): Promise<BackendResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/schedules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          schedules,
          irrigationSystem,
          timestamp: new Date().toISOString()
        }),
      });

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de l\'envoi des plannings:', error);
      return { success: false, message: 'Erreur de connexion au backend Flask' };
    }
  }

  async startManualIrrigation(durationHours: number, durationMinutes: number, irrigationSystem?: string): Promise<BackendResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/irrigation/manual`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          durationHours,
          durationMinutes,
          scheduledBy: 'MANUAL',
          irrigationSystem,
          timestamp: new Date().toISOString()
        }),
      });

      return await response.json();
    } catch (error) {
      console.error('Erreur lors du démarrage manuel:', error);
      return { success: false, message: 'Erreur de connexion au backend Flask' };
    }
  }

  async updateIrrigationSystem(system: string): Promise<BackendResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/irrigation/system`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          irrigationSystem: system,
          timestamp: new Date().toISOString()
        }),
      });

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du système:', error);
      return { success: false, message: 'Erreur de connexion au backend Flask' };
    }
  }

  async getIrrigationStatus(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/irrigation/status`);
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération du statut:', error);
      return null;
    }
  }

  // Données d'exemple pour les paramètres agro-climatiques
  getDefaultSoilClimateFeatures(): number[] {
    return [
      25.0,  // Température
      120.0, // Humidité relative
      60,    // Humidité du sol
      15.0,  // Vitesse du vent
      5000,  // Rayonnement solaire
      30.0,  // Pression atmosphérique
      40,    // Précipitations
      1.0,   // Évapotranspiration
      6.8,   // pH du sol
      60,    // Conductivité
      20,    // Azote
      150,   // Phosphore
      0.7,   // Potassium
    ];
  }
}

export const backendService = new BackendService();
