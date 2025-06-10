
import React from 'react';
import { MLRecommendation } from './MLRecommendation';
import { ManualControl } from './ManualControl';
import { ScheduleControl } from './ScheduleControl';

export const QuickControl = () => {
  return (
    <div className="space-y-6">
      <MLRecommendation />
      <ManualControl />
      <ScheduleControl />
    </div>
  );
};
