
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Settings, Droplets, AlertTriangle } from 'lucide-react';
import { backendService, IrrigationSystem } from '@/services/backendService';
import { useToast } from '@/hooks/use-toast';

const irrigationSystems: IrrigationSystem[] = [
  { type: 'aucun', name: 'Aucun système en place' },
  { type: 'goutte-a-goutte', name: 'Goutte à Goutte' },
  { type: 'aspersion', name: 'Aspersion' },
  { type: 'tourniquet', name: 'Tourniquet' },
  { type: 'laser', name: 'Laser' },
  { type: 'micro-aspersion', name: 'Micro-aspersion' },
  { type: 'submersion', name: 'Submersion contrôlée' }
];

export const IrrigationSystemConfig = () => {
  const [selectedSystem, setSelectedSystem] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSynchronize = async () => {
    if (!selectedSystem) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un système d'irrigation",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log('🔧 Envoi configuration système irrigation vers Flask:', selectedSystem);
      const response = await backendService.updateIrrigationSystem(selectedSystem);
      
      if (response.success) {
        const systemName = irrigationSystems.find(s => s.type === selectedSystem)?.name;
        toast({
          title: "Système synchronisé",
          description: `Configuration ${systemName} envoyée au serveur Flask`,
        });
        
        // Log pour le développement
        console.log('✅ Configuration système irrigation confirmée:', response);
      } else {
        toast({
          title: "Erreur de synchronisation",
          description: response.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('❌ Erreur synchronisation système:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la synchronisation avec le serveur Flask",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getSystemIcon = (systemType: string) => {
    if (systemType === 'aucun') return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    return <Droplets className="h-4 w-4 text-blue-500" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="h-5 w-5 text-blue-600" />
          <span>Système d'Irrigation</span>
        </CardTitle>
        <p className="text-sm text-gray-600">
          Configurez le type de système d'irrigation pour optimiser l'arrosage IA
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Type de système</Label>
          <Select value={selectedSystem} onValueChange={setSelectedSystem}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sélectionnez un système d'irrigation" />
            </SelectTrigger>
            <SelectContent>
              {irrigationSystems.map((system) => (
                <SelectItem key={system.type} value={system.type}>
                  <div className="flex items-center space-x-2">
                    {getSystemIcon(system.type)}
                    <span>{system.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          onClick={handleSynchronize}
          disabled={!selectedSystem || isLoading}
          className="w-full"
          style={{ backgroundColor: '#0505FB' }}
        >
          <Settings className="h-4 w-4 mr-2" />
          {isLoading ? 'Synchronisation...' : 'Synchroniser avec Flask'}
        </Button>
        
        {selectedSystem && (
          <div className={`p-3 rounded-lg border ${
            selectedSystem === 'aucun' 
              ? 'bg-orange-50 border-orange-200' 
              : 'bg-blue-50 border-blue-200'
          }`}>
            <p className={`text-sm font-medium ${
              selectedSystem === 'aucun' ? 'text-orange-700' : 'text-blue-700'
            }`}>
              <strong>Système sélectionné:</strong> {irrigationSystems.find(s => s.type === selectedSystem)?.name}
            </p>
            <p className={`text-xs mt-1 ${
              selectedSystem === 'aucun' ? 'text-orange-600' : 'text-blue-600'
            }`}>
              {selectedSystem === 'aucun' 
                ? 'Le serveur Flask proposera un système adapté à votre terrain'
                : 'Ce paramètre sera utilisé par l\'IA pour optimiser les stratégies d\'arrosage'
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
