
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lightbulb, Sun, CloudRain, Droplets, Leaf } from 'lucide-react';
import { useWeather } from '@/hooks/useWeather';

export const Recommendations = ({ selectedLocation = 'thies' }: { selectedLocation?: 'thies' | 'taiba-ndiaye' | 'hann-maristes' | 'dakar' | 'bargny' }) => {
  const { weatherData, isLoading, error } = useWeather(selectedLocation);

  const getLocationBasedRecommendations = () => {
    // Recommandations de base adaptées selon la région
    const baseRecommendations = [
      {
        type: "irrigation",
        icon: Droplets,
        title: "Irrigation Recommandée",
        description: "L'humidité du sol est à 42%. Prévoir un arrosage de 30 minutes dans les prochaines 6 heures.",
        priority: "medium",
        season: "dry"
      },
      {
        type: "fertilization", 
        icon: Leaf,
        title: "Fertilisation",
        description: "Les niveaux de phosphore sont corrects. Maintenir l'apport en potassium pour une bonne croissance des gousses.",
        priority: "low",
        season: "all"
      }
    ];

    // Recommandations spécifiques selon les données météo et la région
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
          description: `Température de ${weatherData.temperature} détectée à ${weatherData.location}. Augmenter la fréquence d'irrigation de 20%.`,
          priority: "high",
          season: "all"
        });
      }
      
      if (precipitation > 5) {
        weatherBasedRecommendations.push({
          type: "weather", 
          icon: CloudRain,
          title: "Précipitations Importantes",
          description: `Pluie de ${weatherData.precipitation} prévue à ${weatherData.location}. Réduire l'irrigation et surveiller le drainage.`,
          priority: "medium",
          season: "all"
        });
      } else if (humidity < 50) {
        weatherBasedRecommendations.push({
          type: "weather",
          icon: Sun,
          title: "Air Sec",
          description: `Humidité faible (${weatherData.humidity}) à ${weatherData.location}. Maintenir l'hydratation du sol.`,
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

  const getLocationName = () => {
    const names = {
      'thies': 'Thiès',
      'taiba-ndiaye': 'Taïba Ndiaye', 
      'hann-maristes': 'Hann Maristes',
      'dakar': 'Dakar',
      'bargny': 'Bargny'
    };
    return names[selectedLocation] || 'Thiès';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Lightbulb className="h-5 w-5 text-yellow-600" />
          <span>Recommandations</span>
          <span className="text-sm font-normal text-gray-600">
            ({getLocationName()} - Saison {currentSeason === 'dry' ? 'Sèche' : 'des Pluies'})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700">Chargement des conditions météo pour {getLocationName()}...</p>
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
          <h4 className="font-medium text-blue-800 mb-2">Bonnes Pratiques - {getLocationName()}</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Arroser tôt le matin (6h-8h) pour réduire l'évaporation</li>
            <li>• Maintenir un paillage autour des plants d'arachide</li>
            <li>• Surveiller les signes de stress hydrique sur les feuilles</li>
            <li>• Adapter l'irrigation selon le stade de développement</li>
            {selectedLocation === 'bargny' || selectedLocation === 'hann-maristes' ? (
              <li>• Zone côtière: attention à la salinité de l'eau d'irrigation</li>
            ) : (
              <li>• Zone continentale: surveiller les variations thermiques</li>
            )}
          </ul>
        </div>

        {weatherData && !error && (
          <div className="text-xs text-green-600 bg-green-50 p-2 rounded border border-green-200">
            Recommandations adaptées aux conditions météo temps réel de {weatherData.location}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
