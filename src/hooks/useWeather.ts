
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
        const data = await weatherService.getWeatherData(location);
        setWeatherData(data);
      } catch (err) {
        setError('Erreur lors du chargement des données météo');
        console.error('Weather fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeather();
    
    // Actualiser toutes les 10 minutes
    const interval = setInterval(fetchWeather, 10 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [location]);

  return { weatherData, isLoading, error };
};
