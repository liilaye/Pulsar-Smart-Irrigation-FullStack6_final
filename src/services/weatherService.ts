
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
      console.log(`🌤️ Récupération météo Flask pour: ${location}`);
      const response = await fetch(`${this.baseUrl}/weather/${location}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch weather data from Flask backend');
      }
      
      const data = await response.json();
      console.log('✅ Données météo Flask reçues:', data);
      return data;
      
    } catch (error) {
      console.error('❌ Erreur météo Flask, utilisation données de secours:', error);
      // Données de fallback
      return {
        temperature: "28°C",
        humidity: "65%",
        windSpeed: "12 km/h",
        precipitation: "2.5 mm",
        weatherIcon: "sun",
        location: location === 'thies' ? 'Thiès' : 'Taïba Ndiaye'
      };
    }
  }
}

export const weatherService = new WeatherService();
export type { WeatherData };
