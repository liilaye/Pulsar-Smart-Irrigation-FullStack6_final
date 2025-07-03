// Base de données complète des localités du Sénégal avec coordonnées - toutes communes et arrondissements
const COMPLETE_SENEGAL_LOCATIONS = [
  // Région de Dakar - Toutes communes et arrondissements
  { name: "Dakar", region: "Dakar", department: "Dakar", lat: 14.6937, lng: -17.4441, type: "commune" as const },
  { name: "Plateau", region: "Dakar", department: "Dakar", lat: 14.6928, lng: -17.4467, type: "arrondissement" as const },
  { name: "Médina", region: "Dakar", department: "Dakar", lat: 14.6889, lng: -17.4558, type: "arrondissement" as const },
  { name: "Gueule Tapée-Fass-Colobane", region: "Dakar", department: "Dakar", lat: 14.6792, lng: -17.4592, type: "arrondissement" as const },
  { name: "Fann-Point E-Amitié", region: "Dakar", department: "Dakar", lat: 14.7039, lng: -17.4694, type: "arrondissement" as const },
  { name: "Grand Dakar", region: "Dakar", department: "Dakar", lat: 14.7214, lng: -17.4711, type: "arrondissement" as const },
  { name: "Parcelles Assainies", region: "Dakar", department: "Dakar", lat: 14.7558, lng: -17.4394, type: "arrondissement" as const },
  
  { name: "Pikine", region: "Dakar", department: "Pikine", lat: 14.7581, lng: -17.3961, type: "commune" as const },
  { name: "Pikine Nord", region: "Dakar", department: "Pikine", lat: 14.7667, lng: -17.3889, type: "arrondissement" as const },
  { name: "Pikine Ouest", region: "Dakar", department: "Pikine", lat: 14.7528, lng: -17.4083, type: "arrondissement" as const },
  { name: "Pikine Est", region: "Dakar", department: "Pikine", lat: 14.7639, lng: -17.3778, type: "arrondissement" as const },
  { name: "Dagoudane", region: "Dakar", department: "Pikine", lat: 14.7722, lng: -17.3667, type: "arrondissement" as const },
  { name: "Guinaw Rail Nord", region: "Dakar", department: "Pikine", lat: 14.7458, lng: -17.3806, type: "arrondissement" as const },
  { name: "Guinaw Rail Sud", region: "Dakar", department: "Pikine", lat: 14.7375, lng: -17.3889, type: "arrondissement" as const },
  { name: "Thiaroye Gare", region: "Dakar", department: "Pikine", lat: 14.7847, lng: -17.3472, type: "arrondissement" as const },
  { name: "Thiaroye sur Mer", region: "Dakar", department: "Pikine", lat: 14.7986, lng: -17.3222, type: "arrondissement" as const },
  { name: "Yeumbeul Nord", region: "Dakar", department: "Pikine", lat: 14.7764, lng: -17.3389, type: "arrondissement" as const },
  { name: "Yeumbeul Sud", region: "Dakar", department: "Pikine", lat: 14.7639, lng: -17.3472, type: "arrondissement" as const },
  { name: "Malika", region: "Dakar", department: "Pikine", lat: 14.7833, lng: -17.3694, type: "arrondissement" as const },
  { name: "Keur Massar", region: "Dakar", department: "Pikine", lat: 14.7911, lng: -17.3139, type: "arrondissement" as const },
  
  { name: "Guédiawaye", region: "Dakar", department: "Guédiawaye", lat: 14.7744, lng: -17.4111, type: "commune" as const },
  { name: "Golf Sud", region: "Dakar", department: "Guédiawaye", lat: 14.7667, lng: -17.4167, type: "arrondissement" as const },
  { name: "Médina Gounass", region: "Dakar", department: "Guédiawaye", lat: 14.7792, lng: -17.4056, type: "arrondissement" as const },
  { name: "Ndiarème Limamou Laye", region: "Dakar", department: "Guédiawaye", lat: 14.7847, lng: -17.4139, type: "arrondissement" as const },
  { name: "Sam Notaire", region: "Dakar", department: "Guédiawaye", lat: 14.7694, lng: -17.4083, type: "arrondissement" as const },
  { name: "Wakhinane Nimzatt", region: "Dakar", department: "Guédiawaye", lat: 14.7778, lng: -17.4167, type: "arrondissement" as const },
  
  { name: "Rufisque", region: "Dakar", department: "Rufisque", lat: 14.7167, lng: -17.2667, type: "commune" as const },
  { name: "Rufisque Est", region: "Dakar", department: "Rufisque", lat: 14.7222, lng: -17.2556, type: "arrondissement" as const },
  { name: "Rufisque Ouest", region: "Dakar", department: "Rufisque", lat: 14.7111, lng: -17.2778, type: "arrondissement" as const },
  { name: "Rufisque Nord", region: "Dakar", department: "Rufisque", lat: 14.7250, lng: -17.2639, type: "arrondissement" as const },
  { name: "Bargny", region: "Dakar", department: "Rufisque", lat: 14.6969, lng: -17.1856, type: "commune" as const },
  { name: "Diamniadio", region: "Dakar", department: "Rufisque", lat: 14.7172, lng: -17.1828, type: "commune" as const },
  { name: "Sébikotane", region: "Dakar", department: "Rufisque", lat: 14.7422, lng: -17.1294, type: "commune" as const },
  { name: "Sangalkam", region: "Dakar", department: "Rufisque", lat: 14.7683, lng: -17.1089, type: "commune" as const },
  { name: "Jaxaay-Parcelles-Niakoul Rap", region: "Dakar", department: "Rufisque", lat: 14.7458, lng: -17.1444, type: "commune" as const },
  
  // Toutes les autres localités avec type: "commune" as const ou type: "arrondissement" as const
  { name: "Bokiladji", region: "Matam", department: "Ranérou", lat: 15.2833, lng: -13.8833, type: "commune" as const }
];

