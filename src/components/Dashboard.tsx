
import React from 'react';
import { QuickControl } from './QuickControl';
import { AgroClimateParams } from './AgroClimateParams';
import { IrrigationStatus } from './IrrigationStatus';
import { WaterChart } from './WaterChart';
import { Recommendations } from './Recommendations';

export const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QuickControl />
        <IrrigationStatus />
      </div>
      
      <AgroClimateParams />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WaterChart />
        <Recommendations />
      </div>
    </div>
  );
};
