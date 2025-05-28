
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Cloud, Thermometer, TestTube, Leaf } from 'lucide-react';

const climateData = [
  { name: "Température Air", value: "28°C", unit: "°C", status: "normal" },
  { name: "Humidité Air", value: "65%", unit: "%", status: "normal" },
  { name: "Vent Moyen", value: "12 km/h", unit: "km/h", status: "normal" },
  { name: "Précipitations", value: "2.5 mm", unit: "mm", status: "faible" },
];

const soilData = [
  { name: "Azote (N)", value: "45 mg/kg", unit: "mg/kg", status: "bon" },
  { name: "Phosphore (P)", value: "38 mg/kg", unit: "mg/kg", status: "bon" },
  { name: "Potassium (K)", value: "152 mg/kg", unit: "mg/kg", status: "excellent" },
  { name: "Température Sol", value: "26°C", unit: "°C", status: "normal" },
  { name: "Humidité Sol", value: "42%", unit: "%", status: "normal" },
  { name: "Conductivité (EC)", value: "1.2 dS/m", unit: "dS/m", status: "bon" },
  { name: "pH", value: "6.8", unit: "", status: "optimal" },
  { name: "Fertilité Sol", value: "Bonne", unit: "", status: "bon" },
];

const otherData = [
  { name: "Type de Culture", value: "Arachide", unit: "", status: "optimal" },
  { name: "Type de Sol", value: "Sablo-argileux", unit: "", status: "bon" },
  { name: "Périmètre Parcelle", value: "2.5 ha", unit: "", status: "normal" },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'excellent': case 'optimal': return 'text-green-600 bg-green-50';
    case 'bon': case 'normal': return 'text-blue-600 bg-blue-50';
    case 'faible': return 'text-orange-600 bg-orange-50';
    default: return 'text-gray-600 bg-gray-50';
  }
};

export const AgroClimateParams = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Thermometer className="h-5 w-5 text-blue-600" />
          <span>Paramètres Agro-climatiques</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="climate" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="climate" className="flex items-center space-x-2">
              <Cloud className="h-4 w-4" />
              <span>Climatique</span>
            </TabsTrigger>
            <TabsTrigger value="soil" className="flex items-center space-x-2">
              <TestTube className="h-4 w-4" />
              <span>Sol</span>
            </TabsTrigger>
            <TabsTrigger value="other" className="flex items-center space-x-2">
              <Leaf className="h-4 w-4" />
              <span>Autres</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="climate" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {climateData.map((param, index) => (
                <div key={index} className={`p-3 rounded-lg border ${getStatusColor(param.status)}`}>
                  <h4 className="font-medium text-sm">{param.name}</h4>
                  <p className="text-lg font-bold">{param.value}</p>
                  <p className="text-xs capitalize">{param.status}</p>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="soil" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {soilData.map((param, index) => (
                <div key={index} className={`p-3 rounded-lg border ${getStatusColor(param.status)}`}>
                  <h4 className="font-medium text-sm">{param.name}</h4>
                  <p className="text-lg font-bold">{param.value}</p>
                  <p className="text-xs capitalize">{param.status}</p>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="other" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {otherData.map((param, index) => (
                <div key={index} className={`p-3 rounded-lg border ${getStatusColor(param.status)}`}>
                  <h4 className="font-medium text-sm">{param.name}</h4>
                  <p className="text-lg font-bold">{param.value}</p>
                  <p className="text-xs capitalize">{param.status}</p>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
