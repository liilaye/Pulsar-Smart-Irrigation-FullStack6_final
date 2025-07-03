import { useState, useEffect } from 'react';
import { completeSenegalLocationService, CompleteSenegalLocation } from '@/services/completeSenegalLocationService';

export const useLocationAutocomplete = (value: string, region?: string) => {
  const [suggestions, setSuggestions] = useState<CompleteSenegalLocation[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isValidated, setIsValidated] = useState(false);

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

  const handleKeyDown = (e: React.KeyboardEvent, onSuggestionSelect: (location: CompleteSenegalLocation) => void) => {
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
          onSuggestionSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  return {
    suggestions,
    showSuggestions,
    setShowSuggestions,
    selectedIndex,
    isValidated,
    setIsValidated,
    handleKeyDown
  };
};