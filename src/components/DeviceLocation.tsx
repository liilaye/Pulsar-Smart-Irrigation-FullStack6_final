
import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Navigation, Wifi } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

export const DeviceLocation = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(true);
  
  // Coordonnées de Hann Maristes
  const deviceLocation = {
    lat: 14.7167,
    lng: -17.4677
  };

  const initializeMap = () => {
    if (!mapContainer.current || !mapboxToken.trim()) return;

    try {
      mapboxgl.accessToken = mapboxToken;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/satellite-streets-v12',
        center: [deviceLocation.lng, deviceLocation.lat],
        zoom: 16,
        pitch: 45
      });

      // Ajouter les contrôles de navigation
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Ajouter un marqueur pour le boîtier PulsarInfinite
      new mapboxgl.Marker({ color: '#EF4444' })
        .setLngLat([deviceLocation.lng, deviceLocation.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML('<h3>Boîtier PulsarInfinite</h3><p>Système d\'irrigation connecté</p>')
        )
        .addTo(map.current);

      // Ajouter un cercle pour la zone d'irrigation
      map.current.on('load', () => {
        if (!map.current) return;
        
        map.current.addSource('irrigation-zone', {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [deviceLocation.lng, deviceLocation.lat]
            },
            properties: {}
          }
        });

        map.current.addLayer({
          id: 'irrigation-circle',
          type: 'circle',
          source: 'irrigation-zone',
          paint: {
            'circle-radius': {
              stops: [
                [0, 0],
                [20, 200]
              ],
              base: 2
            },
            'circle-color': '#3B82F6',
            'circle-opacity': 0.3,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#1D4ED8'
          }
        });
      });

      setShowTokenInput(false);
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de la carte:', error);
    }
  };

  const handleTokenSubmit = () => {
    if (mapboxToken.trim()) {
      initializeMap();
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
        {showTokenInput ? (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700 mb-2">
                Pour afficher la carte interactive, veuillez entrer votre token Mapbox public.
              </p>
              <p className="text-xs text-blue-600">
                Obtenez votre token sur <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="underline">mapbox.com</a>
              </p>
            </div>
            <div className="flex space-x-2">
              <Input
                type="text"
                placeholder="pk.eyJ1IjoieW91ci11c2VybmFtZSIsImEiOiJ..."
                value={mapboxToken}
                onChange={(e) => setMapboxToken(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleTokenSubmit}>
                Charger la carte
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div ref={mapContainer} className="w-full h-64 rounded-lg" />
            
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
          </>
        )}
      </CardContent>
    </Card>
  );
};
