
import { useState, useEffect } from 'react';
import { backendService } from '@/services/backendService';

interface IrrigationStatus {
  isActive: boolean;
  type: string | null;
  startTime: number | null;
  duration: number | null;
  source: string | null;
}

export const useIrrigationStatus = () => {
  const [status, setStatus] = useState<IrrigationStatus>({
    isActive: false,
    type: null,
    startTime: null,
    duration: null,
    source: null
  });

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await backendService.getIrrigationStatus();
        if (response && response.status === 'ok') {
          setStatus({
            isActive: response.isActive,
            type: response.type,
            startTime: response.startTime,
            duration: response.duration,
            source: response.source
          });
        }
      } catch (error) {
        console.error('Erreur vérification statut irrigation:', error);
      }
    };

    // Vérification initiale
    checkStatus();

    // Vérification toutes les 5 secondes
    const interval = setInterval(checkStatus, 5000);

    return () => clearInterval(interval);
  }, []);

  return status;
};
