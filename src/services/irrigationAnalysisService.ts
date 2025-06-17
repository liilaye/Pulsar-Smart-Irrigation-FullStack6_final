
import { backendService } from './backendService';

export interface IrrigationAnalysisData {
  manual: {
    max: number;
    min: number;
    current: number;
  };
  ml: {
    max: number;
    min: number;
    current: number;
  };
}

class IrrigationAnalysisService {
  private cache: IrrigationAnalysisData | null = null;
  private lastFetch: number = 0;
  private readonly CACHE_DURATION = 30000; // 30 secondes
  private fetchPromise: Promise<IrrigationAnalysisData> | null = null;

  async getAnalysisData(): Promise<IrrigationAnalysisData> {
    const now = Date.now();
    
    // Retourner les données en cache si elles sont récentes
    if (this.cache && (now - this.lastFetch) < this.CACHE_DURATION) {
      return this.cache;
    }

    // Si une requête est déjà en cours, attendre son résultat
    if (this.fetchPromise) {
      return this.fetchPromise;
    }

    // Démarrer une nouvelle requête
    this.fetchPromise = this.fetchAnalysisData();
    
    try {
      const data = await this.fetchPromise;
      this.cache = data;
      this.lastFetch = now;
      return data;
    } finally {
      this.fetchPromise = null;
    }
  }

  private async fetchAnalysisData(): Promise<IrrigationAnalysisData> {
    try {
      console.log('📊 Récupération données analyse irrigation...');
      const response = await fetch('/api/irrigation/analysis');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'ok' && data.data) {
        console.log('✅ Données analyse récupérées:', data.data);
        return data.data;
      }
      
      throw new Error('Format de réponse invalide');
    } catch (error) {
      console.warn('⚠️ Erreur récupération analyse, utilisation des données par défaut:', error);
      
      // Données par défaut en cas d'erreur
      return {
        manual: {
          max: 0.8,
          min: 0.2,
          current: 0.5
        },
        ml: {
          max: 0.9,
          min: 0.3,
          current: 0.6
        }
      };
    }
  }

  clearCache(): void {
    this.cache = null;
    this.lastFetch = 0;
  }
}

export const irrigationAnalysisService = new IrrigationAnalysisService();
