
import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from 'lucide-react';
import { Loader } from '@googlemaps/js-api-loader';

export const DeviceLocation = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);

  // Coordonnées de Hann Maristes depuis le lien fourni
  const deviceLocation = {
    lat: 14.7167, // Latitude approximative de Hann Maristes
    lng: -17.4677 // Longitude approximative de Hann Maristes
  };

  useEffect(() => {
    const initMap = async () => {
      // Utilisation d'une clé API publique de démonstration - remplacer par votre clé
      const loader = new Loader({
        apiKey: "AIzaSyBFw0Qbyq9zTFTd-tUqqo6yBN87Qd4oEUA", // Clé de démonstration
        version: "weekly",
        libraries: ["places"]
      });

      try {
        await loader.load();
        
        if (mapRef.current && window.google) {
          mapInstance.current = new window.google.maps.Map(mapRef.current, {
            center: deviceLocation,
            zoom: 16,
            mapTypeId: window.google.maps.MapTypeId.SATELLITE,
            styles: [
              {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "off" }]
              }
            ]
          });

          // Ajouter un marqueur rouge pour le boîtier PulsarInfinite
          new window.google.maps.Marker({
            position: deviceLocation,
            map: mapInstance.current,
            title: "Boîtier PulsarInfinite",
            icon: {
              url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
              scaledSize: new window.google.maps.Size(40, 40)
            }
          });

          // Ajouter un cercle pour indiquer la zone d'irrigation
          new window.google.maps.Circle({
            strokeColor: "#0505FB",
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: "#0505FB",
            fillOpacity: 0.1,
            map: mapInstance.current,
            center: deviceLocation,
            radius: 50 // 50 mètres de rayon
          });
        }
      } catch (error) {
        console.error("Erreur lors du chargement de Google Maps:", error);
        // Fallback vers une carte simple en cas d'échec
        if (mapRef.current) {
          mapRef.current.innerHTML = `
            <div class="flex items-center justify-center h-full bg-gray-100 rounded">
              <div class="text-center">
                <div class="mx-auto h-8 w-8 text-red-500 mb-2">📍</div>
                <p class="text-sm text-gray-600">Hann Maristes, Dakar</p>
                <p class="text-xs text-gray-500">Lat: ${deviceLocation.lat}, Lng: ${deviceLocation.lng}</p>
              </div>
            </div>
          `;
        }
      }
    };

    initMap();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MapPin className="h-5 w-5 text-red-500" />
          <span>Localisation PulsarInfinite</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div ref={mapRef} className="w-full h-64 rounded-lg border" />
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
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="font-medium text-green-600">En ligne</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
