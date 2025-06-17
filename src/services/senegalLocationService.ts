
// Base de données des localités du Sénégal avec coordonnées
const SENEGAL_LOCATIONS = [
  // Région de Dakar
  { name: "Dakar", region: "Dakar", lat: 14.6937, lng: -17.4441, type: "commune" },
  { name: "Pikine", region: "Dakar", lat: 14.7581, lng: -17.3961, type: "commune" },
  { name: "Guédiawaye", region: "Dakar", lat: 14.7744, lng: -17.4111, type: "commune" },
  { name: "Rufisque", region: "Dakar", lat: 14.7167, lng: -17.2667, type: "commune" },
  { name: "Bargny", region: "Dakar", lat: 14.6969, lng: -17.1856, type: "commune" },
  
  // Région de Thiès
  { name: "Thiès", region: "Thiès", lat: 14.7886, lng: -16.9239, type: "commune" },
  { name: "Tivaouane", region: "Thiès", lat: 14.9500, lng: -16.8167, type: "commune" },
  { name: "Mbour", region: "Thiès", lat: 14.4199, lng: -16.9619, type: "commune" },
  { name: "Taïba Ndiaye", region: "Thiès", lat: 14.8833, lng: -16.6333, type: "commune" },
  { name: "Khombole", region: "Thiès", lat: 14.7667, lng: -16.6500, type: "commune" },
  
  // Région de Saint-Louis
  { name: "Saint-Louis", region: "Saint-Louis", lat: 16.0179, lng: -16.4897, type: "commune" },
  { name: "Dagana", region: "Saint-Louis", lat: 16.5167, lng: -15.5000, type: "commune" },
  { name: "Podor", region: "Saint-Louis", lat: 16.6533, lng: -14.9594, type: "commune" },
  { name: "Richard Toll", region: "Saint-Louis", lat: 16.4625, lng: -15.7019, type: "commune" },
  
  // Région de Diourbel
  { name: "Diourbel", region: "Diourbel", lat: 14.6500, lng: -16.2333, type: "commune" },
  { name: "Touba", region: "Diourbel", lat: 14.8667, lng: -15.8833, type: "commune" },
  { name: "Mbacké", region: "Diourbel", lat: 14.8000, lng: -15.9167, type: "commune" },
  { name: "Bambey", region: "Diourbel", lat: 14.7000, lng: -16.4500, type: "commune" },
  
  // Région de Louga
  { name: "Louga", region: "Louga", lat: 15.6167, lng: -16.2333, type: "commune" },
  { name: "Linguère", region: "Louga", lat: 15.3833, lng: -15.1167, type: "commune" },
  { name: "Kébémer", region: "Louga", lat: 15.0167, lng: -16.4833, type: "commune" },
  
  // Région de Fatick
  { name: "Fatick", region: "Fatick", lat: 14.3333, lng: -16.4167, type: "commune" },
  { name: "Foundiougne", region: "Fatick", lat: 14.1333, lng: -16.4667, type: "commune" },
  { name: "Gossas", region: "Fatick", lat: 14.5000, lng: -16.0667, type: "commune" },
  
  // Région de Kaolack
  { name: "Kaolack", region: "Kaolack", lat: 14.1500, lng: -16.0833, type: "commune" },
  { name: "Nioro du Rip", region: "Kaolack", lat: 13.7500, lng: -15.7833, type: "commune" },
  { name: "Guinguinéo", region: "Kaolack", lat: 14.2667, lng: -15.9500, type: "commune" },
  
  // Région de Kaffrine
  { name: "Kaffrine", region: "Kaffrine", lat: 14.1167, lng: -15.5500, type: "commune" },
  { name: "Birkelane", region: "Kaffrine", lat: 14.2167, lng: -15.6167, type: "commune" },
  { name: "Malem Hodar", region: "Kaffrine", lat: 13.8167, lng: -15.3167, type: "commune" },
  
  // Région de Tambacounda
  { name: "Tambacounda", region: "Tambacounda", lat: 13.7667, lng: -13.6667, type: "commune" },
  { name: "Bakel", region: "Tambacounda", lat: 14.9000, lng: -12.4667, type: "commune" },
  { name: "Goudiry", region: "Tambacounda", lat: 14.1833, lng: -12.7167, type: "commune" },
  
  // Région de Kédougou
  { name: "Kédougou", region: "Kédougou", lat: 12.5667, lng: -12.1833, type: "commune" },
  { name: "Saraya", region: "Kédougou", lat: 12.8167, lng: -11.7500, type: "commune" },
  { name: "Salémata", region: "Kédougou", lat: 12.9167, lng: -12.0667, type: "commune" },
  
  // Région de Kolda
  { name: "Kolda", region: "Kolda", lat: 12.8833, lng: -14.9500, type: "commune" },
  { name: "Vélingara", region: "Kolda", lat: 13.1500, lng: -14.1167, type: "commune" },
  { name: "Médina Yoro Foulah", region: "Kolda", lat: 12.8000, lng: -13.8000, type: "commune" },
  
  // Région de Ziguinchor
  { name: "Ziguinchor", region: "Ziguinchor", lat: 12.5833, lng: -16.2667, type: "commune" },
  { name: "Oussouye", region: "Ziguinchor", lat: 12.4833, lng: -16.5500, type: "commune" },
  { name: "Bignona", region: "Ziguinchor", lat: 12.8167, lng: -16.2333, type: "commune" },
  
  // Région de Sédhiou
  { name: "Sédhiou", region: "Sédhiou", lat: 12.7167, lng: -15.5667, type: "commune" },
  { name: "Bounkiling", region: "Sédhiou", lat: 12.9167, lng: -15.7333, type: "commune" },
  { name: "Goudomp", region: "Sédhiou", lat: 12.6167, lng: -15.9167, type: "commune" },
  
  // Région de Matam
  { name: "Matam", region: "Matam", lat: 15.6500, lng: -13.2500, type: "commune" },
  { name: "Kanel", region: "Matam", lat: 15.4833, lng: -13.1833, type: "commune" },
  { name: "Ranérou", region: "Matam", lat: 15.3000, lng: -13.9500, type: "commune" }
];

