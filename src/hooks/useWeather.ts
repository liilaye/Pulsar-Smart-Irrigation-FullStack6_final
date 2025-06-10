
import { useState, useEffect } from 'react';
import { weatherService, WeatherData } from '@/services/weatherService';

export const useWeather = (location: 'thies' | 'taiba-ndiaye' = 'thies') => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log(`🌤️ Fetch OpenWeather données pour ${location}`);
        const data = await weatherService.getRealTimeWeatherData(location);
        
        if (data) {
          setWeatherData(data);
          console.log(`✅ Données OpenWeather chargées pour ${location}:`, data);
        } else {
          throw new Error('Aucune donnée météo reçue');
        }
      } catch (err) {
        console.error('❌ Erreur lors du chargement des données météo OpenWeather:', err);
        setError('Erreur de connexion OpenWeather - Utilisation des données de secours');
        
        // Essayer les données de secours
        try {
          const fallbackData = await weatherService.getWeatherData(location);
          setWeatherData(fallbackData);
        } catch (fallbackErr) {
          console.error('❌ Erreur données de secours:', fallbackErr);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeather();
    
    // Actualiser toutes les 2 minutes pour les données temps réel OpenWeather
    const interval = setInterval(fetchWeather, 2 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [location]);

  return { weatherData, isLoading, error };
};
