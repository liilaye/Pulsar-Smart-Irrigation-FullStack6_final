
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin } from 'lucide-react';
import { useMQTT } from '@/hooks/useMQTT';

export const IrrigationStatus = () => {
  const { irrigationStatus, isConnected } = useMQTT();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Zone d'Irrigation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-green-800">Parcelle Arachide A1</h3>
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
              <div className={`w-3 h-3 rounded-full ${irrigationStatus ? 'bg-blue-500' : 'bg-gray-400'}`} />
              <span>Statut: {irrigationStatus ? "Arrosage actif" : "Pas d'arrosage"}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Surface</p>
            <p className="font-semibold">2.5 hectares</p>
          </div>
          <div>
            <p className="text-gray-600">Type de sol</p>
            <p className="font-semibold">Sablo-argileux</p>
          </div>
          <div>
            <p className="text-gray-600">Connexion</p>
            <p className={`font-semibold ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
              {isConnected ? 'Connecté' : 'Déconnecté'}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Dernière irrigation</p>
            <p className="font-semibold">Il y a 2h</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
