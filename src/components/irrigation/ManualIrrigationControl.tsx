
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Volume2, Play, Square, Bot, Lightbulb } from 'lucide-react';
import { irrigationSyncService } from '@/services/irrigationSyncService';
import { irrigationDataService } from '@/services/irrigationDataService';
import { api } from '@/services/apiService';
import { useToast } from '@/hooks/use-toast';

interface ManualIrrigationStatus {
  isActive: boolean;
  duration: number;
  volume: number;
}

interface MLRecommendation {
  duree_minutes: number;
  volume_eau_m3: number;
}

export const ManualIrrigationControl = () => {
  const [manualStatus, setManualStatus] = useState<ManualIrrigationStatus>({
    isActive: false,
    duration: 30,
    volume: 20
  });
  const [mlRecommendation, setMLRecommendation] = useState<MLRecommendation | null>(null);
  const [isLoadingRecommendation, setIsLoadingRecommendation] = useState(false);
  const [conflictMessage, setConflictMessage] = useState<string>('');
  const [activeDuration, setActiveDuration] = useState<number>(0);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // S'abonner aux changements d'état global
    const unsubscribe = irrigationSyncService.subscribe((state) => {
      setManualStatus(prev => ({
        ...prev,
        isActive: state.isActive && state.type === 'manual'
      }));
      
      if (state.isActive && state.type === 'manual') {
        setActiveDuration(irrigationSyncService.getActiveDuration());
      } else {
        setActiveDuration(0);
      }
      
      // Effacer le message de conflit si irrigation arrêtée
      if (!state.isActive) {
        setConflictMessage('');
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    // Mettre à jour la durée active toutes les secondes
    const interval = setInterval(() => {
      if (manualStatus.isActive) {
        setActiveDuration(irrigationSyncService.getActiveDuration());
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [manualStatus.isActive]);

  const getMLRecommendation = async () => {
    setIsLoadingRecommendation(true);
    try {
      // Features par défaut pour recommandation ML
      const featuresArray = [
        29, 0, 62, 4, 1, 600, 26, 40, 0.9, 6.5, 10, 15, 20, 4, 2
      ];

      const data = await api.arroserAvecML(featuresArray);
      if (data && data.status === 'ok') {
        setMLRecommendation({
          duree_minutes: data.duree_minutes,
          volume_eau_m3: data.volume_eau_m3
        });
        
        toast({
          title: "💡 Recommandation ML reçue",
          description: `${data.duree_minutes.toFixed(1)} min - ${data.volume_eau_m3.toFixed(3)} m³`
        });
      }
    } catch (error) {
      console.error("❌ Erreur recommandation ML :", error);
      toast({
        title: "❌ Erreur recommandation",
        description: "Impossible d'obtenir la recommandation ML",
        variant: "destructive"
      });
    } finally {
      setIsLoadingRecommendation(false);
    }
  };

  const startManualIrrigation = async () => {
    // Vérifier si on peut démarrer
    const { canStart, reason } = irrigationSyncService.canStartIrrigation('manual');
    if (!canStart) {
      setConflictMessage(reason || 'Irrigation déjà active');
      toast({
        title: "⚠️ Conflit d'irrigation",
        description: reason,
        variant: "destructive"
      });
      return;
    }

    try {
      if (irrigationSyncService.startIrrigation('manual', 'Manual_User', manualStatus.duration)) {
        // Démarrer une session de données
        const sessionId = irrigationDataService.startIrrigationSession('manual', 'Manual_User');
        setCurrentSessionId(sessionId);
        
        setManualStatus(prev => ({ ...prev, isActive: true }));
        
        // Programmer l'arrêt automatique
        setTimeout(() => {
          if (sessionId) {
            const volumeCalculated = (manualStatus.duration * manualStatus.volume) / 1000;
            irrigationDataService.endIrrigationSession(sessionId, manualStatus.duration);
            setCurrentSessionId(null);
          }
          irrigationSyncService.stopIrrigation('Manual_Auto_Complete');
          setManualStatus(prev => ({ ...prev, isActive: false }));
        }, manualStatus.duration * 60 * 1000);
        
        toast({
          title: "🚿 Irrigation manuelle démarrée",
          description: `${manualStatus.duration} min - ${(manualStatus.duration * manualStatus.volume / 1000).toFixed(3)} m³`,
        });
      }
    } catch (error) {
      console.error('❌ Erreur démarrage manuel:', error);
      toast({
        title: "❌ Erreur démarrage",
        description: "Impossible de démarrer l'irrigation manuelle",
        variant: "destructive"
      });
    }
  };

  const stopManualIrrigation = () => {
    if (irrigationSyncService.stopIrrigation('Manual_User')) {
      if (currentSessionId) {
        const volumeCalculated = (activeDuration / 60 * manualStatus.volume) / 1000;
        irrigationDataService.endIrrigationSession(currentSessionId, activeDuration / 60);
        setCurrentSessionId(null);
      }
      
      setManualStatus(prev => ({ ...prev, isActive: false }));
      
      toast({
        title: "⏹️ Irrigation manuelle arrêtée",
        description: `Durée: ${(activeDuration / 60).toFixed(1)} min`,
      });
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Arrosage Manuel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className={`w-4 h-4 rounded-full ${
                manualStatus.isActive ? 'bg-blue-500 animate-pulse' : 'bg-gray-400'
              }`}></div>
              
              <Badge className={manualStatus.isActive ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}>
                {manualStatus.isActive ? 'ACTIF' : 'ARRÊTÉ'}
              </Badge>
            </div>
          </div>

          {conflictMessage && (
            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm text-red-700">
                ⚠️ {conflictMessage}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                <Clock className="h-4 w-4 inline mr-1" />
                Durée (minutes)
              </label>
              <input
                type="number"
                value={manualStatus.duration}
                onChange={(e) => setManualStatus(prev => ({ 
                  ...prev, 
                  duration: Math.max(1, parseInt(e.target.value) || 1)
                }))}
                disabled={manualStatus.isActive}
                className="w-full px-3 py-2 border rounded-md"
                min="1"
                max="120"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                <Volume2 className="h-4 w-4 inline mr-1" />
                Débit (L/min)
              </label>
              <input
                type="number"
                value={manualStatus.volume}
                onChange={(e) => setManualStatus(prev => ({ 
                  ...prev, 
                  volume: Math.max(1, parseInt(e.target.value) || 1)
                }))}
                disabled={manualStatus.isActive}
                className="w-full px-3 py-2 border rounded-md"
                min="1"
                max="100"
              />
            </div>
          </div>

          <div className="flex space-x-2">
            <Button 
              onClick={startManualIrrigation}
              disabled={manualStatus.isActive}
              size="sm"
              className="flex items-center space-x-2"
            >
              <Play className="h-4 w-4" />
              <span>Démarrer</span>
            </Button>
            
            <Button 
              onClick={stopManualIrrigation}
              disabled={!manualStatus.isActive}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <Square className="h-4 w-4" />
              <span>Arrêter</span>
            </Button>
          </div>

          {manualStatus.isActive && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between text-xs text-blue-600 mb-1">
                <span>Temps écoulé: {(activeDuration / 60).toFixed(1)} min</span>
                <span>
                  {Math.round((activeDuration / 60 / manualStatus.duration) * 100)}% complété
                </span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                  style={{ 
                    width: `${Math.min((activeDuration / 60 / manualStatus.duration) * 100, 100)}%` 
                  }}
                ></div>
              </div>
            </div>
          )}

          <p className="text-sm text-gray-600">
            Volume estimé: <strong>{(manualStatus.duration * manualStatus.volume / 1000).toFixed(3)} m³</strong>
          </p>
        </CardContent>
      </Card>

      {/* Section Recommandation IA - Design élégant blanc et bleu */}
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-blue-800">
            <Bot className="h-5 w-5 text-blue-600" />
            <span>Recommandation IA XGBoost</span>
            <span className="text-sm font-normal text-blue-600">(Optionnelle)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white/70 rounded-lg border border-blue-100">
            <div className="flex items-center space-x-4">
              <div className="w-3 h-3 rounded-full bg-blue-400"></div>
              <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                CONSEIL IA
              </Badge>
            </div>
          </div>

          <Button 
            onClick={getMLRecommendation}
            disabled={isLoadingRecommendation}
            size="sm"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Lightbulb className="h-4 w-4 mr-2" />
            {isLoadingRecommendation ? 'Analyse IA en cours...' : 'Obtenir Recommandation XGBoost'}
          </Button>

          {mlRecommendation && (
            <div className="p-4 bg-white rounded-lg border border-blue-200 shadow-sm">
              <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                <Bot className="h-4 w-4 mr-2" />
                Prédiction ML pour Arrosage Manuel
              </h4>
              
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm text-blue-700 font-medium">
                      Durée suggérée
                    </p>
                    <p className="text-lg font-bold text-blue-800">
                      {Math.floor(mlRecommendation.duree_minutes)} min
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Volume2 className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm text-blue-700 font-medium">
                      Volume suggéré
                    </p>
                    <p className="text-lg font-bold text-blue-800">
                      {mlRecommendation.volume_eau_m3.toFixed(3)} m³
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-xs text-blue-700 flex items-center">
                  <Lightbulb className="h-3 w-3 mr-1" />
                  <strong>Conseil IA :</strong> Recommandation basée sur 15 paramètres agro-climatiques
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  💡 Vous gardez le contrôle total - Appliquez selon votre jugement terrain
                </p>
              </div>
            </div>
          )}

          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded border">
            🎯 Intelligence artificielle optionnelle - Vos paramètres manuels restent prioritaires
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
