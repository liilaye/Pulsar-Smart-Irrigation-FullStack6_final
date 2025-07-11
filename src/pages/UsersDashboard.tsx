
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Eye, MapPin, User, Droplets, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { UserManagement } from '@/components/UserManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMockActors } from '@/hooks/useMockActors';

interface RegisteredActor {
  id: number;
  prenom: string;
  nom: string;
  role: string;
  region: string;
  localite: string;
  superficie: number;
  systeme_irrigation: string;
  type_sol: string;
  type_culture: string;
  speculation: string;
  created_at: string;
}

const UsersDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { actors, isLoading, loadActors } = useMockActors();

  const handleViewDashboard = (actorId: string) => {
    navigate(`/dashboard?userId=${actorId}`);
  };

  const getCultureLabel = (type: string) => {
    const types = {
      '1': 'Légumes maraîchers',
      '2': 'Céréales', 
      '3': 'Légumineuses',
      '4': 'Cultures fruitières'
    };
    return types[type as keyof typeof types] || 'Non défini';
  };

  const getRoleColor = (role: string) => {
    const colors = {
      'Agriculteur': 'bg-green-100 text-green-800',
      'Producteur agricole': 'bg-blue-100 text-blue-800',
      'Gérant de ferme agricole': 'bg-purple-100 text-purple-800',
      'Acteur économique': 'bg-orange-100 text-orange-800',
      'Investisseur': 'bg-yellow-100 text-yellow-800'
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement des acteurs...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button 
            onClick={() => navigate('/dashboard')}
            variant="ghost" 
            className="mb-4 text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au Dashboard
          </Button>
          
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Gestion des Acteurs Agricoles
              </h1>
              <p className="text-gray-600">
                {actors.length} acteur(s) enregistré(s) dans le système
              </p>
            </div>
            <Button 
              onClick={() => navigate('/register-actor')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <User className="h-4 w-4 mr-2" />
              Ajouter un Acteur
            </Button>
          </div>
        </div>

        {actors.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucun acteur enregistré
              </h3>
              <p className="text-gray-600 mb-4">
                Commencez par enregistrer votre premier acteur agricole
              </p>
              <Button 
                onClick={() => navigate('/register-actor')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Ajouter un Acteur
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="view" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="view">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="manage">Gestion</TabsTrigger>
            </TabsList>
            
            <TabsContent value="view" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {actors.map((actor) => (
                  <Card key={actor.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg text-blue-800">
                            {actor.prenom} {actor.nom}
                          </CardTitle>
                          <Badge className={`mt-2 ${getRoleColor(actor.typeUtilisateur)}`}>
                            {actor.typeUtilisateur}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{actor.ville}</span>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Email:</span>
                          <span className="font-medium">{actor.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Téléphone:</span>
                          <span className="font-medium">{actor.telephone}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Statut:</span>
                          <Badge variant={actor.statut === 'actif' ? 'default' : 'secondary'}>
                            {actor.statut}
                          </Badge>
                        </div>
                      </div>

                      <Button
                        onClick={() => handleViewDashboard(actor.id)}
                        className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Voir Dashboard
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="manage" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="h-5 w-5" />
                    <span>Gestion des Utilisateurs</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <UserManagement users={actors} onUserUpdated={loadActors} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default UsersDashboard;
