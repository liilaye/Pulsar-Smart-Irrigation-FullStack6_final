
import React from 'react';
import { SimpleManualControl } from './irrigation/SimpleManualControl';
import { SimpleMLControl } from './irrigation/SimpleMLControl';

export const ManualControl = () => {
  return (
    <div className="space-y-6">
      <SimpleManualControl />
      <SimpleMLControl />
    </div>
  );
};
