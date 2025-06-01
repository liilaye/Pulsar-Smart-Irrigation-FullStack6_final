
import React from 'react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface IrrigationToggleProps {
  isManualActive: boolean;
  irrigationStatus: boolean;
  isConnected: boolean;
  onToggle: (enabled: boolean) => void;
}

export const IrrigationToggle = ({ isManualActive, irrigationStatus, isConnected, onToggle }: IrrigationToggleProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Switch 
          checked={isManualActive}
          onCheckedChange={onToggle}
          disabled={!isConnected}
        />
        <Label className="text-sm">
          {isManualActive ? "💧 Irrigation en cours" : "⏸️ Irrigation arrêtée"}
        </Label>
      </div>
      <div className={`px-2 py-1 rounded-full text-xs ${
        irrigationStatus ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
      }`}>
        {irrigationStatus ? 'ACTIF' : 'INACTIF'}
      </div>
    </div>
  );
};
