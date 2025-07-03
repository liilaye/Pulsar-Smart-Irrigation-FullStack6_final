
import React, { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MapPin, Check, LocateFixed, Loader2, AlertTriangle } from 'lucide-react';
import { completeSenegalLocationService, CompleteSenegalLocation } from '@/services/completeSenegalLocationService';

interface LocationAutocompleteProps {
  label: string;
  value: string;
  onChange: (value: string, coordinates?: { lat: number; lng: number }) => void;
  region?: string;
  placeholder?: string;
  required?: boolean;
}

export const LocationAutocomplete = ({ 
  label, 
  value, 
  onChange, 
  region,
  placeholder, 
  required 
}: LocationAutocompleteProps) => {
  const [suggestions, setSuggestions] = useState<CompleteSenegalLocation[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isValidated, setIsValidated] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (value.length > 1) {
      const results = completeSenegalLocationService.searchLocations(value, region, 8);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
      setSelectedIndex(-1);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
    
    // Vérifier si la localité est validée
    if (region && value) {
      const isValid = completeSenegalLocationService.validateLocation(value, region);
      setIsValidated(isValid);
    }
  }, [value, region]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setIsValidated(false);
  };

  const handleSuggestionClick = (location: CompleteSenegalLocation) => {
    onChange(location.name, { lat: location.lat, lng: location.lng });
    setShowSuggestions(false);
    setIsValidated(true);
    inputRef.current?.blur();
  };

  // Fonction pour obtenir la position actuelle de l'utilisateur
  const getCurrentLocation = () => {
    setIsLoadingLocation(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError("La géolocalisation n'est pas supportée par ce navigateur");
      setIsLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Vérification élargie des limites du Sénégal (avec marge d'erreur GPS)
        // Sénégal étendu: Lat 12.0°N à 16.9°N, Lng 11.2°W à 17.7°W
        if (latitude < 12.0 || latitude > 16.9 || longitude < -17.7 || longitude > -11.2) {
          setLocationError("Position détectée hors du Sénégal");
          setIsLoadingLocation(false);
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
            
            // Conserver les coordonnées GPS exactes de l'utilisateur
            onChange(locationName, { lat: latitude, lng: longitude });
            setIsValidated(true);
            setLocationError(null);
            setShowSuggestions(false);
          } else {
            // Aucune localité trouvée même avec distance adaptative
            console.log('📍 Aucune localité trouvée, position GPS pure');
            onChange(`Position GPS (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`, { lat: latitude, lng: longitude });
            setIsValidated(true);
            setLocationError(null);
          }
        } catch (error) {
          console.error('❌ Erreur lors de la recherche de localité:', error);
          setLocationError("Erreur lors de la recherche de localité");
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
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  return (
    <div className="relative">
      <Label htmlFor={label.toLowerCase()}>{label} {required && '*'}</Label>
      <div className="relative">
        <Input
          ref={inputRef}
          id={label.toLowerCase()}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => value.length > 1 && setShowSuggestions(suggestions.length > 0)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={placeholder}
          required={required}
          className={`pr-8 ${isValidated ? 'border-green-500' : ''}`}
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
          {isValidated ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <MapPin className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </div>
      
      {showSuggestions && suggestions.length > 0 && (
        <ul
          ref={listRef}
          className="absolute z-50 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto mt-1"
        >
          {suggestions.map((location, index) => (
            <li
              key={`${location.name}-${location.region}`}
              onClick={() => handleSuggestionClick(location)}
              className={`px-4 py-2 cursor-pointer hover:bg-blue-50 flex items-center justify-between ${
                index === selectedIndex ? 'bg-blue-50' : ''
              }`}
            >
              <div>
                <div className="font-medium text-gray-900">{location.name}</div>
                <div className="text-sm text-gray-500">{location.region}</div>
              </div>
              <MapPin className="h-4 w-4 text-blue-500" />
            </li>
          ))}
        </ul>
      )}

      {/* Bouton de géolocalisation */}
      <div className="flex items-center space-x-2 mt-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={getCurrentLocation}
          disabled={isLoadingLocation}
          className="flex items-center space-x-2 text-sm"
        >
          {isLoadingLocation ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LocateFixed className="h-4 w-4" />
          )}
          <span>
            {isLoadingLocation ? 'Localisation...' : 'Ma position actuelle'}
          </span>
        </Button>
        
        {locationError && (
          <div className="flex items-center text-red-600 text-xs">
            <AlertTriangle className="h-3 w-3 mr-1" />
            <span>{locationError}</span>
          </div>
        )}
      </div>
      
      {value && !isValidated && value.length > 2 && !value.includes('Position GPS') && (
        <p className="text-xs text-orange-600 mt-1">
          Sélectionnez une localité dans la liste pour validation
        </p>
      )}

      {/* Affichage des coordonnées capturées */}
      {(value.includes('Position GPS') || value.includes('km)')) && (
        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center space-x-2">
            <LocateFixed className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-800 font-medium">
              {value.includes('Position GPS') ? 'Position GPS capturée' : 'Géolocalisation intelligente'}
            </span>
          </div>
          <p className="text-xs text-green-700 mt-1">
            {value.includes('Position GPS') 
              ? 'Votre position exacte a été enregistrée pour une géolocalisation précise'
              : 'Localité la plus proche trouvée avec distance adaptative (région prioritaire)'
            }
          </p>
        </div>
      )}
    </div>
  );
};
