// Indicateur de mode démo pour informer l'utilisateur
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info, Zap, Database, Wifi } from 'lucide-react';

export const DemoModeIndicator = () => {
  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <Zap className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900">Mode Démo Actif</h3>
              <p className="text-sm text-blue-700">
                Toutes les fonctionnalités sont simulées - Aucun serveur requis
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            DEMO
          </Badge>
        </div>
        
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex items-center space-x-2 p-2 bg-white/50 rounded-lg">
            <Database className="h-4 w-4 text-green-600" />
            <span className="text-xs text-green-700 font-medium">Backend Simulé</span>
          </div>
          <div className="flex items-center space-x-2 p-2 bg-white/50 rounded-lg">
            <Wifi className="h-4 w-4 text-green-600" />
            <span className="text-xs text-green-700 font-medium">MQTT Simulé</span>
          </div>
          <div className="flex items-center space-x-2 p-2 bg-white/50 rounded-lg">
            <Zap className="h-4 w-4 text-green-600" />
            <span className="text-xs text-green-700 font-medium">IA Simulée</span>
          </div>
        </div>

        <div className="mt-3 flex items-start space-x-2 p-2 bg-blue-50 rounded-lg">
          <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-700">
            <p className="font-medium">Fonctionnalités démo :</p>
            <ul className="mt-1 space-y-1 list-disc list-inside">
              <li>Recommandations IA intelligentes simulées</li>
              <li>Contrôle irrigation avec réponses réalistes</li>
              <li>Données météo et capteurs générées</li>
              <li>Interface complète sans dépendances externes</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};