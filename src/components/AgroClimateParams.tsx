
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Cloud, Thermometer, TestTube, Leaf, MapPin, User } from 'lucide-react';
import { dynamicWeatherService } from '@/services/dynamicWeatherService';
import { activeUserService, ActiveUser } from '@/services/activeUserService';
import { WeatherData } from '@/services/weatherService';

const getWeatherIcon = (iconType: string) => {
  switch (iconType) {
    case 'sun': return '☀️';
    case 'cloud': return '☁️';
    case 'rain': return '🌧️';
    case 'storm': return '⛈️';
    case 'snow': return '❄️';
    case 'mist': return '🌫️';
    case 'moon': return '🌙';
    default: return '☀️';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'excellent': case 'optimal': return 'text-green-600 bg-green-50';
    case 'bon': case 'normal': return 'text-blue-600 bg-blue-50';
    case 'faible': return 'text-orange-600 bg-orange-50';
    default: return 'text-gray-600 bg-gray-50';
  }
};

export const AgroClimateParams = () => {
  const [activeUser, setActiveUser] = useState<ActiveUser | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // S'abonner aux changements d'utilisateur actif
    const unsubscribe = activeUserService.subscribe((user) => {
      setActiveUser(user);
      if (user) {
        loadWeatherData();
      }
    });

    // Charger l'utilisateur actuel
    const currentUser = activeUserService.getActiveUser();
    setActiveUser(currentUser);
    if (currentUser) {
      loadWeatherData();
    }
    
    return unsubscribe;
  }, []);

  const loadWeatherData = async () => {
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

  // Générer les données sol adaptées à l'utilisateur
  const getSoilData = () => {
    if (!activeUser) return [];
    
    // Données sol variables selon le type de sol de l'utilisateur
    const baseSoil = {
      'Sablo-argileux': { n: 45, p: 38, k: 152, ph: 6.8, ec: 1.2, temp: 26, hum: 42 },
      'Argileux': { n: 52, p: 42, k: 168, ph: 7.1, ec: 1.4, temp: 24, hum: 48 },
      'Sableux': { n: 38, p: 32, k: 135, ph: 6.5, ec: 0.9, temp: 28, hum: 38 },
      'Limoneux': { n: 48, p: 40, k: 158, ph: 6.9, ec: 1.3, temp: 25, hum: 45 },
      'Latéritique': { n: 35, p: 28, k: 125, ph: 6.2, ec: 0.8, temp: 29, hum: 35 }
    };
    
    const soil = baseSoil[activeUser.type_sol as keyof typeof baseSoil] || baseSoil['Sablo-argileux'];
    
    return [
      { name: "Azote (N)", value: `${soil.n} mg/kg`, unit: "mg/kg", status: soil.n > 40 ? "bon" : "faible" },
      { name: "Phosphore (P)", value: `${soil.p} mg/kg`, unit: "mg/kg", status: soil.p > 35 ? "bon" : "faible" },
      { name: "Potassium (K)", value: `${soil.k} mg/kg`, unit: "mg/kg", status: soil.k > 150 ? "excellent" : "bon" },
      { name: "Température Sol", value: `${soil.temp}°C`, unit: "°C", status: "normal" },
      { name: "Humidité Sol", value: `${soil.hum}%`, unit: "%", status: "normal" },
      { name: "Conductivité (EC)", value: `${soil.ec} dS/m`, unit: "dS/m", status: "bon" },
      { name: "pH", value: `${soil.ph}`, unit: "", status: "optimal" },
      { name: "Fertilité Sol", value: activeUser.type_sol, unit: "", status: "bon" },
    ];
  };

  // Données autres basées sur l'utilisateur actif
  const getOtherData = () => {
    if (!activeUser) return [];
    
    const getCultureLabel = (type: string) => {
      const types = {
        '1': 'Légumes maraîchers',
        '2': 'Céréales', 
        '3': 'Légumineuses',
        '4': 'Cultures fruitières'
      };
      return types[type as keyof typeof types] || 'Non défini';
    };
    
    return [
      { name: "Acteur", value: `${activeUser.prenom} ${activeUser.nom}`, unit: "", status: "optimal" },
      { name: "Type de Culture", value: getCultureLabel(activeUser.type_culture), unit: "", status: "optimal" },
      { name: "Spéculation", value: activeUser.speculation, unit: "", status: "optimal" },
      { name: "Type de Sol", value: activeUser.type_sol, unit: "", status: "bon" },
      { name: "Superficie", value: `${(activeUser.superficie / 10000).toFixed(2)} ha`, unit: "", status: "normal" },
      { name: "Système d'irrigation", value: activeUser.systeme_irrigation, unit: "", status: "bon" },
    ];
  };

  // Paramètres climatiques basés sur les données météo réelles
  const getClimateData = () => {
    if (!weatherData) return [];
    
    return [
      { name: "Température Air", value: weatherData.temperature, unit: "°C", status: "normal" },
      { name: "Humidité Air", value: weatherData.humidity, unit: "%", status: "normal" },
      { name: "Pression Atm.", value: weatherData.pressure || "N/A", unit: "hPa", status: "normal" },
      { name: "Vent Moyen", value: weatherData.windSpeed, unit: "km/h", status: "normal" },
      { name: "Précipitations", value: weatherData.precipitation, unit: "mm", status: parseFloat(weatherData.precipitation) > 5 ? "bon" : "faible" },
      { name: "Visibilité", value: weatherData.visibility || "N/A", unit: "km", status: "normal" },
    ];
  };

  if (!activeUser) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-12 text-center">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun utilisateur sélectionné
            </h3>
            <p className="text-gray-600">
              Sélectionnez un acteur agricole pour voir ses paramètres agro-climatiques
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const soilData = getSoilData();
  const otherData = getOtherData();
  const climateData = getClimateData();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Thermometer className="h-5 w-5 text-blue-600" />
              <span>Paramètres Agro-climatiques</span>
              <Badge variant="secondary">
                {activeUser.prenom} {activeUser.nom}
              </Badge>
            </div>
            {weatherData && (
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{getWeatherIcon(weatherData.weatherIcon)}</span>
                <div className="text-right">
                  <span className="text-sm font-medium text-gray-900">{weatherData.location}</span>
                  {weatherData.description && (
                    <p className="text-xs text-gray-600">{weatherData.description}</p>
                  )}
                </div>
              </div>
            )}
          </CardTitle>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2 text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>{activeUser.localite}, {activeUser.region}</span>
            </div>
            
            {weatherData && !error && (
              <Badge variant="outline" className="text-green-600 border-green-200">
                Données temps réel
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="climate" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="climate" className="flex items-center space-x-2">
                <Cloud className="h-4 w-4" />
                <span>Climatique</span>
              </TabsTrigger>
              <TabsTrigger value="soil" className="flex items-center space-x-2">
                <TestTube className="h-4 w-4" />
                <span>Sol</span>
              </TabsTrigger>
              <TabsTrigger value="other" className="flex items-center space-x-2">
                <Leaf className="h-4 w-4" />
                <span>Culture</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="climate" className="mt-4">
              {error && (
                <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-sm text-orange-700">{error} - Données de secours utilisées</p>
                </div>
              )}
              
              {isLoading && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">Chargement des données météo pour {activeUser.localite}...</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {climateData.map((param, index) => (
                  <div key={index} className={`p-3 rounded-lg border ${getStatusColor(param.status)}`}>
                    <h4 className="font-medium text-sm mb-1">{param.name}</h4>
                    <p className="text-lg font-bold">{param.value}</p>
                    <p className="text-xs capitalize">{param.status}</p>
                  </div>
                ))}
              </div>
              
              {weatherData && !error && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-700">
                    🌍 Données météo en temps réel pour la position exacte de {activeUser.localite}
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="soil" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {soilData.map((param, index) => (
                  <div key={index} className={`p-3 rounded-lg border ${getStatusColor(param.status)}`}>
                    <h4 className="font-medium text-sm">{param.name}</h4>
                    <p className="text-lg font-bold">{param.value}</p>
                    <p className="text-xs capitalize">{param.status}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600">
                  📊 Données sol adaptées au type "{activeUser.type_sol}" de la parcelle
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="other" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {otherData.map((param, index) => (
                  <div key={index} className={`p-3 rounded-lg border ${getStatusColor(param.status)}`}>
                    <h4 className="font-medium text-sm">{param.name}</h4>
                    <p className="text-lg font-bold">{param.value}</p>
                    <p className="text-xs capitalize">{param.status}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <p className="text-xs text-green-600">
                  👤 Informations personnalisées pour {activeUser.prenom} {activeUser.nom}
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgroClimateParams;
