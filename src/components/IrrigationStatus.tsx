
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, User } from 'lucide-react';
import { useMQTT } from '@/hooks/useMQTT';
import { activeUserService, ActiveUser } from '@/services/activeUserService';

export const IrrigationStatus = () => {
  const { irrigationStatus, isConnected, isManualMode } = useMQTT();
  const [activeUser, setActiveUser] = useState<ActiveUser | null>(null);

  useEffect(() => {
    // S'abonner aux changements d'utilisateur actif
    const unsubscribe = activeUserService.subscribe((user) => {
      setActiveUser(user);
    });

    // Charger l'utilisateur actuel
    setActiveUser(activeUserService.getActiveUser());
    
    return unsubscribe;
  }, []);

  if (!activeUser) {
    return (
      <Card className="h-fit">
        <CardHeader className="pb-4">
          <CardTitle>Zone d'Irrigation</CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="text-center py-8">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun utilisateur sélectionné
            </h3>
            <p className="text-gray-600">
              Sélectionnez un acteur agricole pour voir sa zone d'irrigation
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getCultureLabel = (type: string) => {
    const types = {
      '1': 'Légumes maraîchers',
      '2': 'Céréales', 
      '3': 'Légumineuses',
      '4': 'Cultures fruitières'
    };
    return types[type as keyof typeof types] || 'Non défini';
  };

  return (
    <Card className="h-fit">
      <CardHeader className="pb-4">
        <CardTitle>Zone d'Irrigation</CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="p-4 rounded-lg bg-green-50">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-green-800">
              Parcelle de {activeUser.prenom} {activeUser.nom}
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
              <span>{activeUser.localite}, {activeUser.region}</span>
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
              <p className="font-semibold">{(activeUser.superficie / 10000).toFixed(2)} hectares</p>
            </div>
            <div>
              <p className="text-gray-600">Type de sol</p>
              <p className="font-semibold">{activeUser.type_sol}</p>
            </div>
            <div>
              <p className="text-gray-600">Connexion</p>
              <p className={`font-semibold ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                {isConnected ? 'Connecté' : 'Déconnecté'}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Culture</p>
              <p className="font-semibold">{activeUser.speculation}</p>
            </div>
            <div>
              <p className="text-gray-600">Système</p>
              <p className="font-semibold">{activeUser.systeme_irrigation}</p>
            </div>
            <div>
              <p className="text-gray-600">Type Culture</p>
              <p className="font-semibold">{getCultureLabel(activeUser.type_culture)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
