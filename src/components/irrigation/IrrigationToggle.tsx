
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
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-4">
        <Switch 
          checked={isManualActive}
          onCheckedChange={(checked) => {
            console.log('🔄 Switch toggled:', checked);
            onToggle(checked);
          }}
          disabled={!isConnected}
          className="data-[state=checked]:bg-blue-600"
        />
        <Label className="text-sm font-medium cursor-pointer" htmlFor="irrigation-switch">
          {isManualActive ? "💧 Irrigation activée" : "⏸️ Irrigation désactivée"}
        </Label>
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
