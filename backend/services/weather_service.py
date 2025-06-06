
import requests
import os
from config.database import log_weather

class WeatherService:
    def __init__(self):
        self.api_key = os.getenv("OPENWEATHER_API_KEY")
        self.base_url = "http://api.openweathermap.org/data/2.5/weather"
    
    def get_weather_data(self, location):
        """Récupère les données météo pour une ville donnée"""
        if not self.api_key:
            return self._get_fallback_data(location)
        
        # Mapping des villes
        city_mapping = {
            "thies": "Thiès,SN",
            "taiba-ndiaye": "Taiba Ndiaye,SN"
        }
        
        city = city_mapping.get(location.lower(), location)
        
        try:
            url = f"{self.base_url}?q={city}&appid={self.api_key}&units=metric&lang=fr"
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                weather_data = self._format_weather_data(data, location)
                
                # Log dans la base de données
                log_weather(
                    location=weather_data['location'],
                    temperature=float(weather_data['temperature'].replace('°C', '')),
                    humidity=float(weather_data['humidity'].replace('%', '')),
                    wind_speed=float(weather_data['windSpeed'].split()[0]),
                    precipitation=float(weather_data['precipitation'].replace(' mm', ''))
                )
                
                return weather_data
            else:
                print(f"⚠️ API Météo error {response.status_code}: {response.text}")
                return self._get_fallback_data(location)
                
        except Exception as e:
            print(f"❌ Erreur météo: {e}")
            return self._get_fallback_data(location)
    
    def _format_weather_data(self, data, location):
        """Formate les données météo de l'API"""
        return {
            "temperature": f"{round(data['main']['temp'])}°C",
            "humidity": f"{data['main']['humidity']}%",
            "windSpeed": f"{round(data['wind']['speed'] * 3.6)} km/h",
            "precipitation": f"{data.get('rain', {}).get('1h', 0)} mm",
            "weatherIcon": self._get_weather_icon(data['weather'][0]['icon']),
            "location": data['name']
        }
    
    def _get_weather_icon(self, icon_code):
        """Convertit le code icône OpenWeather en emoji"""
        icon_mapping = {
            "01d": "sun", "01n": "moon",
            "02d": "cloud", "02n": "cloud",
            "03d": "cloud", "03n": "cloud",
            "04d": "cloud", "04n": "cloud",
            "09d": "rain", "09n": "rain",
            "10d": "rain", "10n": "rain",
            "11d": "storm", "11n": "storm",
            "13d": "snow", "13n": "snow",
            "50d": "mist", "50n": "mist"
        }
        return icon_mapping.get(icon_code, "sun")
    
    def _get_fallback_data(self, location):
        """Données de secours si l'API échoue"""
        location_names = {
            "thies": "Thiès",
            "taiba-ndiaye": "Taïba Ndiaye"
        }
        
        return {
            "temperature": "28°C",
            "humidity": "65%",
            "windSpeed": "12 km/h",
            "precipitation": "2.5 mm",
            "weatherIcon": "sun",
            "location": location_names.get(location, location.title())
        }

# Instance globale
weather_service = WeatherService()
