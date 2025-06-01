
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Navigation, Wifi } from 'lucide-react';

export const DeviceLocation = () => {
  // Coordonnées de Hann Maristes
  const deviceLocation = {
    lat: 14.7167,
    lng: -17.4677
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MapPin className="h-5 w-5 text-red-500" />
          <span>Localisation PulsarInfinite</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Carte statique de remplacement */}
        <div className="w-full h-64 rounded-lg border bg-gradient-to-br from-green-100 to-blue-100 relative overflow-hidden">
          {/* Fond de carte stylisé */}
          <div className="absolute inset-0 opacity-20">
            <div className="w-full h-full bg-green-200 rounded-lg"></div>
            <div className="absolute top-4 left-4 w-16 h-16 bg-blue-300 rounded-full opacity-60"></div>
            <div className="absolute bottom-8 right-6 w-12 h-12 bg-green-300 rounded-full opacity-40"></div>
            <div className="absolute top-12 right-8 w-8 h-8 bg-blue-400 rounded-full opacity-50"></div>
          </div>
          
          {/* Zone d'irrigation (cercle bleu) */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-20 h-20 border-4 border-blue-500 border-opacity-60 rounded-full bg-blue-100 bg-opacity-30 flex items-center justify-center">
              {/* Marqueur du boîtier */}
              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
          
          {/* Légende */}
          <div className="absolute bottom-2 left-2 bg-white bg-opacity-90 rounded-lg p-2 text-xs">
            <div className="flex items-center space-x-1 mb-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Boîtier PulsarInfinite</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 border-2 border-blue-500 rounded-full"></div>
              <span>Zone irrigation (50m)</span>
            </div>
          </div>
          
          {/* Indicateur de direction */}
          <div className="absolute top-2 right-2 bg-white bg-opacity-90 rounded-full p-2">
            <Navigation className="h-4 w-4 text-gray-600" />
          </div>
        </div>
        
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Adresse:</span>
            <span className="font-medium">Hann Maristes, Dakar</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Coordonnées:</span>
            <span className="font-medium">{deviceLocation.lat}, {deviceLocation.lng}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">État connexion:</span>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-medium text-green-600">En ligne</span>
            </div>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Signal:</span>
            <div className="flex items-center space-x-2">
              <Wifi className="h-4 w-4 text-green-500" />
              <span className="font-medium text-green-600">Excellent</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
