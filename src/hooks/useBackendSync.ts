
import { useState, useEffect, useCallback } from 'react';
import { backendService, IrrigationRequest } from '@/services/backendService';

export const useBackendSync = () => {
  const [lastMLRecommendation, setLastMLRecommendation] = useState<IrrigationRequest | null>(null);
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  // Polling pour vérifier le statut du backend
  const checkBackendStatus = useCallback(async () => {
    try {
      const status = await backendService.getIrrigationStatus();
      if (status) {
        setIsBackendConnected(true);
        
        // Récupérer la dernière recommandation ML
        if (status.lastMLRecommendation) {
          setLastMLRecommendation(status.lastMLRecommendation);
        }
      } else {
        setIsBackendConnected(false);
      }
    } catch (error) {
      console.error('Erreur de connexion backend:', error);
      setIsBackendConnected(false);
    }
  }, []);

  // Polling toutes les 10 secondes
  useEffect(() => {
    checkBackendStatus();
    const interval = setInterval(checkBackendStatus, 10000);
    return () => clearInterval(interval);
  }, [checkBackendStatus]);

  return {
    lastMLRecommendation,
    isBackendConnected,
    checkBackendStatus
  };
};