interface SenegalLocation {
  name: string;
  region: string;
  lat: number;
  lng: number;
  type: string;
}

class SenegalLocationService {
  private locations: SenegalLocation[] = SENEGAL_LOCATIONS;

  // Recherche de localités avec autocomplete
  searchLocations(query: string, limit: number = 10): SenegalLocation[] {
    if (!query.trim()) return [];
    
    const normalizedQuery = query.toLowerCase().trim();
    
    return this.locations
      .filter(location => 
        location.name.toLowerCase().includes(normalizedQuery) ||
        location.region.toLowerCase().includes(normalizedQuery)
      )
      .sort((a, b) => {
        // Priorité aux correspondances exactes
        const aExact = a.name.toLowerCase().startsWith(normalizedQuery);
        const bExact = b.name.toLowerCase().startsWith(normalizedQuery);
        
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        
        // Puis ordre alphabétique
        return a.name.localeCompare(b.name);
      })
      .slice(0, limit);
  }

  // Obtenir les coordonnées exactes d'une localité
  getLocationCoordinates(locationName: string, regionName?: string): SenegalLocation | null {
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
  getLocationsByRegion(regionName: string): SenegalLocation[] {
    return this.locations
      .filter(loc => loc.region.toLowerCase() === regionName.toLowerCase())
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  // Convertir coordonnées en identifiant pour OpenWeather
  getWeatherLocationKey(lat: number, lng: number): string {
    // Trouver la localité la plus proche
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
}

export const senegalLocationService = new SenegalLocationService();
export type { SenegalLocation };
