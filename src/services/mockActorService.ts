// Service de gestion d'acteurs simulé avec stockage local
export interface Actor {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse: string;
  ville: string;
  codePostal: string;
  typeUtilisateur: 'admin' | 'utilisateur' | 'technicien';
  dateCreation: string;
  dernierAcces?: string;
  statut: 'actif' | 'inactif' | 'suspendu';
  permissions: string[];
}

class MockActorService {
  private storageKey = 'pulsar_demo_actors';
  private activeUserKey = 'pulsar_demo_active_user';

  // Acteurs par défaut pour la démo
  private defaultActors: Actor[] = [
    {
      id: 'admin_demo_1',
      nom: 'Diallo',
      prenom: 'Amadou',
      email: 'amadou.diallo@pulsar-demo.sn',
      telephone: '+221 77 123 45 67',
      adresse: '15 Avenue Bourguiba',
      ville: 'Dakar',
      codePostal: '10200',
      typeUtilisateur: 'admin',
      dateCreation: '2024-01-15T08:00:00Z',
      dernierAcces: new Date().toISOString(),
      statut: 'actif',
      permissions: ['irrigation', 'analytics', 'user_management', 'ml_control']
    },
    {
      id: 'user_demo_2',
      nom: 'Ndiaye',
      prenom: 'Fatou',
      email: 'fatou.ndiaye@pulsar-demo.sn',
      telephone: '+221 70 987 65 43',
      adresse: 'Parcelles Assainies U15',
      ville: 'Dakar',
      codePostal: '12500',
      typeUtilisateur: 'utilisateur',
      dateCreation: '2024-02-10T10:30:00Z',
      dernierAcces: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      statut: 'actif',
      permissions: ['irrigation', 'analytics']
    },
    {
      id: 'tech_demo_3',
      nom: 'Sarr',
      prenom: 'Moussa',
      email: 'moussa.sarr@pulsar-demo.sn',
      telephone: '+221 76 555 44 33',
      adresse: 'Médina, Rue 6',
      ville: 'Dakar',
      codePostal: '11000',
      typeUtilisateur: 'technicien',
      dateCreation: '2024-03-01T14:15:00Z',
      dernierAcces: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      statut: 'actif',
      permissions: ['irrigation', 'ml_control']
    }
  ];

  constructor() {
    this.initializeStorage();
  }

  private initializeStorage() {
    const stored = localStorage.getItem(this.storageKey);
    if (!stored) {
      localStorage.setItem(this.storageKey, JSON.stringify(this.defaultActors));
      console.log('🟢 [DEMO] Acteurs par défaut initialisés');
    }
  }

  async getAllActors(): Promise<Actor[]> {
    await this.simulateDelay(300);
    const stored = localStorage.getItem(this.storageKey);
    const actors = stored ? JSON.parse(stored) : this.defaultActors;
    console.log('🟢 [DEMO] Récupération de', actors.length, 'acteurs');
    return actors;
  }

  async getActorById(id: string): Promise<Actor | null> {
    await this.simulateDelay(200);
    const actors = await this.getAllActors();
    const actor = actors.find(a => a.id === id) || null;
    console.log('🟢 [DEMO] Acteur trouvé:', actor?.nom || 'Aucun');
    return actor;
  }

