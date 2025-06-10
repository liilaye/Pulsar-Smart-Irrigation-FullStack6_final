
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lightbulb, Sun, CloudRain, Droplets, Leaf } from 'lucide-react';

const recommendations = [
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
  },
  {
    type: "weather",
    icon: Sun,
    title: "Conditions Météo",
    description: "Temps sec prévu. Augmenter la fréquence d'irrigation de 20% pour les 3 prochains jours.",
    priority: "high",
    season: "dry"
  },
  {
    type: "harvest",
    icon: CloudRain,
    title: "Saison des Pluies",
    description: "Réduire l'irrigation automatique. Surveiller le drainage pour éviter l'excès d'humidité.",
    priority: "medium",
    season: "rainy"
  }
];

const currentSeason = "dry"; // ou "rainy" selon la période

export const Recommendations = () => {
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
            (Saison {currentSeason === 'dry' ? 'Sèche' : 'des Pluies'})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
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
          <h4 className="font-medium text-blue-800 mb-2">Bonnes Pratiques - Taiba Ndiaye</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Arroser tôt le matin (6h-8h) pour réduire l'évaporation</li>
            <li>• Maintenir un paillage autour des plants d'arachide</li>
            <li>• Surveiller les signes de stress hydrique sur les feuilles</li>
            <li>• Adapter l'irrigation selon le stade de développement</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
