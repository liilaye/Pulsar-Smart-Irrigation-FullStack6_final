type IrrigationRecord = {
  timestamp: Date;
  volume_m3: number;
  duree_minutes: number;
  source: 'manual' | 'ml' | 'schedule' | 'ml_admin_validated';
  type: 'manual' | 'ml';
};

export type DailyIrrigationData = {
  time: string;
  manualQuantity: number;
  mlQuantity: number;
};

export type WeeklyIrrigationData = {
  time: string;
  manualQuantity: number;
  mlQuantity: number;
};

export type MonthlyIrrigationData = {
  time: string;
  manualQuantity: number;
  mlQuantity: number;
};

class IrrigationDataService {
  private irrigationHistory: IrrigationRecord[] = [];
  private subscribers: ((data: { daily: DailyIrrigationData[], weekly: WeeklyIrrigationData[], monthly: MonthlyIrrigationData[] }) => void)[] = [];
  private activeSessions: Map<string, { startTime: Date, type: 'manual' | 'ml', source: string }> = new Map();

  constructor() {
    this.initializeWithSampleData();
  }

  // Démarrer une session d'irrigation
  startIrrigationSession(type: 'manual' | 'ml', source: string = 'unknown'): string {
    const sessionId = `${type}_${Date.now()}`;
    this.activeSessions.set(sessionId, {
      startTime: new Date(),
      type,
      source
    });
    console.log(`📊 Session irrigation démarrée: ${sessionId} (${type})`);
    return sessionId;
  }

  // Terminer une session d'irrigation et ajouter aux données
  endIrrigationSession(sessionId: string, actualDurationMinutes?: number): void {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      console.warn(`⚠️ Session non trouvée: ${sessionId}`);
      return;
    }

    const endTime = new Date();
    const durationMinutes = actualDurationMinutes || (endTime.getTime() - session.startTime.getTime()) / (1000 * 60);
    const volumeM3 = (durationMinutes * 20) / 1000; // 20 L/min converti en m³

    this.addIrrigation({
      timestamp: session.startTime,
      volume_m3: volumeM3,
      duree_minutes: durationMinutes,
      source: session.source as any,
      type: session.type
    });

    this.activeSessions.delete(sessionId);
    console.log(`✅ Session irrigation terminée: ${sessionId} - ${durationMinutes.toFixed(1)}min, ${volumeM3.toFixed(3)}m³`);
  }

  // Ajouter directement une irrigation (pour les prédictions ML)
  addIrrigation(record: IrrigationRecord): void {
    this.irrigationHistory.push(record);
    console.log(`📈 Nouvelle irrigation ajoutée:`, record);
    this.notifySubscribers();
  }

  // Ajouter une irrigation ML avec prédiction
  addMLPrediction(predictionData: { duree_minutes: number, volume_eau_m3: number }): void {
    this.addIrrigation({
      timestamp: new Date(),
      volume_m3: predictionData.volume_eau_m3,
      duree_minutes: predictionData.duree_minutes,
      source: 'ml',
      type: 'ml'
    });
  }

  // Obtenir les sessions actives
  getActiveSessions(): string[] {
    return Array.from(this.activeSessions.keys());
  }

  private initializeWithSampleData(): void {
    const now = new Date();
    for (let i = 0; i < 24; i++) {
      const time = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000);
      
      if (Math.random() > 0.7) {
        this.irrigationHistory.push({
          timestamp: time,
          volume_m3: Math.random() * 0.8 + 0.2,
          duree_minutes: Math.random() * 20 + 10,
          source: Math.random() > 0.5 ? 'manual' : 'ml',
          type: Math.random() > 0.5 ? 'manual' : 'ml'
        });
      }
    }
  }

  generateChartData() {
    const daily = this.generateDailyData();
    const weekly = this.generateWeeklyData();
    const monthly = this.generateMonthlyData();
    
    return { daily, weekly, monthly };
  }

  private generateDailyData(): DailyIrrigationData[] {
    const now = new Date();
    const dailyData: DailyIrrigationData[] = [];
    
    for (let i = 23; i >= 0; i--) {
      const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hourStart = new Date(hour.getFullYear(), hour.getMonth(), hour.getDate(), hour.getHours());
      const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000);
      
      const hourlyRecords = this.irrigationHistory.filter(record => 
        record.timestamp >= hourStart && record.timestamp < hourEnd
      );
      
      const manualQuantity = hourlyRecords
        .filter(record => record.type === 'manual')
        .reduce((sum, record) => sum + record.volume_m3, 0);
      
      const mlQuantity = hourlyRecords
        .filter(record => record.type === 'ml')
        .reduce((sum, record) => sum + record.volume_m3, 0);
      
      dailyData.push({
        time: hour.getHours().toString().padStart(2, '0') + ':00',
        manualQuantity: Number(manualQuantity.toFixed(3)),
        mlQuantity: Number(mlQuantity.toFixed(3))
      });
    }
    
    return dailyData;
  }

  private generateWeeklyData(): WeeklyIrrigationData[] {
    const weeklyData: WeeklyIrrigationData[] = [];
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const day = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate());
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      
      const dailyRecords = this.irrigationHistory.filter(record => 
        record.timestamp >= dayStart && record.timestamp < dayEnd
      );
      
      const manualQuantity = dailyRecords
        .filter(record => record.type === 'manual')
        .reduce((sum, record) => sum + record.volume_m3, 0);
      
      const mlQuantity = dailyRecords
        .filter(record => record.type === 'ml')
        .reduce((sum, record) => sum + record.volume_m3, 0);
      
      weeklyData.push({
        time: day.toLocaleDateString('fr-FR', { weekday: 'short' }),
        manualQuantity: Number(manualQuantity.toFixed(3)),
        mlQuantity: Number(mlQuantity.toFixed(3))
      });
    }
    
    return weeklyData;
  }

  private generateMonthlyData(): MonthlyIrrigationData[] {
    const monthlyData: MonthlyIrrigationData[] = [];
    const now = new Date();
    
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      const weeklyRecords = this.irrigationHistory.filter(record => 
        record.timestamp >= weekStart && record.timestamp < weekEnd
      );
      
      const manualQuantity = weeklyRecords
        .filter(record => record.type === 'manual')
        .reduce((sum, record) => sum + record.volume_m3, 0);
      
      const mlQuantity = weeklyRecords
        .filter(record => record.type === 'ml')
        .reduce((sum, record) => sum + record.volume_m3, 0);
      
      monthlyData.push({
        time: `S${4-i}`,
        manualQuantity: Number(manualQuantity.toFixed(3)),
        mlQuantity: Number(mlQuantity.toFixed(3))
      });
    }
    
    return monthlyData;
  }

  subscribe(callback: (data: { daily: DailyIrrigationData[], weekly: WeeklyIrrigationData[], monthly: MonthlyIrrigationData[] }) => void): () => void {
    this.subscribers.push(callback);
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  private notifySubscribers(): void {
    const data = this.generateChartData();
    this.subscribers.forEach(callback => callback(data));
  }
}

export const irrigationDataService = new IrrigationDataService();
