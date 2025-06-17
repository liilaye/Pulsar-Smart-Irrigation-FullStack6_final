
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, MapPin, Droplets, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { activeUserService, ActiveUser } from '@/services/activeUserService';

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
}

export const ActiveUserSelector = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [actors, setActors] = useState<RegisteredActor[]>([]);
  const [activeUser, setActiveUser] = useState<ActiveUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadActors();
    
    // S'abonner aux changements d'utilisateur actif
    const unsubscribe = activeUserService.subscribe((user) => {
      setActiveUser(user);
    });

    // Charger l'utilisateur actuel
    setActiveUser(activeUserService.getActiveUser());
    
    return unsubscribe;
  }, []);

  const loadActors = async () => {
    try {
      console.log('📋 Chargement des acteurs...');
      
      const response = await fetch('/api/actors/list');
      if (response.ok) {
        const data = await response.json();
        setActors(data.actors || []);
        console.log('✅ Acteurs chargés:', data.actors?.length || 0);
        
        // Si pas d'utilisateur actif et il y a des acteurs, charger depuis l'URL ou localStorage
        if (!activeUserService.getActiveUser() && data.actors?.length > 0) {
          await activeUserService.loadActiveUserFromAPI();
        }
      } else {
        throw new Error('Erreur lors du chargement');
      }
    } catch (error) {
      console.error('❌ Erreur chargement acteurs:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger la liste des acteurs.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserChange = async (userId: string) => {
    try {
      const response = await fetch(`/api/actors/${userId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.actor) {
          activeUserService.setActiveUser(data.actor);
          toast({
            title: "Utilisateur changé",
            description: `Vous consultez maintenant les données de ${data.actor.prenom} ${data.actor.nom}`,
          });
        }
      }
    } catch (error) {
      console.error('❌ Erreur changement utilisateur:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données de cet utilisateur.",
        variant: "destructive"
      });
    }
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
      <Card>
        <CardContent className="py-6">
          <div className="animate-pulse flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (actors.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-600" />
            <span>Aucun Acteur Enregistré</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun acteur agricole enregistré
          </h3>
          <p className="text-gray-600 mb-4">
            Commencez par enregistrer votre premier acteur pour utiliser le système
          </p>
          <Button 
            onClick={() => navigate('/register-actor')}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <User className="h-4 w-4 mr-2" />
            Enregistrer un Acteur
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-600" />
            <span>Utilisateur Actif</span>
          </div>
          <Button 
            onClick={() => navigate('/users-dashboard')}
            variant="outline"
            size="sm"
          >
            Voir Tous
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sélecteur d'utilisateur */}
        <div>
          <Select 
            value={activeUser?.id.toString() || ''} 
            onValueChange={handleUserChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sélectionnez un utilisateur..." />
            </SelectTrigger>
            <SelectContent>
              {actors.map((actor) => (
                <SelectItem key={actor.id} value={actor.id.toString()}>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>{actor.prenom} {actor.nom}</span>
                    <span className="text-xs text-gray-500">- {actor.localite}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Informations de l'utilisateur actif */}
        {activeUser && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-semibold text-blue-800">
                  {activeUser.prenom} {activeUser.nom}
                </h4>
                <Badge className={`mt-1 ${getRoleColor(activeUser.role)}`}>
                  {activeUser.role}
                </Badge>
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center text-gray-600">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{activeUser.localite}, {activeUser.region}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Droplets className="h-4 w-4 mr-2" />
                <span>{activeUser.systeme_irrigation}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500">Superficie:</span>
                  <span className="font-medium ml-1">{activeUser.superficie.toLocaleString()} m²</span>
                </div>
                <div>
                  <span className="text-gray-500">Culture:</span>
                  <span className="font-medium ml-1">{activeUser.speculation}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-3 pt-2 border-t border-blue-200">
              <p className="text-xs text-blue-600">
                📊 Toutes les données affichées correspondent à cet utilisateur
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
