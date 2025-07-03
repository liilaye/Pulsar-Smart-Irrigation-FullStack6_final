import React from 'react';
import { Button } from "@/components/ui/button";
import { LocateFixed, Loader2, AlertTriangle } from 'lucide-react';

interface GeolocationButtonProps {
  onLocationRequest: () => void;
  isLoading: boolean;
  error: string | null;
}

export const GeolocationButton = ({ 
  onLocationRequest, 
  isLoading, 
  error 
}: GeolocationButtonProps) => {
  return (
    <div className="flex items-center space-x-2 mt-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onLocationRequest}
        disabled={isLoading}
        className="flex items-center space-x-2 text-sm"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <LocateFixed className="h-4 w-4" />
        )}
        <span>
          {isLoading ? 'Localisation...' : 'Ma position actuelle'}
        </span>
      </Button>
      
      {error && (
        <div className="flex items-center text-red-600 text-xs">
          <AlertTriangle className="h-3 w-3 mr-1" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};