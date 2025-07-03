import { useState } from 'react';
import { completeSenegalLocationService } from '@/services/completeSenegalLocationService';

interface GeolocationResult {
  name: string;
  coordinates: { lat: number; lng: number };
}

export const useGeolocation = () => {
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const getCurrentLocation = async (region?: string): Promise<GeolocationResult | null> => {
    setIsLoadingLocation(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError("La géolocalisation n'est pas supportée par ce navigateur");
      setIsLoadingLocation(false);
      return null;
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Vérification élargie des limites du Sénégal (avec marge d'erreur GPS)
          // Sénégal étendu: Lat 12.0°N à 16.9°N, Lng 11.2°W à 17.7°W
          if (latitude < 12.0 || latitude > 16.9 || longitude < -17.7 || longitude > -11.2) {
            setLocationError("Position détectée hors du Sénégal");
            setIsLoadingLocation(false);
            resolve(null);
            return;
          }

          try {
            console.log(`🎯 Géolocalisation: Position (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
            console.log(`🏷️ Région sélectionnée: ${region || 'Aucune'}`);
            
            // Recherche intelligente avec région préférée et distance adaptative
            const nearestLocation = completeSenegalLocationService.findNearestLocation(latitude, longitude, region || undefined);
            
            if (nearestLocation) {
              const distance = completeSenegalLocationService.calculateDistanceGPS(latitude, longitude, nearestLocation.lat, nearestLocation.lng);
              
              // Message informatif sur la précision
              let locationName = nearestLocation.name;
              if (distance > 25) {
                locationName = `${nearestLocation.name} (${distance.toFixed(1)}km)`;
              }
              
              console.log(`📍 Localité assignée: ${locationName}`);
              
              resolve({
                name: locationName,
                coordinates: { lat: latitude, lng: longitude }
              });
            } else {
              // Aucune localité trouvée même avec distance adaptative
              console.log('📍 Aucune localité trouvée, position GPS pure');
              resolve({
                name: `Position GPS (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
                coordinates: { lat: latitude, lng: longitude }
              });
            }
          } catch (error) {
            console.error('❌ Erreur lors de la recherche de localité:', error);
            setLocationError("Erreur lors de la recherche de localité");
            resolve(null);
          }
          
          setIsLoadingLocation(false);
        },
        (error) => {
          let errorMessage = "Erreur de géolocalisation";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Permission de géolocalisation refusée";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Position non disponible";
              break;
            case error.TIMEOUT:
              errorMessage = "Délai d'attente dépassé";
              break;
          }
          setLocationError(errorMessage);
          setIsLoadingLocation(false);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  };

  return {
    getCurrentLocation,
    isLoadingLocation,
    locationError,
    setLocationError
  };
};