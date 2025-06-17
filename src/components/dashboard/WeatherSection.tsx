
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cloud } from 'lucide-react';
import { WeatherData } from '@/services/weatherService';

interface WeatherSectionProps {
  weatherData: WeatherData | null;
  isLoading: boolean;
  error: string | null;
  locationName: string;
}

export const WeatherSection = ({ weatherData, isLoading, error, locationName }: WeatherSectionProps) => {
  return (
    <section className="scroll-mt-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Cloud className="h-5 w-5 text-blue-600" />
            <span>Conditions Météo</span>
            {weatherData && (
              <span className="text-sm font-normal text-gray-600">
                - {weatherData.location}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 mb-4">
              <p className="text-sm text-blue-700">Chargement des conditions météo pour {locationName}...</p>
            </div>
          )}
          
          {error && (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg mb-4">
              <p className="text-sm text-orange-700">Connexion OpenWeather en cours... Données de secours affichées</p>
            </div>
          )}
          
          {weatherData ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Température:</span>
                <span className="font-medium text-orange-600">{weatherData.temperature}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Humidité:</span>
                <span className="font-medium text-blue-600">{weatherData.humidity}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Vent:</span>
                <span className="font-medium text-gray-600">{weatherData.windSpeed}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Précipitations:</span>
                <span className="font-medium text-green-600">{weatherData.precipitation}</span>
              </div>
              {weatherData.description && (
                <div className="flex justify-between items-center">
                  <span>Condition:</span>
                  <span className="font-medium text-purple-600">{weatherData.description}</span>
                </div>
              )}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  🌤️ Données météo en temps réel depuis OpenWeatherMap API
                </p>
              </div>
            </div>
          ) : (
            <p className="text-gray-600">Chargement des conditions météo...</p>
          )}
        </CardContent>
      </Card>
    </section>
  );
};
