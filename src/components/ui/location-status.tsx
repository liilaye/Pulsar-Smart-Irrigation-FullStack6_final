import React from 'react';
import { LocateFixed } from 'lucide-react';

interface LocationStatusProps {
  value: string;
  isValidated: boolean;
}

export const LocationStatus = ({ value, isValidated }: LocationStatusProps) => {
  // Validation message
  if (value && !isValidated && value.length > 2 && !value.includes('Position GPS')) {
    return (
      <p className="text-xs text-orange-600 mt-1">
        Sélectionnez une localité dans la liste pour validation
      </p>
    );
  }

  // GPS capture confirmation
  if (value.includes('Position GPS') || value.includes('km)')) {
    return (
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
    );
  }

  return null;
};