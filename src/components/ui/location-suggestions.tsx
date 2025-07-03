import React from 'react';
import { MapPin } from 'lucide-react';
import { CompleteSenegalLocation } from '@/services/completeSenegalLocationService';

interface LocationSuggestionsProps {
  suggestions: CompleteSenegalLocation[];
  selectedIndex: number;
  onSuggestionClick: (location: CompleteSenegalLocation) => void;
}

export const LocationSuggestions = ({ 
  suggestions, 
  selectedIndex, 
  onSuggestionClick 
}: LocationSuggestionsProps) => {
  if (suggestions.length === 0) return null;

  return (
    <ul className="absolute z-50 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto mt-1">
      {suggestions.map((location, index) => (
        <li
          key={`${location.name}-${location.region}`}
          onClick={() => onSuggestionClick(location)}
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
  );
};