
interface IrrigationData {
  timestamp: string;
  volume_m3: number;
  duree_minutes: number;
  source: 'ML' | 'MANUAL' | 'MANUAL_DIRECT';
  status: string;
  type?: 'manual' | 'ml';
}

interface DailyIrrigationData {
  time: string;
  manualQuantity: number;
  mlQuantity: number;
  accumulated: number;
}

interface WeeklyIrrigationData {
  time: string;
  manualQuantity: number;
  mlQuantity: number;
}

interface MonthlyIrrigationData {
  time: string;
  manualQuantity: number;
  mlQuantity: number;
}

class IrrigationDataService {
  private irrigationHistory: IrrigationData[] = [];
  private listeners: ((data: any) => void)[] = [];

  addIrrigationData(data: IrrigationData) {
    // Déterminer le type basé sur la source
    const enhancedData = {
      ...data,
      type: data.source.includes('MANUAL') ? 'manual' as const : 'ml' as const
    };
    
    this.irrigationHistory.push(enhancedData);
    console.log('📊 Nouvelle donnée irrigation ajoutée:', enhancedData);
    this.notifyListeners();
  }

  subscribe(callback: (data: any) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  private notifyListeners() {
    const chartData = this.generateChartData();
    this.listeners.forEach(listener => listener(chartData));
  }

  generateDailyData(): DailyIrrigationData[] {
    const today = new Date();
    const dailyData: DailyIrrigationData[] = [];
    
    // Initialiser avec des données vides pour chaque heure
    for (let i = 0; i < 24; i++) {
      dailyData.push({
        time: `${i.toString().padStart(2, '0')}:00`,
        manualQuantity: 0,
        mlQuantity: 0,
        accumulated: 0
      });
    }

    // Ajouter les données réelles d'irrigation du jour
    const todayIrrigations = this.irrigationHistory.filter(irrigation => {
      const irrigationDate = new Date(irrigation.timestamp);
      return irrigationDate.toDateString() === today.toDateString();
    });

    todayIrrigations.forEach(irrigation => {
      const hour = new Date(irrigation.timestamp).getHours();
      const index = dailyData.findIndex(item => item.time === `${hour.toString().padStart(2, '0')}:00`);
      if (index !== -1) {
        if (irrigation.type === 'manual') {
          dailyData[index].manualQuantity += irrigation.volume_m3;
        } else {
          dailyData[index].mlQuantity += irrigation.volume_m3;
        }
      }
    });

    // Calculer les valeurs cumulatives
    let accumulated = 0;
    dailyData.forEach(item => {
      accumulated += item.manualQuantity + item.mlQuantity;
      item.accumulated = accumulated;
    });

    return dailyData;
  }

  generateWeeklyData(): WeeklyIrrigationData[] {
    const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    const weeklyData: WeeklyIrrigationData[] = weekDays.map(day => ({ 
      time: day, 
      manualQuantity: 0, 
      mlQuantity: 0 
    }));
    
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay() + 1); // Lundi de cette semaine

    this.irrigationHistory.forEach(irrigation => {
      const irrigationDate = new Date(irrigation.timestamp);
      const daysDiff = Math.floor((irrigationDate.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff >= 0 && daysDiff < 7) {
        if (irrigation.type === 'manual') {
          weeklyData[daysDiff].manualQuantity += irrigation.volume_m3;
        } else {
          weeklyData[daysDiff].mlQuantity += irrigation.volume_m3;
        }
      }
    });

    return weeklyData;
  }

  generateMonthlyData(): MonthlyIrrigationData[] {
    const monthlyData: MonthlyIrrigationData[] = [
      { time: 'S1', manualQuantity: 0, mlQuantity: 0 },
      { time: 'S2', manualQuantity: 0, mlQuantity: 0 },
      { time: 'S3', manualQuantity: 0, mlQuantity: 0 },
      { time: 'S4', manualQuantity: 0, mlQuantity: 0 }
    ];

    const today = new Date();

    this.irrigationHistory.forEach(irrigation => {
      const irrigationDate = new Date(irrigation.timestamp);
      if (irrigationDate.getMonth() === today.getMonth() && irrigationDate.getFullYear() === today.getFullYear()) {
        const weekIndex = Math.floor((irrigationDate.getDate() - 1) / 7);
        if (weekIndex < 4) {
          if (irrigation.type === 'manual') {
            monthlyData[weekIndex].manualQuantity += irrigation.volume_m3;
          } else {
            monthlyData[weekIndex].mlQuantity += irrigation.volume_m3;
          }
        }
      }
    });

    return monthlyData;
  }

  generateChartData() {
    return {
      daily: this.generateDailyData(),
      weekly: this.generateWeeklyData(),
      monthly: this.generateMonthlyData()
    };
  }

  getCurrentIrrigationStatus() {
    const recent = this.irrigationHistory.slice(-1)[0];
    return recent ? {
      isActive: true,
      lastVolume: recent.volume_m3,
      lastDuration: recent.duree_minutes,
      source: recent.source,
      type: recent.type
    } : { isActive: false };
  }
}

export const irrigationDataService = new IrrigationDataService();
export type { IrrigationData, DailyIrrigationData, WeeklyIrrigationData, MonthlyIrrigationData };
