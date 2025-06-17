
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Trash2, Save, X } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { activeUserService, ActiveUser } from '@/services/activeUserService';

interface UserManagementProps {
  users: ActiveUser[];
  onUserUpdated: () => void;
}

export const UserManagement = ({ users, onUserUpdated }: UserManagementProps) => {
  const { toast } = useToast();
  const [editingUser, setEditingUser] = useState<ActiveUser | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<ActiveUser>>({});

  const handleEdit = (user: ActiveUser) => {
    setEditingUser(user);
    setFormData(user);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingUser || !formData) return;

    try {
      const response = await fetch(`/api/actors/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: "Utilisateur modifié",
          description: `${formData.prenom} ${formData.nom} a été modifié avec succès.`,
        });
        
        // Mettre à jour l'utilisateur actif si c'est celui qui est modifié
        const activeUser = activeUserService.getActiveUser();
        if (activeUser?.id === editingUser.id) {
          activeUserService.setActiveUser(formData as ActiveUser);
        }
        
        setIsEditDialogOpen(false);
        onUserUpdated();
      } else {
        throw new Error('Erreur lors de la modification');
      }
    } catch (error) {
      console.error('❌ Erreur modification utilisateur:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier l'utilisateur.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (user: ActiveUser) => {
    try {
      const response = await fetch(`/api/actors/${user.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: "Utilisateur supprimé",
          description: `${user.prenom} ${user.nom} a été supprimé avec succès.`,
        });
        
        // Effacer l'utilisateur actif si c'est celui qui est supprimé
        const activeUser = activeUserService.getActiveUser();
        if (activeUser?.id === user.id) {
          activeUserService.clearActiveUser();
        }
        
        onUserUpdated();
      } else {
        throw new Error('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('❌ Erreur suppression utilisateur:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'utilisateur.",
        variant: "destructive"
      });
    }
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

  if (users.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {users.map((user) => (
        <Card key={user.id} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div>
                <h4 className="font-semibold text-lg">
                  {user.prenom} {user.nom}
                </h4>
                <Badge className={`mt-1 ${getRoleColor(user.role)}`}>
                  {user.role}
                </Badge>
                <p className="text-sm text-gray-600 mt-1">
                  {user.localite}, {user.region}
                </p>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(user)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Modifier {user.prenom} {user.nom}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="prenom">Prénom</Label>
                        <Input
                          id="prenom"
                          value={formData.prenom || ''}
                          onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="nom">Nom</Label>
                        <Input
                          id="nom"
                          value={formData.nom || ''}
                          onChange={(e) => setFormData({...formData, nom: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="role">Rôle</Label>
                      <Select 
                        value={formData.role} 
                        onValueChange={(value) => setFormData({...formData, role: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Agriculteur">Agriculteur</SelectItem>
                          <SelectItem value="Producteur agricole">Producteur agricole</SelectItem>
                          <SelectItem value="Gérant de ferme agricole">Gérant de ferme agricole</SelectItem>
                          <SelectItem value="Acteur économique">Acteur économique</SelectItem>
                          <SelectItem value="Investisseur">Investisseur</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="speculation">Spéculation</Label>
                      <Input
                        id="speculation"
                        value={formData.speculation || ''}
                        onChange={(e) => setFormData({...formData, speculation: e.target.value})}
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                        <X className="h-4 w-4 mr-2" />
                        Annuler
                      </Button>
                      <Button onClick={handleSaveEdit}>
                        <Save className="h-4 w-4 mr-2" />
                        Sauvegarder
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Supprimer l'utilisateur</AlertDialogTitle>
                    <AlertDialogDescription>
                      Êtes-vous sûr de vouloir supprimer {user.prenom} {user.nom} ? 
                      Cette action est irréversible.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(user)}>
                      Supprimer
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
