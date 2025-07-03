import { toast } from "@/hooks/use-toast";

export interface NotificationItem {
  id: string;
  type: 'irrigation_success' | 'irrigation_ml_success' | 'recommendation' | 'weather_alert' | 'system_info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
}

class NotificationService {
  private notifications: NotificationItem[] = [];
  private subscribers: Array<(notifications: NotificationItem[]) => void> = [];

  constructor() {
    // Charger les notifications depuis localStorage
    this.loadNotifications();
  }

  private loadNotifications() {
    try {
      const stored = localStorage.getItem('pulsar_notifications');
      if (stored) {
        const notifications = JSON.parse(stored);
        this.notifications = notifications.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
      }
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
      this.notifications = [];
    }
  }

  private saveNotifications() {
    try {
      localStorage.setItem('pulsar_notifications', JSON.stringify(this.notifications));
    } catch (error) {
      console.error('Erreur sauvegarde notifications:', error);
    }
  }

  private notify() {
    this.subscribers.forEach(callback => callback([...this.notifications]));
  }

  subscribe(callback: (notifications: NotificationItem[]) => void) {
    this.subscribers.push(callback);
    callback([...this.notifications]);
    
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  addNotification(notification: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) {
    const newNotification: NotificationItem = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false
    };

    this.notifications.unshift(newNotification);
    
    // Limiter à 50 notifications
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50);
    }

    this.saveNotifications();
    this.notify();

    // Afficher toast pour notifications importantes
    if (notification.priority === 'high' || notification.priority === 'medium') {
      toast({
        title: notification.title,
        description: notification.message,
        duration: notification.priority === 'high' ? 8000 : 5000,
      });
    }

    console.log('🔔 Nouvelle notification:', notification.title);
  }

  // Notifications spécifiques pour l'irrigation
  notifyIrrigationSuccess(duration: number, method: 'manual' | 'ml', waterAmount?: number) {
    const isManual = method === 'manual';
    const title = isManual ? '💧 Irrigation Manuelle Déclenchée' : '🤖 Irrigation Intelligente Activée';
    
    let message = `Irrigation ${isManual ? 'manuelle' : 'automatique'} démarrée avec succès.`;
    message += `\nDurée: ${duration} minutes`;
    if (waterAmount) {
      message += `\nQuantité estimée: ${waterAmount.toFixed(1)} litres`;
    }
    message += `\nHeure: ${new Date().toLocaleTimeString('fr-FR')}`;

    this.addNotification({
      type: isManual ? 'irrigation_success' : 'irrigation_ml_success',
      title,
      message,
      priority: 'medium'
    });
  }

  notifyIrrigationStopped(method: 'manual' | 'ml', actualDuration?: number) {
    const isManual = method === 'manual';
    const title = isManual ? '⏹️ Irrigation Manuelle Arrêtée' : '⏹️ Irrigation Intelligente Terminée';
    
    let message = `Irrigation ${isManual ? 'manuelle' : 'automatique'} arrêtée.`;
    if (actualDuration) {
      message += `\nDurée effective: ${actualDuration} minutes`;
    }
    message += `\nHeure: ${new Date().toLocaleTimeString('fr-FR')}`;

    this.addNotification({
      type: isManual ? 'irrigation_success' : 'irrigation_ml_success',
      title,
      message,
      priority: 'low'
    });
  }

  // Notifications pour les recommandations ML
  notifyMLRecommendation(waterAmount: number, duration: number, confidence: number, factors: string[]) {
    const title = '🤖 Nouvelle Recommandation d\'Irrigation';
    const message = `L'IA recommande un arrosage de ${duration} minutes (${waterAmount.toFixed(1)} litres).
    
Confiance: ${(confidence * 100).toFixed(0)}%
Facteurs: ${factors.join(', ')}

Recommandation basée sur les conditions météo et l'analyse des données agricoles.`;

    this.addNotification({
      type: 'recommendation',
      title,
      message,
      priority: 'medium',
      actionUrl: '#ml-irrigation'
    });
  }

  // Notifications météo
  notifyWeatherAlert(condition: string, impact: string) {
    const title = '🌦️ Alerte Météorologique';
    const message = `Condition détectée: ${condition}
    
Impact agricole: ${impact}

Consultez les recommandations d'irrigation pour adapter votre stratégie.`;

    this.addNotification({
      type: 'weather_alert',
      title,
      message,
      priority: 'high',
      actionUrl: '#sensors'
    });
  }

  // Notifications système
  notifySystemInfo(title: string, message: string, priority: 'low' | 'medium' | 'high' = 'low') {
    this.addNotification({
      type: 'system_info',
      title: `ℹ️ ${title}`,
      message,
      priority
    });
  }

  // Marquer comme lu
  markAsRead(notificationId: string) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification && !notification.read) {
      notification.read = true;
      this.saveNotifications();
      this.notify();
    }
  }

  // Marquer tout comme lu
  markAllAsRead() {
    let hasChanges = false;
    this.notifications.forEach(notification => {
      if (!notification.read) {
        notification.read = true;
        hasChanges = true;
      }
    });
    
    if (hasChanges) {
      this.saveNotifications();
      this.notify();
    }
  }

  // Supprimer une notification
  removeNotification(notificationId: string) {
    const index = this.notifications.findIndex(n => n.id === notificationId);
    if (index > -1) {
      this.notifications.splice(index, 1);
      this.saveNotifications();
      this.notify();
    }
  }

  // Supprimer toutes les notifications
  clearAll() {
    this.notifications = [];
    this.saveNotifications();
    this.notify();
  }

  // Obtenir le nombre de notifications non lues
  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  // Obtenir toutes les notifications
  getNotifications(): NotificationItem[] {
    return [...this.notifications];
  }

  // Obtenir les notifications récentes (dernières 24h)
  getRecentNotifications(): NotificationItem[] {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return this.notifications.filter(n => n.timestamp > oneDayAgo);
  }

  // Nettoyer les anciennes notifications (plus de 30 jours)
  cleanupOldNotifications() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const originalLength = this.notifications.length;
    
    this.notifications = this.notifications.filter(n => n.timestamp > thirtyDaysAgo);
    
    if (this.notifications.length !== originalLength) {
      this.saveNotifications();
      this.notify();
      console.log(`🧹 Nettoyage: ${originalLength - this.notifications.length} anciennes notifications supprimées`);
    }
  }
}

export const notificationService = new NotificationService();

// Auto-cleanup des anciennes notifications au démarrage
setTimeout(() => {
  notificationService.cleanupOldNotifications();
}, 1000);