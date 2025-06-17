
import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '@/services/apiService';

interface BackendStatus {
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  lastChecked: Date | null;
}

// Instance globale pour éviter les vérifications multiples
let globalStatus: BackendStatus = {
  isConnected: false,
  isLoading: true,
  error: null,
  lastChecked: null
};

let globalListeners: ((status: BackendStatus) => void)[] = [];
let checkingInProgress = false;
let globalInterval: NodeJS.Timeout | null = null;

const notifyListeners = (status: BackendStatus) => {
  globalStatus = { ...status };
  globalListeners.forEach(listener => listener(status));
};

const performCheck = async () => {
  if (checkingInProgress) return;
  
  checkingInProgress = true;
  const newStatus = { ...globalStatus, isLoading: true, error: null };
  notifyListeners(newStatus);
  
  try {
    console.log('🔍 Vérification connexion backend Flask...');
    const data = await api.checkHealth();
    
    console.log('✅ Backend Flask connecté:', data);
    const successStatus = {
      isConnected: true,
      isLoading: false,
      error: null,
      lastChecked: new Date()
    };
    notifyListeners(successStatus);
  } catch (error) {
    console.error('❌ Erreur connexion backend Flask:', error);
    const errorStatus = {
      isConnected: false,
      isLoading: false,
      error: error instanceof Error ? error.message : 'Erreur de connexion',
      lastChecked: new Date()
    };
    notifyListeners(errorStatus);
  } finally {
    checkingInProgress = false;
  }
};

export const useBackendConnection = () => {
  const [status, setStatus] = useState<BackendStatus>(globalStatus);
  const listenerRef = useRef<(status: BackendStatus) => void>();

  // S'abonner aux changements globaux
  useEffect(() => {
    listenerRef.current = setStatus;
    globalListeners.push(listenerRef.current);
    
    // Si c'est le premier listener, démarrer les vérifications
    if (globalListeners.length === 1) {
      performCheck();
      
      // Vérification automatique toutes les 30 secondes
      if (globalInterval) {
        clearInterval(globalInterval);
      }
      globalInterval = setInterval(performCheck, 30000);
    }
    
    return () => {
      if (listenerRef.current) {
        globalListeners = globalListeners.filter(listener => listener !== listenerRef.current);
      }
      
      // Si plus de listeners, arrêter les vérifications
      if (globalListeners.length === 0 && globalInterval) {
        clearInterval(globalInterval);
        globalInterval = null;
      }
    };
  }, []);

  const checkConnection = useCallback(async () => {
    await performCheck();
  }, []);

  return {
    ...status,
    checkConnection
  };
};
