
import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Wifi, User } from 'lucide-react';
import { activeUserService, ActiveUser } from '@/services/activeUserService';

export const DeviceLocationMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [activeUser, setActiveUser] = useState<ActiveUser | null>(null);
  
  useEffect(() => {
    // S'abonner aux changements d'utilisateur actif
    const unsubscribe = activeUserService.subscribe((user) => {
      setActiveUser(user);
    });

    // Charger l'utilisateur actuel
    setActiveUser(activeUserService.getActiveUser());
    
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!mapContainer.current || !activeUser?.coordinates) return;

    // Nettoyer la carte existante
    mapContainer.current.innerHTML = '';

    // Charger Google Maps
    const script = document.createElement('script');
    script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      if (window.google && window.google.maps && activeUser?.coordinates) {
        initializeMap(activeUser.coordinates);
      }
    };
    
    document.head.appendChild(script);
    
    return () => {
      // Nettoyer le script lors du démontage
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript && existingScript.parentNode) {
        existingScript.parentNode.removeChild(existingScript);
      }
    };
  }, [activeUser]);

  const initializeMap = (coordinates: { lat: number; lng: number }) => {
    if (!mapContainer.current || !window.google) return;

    const map = new window.google.maps.Map(mapContainer.current, {
      center: coordinates,
      zoom: 18,
      mapTypeId: 'satellite',
      tilt: 45,
      heading: 90
    });

    // Ajouter un marqueur pour le boîtier PulsarInfinite
    const marker = new window.google.maps.Marker({
      position: coordinates,
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
          <p style="margin: 5px 0 0 0; font-size: 12px; color: #9ca3af;">${activeUser?.localite}, ${activeUser?.region}</p>
        </div>
      `
    });

    marker.addListener('click', () => {
      infoWindow.open(map, marker);
    });

    // Ajouter un cercle pour la zone d'irrigation basé sur la superficie
    const radius = Math.sqrt(activeUser!.superficie / Math.PI); // Rayon approximatif basé sur la superficie
    new window.google.maps.Circle({
      strokeColor: '#1D4ED8',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#3B82F6',
      fillOpacity: 0.2,
      map: map,
      center: coordinates,
      radius: Math.max(radius, 25) // Minimum 25m de rayon
    });

    console.log('✅ Google Maps chargé avec succès pour', activeUser?.prenom, activeUser?.nom);
  };

  if (!activeUser) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-red-500" />
            <span>Localisation PulsarInfinite</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun utilisateur sélectionné
            </h3>
            <p className="text-gray-600">
              Sélectionnez un acteur agricole pour voir sa localisation
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!activeUser.coordinates) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-red-500" />
            <span>Localisation PulsarInfinite</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Coordonnées non disponibles
            </h3>
            <p className="text-gray-600">
              Les coordonnées géographiques de {activeUser.prenom} {activeUser.nom} ne sont pas définies
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MapPin className="h-5 w-5 text-red-500" />
          <span>Localisation PulsarInfinite</span>
          <span className="text-sm font-normal text-gray-600">
            ({activeUser.prenom} {activeUser.nom})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div ref={mapContainer} className="w-full h-64 rounded-lg border bg-gray-100" />
        
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Adresse:</span>
            <span className="font-medium">{activeUser.localite}, {activeUser.region}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Coordonnées:</span>
            <span className="font-medium">{activeUser.coordinates.lat}, {activeUser.coordinates.lng}</span>
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
            <span className="font-medium text-blue-600">
              Superficie {(activeUser.superficie / 10000).toFixed(2)} ha
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Système:</span>
            <span className="font-medium text-blue-600">{activeUser.systeme_irrigation}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
