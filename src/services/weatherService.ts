
interface WeatherData {
  temperature: string;
  humidity: string;
  windSpeed: string;
  precipitation: string;
  weatherIcon: string;
  location: string;
}

class WeatherService {
  private baseUrl = 'http://localhost:5002/api';

  async getWeatherData(location: 'thies' | 'taiba-ndiaye' = 'thies'): Promise<WeatherData | null> {
    try {
      console.log(`🌤️ Récupération météo temps réel Flask pour: ${location}`);
      const response = await fetch(`${this.baseUrl}/weather/${location}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Données météo temps réel Flask reçues:', data);
      return data;
      
    } catch (error) {
      console.error(' Erreur météo Flask, utilisation données de secours:', error);
      // Données de fallback locales pour Thiès
      return {
        temperature: "28°C",
        humidity: "65%",
        windSpeed: "12 km/h",
        precipitation: "0 mm",
        weatherIcon: "sun",
        location: location === 'thies' ? 'Thiès' : 'Taïba Ndiaye'
      };
    }
  }

  // Nouvelle méthode pour les données en temps réel
  async getRealTimeWeatherData(location: 'thies' | 'taiba-ndiaye' = 'thies'): Promise<WeatherData | null> {
    try {
      console.log(`⚡ Récupération météo temps réel pour: ${location}`);
      const response = await fetch(`${this.baseUrl}/weather/${location}/realtime`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        // Fallback vers l'endpoint normal
        return this.getWeatherData(location);
      }
      
      const data = await response.json();
      console.log('Données météo temps réel:', data);
      return data;
      
    } catch (error) {
      console.error('Erreur météo temps réel:', error);
      return this.getWeatherData(location);
    }
  }
}

export const weatherService = new WeatherService();
export type { WeatherData };