  async createActor(actorData: Omit<Actor, 'id' | 'dateCreation'>): Promise<Actor> {
    await this.simulateDelay(800);
    
    const newActor: Actor = {
      ...actorData,
      id: `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      dateCreation: new Date().toISOString(),
      statut: 'actif',
      permissions: this.getDefaultPermissions(actorData.typeUtilisateur)
    };

    const actors = await this.getAllActors();
    actors.push(newActor);
    localStorage.setItem(this.storageKey, JSON.stringify(actors));
    
    console.log('🟢 [DEMO] Nouvel acteur créé:', newActor.nom, newActor.prenom);
    return newActor;
  }

  async updateActor(id: string, updates: Partial<Actor>): Promise<Actor | null> {
    await this.simulateDelay(600);
    
    const actors = await this.getAllActors();
    const index = actors.findIndex(a => a.id === id);
    
    if (index === -1) {
      console.log('❌ [DEMO] Acteur non trouvé pour mise à jour:', id);
      return null;
    }

    actors[index] = { ...actors[index], ...updates };
    localStorage.setItem(this.storageKey, JSON.stringify(actors));
    
    console.log('🟢 [DEMO] Acteur mis à jour:', actors[index].nom);
    return actors[index];
  }

  async deleteActor(id: string): Promise<boolean> {
    await this.simulateDelay(500);
    
    const actors = await this.getAllActors();
    const filteredActors = actors.filter(a => a.id !== id);
    
    if (filteredActors.length === actors.length) {
      console.log('❌ [DEMO] Aucun acteur supprimé pour ID:', id);
      return false;
    }

    localStorage.setItem(this.storageKey, JSON.stringify(filteredActors));
    
    // Si l'acteur supprimé était actif, on le déselectionne
    const activeUser = this.getActiveUser();
    if (activeUser?.id === id) {
      this.setActiveUser(null);
    }
    
    console.log('🟢 [DEMO] Acteur supprimé avec succès');
    return true;
  }

  // Gestion utilisateur actif
  getActiveUser(): Actor | null {
    const stored = localStorage.getItem(this.activeUserKey);
    return stored ? JSON.parse(stored) : null;
  }

  async setActiveUser(actor: Actor | null): Promise<void> {
    await this.simulateDelay(100);
    
    if (actor) {
      // Mettre à jour le dernier accès
      await this.updateActor(actor.id, { 
        dernierAcces: new Date().toISOString() 
      });
      localStorage.setItem(this.activeUserKey, JSON.stringify(actor));
      console.log('🟢 [DEMO] Utilisateur actif défini:', actor.nom, actor.prenom);
    } else {
      localStorage.removeItem(this.activeUserKey);
      console.log('🟢 [DEMO] Aucun utilisateur actif');
    }
  }

  // Statistiques pour dashboard
  async getActorStats(): Promise<{
    total: number;
    actifs: number;
    nouveaux: number;
    parType: Record<string, number>;
  }> {
    await this.simulateDelay(400);
    
    const actors = await this.getAllActors();
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const stats = {
      total: actors.length,
      actifs: actors.filter(a => a.statut === 'actif').length,
      nouveaux: actors.filter(a => new Date(a.dateCreation) > sevenDaysAgo).length,
      parType: actors.reduce((acc, actor) => {
        acc[actor.typeUtilisateur] = (acc[actor.typeUtilisateur] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
    
    console.log('🟢 [DEMO] Statistiques acteurs:', stats);
    return stats;
  }

  // Permissions par défaut selon le type
  private getDefaultPermissions(type: Actor['typeUtilisateur']): string[] {
    switch (type) {
      case 'admin':
        return ['irrigation', 'analytics', 'user_management', 'ml_control', 'system_config'];
      case 'technicien':
        return ['irrigation', 'analytics', 'ml_control'];
      case 'utilisateur':
      default:
        return ['irrigation', 'analytics'];
    }
  }

  private async simulateDelay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms + Math.random() * 300));
  }

  // Méthodes de recherche et filtrage
  async searchActors(query: string): Promise<Actor[]> {
    await this.simulateDelay(300);
    
    const actors = await this.getAllActors();
    const lowerQuery = query.toLowerCase();
    
    return actors.filter(actor => 
      actor.nom.toLowerCase().includes(lowerQuery) ||
      actor.prenom.toLowerCase().includes(lowerQuery) ||
      actor.email.toLowerCase().includes(lowerQuery) ||
      actor.ville.toLowerCase().includes(lowerQuery)
    );
  }

  async getActorsByType(type: Actor['typeUtilisateur']): Promise<Actor[]> {
    await this.simulateDelay(250);
    const actors = await this.getAllActors();
    return actors.filter(actor => actor.typeUtilisateur === type);
  }

  // Validation d'email unique
  async isEmailUnique(email: string, excludeId?: string): Promise<boolean> {
    await this.simulateDelay(200);
    const actors = await this.getAllActors();
    return !actors.some(actor => 
      actor.email.toLowerCase() === email.toLowerCase() && 
      actor.id !== excludeId
    );
  }
}

export const mockActorService = new MockActorService();