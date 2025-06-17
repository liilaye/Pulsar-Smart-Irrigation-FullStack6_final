
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
        console.log(`🌤️ DEBUG: Hook - Tentative récupération données pour ${location}`);
        const data = await weatherService.getRealTimeWeatherData(location);
        
        if (data) {
          console.log(`🔍 DEBUG: Hook - Données reçues avec description: ${data.description}`);
          console.log(`🔍 DEBUG: Hook - isRealData dans les données: ${data.isRealData}`);
          
          setWeatherData(data);
          
          // Utiliser directement le flag isRealData des données
          const usingRealData = data.isRealData === true;
          setIsRealData(usingRealData);
          
          console.log(`🔍 DEBUG: Hook - usingRealData final: ${usingRealData}`);
          
          if (usingRealData) {
            console.log(`✅ DEBUG: Hook - Données OpenWeather temps réel confirmées pour ${location}`);
            setError(null);
          } else {
            console.log(`🔄 DEBUG: Hook - Utilisation données de secours pour ${location}`);
            setError('Données de secours utilisées'); // Signaler qu'on utilise les données de secours
          }
        } else {
          console.error('❌ DEBUG: Hook - Aucune donnée météo disponible');
          throw new Error('Aucune donnée météo disponible');
        }
      } catch (err) {
        console.error('❌ DEBUG: Hook - Erreur complète chargement météo:', err);
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

  console.log(`🔍 DEBUG: Hook - État final: isRealData=${isRealData}, error=${error}, description=${weatherData?.description}`);

  return { weatherData, isLoading, error, isRealData };
};
