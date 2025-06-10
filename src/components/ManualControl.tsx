
import React from 'react';
import { ManualIrrigationControl } from './irrigation/ManualIrrigationControl';
import { MLIrrigationControl } from './irrigation/MLIrrigationControl';

export const ManualControl = () => {
  return (
    <div className="space-y-6">
      <ManualIrrigationControl />
      <MLIrrigationControl />
    </div>
  );
};
