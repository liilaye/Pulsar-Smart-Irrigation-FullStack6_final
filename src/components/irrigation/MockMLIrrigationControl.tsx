// Composant de contrôle ML Irrigation simulé pour la démo
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Brain, Play, Square, Loader2, Timer, Droplets, Gauge } from 'lucide-react';
import { useMockMLIrrigation } from '@/hooks/useMockMLIrrigation';
import { useMockMQTT } from '@/hooks/useMockMQTT';

export const MockMLIrrigationControl = () => {
  const {
    lastMLRecommendation,
    isMLActive,
    isLoading,
    lastMLCommand,
    startTime,
    generateMLRecommendation,
    toggleMLIrrigation,
    getMLMetrics
  } = useMockMLIrrigation();

  const { isConnected: isMqttConnected, connectionHealth } = useMockMQTT();

  const metrics = getMLMetrics();

  const getConnectionBadge = () => {
    if (!isMqttConnected) {
      return <Badge variant="destructive">Déconnecté</Badge>;
    }
    
    const variant = connectionHealth === 'excellent' ? 'default' : 
                   connectionHealth === 'good' ? 'secondary' : 'outline';
    
    return <Badge variant={variant}>✅ DEMO Connecté</Badge>;
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-emerald-600" />
            <span>Contrôle IA Irrigation [DEMO]</span>
          </CardTitle>
          {getConnectionBadge()}
        </div>
        
        {lastMLCommand && (
          <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
            💡 {lastMLCommand}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Bouton génération recommandation */}
        <div className="space-y-2">
          <Button
            onClick={generateMLRecommendation}
            disabled={isLoading}
            className="w-full"
            variant="outline"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Génération IA en cours...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Générer Recommandation IA
              </>
            )}
          </Button>
        </div>

        {/* Affichage de la recommandation */}
        {lastMLRecommendation && (
          <div className="p-3 bg-white rounded-lg border border-emerald-200">
            <h4 className="font-medium text-emerald-800 mb-2">📊 Recommandation IA :</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center space-x-2">
                <Timer className="h-4 w-4 text-blue-500" />
                <span>{Math.floor(lastMLRecommendation.duree_minutes)} minutes</span>
              </div>
              <div className="flex items-center space-x-2">
                <Droplets className="h-4 w-4 text-blue-500" />
                <span>{Math.round(lastMLRecommendation.volume_eau_m3 * 1000)}L</span>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-2">{lastMLRecommendation.matt}</p>
          </div>
        )}

        <Separator />

        {/* Contrôle irrigation */}
        <div className="space-y-3">
          <Button
            onClick={toggleMLIrrigation}
            disabled={isLoading || !lastMLRecommendation || !isMqttConnected}
            className={`w-full ${isMLActive ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Traitement...
              </>
            ) : isMLActive ? (
              <>
                <Square className="h-4 w-4 mr-2" />
                🚫 ARRÊTER Irrigation IA
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                🚿 DÉMARRER Irrigation IA
              </>
            )}
          </Button>

          {!lastMLRecommendation && (
            <p className="text-xs text-amber-600 text-center">
              ⚠️ Générez d'abord une recommandation IA
            </p>
          )}

          {!isMqttConnected && (
            <p className="text-xs text-red-600 text-center">
              ❌ MQTT déconnecté - Impossible de démarrer
            </p>
          )}
        </div>

        {/* Progression en temps réel */}
        {isMLActive && metrics && (
          <div className="p-3 bg-emerald-100 rounded-lg border border-emerald-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-emerald-800">🚿 Irrigation en cours</span>
              <Badge variant="default" className="bg-emerald-600">ACTIF</Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-emerald-700">
                <span>Temps écoulé: {formatDuration(metrics.elapsedSeconds)}</span>
                <span>Restant: {formatDuration(metrics.remainingSeconds)}</span>
              </div>
              
              <Progress 
                value={metrics.progressPercentage} 
                className="h-2 bg-emerald-200"
              />
              
              <div className="flex items-center space-x-2 text-xs text-emerald-600">
                <Gauge className="h-3 w-3" />
                <span>{Math.round(metrics.progressPercentage)}% terminé</span>
                {metrics.estimatedEndTime && (
                  <>
                    <span>•</span>
                    <span>Fin: {metrics.estimatedEndTime.toLocaleTimeString()}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Statut du système */}
        <div className="text-xs text-gray-500 text-center p-2 bg-gray-50 rounded">
          🎯 Mode Démo - Toutes les fonctions IA sont simulées de manière intelligente
        </div>
      </CardContent>
    </Card>
  );
};