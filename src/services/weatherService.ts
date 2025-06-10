
interface WeatherData {
  temperature: string;
  humidity: string;
  windSpeed: string;
  precipitation: string;
  weatherIcon: string;
  location: string;
  description?: string;
  pressure?: string;
  feels_like?: string;
  visibility?: string;
  uvIndex?: string;
  cloudCover?: string;
}

class WeatherService {
  private apiKey = 'c191a33a86795596637b7eb142c51fdd';
  private baseUrl = 'https://api.openweathermap.org/data/2.5';

  async getWeatherData(location: 'thies' | 'taiba-ndiaye' = 'thies'): Promise<WeatherData | null> {
    try {
      console.log(`🌤️ Récupération météo OpenWeather pour: ${location}`);
      
      // Mapping des villes pour le Sénégal
      const cityMapping = {
        'thies': 'Thiès,SN',
        'taiba-ndiaye': 'Taiba Ndiaye,SN'
      };
      
      const city = cityMapping[location];
      const url = `${this.baseUrl}/weather?q=${city}&appid=${this.apiKey}&units=metric&lang=fr`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Données météo OpenWeather reçues:', data);
      
      return this.formatWeatherData(data);
      
    } catch (error) {
      console.error('❌ Erreur météo OpenWeather, utilisation données de secours:', error);
      return this.getFallbackData(location);
    }
  }

  // Nouvelle méthode pour les données en temps réel
  async getRealTimeWeatherData(location: 'thies' | 'taiba-ndiaye' = 'thies'): Promise<WeatherData | null> {
    try {
      console.log(`⚡ Récupération météo temps réel OpenWeather pour: ${location}`);
      
      // Pour les données temps réel, on peut aussi récupérer les données UV
      const cityMapping = {
        'thies': 'Thiès,SN',
        'taiba-ndiaye': 'Taiba Ndiaye,SN'
      };
      
      const city = cityMapping[location];
      
      // Récupérer d'abord les données météo principales
      const weatherUrl = `${this.baseUrl}/weather?q=${city}&appid=${this.apiKey}&units=metric&lang=fr`;
      const weatherResponse = await fetch(weatherUrl);
      
      if (!weatherResponse.ok) {
        return this.getWeatherData(location);
      }
      
      const weatherData = await weatherResponse.json();
      console.log('Données météo temps réel OpenWeather:', weatherData);
      
      return this.formatWeatherData(weatherData, true);
      
    } catch (error) {
      console.error('❌ Erreur météo temps réel OpenWeather:', error);
      return this.getWeatherData(location);
    }
  }

  private formatWeatherData(data: any, isRealTime = false): WeatherData {
    // Calcul des précipitations (pluie + neige)
    let precipitation = 0;
    if (data.rain) {
      precipitation += data.rain['1h'] || 0;
    }
    if (data.snow) {
      precipitation += data.snow['1h'] || 0;
    }

    return {
      temperature: `${Math.round(data.main.temp)}°C`,
      humidity: `${data.main.humidity}%`,
      windSpeed: `${Math.round(data.wind.speed * 3.6)} km/h`,
      precipitation: `${precipitation.toFixed(1)} mm`,
      weatherIcon: this.getWeatherIcon(data.weather[0].icon),
      location: data.name,
      description: data.weather[0].description.charAt(0).toUpperCase() + data.weather[0].description.slice(1),
      pressure: `${data.main.pressure} hPa`,
      feels_like: `${Math.round(data.main.feels_like)}°C`,
      visibility: data.visibility ? `${(data.visibility / 1000).toFixed(1)} km` : 'N/A',
      cloudCover: `${data.clouds.all}%`
    };
  }

  private getWeatherIcon(iconCode: string): string {
    const iconMapping: { [key: string]: string } = {
      "01d": "sun", "01n": "moon",
      "02d": "cloud", "02n": "cloud",
      "03d": "cloud", "03n": "cloud",
      "04d": "cloud", "04n": "cloud",
      "09d": "rain", "09n": "rain",
      "10d": "rain", "10n": "rain",
      "11d": "storm", "11n": "storm",
      "13d": "snow", "13n": "snow",
      "50d": "mist", "50n": "mist"
    };
    return iconMapping[iconCode] || "sun";
  }

  private getFallbackData(location: 'thies' | 'taiba-ndiaye'): WeatherData {
    const locationNames = {
      "thies": "Thiès",
      "taiba-ndiaye": "Taïba Ndiaye"
    };
    
    // Données réalistes pour la région de Thiès
    const now = new Date();
    const month = now.getMonth() + 1;
    const isDrySeason = month >= 11 || month <= 5; // Nov-Mai
    
    const baseTemp = isDrySeason ? 28 : 25;
    const baseHumidity = isDrySeason ? 55 : 80;
    const basePrecipitation = isDrySeason ? 0.2 : 8.5;
    
    return {
      temperature: `${baseTemp + Math.floor(Math.random() * 6 - 3)}°C`,
      humidity: `${baseHumidity + Math.floor(Math.random() * 20 - 10)}%`,
      windSpeed: `${10 + Math.floor(Math.random() * 8)} km/h`,
      precipitation: `${(basePrecipitation + Math.random() * 2).toFixed(1)} mm`,
      weatherIcon: basePrecipitation > 5 ? "rain" : "sun",
      location: locationNames[location],
      description: "Données locales simulées",
      pressure: `${1012 + Math.floor(Math.random() * 10 - 5)} hPa`,
      feels_like: `${baseTemp + Math.floor(Math.random() * 4 - 2)}°C`,
      visibility: `${(8 + Math.random() * 7).toFixed(1)} km`,
      cloudCover: `${Math.floor(Math.random() * 60)}%`
    };
  }
}

export const weatherService = new WeatherService();
export type { WeatherData };
