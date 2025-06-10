
import requests
import os
from datetime import datetime
from config.database import log_weather

class WeatherService:
    def __init__(self):
        self.api_key = os.getenv("OPENWEATHER_API_KEY")
        self.base_url = "http://api.openweathermap.org/data/2.5/weather"
        self.last_update = None
    
    def get_weather_data(self, location):
        """Récupère les données météo pour une ville donnée"""
        if not self.api_key:
            print("⚠️ Pas de clé API OpenWeather, utilisation données de secours")
            return self._get_fallback_data(location)
        
        # Mapping des villes pour le Sénégal
        city_mapping = {
            "thies": "Thiès,SN",
            "taiba-ndiaye": "Taiba Ndiaye,SN"
        }
        
        city = city_mapping.get(location.lower(), location)
        
        try:
            url = f"{self.base_url}?q={city}&appid={self.api_key}&units=metric&lang=fr"
            print(f"🌍 Appel API météo: {url}")
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                weather_data = self._format_weather_data(data, location)
                self.last_update = datetime.now()
                
                # Log dans la base de données
                log_weather(
                    location=weather_data['location'],
                    temperature=float(weather_data['temperature'].replace('°C', '')),
                    humidity=float(weather_data['humidity'].replace('%', '')),
                    wind_speed=float(weather_data['windSpeed'].split()[0]),
                    precipitation=float(weather_data['precipitation'].replace(' mm', ''))
                )
                
                print(f"✅ Données météo API récupérées pour {city}")
                return weather_data
            else:
                print(f"⚠️ API Météo error {response.status_code}: {response.text}")
                return self._get_fallback_data(location)
                
        except Exception as e:
            print(f"❌ Erreur météo API: {e}")
            return self._get_fallback_data(location)
    
    def get_last_update_time(self):
        """Retourne l'heure de la dernière mise à jour"""
        if self.last_update:
            return self.last_update.strftime("%Y-%m-%d %H:%M:%S")
        return "Données locales"
    
    def _format_weather_data(self, data, location):
        """Formate les données météo de l'API"""
        # Calcul des précipitations (pluie + neige)
        precipitation = 0
        if 'rain' in data:
            precipitation += data['rain'].get('1h', 0)
        if 'snow' in data:
            precipitation += data['snow'].get('1h', 0)
            
        return {
            "temperature": f"{round(data['main']['temp'])}°C",
            "humidity": f"{data['main']['humidity']}%",
            "windSpeed": f"{round(data['wind']['speed'] * 3.6)} km/h",
            "precipitation": f"{precipitation:.1f} mm",
            "weatherIcon": self._get_weather_icon(data['weather'][0]['icon']),
            "location": data['name'],
            "description": data['weather'][0]['description'].title(),
            "pressure": f"{data['main']['pressure']} hPa",
            "feels_like": f"{round(data['main']['feels_like'])}°C"
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
        """Données de secours optimisées pour Thiès/Taïba Ndiaye"""
        location_names = {
            "thies": "Thiès",
            "taiba-ndiaye": "Taïba Ndiaye"
        }
        
        # Données réalistes pour la région de Thiès
        import random
        from datetime import datetime
        
        # Simulation basée sur la saison (saison sèche vs saison des pluies)
        month = datetime.now().month
        is_dry_season = month in [11, 12, 1, 2, 3, 4, 5]  # Nov-Mai
        
        if is_dry_season:
            temp = random.randint(25, 35)
            humidity = random.randint(40, 65)
            precipitation = round(random.uniform(0, 1.5), 1)
        else:  # Saison des pluies
            temp = random.randint(22, 30)
            humidity = random.randint(70, 90)
            precipitation = round(random.uniform(5, 25), 1)
        
        return {
            "temperature": f"{temp}°C",
            "humidity": f"{humidity}%",
            "windSpeed": f"{random.randint(8, 18)} km/h",
            "precipitation": f"{precipitation} mm",
            "weatherIcon": "rain" if precipitation > 5 else "sun",
            "location": location_names.get(location, location.title()),
            "description": "Données locales simulées",
            "pressure": f"{random.randint(1010, 1020)} hPa",
            "feels_like": f"{temp + random.randint(-2, 4)}°C"
        }

# Instance globale
weather_service = WeatherService()
