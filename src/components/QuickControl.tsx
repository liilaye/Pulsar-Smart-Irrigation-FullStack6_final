
import React from 'react';
import { ManualControl } from './ManualControl';
import { ScheduleControl } from './ScheduleControl';

export const QuickControl = () => {
  return (
    <div className="space-y-6">
      <ManualControl />
      <ScheduleControl />
    </div>
  );
};
