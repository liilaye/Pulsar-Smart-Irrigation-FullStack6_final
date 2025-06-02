
import React, { useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Wifi } from 'lucide-react';

export const DeviceLocation = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  
  // Coordonnées de Hann Maristes
  const deviceLocation = {
    lat: 14.7167,
    lng: -17.4677
  };

  useEffect(() => {
    if (!mapContainer.current) return;

    // Charger Google Maps directement sans clé API
    const script = document.createElement('script');
    script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      if (window.google && window.google.maps) {
        initializeMap();
      }
    };
    
    document.head.appendChild(script);
    
    return () => {
      // Nettoyer le script lors du démontage
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

  const initializeMap = () => {
    if (!mapContainer.current || !window.google) return;

    const map = new window.google.maps.Map(mapContainer.current, {
      center: deviceLocation,
      zoom: 18,
      mapTypeId: 'satellite',
      tilt: 45,
      heading: 90
    });

    // Ajouter un marqueur pour le boîtier PulsarInfinite
    const marker = new window.google.maps.Marker({
      position: deviceLocation,
      map: map,
      title: 'Boîtier PulsarInfinite',
      icon: {
        url: 'data:image/svg+xml;base64,' + btoa(`
          <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="18" fill="#EF4444" stroke="#FFFFFF" stroke-width="4"/>
            <circle cx="20" cy="20" r="8" fill="#FFFFFF"/>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(40, 40),
        anchor: new window.google.maps.Point(20, 20)
      }
    });

    // InfoWindow pour le marqueur
    const infoWindow = new window.google.maps.InfoWindow({
      content: `
        <div style="padding: 10px;">
          <h3 style="margin: 0 0 5px 0; color: #1f2937;">Boîtier PulsarInfinite</h3>
          <p style="margin: 0; color: #6b7280;">Système d'irrigation connecté</p>
          <p style="margin: 5px 0 0 0; font-size: 12px; color: #9ca3af;">Hann Maristes, Dakar</p>
        </div>
      `
    });

    marker.addListener('click', () => {
      infoWindow.open(map, marker);
    });

    // Ajouter un cercle pour la zone d'irrigation
    new window.google.maps.Circle({
      strokeColor: '#1D4ED8',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#3B82F6',
      fillOpacity: 0.2,
      map: map,
      center: deviceLocation,
      radius: 50
    });

    console.log('✅ Google Maps chargé avec succès');
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
        <div ref={mapContainer} className="w-full h-64 rounded-lg border bg-gray-100" />
        
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
      </CardContent>
    </Card>
  );
};
