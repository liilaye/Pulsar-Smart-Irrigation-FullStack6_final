
interface ActiveUser {
  id: number;
  prenom: string;
  nom: string;
  role: string;
  region: string;
  localite: string;
  superficie: number;
  systeme_irrigation: string;
  type_sol: string;
  type_culture: string;
  speculation: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

class ActiveUserService {
  private storageKey = 'activeUserId';
  private currentUser: ActiveUser | null = null;
  private listeners: ((user: ActiveUser | null) => void)[] = [];

  // Définir l'utilisateur actif
  setActiveUser(user: ActiveUser) {
    this.currentUser = user;
    localStorage.setItem(this.storageKey, user.id.toString());
    this.notifyListeners();
    console.log('👤 Utilisateur actif défini:', user.prenom, user.nom);
  }

  // Obtenir l'utilisateur actif
  getActiveUser(): ActiveUser | null {
    return this.currentUser;
  }

  // Obtenir l'ID de l'utilisateur actif depuis localStorage
  getActiveUserId(): number | null {
    const id = localStorage.getItem(this.storageKey);
    return id ? parseInt(id) : null;
  }

  // Effacer l'utilisateur actif
  clearActiveUser() {
    this.currentUser = null;
    localStorage.removeItem(this.storageKey);
    this.notifyListeners();
    console.log('👤 Utilisateur actif effacé');
  }

  // S'abonner aux changements d'utilisateur actif
  subscribe(listener: (user: ActiveUser | null) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notifier tous les listeners
  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.currentUser));
  }

  // Charger l'utilisateur depuis l'API
  async loadActiveUserFromAPI(): Promise<void> {
    const userId = this.getActiveUserId();
    if (!userId) return;

    try {
      const response = await fetch(`/api/actors/${userId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.actor) {
          this.currentUser = data.actor;
          this.notifyListeners();
          console.log('✅ Utilisateur actif chargé depuis l\'API:', data.actor);
        }
      }
    } catch (error) {
      console.error('❌ Erreur chargement utilisateur actif:', error);
    }
  }

  // Obtenir les données pour les paramètres agro-climatiques
  getAgroClimateData() {
    if (!this.currentUser) return null;

    return {
      region: this.currentUser.region,
      localite: this.currentUser.localite,
      superficie: this.currentUser.superficie,
      systeme_irrigation: this.currentUser.systeme_irrigation,
      type_sol: this.currentUser.type_sol,
      type_culture: this.getCultureLabel(this.currentUser.type_culture),
      speculation: this.currentUser.speculation,
      coordinates: this.currentUser.coordinates
    };
  }

  private getCultureLabel(type: string): string {
    const types = {
      '1': 'Légumes maraîchers',
      '2': 'Céréales', 
      '3': 'Légumineuses',
      '4': 'Cultures fruitières'
    };
    return types[type as keyof typeof types] || 'Non défini';
  }
}

export const activeUserService = new ActiveUserService();
export type { ActiveUser };
