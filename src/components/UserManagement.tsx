
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
import { Actor } from '@/services/mockActorService';
import { useMockActors } from '@/hooks/useMockActors';

interface UserManagementProps {
  users: Actor[];
  onUserUpdated: () => void;
}

export const UserManagement = ({ users, onUserUpdated }: UserManagementProps) => {
  const { toast } = useToast();
  const { updateActor, deleteActor, selectActiveUser } = useMockActors();
  const [editingUser, setEditingUser] = useState<Actor | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Actor>>({});

  const handleEdit = (user: Actor) => {
    setEditingUser(user);
    setFormData(user);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingUser || !formData) return;

    try {
      const updatedActor = await updateActor(editingUser.id, formData);
      if (updatedActor) {
        setIsEditDialogOpen(false);
        onUserUpdated();
      }
    } catch (error) {
      console.error('❌ [DEMO] Erreur modification utilisateur:', error);
    }
  };

  const handleDelete = async (user: Actor) => {
    try {
      const success = await deleteActor(user.id);
      if (success) {
        onUserUpdated();
      }
    } catch (error) {
      console.error('❌ [DEMO] Erreur suppression utilisateur:', error);
    }
  };

  const getRoleColor = (role: string) => {
    const colors = {
      'admin': 'bg-red-100 text-red-800',
      'technicien': 'bg-blue-100 text-blue-800',
      'utilisateur': 'bg-green-100 text-green-800'
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
                <Badge className={`mt-1 ${getRoleColor(user.typeUtilisateur)}`}>
                  {user.typeUtilisateur}
                </Badge>
                <p className="text-sm text-gray-600 mt-1">
                  {user.ville} - {user.email}
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
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email || ''}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                      </div>

                      <div>
                        <Label htmlFor="telephone">Téléphone</Label>
                        <Input
                          id="telephone"
                          value={formData.telephone || ''}
                          onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                        />
                      </div>

                      <div>
                        <Label htmlFor="typeUtilisateur">Type</Label>
                        <Select 
                          value={formData.typeUtilisateur} 
                          onValueChange={(value) => setFormData({...formData, typeUtilisateur: value as 'admin' | 'utilisateur' | 'technicien'})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="utilisateur">Utilisateur</SelectItem>
                            <SelectItem value="technicien">Technicien</SelectItem>
                            <SelectItem value="admin">Administrateur</SelectItem>
                          </SelectContent>
                        </Select>
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
