
import { useState, useEffect } from 'react';
import { irrigationAnalysisService, IrrigationAnalysisData } from '@/services/irrigationAnalysisService';

export const useIrrigationAnalysis = () => {
  const [data, setData] = useState<IrrigationAnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadAnalysisData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const analysisData = await irrigationAnalysisService.getAnalysisData();
        
        if (isMounted) {
          setData(analysisData);
        }
      } catch (err) {
        if (isMounted) {
          const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
          setError(errorMessage);
          console.error('❌ Erreur chargement analyse:', err);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadAnalysisData();

    return () => {
      isMounted = false;
    };
  }, []);

  const refresh = async () => {
    irrigationAnalysisService.clearCache();
    setIsLoading(true);
    
    try {
      const analysisData = await irrigationAnalysisService.getAnalysisData();
      setData(analysisData);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    data,
    isLoading,
    error,
    refresh
  };
};