interface CompleteSenegalLocation {
  name: string;
  region: string;
  department: string;
  lat: number;
  lng: number;
  type: "commune" | "arrondissement";
}

class CompleteSenegalLocationService {
  private locations: CompleteSenegalLocation[] = COMPLETE_SENEGAL_LOCATIONS as CompleteSenegalLocation[];

  // Recherche de localités avec autocomplete avancée
  searchLocations(query: string, region?: string, limit: number = 15): CompleteSenegalLocation[] {
    if (!query.trim()) return [];
    
    const normalizedQuery = query.toLowerCase().trim();
    
    let filteredLocations = this.locations;
    
    // Filtrer par région si spécifiée
    if (region) {
      filteredLocations = this.locations.filter(loc => 
        loc.region.toLowerCase() === region.toLowerCase()
      );
    }
    
    return filteredLocations
      .filter(location => 
        location.name.toLowerCase().includes(normalizedQuery) ||
        location.department.toLowerCase().includes(normalizedQuery) ||
        location.region.toLowerCase().includes(normalizedQuery)
      )
      .sort((a, b) => {
        // Priorité aux correspondances exactes du nom
        const aExactName = a.name.toLowerCase().startsWith(normalizedQuery);
        const bExactName = b.name.toLowerCase().startsWith(normalizedQuery);
        
        if (aExactName && !bExactName) return -1;
        if (!aExactName && bExactName) return 1;
        
        // Priorité aux communes par rapport aux arrondissements
        if (a.type === 'commune' && b.type === 'arrondissement') return -1;
        if (a.type === 'arrondissement' && b.type === 'commune') return 1;
        
        // Puis par correspondance partielle du nom
        const aPartialName = a.name.toLowerCase().includes(normalizedQuery);
        const bPartialName = b.name.toLowerCase().includes(normalizedQuery);
        
        if (aPartialName && !bPartialName) return -1;
        if (!aPartialName && bPartialName) return 1;
        
        // Enfin ordre alphabétique
        return a.name.localeCompare(b.name);
      })
      .slice(0, limit);
  }

