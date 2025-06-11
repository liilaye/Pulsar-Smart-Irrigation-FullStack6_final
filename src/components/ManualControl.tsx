
import React from 'react';
import { SimpleManualControl } from './irrigation/SimpleManualControl';
import { SimpleMLControl } from './irrigation/SimpleMLControl';
import { IrrigationRecommendations } from './irrigation/IrrigationRecommendations';

export const ManualControl = () => {
  return (
    <div className="space-y-6">
      <IrrigationRecommendations />
      <SimpleManualControl />
      <SimpleMLControl />
    </div>
  );
};
