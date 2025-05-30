
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Cloud, Thermometer, TestTube, Leaf, MapPin } from 'lucide-react';
import { useWeather } from '@/hooks/useWeather';

const getWeatherIcon = (iconType: string) => {
  switch (iconType) {
    case 'sun': return '☀️';
    case 'cloud': return '☁️';
    case 'rain': return '🌧️';
    case 'storm': return '⛈️';
    default: return '☀️';
  }
};

const soilData = [
  { name: "Azote (N)", value: "45 mg/kg", unit: "mg/kg", status: "bon" },
  { name: "Phosphore (P)", value: "38 mg/kg", unit: "mg/kg", status: "bon" },
  { name: "Potassium (K)", value: "152 mg/kg", unit: "mg/kg", status: "excellent" },
  { name: "Température Sol", value: "26°C", unit: "°C", status: "normal" },
  { name: "Humidité Sol", value: "42%", unit: "%", status: "normal" },
  { name: "Conductivité (EC)", value: "1.2 dS/m", unit: "dS/m", status: "bon" },
  { name: "pH", value: "6.8", unit: "", status: "optimal" },
  { name: "Fertilité Sol", value: "Bonne", unit: "", status: "bon" },
];

const otherData = [
  { name: "Type de Culture", value: "Arachide", unit: "", status: "optimal" },
  { name: "Type de Sol", value: "Sablo-argileux", unit: "", status: "bon" },
  { name: "Périmètre Parcelle", value: "2.5 ha", unit: "", status: "normal" },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'excellent': case 'optimal': return 'text-green-600 bg-green-50';
    case 'bon': case 'normal': return 'text-blue-600 bg-blue-50';
    case 'faible': return 'text-orange-600 bg-orange-50';
    default: return 'text-gray-600 bg-gray-50';
  }
};

export const AgroClimateParams = () => {
  const [selectedLocation, setSelectedLocation] = useState<'thies' | 'taiba-ndiaye'>('thies');
  const { weatherData, isLoading, error } = useWeather(selectedLocation);

  const climateData = weatherData ? [
    { name: "Température Air", value: weatherData.temperature, unit: "°C", status: "normal" },
    { name: "Humidité Air", value: weatherData.humidity, unit: "%", status: "normal" },
    { name: "Vent Moyen", value: weatherData.windSpeed, unit: "km/h", status: "normal" },
    { name: "Précipitations", value: weatherData.precipitation, unit: "mm", status: "faible" },
  ] : [
    { name: "Température Air", value: "Chargement...", unit: "°C", status: "normal" },
    { name: "Humidité Air", value: "Chargement...", unit: "%", status: "normal" },
    { name: "Vent Moyen", value: "Chargement...", unit: "km/h", status: "normal" },
    { name: "Précipitations", value: "Chargement...", unit: "mm", status: "faible" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Thermometer className="h-5 w-5 text-blue-600" />
            <span>Paramètres Agro-climatiques</span>
          </div>
          {weatherData && (
            <div className="flex items-center space-x-2 text-2xl">
              {getWeatherIcon(weatherData.weatherIcon)}
              <span className="text-sm text-gray-600">{weatherData.location}</span>
            </div>
          )}
        </CardTitle>
        
        <div className="flex items-center space-x-2">
          <Label className="text-sm">Région:</Label>
          <Select value={selectedLocation} onValueChange={(value: 'thies' | 'taiba-ndiaye') => setSelectedLocation(value)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="thies">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>Thiès</span>
                </div>
              </SelectItem>
              <SelectItem value="taiba-ndiaye">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>Taïba Ndiaye</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
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
              <span>Autres</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="climate" className="mt-4">
            {error && (
              <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm text-orange-700">⚠️ Données météo en mode local</p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {climateData.map((param, index) => (
                <div key={index} className={`p-3 rounded-lg border ${getStatusColor(param.status)}`}>
                  <h4 className="font-medium text-sm">{param.name}</h4>
                  <p className="text-lg font-bold">{param.value}</p>
                  <p className="text-xs capitalize">{param.status}</p>
                </div>
              ))}
            </div>
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
          </TabsContent>
          
          <TabsContent value="other" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {otherData.map((param, index) => (
                <div key={index} className={`p-3 rounded-lg border ${getStatusColor(param.status)}`}>
                  <h4 className="font-medium text-sm">{param.name}</h4>
                  <p className="text-lg font-bold">{param.value}</p>
                  <p className="text-xs capitalize">{param.status}</p>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
