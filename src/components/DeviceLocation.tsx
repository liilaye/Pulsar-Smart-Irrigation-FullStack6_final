
import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Navigation, Wifi } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader } from '@googlemaps/js-api-loader';

export const DeviceLocation = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  // Coordonnées de Hann Maristes
  const deviceLocation = {
    lat: 14.7167,
    lng: -17.4677
  };

  const initializeGoogleMap = async () => {
    if (!mapContainer.current || !apiKey.trim()) return;

    setIsLoading(true);
    
    try {
      const loader = new Loader({
        apiKey: apiKey,
        version: "weekly",
        libraries: ["maps", "marker"]
      });

      await loader.load();

      map.current = new google.maps.Map(mapContainer.current, {
        center: deviceLocation,
        zoom: 18,
        mapTypeId: 'satellite',
        tilt: 45,
        heading: 90,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true
      });

      // Ajouter un marqueur pour le boîtier PulsarInfinite
      const marker = new google.maps.Marker({
        position: deviceLocation,
        map: map.current,
        title: 'Boîtier PulsarInfinite',
        icon: {
          url: 'data:image/svg+xml;base64,' + btoa(`
            <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="18" fill="#EF4444" stroke="#FFFFFF" stroke-width="4"/>
              <circle cx="20" cy="20" r="8" fill="#FFFFFF"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(40, 40),
          anchor: new google.maps.Point(20, 20)
        }
      });

      // InfoWindow pour le marqueur
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 10px;">
            <h3 style="margin: 0 0 5px 0; color: #1f2937;">Boîtier PulsarInfinite</h3>
            <p style="margin: 0; color: #6b7280;">Système d'irrigation connecté</p>
            <p style="margin: 5px 0 0 0; font-size: 12px; color: #9ca3af;">Hann Maristes, Dakar</p>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(map.current, marker);
      });

      // Ajouter un cercle pour la zone d'irrigation
      new google.maps.Circle({
        strokeColor: '#1D4ED8',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#3B82F6',
        fillOpacity: 0.2,
        map: map.current,
        center: deviceLocation,
        radius: 50 // 50 mètres de rayon
      });

      setShowKeyInput(false);
      console.log('✅ Google Maps chargé avec succès');
      
    } catch (error) {
      console.error('❌ Erreur lors du chargement de Google Maps:', error);
      alert('Erreur lors du chargement de Google Maps. Vérifiez votre clé API.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeySubmit = () => {
    if (apiKey.trim()) {
      initializeGoogleMap();
    }
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
        {showKeyInput ? (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700 mb-2">
                Pour afficher la carte Google Maps, veuillez entrer votre clé API Google Maps.
              </p>
              <p className="text-xs text-blue-600">
                Obtenez votre clé API sur <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console</a>
              </p>
            </div>
            <div className="flex space-x-2">
              <Input
                type="text"
                placeholder="AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="flex-1"
                disabled={isLoading}
              />
              <Button onClick={handleKeySubmit} disabled={isLoading || !apiKey.trim()}>
                {isLoading ? 'Chargement...' : 'Charger la carte'}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div ref={mapContainer} className="w-full h-64 rounded-lg border" />
            
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
              <div className="flex justify-between">
                <span className="text-gray-600">Zone d'irrigation:</span>
                <span className="font-medium text-blue-600">Rayon 50m</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
