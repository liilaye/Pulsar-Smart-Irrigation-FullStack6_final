// Hook de connexion backend simulé pour la démo
import { useState, useEffect, useCallback } from 'react';
import { mockBackendService } from '@/services/mockBackendService';

export const useMockBackendConnection = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkConnection = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🟢 [DEMO] Vérification connexion backend simulé...');
      
      const result = await mockBackendService.checkConnection();
      
      if (result.isConnected) {
        setIsConnected(true);
        setError(null);
        console.log('🟢 [DEMO] Backend simulé connecté avec succès');
      } else {
        setIsConnected(false);
        setError(result.error || 'Erreur connexion backend simulé');
        console.log('❌ [DEMO] Échec connexion backend simulé');
      }
    } catch (err) {
      setIsConnected(false);
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      console.error('❌ [DEMO] Erreur connexion backend simulé:', errorMessage);
    } finally {
      setIsLoading(false);
      setLastChecked(new Date());
    }
  }, []);

  // Vérification automatique au montage et polling
  useEffect(() => {
    console.log('🟢 [DEMO] Initialisation connexion backend simulé');
    
    // Vérification immédiate
    checkConnection();
    
    // Polling toutes les 30 secondes (plus espacé pour la démo)
    const interval = setInterval(checkConnection, 30000);
    
    return () => {
      clearInterval(interval);
      console.log('🟢 [DEMO] Nettoyage connexion backend simulé');
    };
  }, [checkConnection]);

  // Simulation d'une connexion plus stable en mode démo
  useEffect(() => {
    // En mode démo, on simule une connexion réussie après un court délai
    const timer = setTimeout(() => {
      if (!isConnected && !isLoading) {
        console.log('🟢 [DEMO] Auto-connexion backend simulé');
        setIsConnected(true);
        setError(null);
        setLastChecked(new Date());
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [isConnected, isLoading]);

  return {
    isConnected,
    isLoading,
    error,
    lastChecked,
    checkConnection
  };
};