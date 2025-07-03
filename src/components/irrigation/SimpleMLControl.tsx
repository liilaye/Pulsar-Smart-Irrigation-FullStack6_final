
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { User } from 'lucide-react';
import { useMQTT } from '@/hooks/useMQTT';
import { useIrrigationStatus } from '@/hooks/useIrrigationStatus';
import { MLParametersDisplay } from './MLParametersDisplay';
import { backendService } from '@/services/backendService';
import { activeUserService, ActiveUser } from '@/services/activeUserService';
import { dynamicWeatherService } from '@/services/dynamicWeatherService';
import { toast } from "sonner";

interface MLRecommendation {
  duree_minutes: number;
  volume_eau_m3: number;
  matt: string;
  status: string;
}

export const SimpleMLControl = () => {
  const [activeUser, setActiveUser] = useState<ActiveUser | null>(null);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [recommendation, setRecommendation] = useState<MLRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastAction, setLastAction] = useState<string>('');
  const { isConnected } = useMQTT();
  const irrigationStatus = useIrrigationStatus();

  // Synchroniser l'état local avec le statut du backend
  const isActive = irrigationStatus.isActive && irrigationStatus.type === 'ml';

  // S'abonner aux changements d'utilisateur actif
  useEffect(() => {
    const unsubscribe = activeUserService.subscribe((user) => {
      setActiveUser(user);
      if (user) {
        setLastAction(`Utilisateur sélectionné: ${user.prenom} ${user.nom} (${user.localite})`);
      } else {
        setLastAction('Aucun utilisateur sélectionné');
        setRecommendation(null);
      }
    });

    setActiveUser(activeUserService.getActiveUser());
    return unsubscribe;
  }, []);

  // Charger les données météo de l'utilisateur actif
  useEffect(() => {
    const loadUserWeatherData = async () => {
      if (!activeUser) {
        setWeatherData(null);
        return;
      }

      try {
        console.log(`🌤️ Chargement météo ML pour ${activeUser.prenom} ${activeUser.nom} à ${activeUser.localite}`);
        const data = await dynamicWeatherService.getCurrentUserWeather();
        setWeatherData(data);
        console.log('✅ Données météo ML chargées:', data);
      } catch (error) {
        console.error('❌ Erreur chargement météo ML utilisateur:', error);
      }
    };

    loadUserWeatherData();
  }, [activeUser]);

  // Générer les features personnalisées pour l'utilisateur actif
  const generatePersonalizedFeatures = () => {
    const features = backendService.getDefaultSoilClimateFeatures();
    
    if (activeUser) {
      // Adapter selon le type de sol de l'utilisateur
      const typeSolMapping: { [key: string]: number } = {
        'sableux': 1,
        'argileux': 2,
        'limoneux': 3,
        'humifère': 4
      };
      features[14] = typeSolMapping[activeUser.type_sol.toLowerCase()] || 2;
      
      // Adapter selon le type de culture
      const typeCultureMapping: { [key: string]: number } = {
        '1': 1, // Légumes maraîchers
        '2': 2, // Céréales
        '3': 3, // Légumineuses
        '4': 4  // Cultures fruitières
      };
      features[4] = typeCultureMapping[activeUser.type_culture] || 1;
      
      // Adapter la superficie (en m²)
      features[5] = activeUser.superficie;
      
      console.log(`🤖 Features personnalisées pour ${activeUser.prenom} ${activeUser.nom}:`, {
        type_sol: activeUser.type_sol,
        type_culture: activeUser.type_culture,
        superficie: activeUser.superficie,
        localite: activeUser.localite
      });
    }
    
    if (weatherData) {
      const temp = parseFloat(weatherData.temperature.replace('°C', ''));
      const humidity = parseFloat(weatherData.humidity.replace('%', ''));
      const windSpeed = parseFloat(weatherData.windSpeed.replace(' km/h', ''));
      const precipitation = parseFloat(weatherData.precipitation.replace(' mm', ''));
      
      features[0] = temp;        // Température_air_(°C)
      features[1] = precipitation; // Précipitation_(mm)
      features[2] = humidity;     // Humidité_air_(%)
      features[3] = windSpeed;    // Vent_moyen_(km/h)
      
      console.log(`🌤️ Conditions météo ML intégrées pour ${activeUser?.localite}:`, {
        temperature: temp,
        humidity: humidity,
        windSpeed: windSpeed,
        precipitation: precipitation
      });
    }
    
    return features;
  };

  useEffect(() => {
    if (!irrigationStatus.isActive && isActive !== irrigationStatus.isActive) {
      setLastAction('Irrigation ML terminée automatiquement');
    }
  }, [irrigationStatus.isActive, isActive]);

  // Générer une recommandation ML personnalisée sans démarrer l'irrigation
  const generateMLRecommendation = async () => {
    if (!activeUser) {
      setLastAction('Sélectionnez un utilisateur pour les recommandations ML personnalisées');
      toast.error("Utilisateur requis", {
        description: "Sélectionnez un acteur agricole pour des recommandations ML personnalisées"
      });
      return;
    }

    setIsLoading(true);
    setLastAction(`Génération recommandation ML personnalisée pour ${activeUser.prenom} ${activeUser.nom}...`);

    try {
      console.log(`🤖 Génération recommandation ML personnalisée pour ${activeUser.prenom} ${activeUser.nom}`);
      const features = generatePersonalizedFeatures();
      const response = await backendService.getMLRecommendation(features);
      
      if (response && response.status === 'ok') {
        setRecommendation(response);
        setLastAction(`Recommandation ML générée pour ${activeUser.localite}: ${Math.floor(response.duree_minutes)} min`);
        toast.success("Recommandation ML personnalisée générée", {
          description: `Pour ${activeUser.prenom} ${activeUser.nom} - ${Math.floor(response.duree_minutes)} minutes optimisées`
        });
      } else {
        throw new Error('Réponse ML invalide');
      }
    } catch (error) {
      console.error('❌ Erreur génération recommandation ML personnalisée:', error);
      setLastAction('Erreur génération recommandation ML personnalisée');
      toast.error("Erreur recommandation ML", {
        description: "Impossible de générer la recommandation ML personnalisée"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Démarrer l'irrigation ML avec la recommandation personnalisée existante
  const handleStartML = async () => {
    if (!activeUser) {
      toast.error("Utilisateur requis", {
        description: "Sélectionnez un acteur agricole pour l'irrigation ML personnalisée"
      });
      return;
    }

    if (!recommendation) {
      // Si pas de recommandation, la générer d'abord
      await generateMLRecommendation();
      return;
    }

    setIsLoading(true);
    setLastAction(`Démarrage irrigation ML personnalisée pour ${activeUser.prenom} ${activeUser.nom}...`);

    try {
      console.log(`🤖 GÉNÉRATION PRÉDICTION ML personnalisée pour ${activeUser.prenom} ${activeUser.nom} (SANS auto-start)`);
      const features = generatePersonalizedFeatures();
      const response = await backendService.arroserAvecML(features);
      
      if (response && response.status === 'ok') {
        // IMPORTANT: Plus de vérification auto_irrigation ou mqtt_started
        // On affiche seulement la prédiction - AUCUN déclenchement automatique
        setLastAction(`Prédiction ML générée pour ${activeUser.localite}: ${Math.floor(response.duree_minutes)} min (VALIDATION ADMIN REQUISE)`);
        toast.success("Prédiction ML personnalisée générée", {
          description: `Pour ${activeUser.prenom} ${activeUser.nom} - ${Math.floor(response.duree_minutes)} min recommandées (Cliquez Démarrer pour valider)`
        });
      } else {
        setLastAction('Erreur génération prédiction ML personnalisée');
        toast.error("Erreur génération prédiction ML personnalisée", {
          description: response?.matt || "Impossible de générer la prédiction ML personnalisée"
        });
      }
    } catch (error) {
      console.error('❌ Erreur prédiction ML personnalisée:', error);
      setLastAction('Erreur système ML personnalisé');
      toast.error("Erreur système ML personnalisé", {
        description: "Problème de communication avec le backend"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopML = async () => {
    setIsLoading(true);
    setLastAction('Arrêt irrigation ML...');
    
    try {
      console.log('⏹️ Arrêt irrigation ML');
      const response = await backendService.stopIrrigation();
      
      if (response.success) {
        setLastAction('Irrigation ML arrêtée');
        toast.success("Irrigation ML arrêtée");
      } else {
        setLastAction('Erreur d\'arrêt ML');
        toast.error("Erreur", {
          description: response.message || "Impossible d'arrêter l'irrigation ML"
        });
      }
    } catch (error) {
      console.error('❌ Erreur arrêt irrigation ML:', error);
      setLastAction('Erreur de communication');
      toast.error("Erreur de communication");
    } finally {
      setIsLoading(false);
    }
  };

  // ÉLIMINATION AUTO-GÉNÉRATION : Ne plus auto-générer de recommandation
  // Cette fonction causait le déclenchement automatique lors des changements d'acteurs
  // useEffect(() => {
  //   if (isConnected && activeUser && weatherData && !recommendation && !isLoading) {
  //     generateMLRecommendation();
  //   }
  // }, [isConnected, activeUser, weatherData]);

  if (!activeUser) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>Irrigation Intelligente ML</span>
            <Badge variant="secondary">Personnalisée</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun utilisateur sélectionné
            </h3>
            <p className="text-gray-600">
              Sélectionnez un acteur agricole pour des recommandations ML personnalisées
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-gradient-to-br from-blue-50 to-sky-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span>Irrigation Intelligente ML</span>
            <Badge variant="secondary">Personnalisée</Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">{activeUser.localite}</Badge>
            <Badge variant="outline">{activeUser.speculation}</Badge>
            <div className={`w-3 h-3 rounded-full ${
              isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
            }`}></div>
          </div>
        </CardTitle>
        <p className="text-sm text-gray-600">
          Pour {activeUser.prenom} {activeUser.nom} - {(activeUser.superficie / 10000).toFixed(2)} ha - Sol {activeUser.type_sol}
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Recommandation ML personnalisée actuelle */}
        {recommendation && (
          <div className="p-4 bg-white rounded-lg border border-blue-200 shadow-sm">
            <h4 className="font-semibold text-blue-800 mb-2">Recommandation IA Personnalisée</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700">Durée optimisée:</span>
                <span className="font-medium">{Math.floor(recommendation.duree_minutes)} min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Volume adapté:</span>
                <span className="font-medium">{recommendation.volume_eau_m3?.toFixed(2)} m³</span>
              </div>
            </div>
            <p className="text-xs text-blue-600 mt-2">
              {recommendation.matt}
            </p>
          </div>
        )}

        {/* Conditions spécifiques à l'utilisateur */}
        {weatherData && (
          <div className="p-3 bg-sky-50 rounded-lg border border-sky-200">
            <div className="text-sm text-sky-700">
              <strong>Conditions {activeUser.localite}:</strong> {weatherData.temperature}, 
              Humidité: {weatherData.humidity}, Précipitations: {weatherData.precipitation}
            </div>
          </div>
        )}

        {/* Affichage des paramètres agro-climatiques pendant irrigation ML */}
        {isActive && recommendation && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 flex items-center gap-2">
              🚿 Irrigation ML Personnalisée en Cours
            </h4>
            <div className="mt-3 p-3 bg-white rounded border border-blue-100">
              <div className="text-sm">
                <strong>Prédiction appliquée:</strong> {Math.floor(recommendation.duree_minutes)} minutes
                pour {(recommendation.volume_eau_m3 * 1000)?.toFixed(0)} litres d'eau
              </div>
              <div className="text-xs text-blue-600 mt-1">
                {recommendation.matt}
              </div>
            </div>
          </div>
        )}

        <Separator />

        {/* Contrôles ML personnalisés */}
        <div className="space-y-4">
          <div className="flex gap-4">
            <Button
              onClick={handleStartML}
              disabled={!isConnected || isLoading || isActive}
              variant="default"
              size="lg"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isLoading && !isActive ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <span className="mr-2">🤖</span>
              )}
              {recommendation ? 'Démarrer ML Personnalisé' : 'Générer & Démarrer ML'}
            </Button>
            
            <Button
              onClick={handleStopML}
              disabled={!isConnected || isLoading || !isActive}
              variant="destructive"
              size="lg"
              className="flex-1"
            >
              {isLoading && isActive ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <span className="mr-2">🛑</span>
              )}
              Arrêter ML
            </Button>
          </div>
          
          {/* Statut */}
          <div className="text-center">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              isActive ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
            }`}>
              {isActive ? 'IRRIGATION ML PERSONNALISÉE ACTIVE' : 'IRRIGATION ML ARRÊTÉE'}
            </div>
            {lastAction && (
              <div className="text-xs text-gray-500 mt-2">
                {lastAction}
              </div>
            )}
          </div>
        </div>

        {/* Informations système personnalisées */}
        <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex justify-between">
              <span>Profil:</span>
              <span className="text-blue-600">
                {activeUser.prenom} {activeUser.nom}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Localité:</span>
              <span className="text-sky-600">{activeUser.localite}</span>
            </div>
            <div className="flex justify-between">
              <span>Sol:</span>
              <span className="text-green-600">{activeUser.type_sol}</span>
            </div>
            <div className="flex justify-between">
              <span>IA:</span>
              <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
                {isConnected ? 'Personnalisée Prête' : 'Indisponible'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
