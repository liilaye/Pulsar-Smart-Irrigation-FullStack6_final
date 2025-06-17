
import { weatherService, WeatherData } from './weatherService';
import { activeUserService } from './activeUserService';
import { senegalLocationService } from './senegalLocationService';

class DynamicWeatherService {
  async getCurrentUserWeather(): Promise<WeatherData | null> {
    const activeUser = activeUserService.getActiveUser();
    
    if (!activeUser) {
      console.log('❌ Aucun utilisateur actif pour les données météo');
      return null;
    }

    try {
      console.log(`🌤️ Récupération météo pour ${activeUser.prenom} ${activeUser.nom} à ${activeUser.localite}`);
      
      // Utiliser les coordonnées de l'utilisateur si disponibles
      if (activeUser.coordinates) {
        return await this.getWeatherByCoordinates(
          activeUser.coordinates.lat, 
          activeUser.coordinates.lng,
          activeUser.localite
        );
      }
      
      // Sinon, obtenir les coordonnées depuis le service de localisation
      const location = senegalLocationService.getLocationCoordinates(
        activeUser.localite, 
        activeUser.region
      );
      
      if (location) {
        return await this.getWeatherByCoordinates(
          location.lat, 
          location.lng,
          activeUser.localite
        );
      }
      
      // Fallback sur le service météo standard
      const locationKey = this.getLocationKeyFromUser(activeUser);
      return await weatherService.getWeatherData(locationKey);
      
    } catch (error) {
      console.error('❌ Erreur météo utilisateur actif:', error);
      return null;
    }
  }

  private async getWeatherByCoordinates(lat: number, lng: number, locationName: string): Promise<WeatherData | null> {
    try {
      const apiKey = 'c191a33a86795596637b7eb142c51fdd';
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric&lang=fr`;
      
      console.log(`🌍 Appel API météo par coordonnées: ${lat}, ${lng}`);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Données météo par coordonnées reçues:', data);
      
      return this.formatWeatherData(data, locationName);
      
    } catch (error) {
      console.error('❌ Erreur météo par coordonnées:', error);
      return null;
    }
  }

  private formatWeatherData(data: any, locationName: string): WeatherData {
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
      location: locationName,
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

  private getLocationKeyFromUser(user: any): 'thies' | 'taiba-ndiaye' | 'hann-maristes' | 'dakar' | 'bargny' {
    const locationMapping: { [key: string]: 'thies' | 'taiba-ndiaye' | 'hann-maristes' | 'dakar' | 'bargny' } = {
      'thiès': 'thies',
      'thies': 'thies',
      'taïba ndiaye': 'taiba-ndiaye',
      'taiba ndiaye': 'taiba-ndiaye',
      'hann maristes': 'hann-maristes',
      'dakar': 'dakar',
      'bargny': 'bargny'
    };
    
    const key = user.localite.toLowerCase();
    return locationMapping[key] || 'thies';
  }
}

export const dynamicWeatherService = new DynamicWeatherService();
