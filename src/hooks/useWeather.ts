
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
        // Essayer d'abord les données temps réel
        const data = await weatherService.getRealTimeWeatherData(location);
        setWeatherData(data);
      } catch (err) {
        setError('Erreur lors du chargement des données météo temps réel');
        console.error('Weather fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeather();
    
    // Actualiser toutes les 2 minutes pour le temps réel
    const interval = setInterval(fetchWeather, 2 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [location]);

  return { weatherData, isLoading, error };
};
