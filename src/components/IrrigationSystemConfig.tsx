
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Settings, Droplets } from 'lucide-react';
import { backendService, IrrigationSystem } from '@/services/backendService';
import { useToast } from '@/hooks/use-toast';

const irrigationSystems: IrrigationSystem[] = [
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
      const response = await backendService.updateIrrigationSystem(selectedSystem);
      
      if (response.success) {
        toast({
          title: "Système synchronisé",
          description: `Le système ${irrigationSystems.find(s => s.type === selectedSystem)?.name} a été configuré`,
        });
      } else {
        toast({
          title: "Erreur",
          description: response.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la synchronisation",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
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
                    <Droplets className="h-4 w-4 text-blue-500" />
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
          {isLoading ? 'Synchronisation...' : 'Synchroniser'}
        </Button>
        
        {selectedSystem && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700">
              <strong>Système sélectionné:</strong> {irrigationSystems.find(s => s.type === selectedSystem)?.name}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Ce paramètre sera utilisé par l'IA pour optimiser les stratégies d'arrosage
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
