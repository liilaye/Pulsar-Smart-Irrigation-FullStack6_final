
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lightbulb, Sun, CloudRain, Droplets, Leaf, User } from 'lucide-react';
import { dynamicWeatherService } from '@/services/dynamicWeatherService';
import { activeUserService, ActiveUser } from '@/services/activeUserService';
import { WeatherData } from '@/services/weatherService';

export const Recommendations = () => {
  const [activeUser, setActiveUser] = useState<ActiveUser | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // S'abonner aux changements d'utilisateur actif
    const unsubscribe = activeUserService.subscribe((user) => {
      setActiveUser(user);
      if (user) {
        loadUserWeatherData();
      } else {
        setWeatherData(null);
      }
    });

    // Charger l'utilisateur actuel
    const currentUser = activeUserService.getActiveUser();
    setActiveUser(currentUser);
    if (currentUser) {
      loadUserWeatherData();
    }
    
    return unsubscribe;
  }, []);

  const loadUserWeatherData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await dynamicWeatherService.getCurrentUserWeather();
      setWeatherData(data);
      
      if (!data) {
        setError('Impossible de récupérer les données météo');
      }
    } catch (err) {
      console.error('Erreur chargement météo:', err);
      setError('Erreur de connexion météo');
    } finally {
      setIsLoading(false);
    }
  };

  if (!activeUser) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            <span>Recommandations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun utilisateur sélectionné
            </h3>
            <p className="text-gray-600">
              Sélectionnez un acteur agricole pour voir les recommandations personnalisées
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getLocationBasedRecommendations = () => {
    if (!activeUser) return [];

    // Recommandations de base adaptées selon l'utilisateur
    const baseRecommendations = [
      {
        type: "irrigation",
        icon: Droplets,
        title: "Irrigation Recommandée",
        description: `Pour votre culture de ${activeUser.speculation} sur ${(activeUser.superficie / 10000).toFixed(2)} hectares, prévoir un arrosage adapté au sol ${activeUser.type_sol}.`,
        priority: "medium",
        season: "dry"
      },
      {
        type: "fertilization", 
        icon: Leaf,
        title: "Fertilisation",
        description: `Pour votre système ${activeUser.systeme_irrigation}, maintenir l'apport nutritif adapté à la culture de ${activeUser.speculation}.`,
        priority: "low",
        season: "all"
      }
    ];

    // Recommandations spécifiques selon les données météo et l'utilisateur
    const weatherBasedRecommendations = [];
    
    if (weatherData) {
      const temp = parseInt(weatherData.temperature);
      const humidity = parseInt(weatherData.humidity);
      const precipitation = parseFloat(weatherData.precipitation);
      
      if (temp > 30) {
        weatherBasedRecommendations.push({
          type: "weather",
          icon: Sun,
          title: "Température Élevée",
          description: `Température de ${weatherData.temperature} détectée à ${activeUser.localite}. Augmenter la fréquence d'irrigation pour votre ${activeUser.speculation}.`,
          priority: "high",
          season: "all"
        });
      }
      
      if (precipitation > 5) {
        weatherBasedRecommendations.push({
          type: "weather", 
          icon: CloudRain,
          title: "Précipitations Importantes",
          description: `Pluie de ${weatherData.precipitation} prévue à ${activeUser.localite}. Réduire l'irrigation et surveiller le drainage sur sol ${activeUser.type_sol}.`,
          priority: "medium",
          season: "all"
        });
      } else if (humidity < 50) {
        weatherBasedRecommendations.push({
          type: "weather",
          icon: Sun,
          title: "Air Sec",
          description: `Humidité faible (${weatherData.humidity}) à ${activeUser.localite}. Maintenir l'hydratation pour votre ${activeUser.speculation}.`,
          priority: "medium", 
          season: "all"
        });
      }
    }

    return [...baseRecommendations, ...weatherBasedRecommendations];
  };

  const recommendations = getLocationBasedRecommendations();
  const currentSeason = "dry"; // ou "rainy" selon la période

  const filteredRecommendations = recommendations.filter(
    rec => rec.season === "all" || rec.season === currentSeason
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'low': return 'border-green-200 bg-green-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Lightbulb className="h-5 w-5 text-yellow-600" />
          <span>Recommandations</span>
          <span className="text-sm font-normal text-gray-600">
            ({activeUser.prenom} {activeUser.nom} - {activeUser.localite})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700">Chargement des conditions météo pour {activeUser.localite}...</p>
          </div>
        )}

        {filteredRecommendations.map((rec, index) => (
          <Alert key={index} className={getPriorityColor(rec.priority)}>
            <rec.icon className="h-4 w-4" />
            <AlertDescription>
              <div>
                <h4 className="font-medium">{rec.title}</h4>
                <p className="text-sm text-gray-700 mt-1">{rec.description}</p>
              </div>
            </AlertDescription>
          </Alert>
        ))}
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">Bonnes Pratiques - {activeUser.localite}</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Arroser tôt le matin (6h-8h) pour réduire l'évaporation</li>
            <li>• Adapter l'irrigation au système {activeUser.systeme_irrigation}</li>
            <li>• Surveiller les signes de stress hydrique sur {activeUser.speculation}</li>
            <li>• Maintenir un paillage sur sol {activeUser.type_sol}</li>
            <li>• Adapter selon la superficie de {(activeUser.superficie / 10000).toFixed(2)} hectares</li>
          </ul>
        </div>

        {weatherData && !error && (
          <div className="text-xs text-green-600 bg-green-50 p-2 rounded border border-green-200">
            Recommandations personnalisées pour {activeUser.prenom} {activeUser.nom} selon les conditions météo de {activeUser.localite}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
