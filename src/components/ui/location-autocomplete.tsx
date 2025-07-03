
import React, { useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Check } from 'lucide-react';
import { CompleteSenegalLocation } from '@/services/completeSenegalLocationService';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useLocationAutocomplete } from '@/hooks/useLocationAutocomplete';
import { LocationSuggestions } from './location-suggestions';
import { GeolocationButton } from './geolocation-button';
import { LocationStatus } from './location-status';

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
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { getCurrentLocation, isLoadingLocation, locationError, setLocationError } = useGeolocation();
  const { 
    suggestions, 
    showSuggestions, 
    setShowSuggestions, 
    selectedIndex, 
    isValidated, 
    setIsValidated, 
    handleKeyDown 
  } = useLocationAutocomplete(value, region);

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

  const handleGeolocationRequest = async () => {
    setLocationError(null);
    const result = await getCurrentLocation(region);
    
    if (result) {
      onChange(result.name, result.coordinates);
      setIsValidated(true);
      setShowSuggestions(false);
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
          onKeyDown={(e) => handleKeyDown(e, handleSuggestionClick)}
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
      
      {showSuggestions && (
        <LocationSuggestions 
          suggestions={suggestions}
          selectedIndex={selectedIndex}
          onSuggestionClick={handleSuggestionClick}
        />
      )}

      <GeolocationButton
        onLocationRequest={handleGeolocationRequest}
        isLoading={isLoadingLocation}
        error={locationError}
      />
      
      <LocationStatus value={value} isValidated={isValidated} />
    </div>
  );
};
