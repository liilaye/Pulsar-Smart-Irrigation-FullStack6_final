
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

export interface BackendResponse {
  success: boolean;
  message: string;
  data?: any;
}

class BackendService {
  private baseUrl = 'http://localhost:3001/api'; // Remplacez par votre URL backend

  async sendSchedulesToBackend(schedules: ScheduleData): Promise<BackendResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/schedules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          schedules,
          timestamp: new Date().toISOString()
        }),
      });

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de l\'envoi des plannings:', error);
      return { success: false, message: 'Erreur de connexion au backend' };
    }
  }

  async startManualIrrigation(durationHours: number, durationMinutes: number): Promise<BackendResponse> {
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
          timestamp: new Date().toISOString()
        }),
      });

      return await response.json();
    } catch (error) {
      console.error('Erreur lors du démarrage manuel:', error);
      return { success: false, message: 'Erreur de connexion au backend' };
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
