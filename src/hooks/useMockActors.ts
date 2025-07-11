// Hook pour gestion d'acteurs simulé
import { useState, useEffect, useCallback } from 'react';
import { mockActorService, type Actor } from '@/services/mockActorService';
import { toast } from 'sonner';

export const useMockActors = () => {
  const [actors, setActors] = useState<Actor[]>([]);
  const [activeUser, setActiveUser] = useState<Actor | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredActors, setFilteredActors] = useState<Actor[]>([]);

  // Charger tous les acteurs
  const loadActors = useCallback(async () => {
    setIsLoading(true);
    try {
      const allActors = await mockActorService.getAllActors();
      setActors(allActors);
      console.log('🟢 [DEMO] Acteurs chargés:', allActors.length);
    } catch (error) {
      console.error('❌ [DEMO] Erreur chargement acteurs:', error);
      toast.error('Erreur lors du chargement des acteurs');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Charger l'utilisateur actif
  const loadActiveUser = useCallback(async () => {
    try {
      const user = mockActorService.getActiveUser();
      setActiveUser(user);
      console.log('🟢 [DEMO] Utilisateur actif chargé:', user?.nom || 'Aucun');
    } catch (error) {
      console.error('❌ [DEMO] Erreur chargement utilisateur actif:', error);
    }
  }, []);

  // Créer un nouvel acteur
  const createActor = useCallback(async (actorData: Omit<Actor, 'id' | 'dateCreation'>) => {
    setIsLoading(true);
    try {
      // Vérifier l'unicité de l'email
      const isUnique = await mockActorService.isEmailUnique(actorData.email);
      if (!isUnique) {
        toast.error('Erreur', {
          description: 'Cet email est déjà utilisé par un autre acteur'
        });
        return null;
      }

      const newActor = await mockActorService.createActor(actorData);
      await loadActors(); // Recharger la liste
      
      toast.success('Acteur créé avec succès!', {
        description: `${newActor.prenom} ${newActor.nom} a été enregistré`
      });
      
      console.log('🟢 [DEMO] Nouvel acteur créé:', newActor);
      return newActor;
    } catch (error) {
      console.error('❌ [DEMO] Erreur création acteur:', error);
      toast.error('Erreur lors de la création de l\'acteur');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [loadActors]);

  // Mettre à jour un acteur
  const updateActor = useCallback(async (id: string, updates: Partial<Actor>) => {
    setIsLoading(true);
    try {
      // Si l'email est modifié, vérifier l'unicité
      if (updates.email) {
        const isUnique = await mockActorService.isEmailUnique(updates.email, id);
        if (!isUnique) {
          toast.error('Erreur', {
            description: 'Cet email est déjà utilisé par un autre acteur'
          });
          return null;
        }
      }

      const updatedActor = await mockActorService.updateActor(id, updates);
      if (updatedActor) {
        await loadActors(); // Recharger la liste
        
        // Si c'est l'utilisateur actif, mettre à jour
        if (activeUser?.id === id) {
          setActiveUser(updatedActor);
        }
        
        toast.success('Acteur mis à jour!', {
          description: `${updatedActor.prenom} ${updatedActor.nom} a été modifié`
        });
        
        console.log('🟢 [DEMO] Acteur mis à jour:', updatedActor);
        return updatedActor;
      }
      return null;
    } catch (error) {
      console.error('❌ [DEMO] Erreur mise à jour acteur:', error);
      toast.error('Erreur lors de la mise à jour de l\'acteur');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [loadActors, activeUser]);

  // Supprimer un acteur
  const deleteActor = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const actorToDelete = actors.find(a => a.id === id);
      const success = await mockActorService.deleteActor(id);
      
      if (success) {
        await loadActors(); // Recharger la liste
        
        toast.success('Acteur supprimé!', {
          description: `${actorToDelete?.prenom} ${actorToDelete?.nom} a été retiré du système`
        });
        
        console.log('🟢 [DEMO] Acteur supprimé:', actorToDelete?.nom);
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ [DEMO] Erreur suppression acteur:', error);
      toast.error('Erreur lors de la suppression de l\'acteur');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [actors, loadActors]);

  // Définir l'utilisateur actif
  const selectActiveUser = useCallback(async (actor: Actor | null) => {
    try {
      await mockActorService.setActiveUser(actor);
      setActiveUser(actor);
      
      if (actor) {
        toast.success('Utilisateur sélectionné!', {
          description: `${actor.prenom} ${actor.nom} est maintenant actif`
        });
        console.log('🟢 [DEMO] Utilisateur actif sélectionné:', actor.nom);
      } else {
        toast.info('Utilisateur déconnecté');
        console.log('🟢 [DEMO] Aucun utilisateur actif');
      }
    } catch (error) {
      console.error('❌ [DEMO] Erreur sélection utilisateur actif:', error);
      toast.error('Erreur lors de la sélection de l\'utilisateur');
    }
  }, []);

  // Recherche d'acteurs
  const searchActors = useCallback(async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredActors(actors);
      return;
    }

    try {
      const results = await mockActorService.searchActors(query);
      setFilteredActors(results);
      console.log('🟢 [DEMO] Recherche:', query, '- Résultats:', results.length);
    } catch (error) {
      console.error('❌ [DEMO] Erreur recherche acteurs:', error);
      setFilteredActors([]);
    }
  }, [actors]);

  // Filtrer par type
  const filterByType = useCallback(async (type: Actor['typeUtilisateur']) => {
    try {
      const results = await mockActorService.getActorsByType(type);
      setFilteredActors(results);
      console.log('🟢 [DEMO] Filtrage par type:', type, '- Résultats:', results.length);
    } catch (error) {
      console.error('❌ [DEMO] Erreur filtrage par type:', error);
      setFilteredActors([]);
    }
  }, []);

  // Obtenir les statistiques
  const getStats = useCallback(async () => {
    try {
      const stats = await mockActorService.getActorStats();
      console.log('🟢 [DEMO] Statistiques acteurs récupérées:', stats);
      return stats;
    } catch (error) {
      console.error('❌ [DEMO] Erreur récupération statistiques:', error);
      return null;
    }
  }, []);

  // Charger les données au montage
  useEffect(() => {
    loadActors();
    loadActiveUser();
  }, [loadActors, loadActiveUser]);

  // Mettre à jour les acteurs filtrés quand la liste change
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredActors(actors);
    } else {
      searchActors(searchQuery);
    }
  }, [actors, searchQuery, searchActors]);

  return {
    // État
    actors,
    activeUser,
    isLoading,
    searchQuery,
    filteredActors,
    
    // Actions
    loadActors,
    createActor,
    updateActor,
    deleteActor,
    selectActiveUser,
    searchActors,
    filterByType,
    getStats,
    
    // Utilitaires
    setSearchQuery,
    totalActors: actors.length,
    activeActors: actors.filter(a => a.statut === 'actif').length
  };
};