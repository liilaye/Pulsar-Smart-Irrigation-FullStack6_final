
export interface IrrigationRequest {
  durationHours: number;
  durationMinutes: number;
  scheduledBy: 'ML' | 'MANUAL';
  timestamp: string;
}

export interface ScheduleData {
  [day: string]: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
}

export interface IrrigationSystem {
  type: 'goutte-a-goutte' | 'aspersion' | 'tourniquet' | 'laser' | 'micro-aspersion' | 'submersion';
  name: string;
}

export interface BackendResponse {
  success: boolean;
  message: string;
  data?: any;
}

class BackendService {
  private baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://your-deployed-api.com/api' 
    : 'http://localhost:5002/api';

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
}

export const backendService = new BackendService();
