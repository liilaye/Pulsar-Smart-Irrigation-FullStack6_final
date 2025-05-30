
interface WeatherData {
  temperature: string;
  humidity: string;
  windSpeed: string;
  precipitation: string;
  weatherIcon: string;
  location: string;
}

class WeatherService {
  private baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://your-deployed-api.com/api' 
    : 'http://localhost:5002/api';

  async getWeatherData(location: 'thies' | 'taiba-ndiaye' = 'thies'): Promise<WeatherData | null> {
    try {
      const response = await fetch(`${this.baseUrl}/weather/${location}`);
      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }
      return await response.json();
    } catch (error) {
      console.error('Erreur récupération météo:', error);
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
