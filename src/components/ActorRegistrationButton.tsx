
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UserPlus, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ActorRegistrationButton = () => {
  const navigate = useNavigate();

  const handleAddActor = () => {
    navigate('/register-actor');
  };

  const handleViewUsers = () => {
    navigate('/users-dashboard');
  };

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-white border-blue-200">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="text-center sm:text-left">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              Gestion des Acteurs Agricoles
            </h3>
            <p className="text-blue-600 text-sm">
              Enregistrez de nouveaux agriculteurs ou consultez les dashboards existants
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handleAddActor}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Ajouter un Acteur
            </Button>
            <Button 
              onClick={handleViewUsers}
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-2 rounded-md flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              Liste des Utilisateurs
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
