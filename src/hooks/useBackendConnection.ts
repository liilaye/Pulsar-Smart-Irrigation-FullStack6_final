
import { useState, useEffect, useCallback } from 'react';
import { api } from '@/services/apiService';

interface BackendStatus {
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  lastChecked: Date | null;
}

export const useBackendConnection = () => {
  const [status, setStatus] = useState<BackendStatus>({
    isConnected: false,
    isLoading: true,
    error: null,
    lastChecked: null
  });

  const checkConnection = useCallback(async () => {
    setStatus(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      console.log('🔍 Vérification connexion backend Flask...');
      // Utiliser notre service API au lieu d'un appel direct
      const data = await api.checkHealth();
      
      console.log('✅ Backend Flask connecté:', data);
      setStatus({
        isConnected: true,
        isLoading: false,
        error: null,
        lastChecked: new Date()
      });
    } catch (error) {
      console.error('❌ Erreur connexion backend Flask:', error);
      setStatus({
        isConnected: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erreur de connexion',
        lastChecked: new Date()
      });
    }
  }, []);

  // Vérification automatique toutes les 30 secondes
  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, [checkConnection]);

  return {
    ...status,
    checkConnection
  };
};
