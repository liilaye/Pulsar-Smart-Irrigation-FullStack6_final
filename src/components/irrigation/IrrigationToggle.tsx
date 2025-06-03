
import React from 'react';
import { Button } from "@/components/ui/button";
import { Power, PowerOff } from 'lucide-react';

interface IrrigationToggleProps {
  isManualActive: boolean;
  irrigationStatus: boolean;
  isConnected: boolean;
  onToggle: (enabled: boolean) => void;
}

export const IrrigationToggle = ({ isManualActive, irrigationStatus, isConnected, onToggle }: IrrigationToggleProps) => {
  const handleClick = () => {
    console.log('🔄 Button clicked, current state:', isManualActive);
    onToggle(!isManualActive);
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-4">
        <Button
          onClick={handleClick}
          disabled={!isConnected}
          variant={isManualActive ? "destructive" : "default"}
          className={`flex items-center space-x-2 ${
            isManualActive 
              ? 'bg-red-600 hover:bg-red-700' 
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {isManualActive ? (
            <>
              <PowerOff className="h-4 w-4" />
              <span>ÉTEINDRE</span>
            </>
          ) : (
            <>
              <Power className="h-4 w-4" />
              <span>ALLUMER</span>
            </>
          )}
        </Button>
        
        <div className="text-sm font-medium">
          {isManualActive ? "💧 Irrigation activée" : "⏸️ Irrigation désactivée"}
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${
          isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
        }`}></div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          irrigationStatus ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
        }`}>
          {irrigationStatus ? 'ACTIF' : 'INACTIF'}
        </div>
      </div>
    </div>
  );
};
