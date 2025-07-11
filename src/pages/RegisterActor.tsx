import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LocationAutocomplete } from "@/components/ui/location-autocomplete";
import { ArrowLeft, Save, MapPin, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { senegalLocationService } from '@/services/senegalLocationService';
import { useMockActors } from '@/hooks/useMockActors';

const SENEGAL_REGIONS = [
  'Dakar', 'Thiès', 'Saint-Louis', 'Diourbel', 'Louga', 'Fatick', 
  'Kaolack', 'Kaffrine', 'Tambacounda', 'Kédougou', 'Kolda', 
  'Ziguinchor', 'Sédhiou', 'Matam'
];

const IRRIGATION_SYSTEMS = [
  'Irrigation goutte à goutte',
  'Irrigation par aspersion', 
  'Irrigation par submersion',
  'Irrigation localisée micro-aspersion',
  'Irrigation gravitaire'
];

const SOIL_TYPES = [
  'Sablo-argileux',
  'Argileux',
  'Sableux',
  'Limoneux',
  'Latéritique'
];

const CROP_TYPES = [
  { value: '1', label: 'Légumes maraîchers (tomates, oignons, carottes, etc.)' },
  { value: '2', label: 'Céréales (mil, sorgho, maïs)' },
  { value: '3', label: 'Légumineuses (niébé, arachide)' },
  { value: '4', label: 'Cultures fruitières (mangues, agrumes)' }
];

const ACTOR_ROLES = [
  'Agriculteur',
  'Producteur agricole', 
  'Gérant de ferme agricole',
  'Acteur économique',
  'Investisseur'
];

const RegisterActor = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createActor, isLoading } = useMockActors();
  const [locationCoordinates, setLocationCoordinates] = useState<{lat: number; lng: number} | null>(null);
  
  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    email: '',
    telephone: '',
    adresse: '',
    ville: '',
    codePostal: '',
    typeUtilisateur: 'utilisateur' as const,
    statut: 'actif' as const,
    permissions: [] as string[]
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLocationChange = (value: string, coordinates?: { lat: number; lng: number }) => {
    handleInputChange('localite', value);
    if (coordinates) {
      setLocationCoordinates(coordinates);
      console.log('📍 Coordonnées définies:', coordinates);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      console.log('🚀 [DEMO] Début processus enregistrement acteur');
      
      // Créer l'acteur avec le service simulé
      const newActor = await createActor(formData);
      
      if (newActor) {
        console.log('✅ [DEMO] Acteur enregistré avec succès:', newActor);
        
        // Rediriger vers le dashboard
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      }
      
    } catch (error) {
      console.error('❌ [DEMO] Erreur enregistrement acteur:', error);
    }
  };

  const isFormValid = () => {
    return formData.prenom.trim() !== '' && 
           formData.nom.trim() !== '' && 
           formData.email.trim() !== '' && 
           formData.telephone.trim() !== '' &&
           formData.adresse.trim() !== '' &&
           formData.ville.trim() !== '' &&
           formData.codePostal.trim() !== '';
  };

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
          
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Enregistrement d'un Nouvel Acteur Agricole
          </h1>
          <p className="text-gray-600">
            Remplissez ce formulaire pour ajouter un nouveau bénéficiaire au système d'irrigation intelligente
          </p>
        </div>


        {/* Formulaire */}
        <Card>
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center space-x-2">
              <span>Informations de l'Acteur</span>
              {locationCoordinates && (
                <div className="flex items-center space-x-1 text-sm text-green-600">
                  <MapPin className="h-4 w-4" />
                  <span>Géolocalisé</span>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Informations personnelles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="prenom">Prénom *</Label>
                  <Input
                    id="prenom"
                    value={formData.prenom}
                    onChange={(e) => handleInputChange('prenom', e.target.value)}
                    placeholder="Entrez le prénom"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="nom">Nom *</Label>
                  <Input
                    id="nom"
                    value={formData.nom}
                    onChange={(e) => handleInputChange('nom', e.target.value)}
                    placeholder="Entrez le nom"
                    required
                  />
                </div>
              </div>

              {/* Contact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="exemple@email.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="telephone">Téléphone *</Label>
                  <Input
                    id="telephone"
                    value={formData.telephone}
                    onChange={(e) => handleInputChange('telephone', e.target.value)}
                    placeholder="+221 XX XXX XX XX"
                    required
                  />
                </div>
              </div>

              {/* Adresse */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="adresse">Adresse *</Label>
                  <Input
                    id="adresse"
                    value={formData.adresse}
                    onChange={(e) => handleInputChange('adresse', e.target.value)}
                    placeholder="Adresse complète"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="ville">Ville *</Label>
                  <Input
                    id="ville"
                    value={formData.ville}
                    onChange={(e) => handleInputChange('ville', e.target.value)}
                    placeholder="Ville"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="codePostal">Code Postal *</Label>
                  <Input
                    id="codePostal"
                    value={formData.codePostal}
                    onChange={(e) => handleInputChange('codePostal', e.target.value)}
                    placeholder="Code postal"
                    required
                  />
                </div>
              </div>

              {/* Type d'utilisateur */}
              <div>
                <Label htmlFor="typeUtilisateur">Type d'utilisateur *</Label>
                <Select value={formData.typeUtilisateur} onValueChange={(value) => handleInputChange('typeUtilisateur', value as 'admin' | 'utilisateur' | 'technicien')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="utilisateur">Utilisateur</SelectItem>
                    <SelectItem value="technicien">Technicien</SelectItem>
                    <SelectItem value="admin">Administrateur</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Bouton de soumission */}
              <div className="flex justify-end pt-6">
                <Button 
                  type="submit" 
                  disabled={!isFormValid() || isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-md flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {isLoading ? 'Enregistrement...' : 'Enregistrer l\'Acteur'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegisterActor;
