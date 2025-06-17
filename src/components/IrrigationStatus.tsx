
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin } from 'lucide-react';
import { useMQTT } from '@/hooks/useMQTT';

const parcelles = [
  {
    id: 'A1',
    nom: 'Parcelle Arachide A1',
    culture: 'Arachide',
    surface: '2.5 hectares',
    sol: 'Sablo-argileux',
    active: true
  }
];

export const IrrigationStatus = () => {
  const { irrigationStatus, isConnected, isManualMode } = useMQTT();

  return (
    <Card className="h-fit">
      <CardHeader className="pb-4">
        <CardTitle>Zone d'Irrigation</CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        {parcelles.map((parcelle) => (
          <div 
            key={parcelle.id}
            className="p-4 rounded-lg bg-green-50"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-green-800">
                {parcelle.nom}
              </h3>
              <Badge 
                variant={irrigationStatus ? "default" : "secondary"}
                className={irrigationStatus ? "bg-green-600" : "bg-gray-500"}
              >
                {irrigationStatus ? "EN COURS" : "ARRÊTÉ"}
              </Badge>
            </div>
            
            <div className="space-y-2 text-sm text-green-700">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Taiba Ndiaye, Thiès</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  irrigationStatus ? 'bg-blue-500' : 'bg-gray-400'
                }`} />
                <span>
                  {irrigationStatus ? 
                    `Arrosage actif ${isManualMode ? '(Manuel)' : '(Auto)'}` : 
                    "Pas d'arrosage"
                  }
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm mt-3">
              <div>
                <p className="text-gray-600">Surface</p>
                <p className="font-semibold">{parcelle.surface}</p>
              </div>
              <div>
                <p className="text-gray-600">Type de sol</p>
                <p className="font-semibold">{parcelle.sol}</p>
              </div>
              <div>
                <p className="text-gray-600">Connexion</p>
                <p className={`font-semibold ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                  {isConnected ? 'Connecté' : 'Déconnecté'}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Culture</p>
                <p className="font-semibold">{parcelle.culture}</p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
