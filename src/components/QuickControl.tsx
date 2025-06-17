
import React from 'react';
import { ManualControl } from './ManualControl';
import { ScheduleControl } from './ScheduleControl';

export const QuickControl = () => {
  return (
    <div className="w-full space-y-6">
      <ManualControl />
      <ScheduleControl />
    </div>
  );
};
