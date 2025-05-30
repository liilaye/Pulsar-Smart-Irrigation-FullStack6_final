
import React from 'react';
import { MLRecommendation } from './MLRecommendation';
import { ManualControl } from './ManualControl';
import { ScheduleControl } from './ScheduleControl';
import { IrrigationSystemConfig } from './IrrigationSystemConfig';

export const QuickControl = () => {
  return (
    <div className="space-y-6">
      <MLRecommendation />
      <IrrigationSystemConfig />
      <ManualControl />
      <ScheduleControl />
    </div>
  );
};
