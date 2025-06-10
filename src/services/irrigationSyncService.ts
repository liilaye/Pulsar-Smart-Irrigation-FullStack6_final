
interface IrrigationState {
  isActive: boolean;
  type: 'manual' | 'ml' | null;
  startTime: Date | null;
  duration?: number;
  source: string;
}

class IrrigationSyncService {
  private state: IrrigationState = {
    isActive: false,
    type: null,
    startTime: null,
    source: 'none'
  };
  
  private listeners: ((state: IrrigationState) => void)[] = [];

  // Démarrer irrigation avec vérification de conflit
  startIrrigation(type: 'manual' | 'ml', source: string, duration?: number): boolean {
    if (this.state.isActive) {
      console.warn(`❌ Irrigation ${this.state.type} déjà active, impossible de démarrer ${type}`);
      return false;
    }

    this.state = {
      isActive: true,
      type,
      startTime: new Date(),
      duration,
      source
    };

    console.log(`✅ Irrigation ${type} démarrée (${source})`);
    this.notifyListeners();
    return true;
  }

  // Arrêter irrigation
  stopIrrigation(source: string): boolean {
    if (!this.state.isActive) {
      console.warn('❌ Aucune irrigation active à arrêter');
      return false;
    }

    const duration = this.state.startTime ? 
      (new Date().getTime() - this.state.startTime.getTime()) / 1000 / 60 : 0;

    console.log(`⏹️ Irrigation ${this.state.type} arrêtée après ${duration.toFixed(1)} min (${source})`);

    this.state = {
      isActive: false,
      type: null,
      startTime: null,
      source: 'none'
    };

    this.notifyListeners();
    return true;
  }

  // Vérifier si une irrigation est possible
  canStartIrrigation(type: 'manual' | 'ml'): { canStart: boolean; reason?: string } {
    if (!this.state.isActive) {
      return { canStart: true };
    }

    return {
      canStart: false,
      reason: `Irrigation ${this.state.type} en cours depuis ${this.getActiveDuration()} min`
    };
  }

  // Obtenir l'état actuel
  getState(): IrrigationState {
    return { ...this.state };
  }

  // Obtenir la durée active
  getActiveDuration(): number {
    if (!this.state.isActive || !this.state.startTime) return 0;
    return (new Date().getTime() - this.state.startTime.getTime()) / 1000 / 60;
  }

  // S'abonner aux changements d'état
  subscribe(callback: (state: IrrigationState) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.getState()));
  }

  // Forcer la synchronisation avec l'état externe (MQTT/Backend)
  syncWithExternal(isActive: boolean, type: 'manual' | 'ml', source: string) {
    if (isActive && !this.state.isActive) {
      this.state = {
        isActive: true,
        type,
        startTime: new Date(),
        source
      };
      console.log(`🔄 Synchronisation: irrigation ${type} détectée (${source})`);
    } else if (!isActive && this.state.isActive) {
      this.stopIrrigation(`sync_${source}`);
    }
    this.notifyListeners();
  }
}

export const irrigationSyncService = new IrrigationSyncService();
export type { IrrigationState };
