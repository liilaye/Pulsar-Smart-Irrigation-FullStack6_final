
import React, { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Check } from 'lucide-react';
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
      
      {value && !isValidated && value.length > 2 && (
        <p className="text-xs text-orange-600 mt-1">
          Sélectionnez une localité dans la liste pour validation
        </p>
      )}
    </div>
  );
};