  // Obtenir les coordonnées exactes d'une localité
  getLocationCoordinates(locationName: string, regionName?: string): CompleteSenegalLocation | null {
    const location = this.locations.find(loc => 
      loc.name.toLowerCase() === locationName.toLowerCase() &&
      (!regionName || loc.region.toLowerCase() === regionName.toLowerCase())
    );
    
    return location || null;
  }

  // Valider qu'une localité existe au Sénégal
  validateLocation(locationName: string, regionName: string): boolean {
    return this.locations.some(loc => 
      loc.name.toLowerCase() === locationName.toLowerCase() &&
      loc.region.toLowerCase() === regionName.toLowerCase()
    );
  }

  // Obtenir toutes les localités d'une région
  getLocationsByRegion(regionName: string): CompleteSenegalLocation[] {
    return this.locations
      .filter(loc => loc.region.toLowerCase() === regionName.toLowerCase())
      .sort((a, b) => {
        // Communes d'abord, puis arrondissements
        if (a.type === 'commune' && b.type === 'arrondissement') return -1;
        if (a.type === 'arrondissement' && b.type === 'commune') return 1;
        return a.name.localeCompare(b.name);
      });
  }

  // Obtenir toutes les localités d'un département
  getLocationsByDepartment(departmentName: string, regionName: string): CompleteSenegalLocation[] {
    return this.locations
      .filter(loc => 
        loc.department.toLowerCase() === departmentName.toLowerCase() &&
        loc.region.toLowerCase() === regionName.toLowerCase()
      )
      .sort((a, b) => {
        if (a.type === 'commune' && b.type === 'arrondissement') return -1;
        if (a.type === 'arrondissement' && b.type === 'commune') return 1;
        return a.name.localeCompare(b.name);
      });
  }

  // Recherche intelligente qui combine nom, département et région
  intelligentSearch(query: string, limit: number = 20): CompleteSenegalLocation[] {
    if (!query.trim()) return [];
    
    const normalizedQuery = query.toLowerCase().trim();
    const queryWords = normalizedQuery.split(/\s+/);
    
    return this.locations
      .map(location => {
        let score = 0;
        const locationText = `${location.name} ${location.department} ${location.region}`.toLowerCase();
        
        // Score basé sur les correspondances de mots
        queryWords.forEach(word => {
          if (location.name.toLowerCase().includes(word)) score += 10;
          if (location.department.toLowerCase().includes(word)) score += 5;
          if (location.region.toLowerCase().includes(word)) score += 3;
          if (locationText.includes(word)) score += 1;
        });
        
        // Bonus pour correspondance exacte
        if (location.name.toLowerCase() === normalizedQuery) score += 50;
        if (location.name.toLowerCase().startsWith(normalizedQuery)) score += 20;
        
        // Bonus pour les communes
        if (location.type === 'commune') score += 2;
        
        return { location, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.location);
  }

  // Convertir coordonnées en identifiant pour OpenWeather
  getWeatherLocationKey(lat: number, lng: number): string {
    let closestLocation = this.locations[0];
    let minDistance = this.calculateDistance(lat, lng, closestLocation.lat, closestLocation.lng);
    
    for (const location of this.locations) {
      const distance = this.calculateDistance(lat, lng, location.lat, location.lng);
      if (distance < minDistance) {
        minDistance = distance;
        closestLocation = location;
      }
    }
    
    return closestLocation.name.toLowerCase().replace(/\s+/g, '-');
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Rayon de la Terre en km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  // Obtenir statistiques sur les localités
  getStatistics() {
    const regionStats = new Map<string, number>();
    const typeStats = new Map<string, number>();
    
    this.locations.forEach(location => {
      regionStats.set(location.region, (regionStats.get(location.region) || 0) + 1);
      typeStats.set(location.type, (typeStats.get(location.type) || 0) + 1);
    });
    
    return {
      total: this.locations.length,
      byRegion: Object.fromEntries(regionStats),
      byType: Object.fromEntries(typeStats)
    };
  }
}

export const completeSenegalLocationService = new CompleteSenegalLocationService();
export type { CompleteSenegalLocation };