import React from 'react';

interface MLTimerDisplayProps {
  isMLActive: boolean;
  startTime: Date | null;
  durationMinutes: number;
}

export const MLTimerDisplay = ({ isMLActive, startTime, durationMinutes }: MLTimerDisplayProps) => {
  const [timeRemaining, setTimeRemaining] = React.useState<string>('');

  React.useEffect(() => {
    if (!isMLActive || !startTime) {
      setTimeRemaining('');
      return;
    }

    const updateTimer = () => {
      const now = new Date();
      const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
      const totalSeconds = durationMinutes * 60;
      const remaining = Math.max(0, totalSeconds - elapsed);
      
      if (remaining === 0) {
        setTimeRemaining('Arrêt imminent...');
        return;
      }
      
      const minutes = Math.floor(remaining / 60);
      const seconds = remaining % 60;
      setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [isMLActive, startTime, durationMinutes]);

  if (!isMLActive || !timeRemaining) return null;

  return (
    <div className="p-3 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="font-medium text-green-800">Irrigation ML en cours</span>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-green-700">{timeRemaining}</div>
          <div className="text-xs text-green-600">restant</div>
        </div>
      </div>
    </div>
  );
};