
import { useState, useEffect } from 'react';
import { weatherService, WeatherData } from '@/services/weatherService';

export const useWeather = (location: 'thies' | 'taiba-ndiaye' | 'hann-maristes' | 'dakar' | 'bargny' = 'thies') => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRealData, setIsRealData] = useState(false);

  useEffect(() => {
    const fetchWeather = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log(`🌤️ Tentative récupération données OpenWeather pour ${location}`);
        const data = await weatherService.getRealTimeWeatherData(location);
        
        if (data) {
          setWeatherData(data);
          // Vérifier si ce sont des vraies données ou de secours
          const usingRealData = weatherService.isUsingRealData() && !data.description?.includes('Données locales');
          setIsRealData(usingRealData);
          
          if (usingRealData) {
            console.log(`✅ Données OpenWeather temps réel chargées pour ${location}`);
            setError(null);
          } else {
            console.log(`🔄 Utilisation données de secours pour ${location}`);
            setError('OpenWeather indisponible - Données de secours actives');
          }
        } else {
          throw new Error('Aucune donnée météo disponible');
        }
      } catch (err) {
        console.error('❌ Erreur complète chargement météo:', err);
        setError('Erreur de connexion météo');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeather();
    
    // Actualiser toutes les 2 minutes pour les données temps réel
    const interval = setInterval(fetchWeather, 2 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [location]);

  return { weatherData, isLoading, error, isRealData };
};
