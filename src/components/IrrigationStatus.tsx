
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
  },
  {
    id: 'B2',
    nom: 'Parcelle Maïs B2',
    culture: 'Maïs',
    surface: '3.2 hectares',
    sol: 'Argileux',
    active: false
  },
  {
    id: 'C3',
    nom: 'Parcelle Mil C3',
    culture: 'Mil',
    surface: '1.8 hectares',
    sol: 'Sableux',
    active: false
  },
  {
    id: 'D4',
    nom: 'Parcelle Tomate D4',
    culture: 'Tomate',
    surface: '0.5 hectares',
    sol: 'Limoneux',
    active: false
  }
];

export const IrrigationStatus = () => {
  const { irrigationStatus, isConnected, isManualMode } = useMQTT();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Zone d'Irrigation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {parcelles.map((parcelle) => (
          <div 
            key={parcelle.id}
            className={`p-4 rounded-lg ${
              parcelle.active ? 'bg-green-50' : 'bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className={`font-semibold ${
                parcelle.active ? 'text-green-800' : 'text-gray-600'
              }`}>
                {parcelle.nom}
              </h3>
              {parcelle.active ? (
                <Badge 
                  variant={irrigationStatus ? "default" : "secondary"}
                  className={irrigationStatus ? "bg-green-600" : "bg-gray-500"}
                >
                  {irrigationStatus ? "EN COURS" : "ARRÊTÉ"}
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-gray-400">
                  DÉSACTIVÉE
                </Badge>
              )}
            </div>
            
            <div className={`space-y-2 text-sm ${
              parcelle.active ? 'text-green-700' : 'text-gray-500'
            }`}>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Taiba Ndiaye, Thiès</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  parcelle.active && irrigationStatus ? 'bg-blue-500' : 'bg-gray-400'
                }`} />
                <span>
                  {parcelle.active ? 
                    (irrigationStatus ? 
                      `Arrosage actif ${isManualMode ? '(Manuel)' : '(Auto)'}` : 
                      "Pas d'arrosage"
                    ) : 
                    "Parcelle inactive"
                  }
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm mt-3">
              <div>
                <p className={parcelle.active ? "text-gray-600" : "text-gray-400"}>Surface</p>
                <p className={`font-semibold ${parcelle.active ? "" : "text-gray-500"}`}>
                  {parcelle.surface}
                </p>
              </div>
              <div>
                <p className={parcelle.active ? "text-gray-600" : "text-gray-400"}>Type de sol</p>
                <p className={`font-semibold ${parcelle.active ? "" : "text-gray-500"}`}>
                  {parcelle.sol}
                </p>
              </div>
              <div>
                <p className={parcelle.active ? "text-gray-600" : "text-gray-400"}>Connexion</p>
                <p className={`font-semibold ${
                  parcelle.active ? 
                    (isConnected ? 'text-green-600' : 'text-red-600') : 
                    'text-gray-500'
                }`}>
                  {parcelle.active ? 
                    (isConnected ? 'Connecté' : 'Déconnecté') : 
                    'Désactivé'
                  }
                </p>
              </div>
              <div>
                <p className={parcelle.active ? "text-gray-600" : "text-gray-400"}>Culture</p>
                <p className={`font-semibold ${parcelle.active ? "" : "text-gray-500"}`}>
                  {parcelle.culture}
                </p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
