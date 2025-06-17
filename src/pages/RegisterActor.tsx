
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";

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
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    role: '',
    region: '',
    localite: '',
    superficie: '',
    systeme_irrigation: '',
    type_sol: '',
    type_culture: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('📝 Envoi des données acteur:', formData);
      
      const response = await fetch('/api/actors/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Acteur enregistré:', result);
        
        toast({
          title: "Succès !",
          description: "Acteur enregistré avec succès. Redirection vers son dashboard...",
        });

        // Rediriger vers le dashboard de l'utilisateur après 2 secondes
        setTimeout(() => {
          navigate(`/dashboard?userId=${result.id}`);
        }, 2000);
      } else {
        throw new Error('Erreur lors de l\'enregistrement');
      }
    } catch (error) {
      console.error('❌ Erreur enregistrement acteur:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer l'acteur. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = () => {
    return Object.values(formData).every(value => value.trim() !== '');
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
            <CardTitle className="text-blue-800">Informations de l'Acteur</CardTitle>
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

              {/* Rôle */}
              <div>
                <Label htmlFor="role">Rôle *</Label>
                <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTOR_ROLES.map((role) => (
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Localisation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="region">Région *</Label>
                  <Select value={formData.region} onValueChange={(value) => handleInputChange('region', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une région" />
                    </SelectTrigger>
                    <SelectContent>
                      {SENEGAL_REGIONS.map((region) => (
                        <SelectItem key={region} value={region}>{region}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="localite">Localité *</Label>
                  <Input
                    id="localite"
                    value={formData.localite}
                    onChange={(e) => handleInputChange('localite', e.target.value)}
                    placeholder="Ex: Taiba Ndiaye, Mbour..."
                    required
                  />
                </div>
              </div>

              {/* Informations agricoles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="superficie">Superficie de la parcelle (m²) *</Label>
                  <Input
                    id="superficie"
                    type="number"
                    value={formData.superficie}
                    onChange={(e) => handleInputChange('superficie', e.target.value)}
                    placeholder="Ex: 10000"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="systeme_irrigation">Système d'irrigation *</Label>
                  <Select value={formData.systeme_irrigation} onValueChange={(value) => handleInputChange('systeme_irrigation', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un système" />
                    </SelectTrigger>
                    <SelectContent>
                      {IRRIGATION_SYSTEMS.map((system) => (
                        <SelectItem key={system} value={system}>{system}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="type_sol">Type de sol *</Label>
                  <Select value={formData.type_sol} onValueChange={(value) => handleInputChange('type_sol', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un type de sol" />
                    </SelectTrigger>
                    <SelectContent>
                      {SOIL_TYPES.map((soil) => (
                        <SelectItem key={soil} value={soil}>{soil}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="type_culture">Type de culture *</Label>
                  <Select value={formData.type_culture} onValueChange={(value) => handleInputChange('type_culture', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un type de culture" />
                    </SelectTrigger>
                    <SelectContent>
                      {CROP_TYPES.map((crop) => (
                        <SelectItem key={crop.value} value={crop.value}>{crop.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
