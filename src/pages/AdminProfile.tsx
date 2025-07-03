import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, User, Edit3, MapPin, Briefcase, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { LocationAutocomplete } from "@/components/ui/location-autocomplete";
import { completeSenegalLocationService } from '@/services/completeSenegalLocationService';

interface AdminProfile {
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  poste: string;
  organisation: string;
  region: string;
  localite: string;
  bio: string;
  dateCreation: string;
  derniereMiseAJour: string;
}

const ADMIN_ROLES = [
  'Administrateur Système',
  'Ingénieur Agricole',
  'Responsable Technique',
  'Chef de Projet Irrigation',
  'Consultant Agricole',
  'Responsable R&D',
  'Directeur Technique'
];

const SENEGAL_REGIONS = [
  'Dakar', 'Thiès', 'Saint-Louis', 'Diourbel', 'Louga', 'Fatick', 
  'Kaolack', 'Kaffrine', 'Tambacounda', 'Kédougou', 'Kolda', 
  'Ziguinchor', 'Sédhiou', 'Matam'
];

const AdminProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [locationCoordinates, setLocationCoordinates] = useState<{lat: number; lng: number} | null>(null);
  
  const [profile, setProfile] = useState<AdminProfile>({
    prenom: 'Amadou',
    nom: 'DIOP',
    email: 'admin@pulsar-infinite.sn',
    telephone: '+221 77 123 45 67',
    poste: 'Administrateur Système',
    organisation: 'Pulsar-Infinite Technologies',
    region: 'Thiès',
    localite: 'Taïba Ndiaye',
    bio: 'Ingénieur en systèmes d\'irrigation intelligente avec 10 ans d\'expérience dans l\'agriculture de précision au Sénégal.',
    dateCreation: '2024-01-15',
    derniereMiseAJour: new Date().toISOString().split('T')[0]
  });

  const [originalProfile, setOriginalProfile] = useState<AdminProfile>(profile);

  useEffect(() => {
    // Charger le profil depuis localStorage ou API
    const savedProfile = localStorage.getItem('admin_profile');
    if (savedProfile) {
      try {
        const parsedProfile = JSON.parse(savedProfile);
        setProfile(parsedProfile);
        setOriginalProfile(parsedProfile);
      } catch (error) {
        console.error('Erreur chargement profil admin:', error);
      }
    }

    // Obtenir les coordonnées de la localité
    if (profile.localite && profile.region) {
      const coordinates = completeSenegalLocationService.getLocationCoordinates(profile.localite, profile.region);
      if (coordinates) {
        setLocationCoordinates({ lat: coordinates.lat, lng: coordinates.lng });
      }
    }
  }, []);

  const handleInputChange = (field: keyof AdminProfile, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLocationChange = (value: string, coordinates?: { lat: number; lng: number }) => {
    handleInputChange('localite', value);
    if (coordinates) {
      setLocationCoordinates(coordinates);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    
    try {
      // Valider les champs obligatoires
      const requiredFields = ['prenom', 'nom', 'email', 'telephone', 'poste'];
      const missingFields = requiredFields.filter(field => !profile[field as keyof AdminProfile].trim());
      
      if (missingFields.length > 0) {
        toast({
          title: "Champs manquants",
          description: `Veuillez remplir: ${missingFields.join(', ')}`,
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      // Valider email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(profile.email)) {
        toast({
          title: "Email invalide",
          description: "Veuillez entrer une adresse email valide",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      // Valider localité si région et localité sont renseignées
      if (profile.region && profile.localite) {
        const isValid = completeSenegalLocationService.validateLocation(profile.localite, profile.region);
        if (!isValid) {
          toast({
            title: "Localité invalide",
            description: "Veuillez sélectionner une localité valide dans la liste",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }
      }

      // Mettre à jour la date de modification
      const updatedProfile = {
        ...profile,
        derniereMiseAJour: new Date().toISOString().split('T')[0]
      };

      // Sauvegarder dans localStorage
      localStorage.setItem('admin_profile', JSON.stringify(updatedProfile));
      
      // Ici on pourrait aussi envoyer vers une API
      // await api.updateAdminProfile(updatedProfile);

      setProfile(updatedProfile);
      setOriginalProfile(updatedProfile);
      setIsEditing(false);

      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été sauvegardées avec succès",
      });

    } catch (error) {
      console.error('Erreur sauvegarde profil:', error);
      toast({
        title: "Erreur de sauvegarde",
        description: "Impossible de sauvegarder le profil. Réessayez.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setProfile(originalProfile);
    setIsEditing(false);
  };

  const hasChanges = JSON.stringify(profile) !== JSON.stringify(originalProfile);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
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
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Profil Administrateur
              </h1>
              <p className="text-gray-600">
                Gérez vos informations personnelles et professionnelles
              </p>
            </div>
            
            <div className="flex space-x-3">
              {isEditing ? (
                <>
                  <Button 
                    variant="outline" 
                    onClick={handleCancel}
                    disabled={isLoading}
                  >
                    Annuler
                  </Button>
                  <Button 
                    onClick={handleSave}
                    disabled={isLoading || !hasChanges}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading ? 'Enregistrement...' : 'Sauvegarder'}
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Modifier le profil
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informations personnelles */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5 text-blue-600" />
                <span>Informations Personnelles</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="prenom">Prénom *</Label>
                  <Input
                    id="prenom"
                    value={profile.prenom}
                    onChange={(e) => handleInputChange('prenom', e.target.value)}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-gray-50' : ''}
                  />
                </div>
                <div>
                  <Label htmlFor="nom">Nom *</Label>
                  <Input
                    id="nom"
                    value={profile.nom}
                    onChange={(e) => handleInputChange('nom', e.target.value)}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-gray-50' : ''}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-gray-50' : ''}
                  />
                </div>
                <div>
                  <Label htmlFor="telephone">Téléphone *</Label>
                  <Input
                    id="telephone"
                    value={profile.telephone}
                    onChange={(e) => handleInputChange('telephone', e.target.value)}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-gray-50' : ''}
                    placeholder="+221 XX XXX XX XX"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="bio">Biographie</Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  disabled={!isEditing}
                  className={!isEditing ? 'bg-gray-50' : ''}
                  placeholder="Décrivez votre expérience et vos compétences..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Informations professionnelles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Briefcase className="h-5 w-5 text-blue-600" />
                <span>Professionnel</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="poste">Poste *</Label>
                {isEditing ? (
                  <Select value={profile.poste} onValueChange={(value) => handleInputChange('poste', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un poste" />
                    </SelectTrigger>
                    <SelectContent>
                      {ADMIN_ROLES.map((role) => (
                        <SelectItem key={role} value={role}>{role}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    value={profile.poste}
                    disabled
                    className="bg-gray-50"
                  />
                )}
              </div>

              <div>
                <Label htmlFor="organisation">Organisation</Label>
                <Input
                  id="organisation"
                  value={profile.organisation}
                  onChange={(e) => handleInputChange('organisation', e.target.value)}
                  disabled={!isEditing}
                  className={!isEditing ? 'bg-gray-50' : ''}
                  placeholder="Nom de votre organisation"
                />
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-800 flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  Localisation
                </h4>
                
                <div>
                  <Label htmlFor="region">Région</Label>
                  {isEditing ? (
                    <Select value={profile.region} onValueChange={(value) => handleInputChange('region', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez une région" />
                      </SelectTrigger>
                      <SelectContent>
                        {SENEGAL_REGIONS.map((region) => (
                          <SelectItem key={region} value={region}>{region}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      value={profile.region}
                      disabled
                      className="bg-gray-50"
                    />
                  )}
                </div>

                <div>
                  {isEditing ? (
                    <LocationAutocomplete
                      label="Localité"
                      value={profile.localite}
                      onChange={handleLocationChange}
                      region={profile.region}
                      placeholder="Tapez pour chercher..."
                    />
                  ) : (
                    <>
                      <Label>Localité</Label>
                      <Input
                        value={profile.localite}
                        disabled
                        className="bg-gray-50"
                      />
                    </>
                  )}
                </div>

                {locationCoordinates && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800 font-medium">
                      📍 Position géographique confirmée
                    </p>
                    <p className="text-xs text-green-600">
                      {locationCoordinates.lat.toFixed(4)}, {locationCoordinates.lng.toFixed(4)}
                    </p>
                  </div>
                )}
              </div>

              {/* Métadonnées */}
              <div className="pt-4 border-t space-y-2">
                <div className="text-sm text-gray-600">
                  <strong>Compte créé:</strong> {new Date(profile.dateCreation).toLocaleDateString('fr-FR')}
                </div>
                <div className="text-sm text-gray-600">
                  <strong>Dernière mise à jour:</strong> {new Date(profile.derniereMiseAJour).toLocaleDateString('fr-FR')}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistiques et raccourcis */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <Phone className="h-8 w-8 mx-auto text-blue-600 mb-2" />
              <h3 className="font-semibold text-gray-800">Support Technique</h3>
              <p className="text-sm text-gray-600 mt-1">
                Assistance 24/7 pour les administrateurs système
              </p>
              <Button variant="outline" size="sm" className="mt-3">
                Contacter le support
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <User className="h-8 w-8 mx-auto text-green-600 mb-2" />
              <h3 className="font-semibold text-gray-800">Gestion Utilisateurs</h3>
              <p className="text-sm text-gray-600 mt-1">
                Gérer les comptes agriculteurs et les permissions
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3"
                onClick={() => navigate('/users-dashboard')}
              >
                Gérer les utilisateurs
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Briefcase className="h-8 w-8 mx-auto text-purple-600 mb-2" />
              <h3 className="font-semibold text-gray-800">Système</h3>
              <p className="text-sm text-gray-600 mt-1">
                Configuration et maintenance du système
              </p>
              <Button variant="outline" size="sm" className="mt-3">
                Paramètres système
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;