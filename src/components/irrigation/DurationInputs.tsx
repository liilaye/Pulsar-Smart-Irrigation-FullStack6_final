
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DurationInputsProps {
  manualDuration: { hours: string; minutes: string };
  isManualActive: boolean;
  onDurationChange: (duration: { hours: string; minutes: string }) => void;
}

export const DurationInputs = ({ manualDuration, isManualActive, onDurationChange }: DurationInputsProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label className="text-sm">Durée (heures)</Label>
        <Input
          type="number"
          min="0"
          max="23"
          value={manualDuration.hours}
          onChange={(e) => onDurationChange({ ...manualDuration, hours: e.target.value })}
          className="h-8"
          disabled={isManualActive}
        />
      </div>
      <div>
        <Label className="text-sm">Durée (minutes)</Label>
        <Input
          type="number"
          min="0"
          max="59"
          value={manualDuration.minutes}
          onChange={(e) => onDurationChange({ ...manualDuration, minutes: e.target.value })}
          className="h-8"
          disabled={isManualActive}
        />
      </div>
    </div>
  );
};
