
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { User } from 'lucide-react';
import { useMQTT } from '@/hooks/useMQTT';
import { irrigationDataService, DailyIrrigationData, WeeklyIrrigationData, MonthlyIrrigationData } from '@/services/irrigationDataService';
import { activeUserService, ActiveUser } from '@/services/activeUserService';

export const WaterChart = () => {
  const [dailyData, setDailyData] = useState<DailyIrrigationData[]>([]);
  const [weeklyData, setWeeklyData] = useState<WeeklyIrrigationData[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyIrrigationData[]>([]);
  const [chartType, setChartType] = useState<'both' | 'manual' | 'ml'>('both');
  const [isRealTimeActive, setIsRealTimeActive] = useState(false);
  const [activeUser, setActiveUser] = useState<ActiveUser | null>(null);
  const { irrigationStatus } = useMQTT();

  useEffect(() => {
    // S'abonner aux changements d'utilisateur actif
    const unsubscribe = activeUserService.subscribe((user) => {
      setActiveUser(user);
      if (user) {
        // Charger les données d'irrigation pour cet utilisateur
        loadUserIrrigationData(user);
      } else {
        // Effacer les données si aucun utilisateur
        setDailyData([]);
        setWeeklyData([]);
        setMonthlyData([]);
      }
    });

    // Charger l'utilisateur actuel
    const currentUser = activeUserService.getActiveUser();
    setActiveUser(currentUser);
    if (currentUser) {
      loadUserIrrigationData(currentUser);
    }
    
    return unsubscribe;
  }, []);

  useEffect(() => {
    setIsRealTimeActive(irrigationStatus);
  }, [irrigationStatus]);

  const loadUserIrrigationData = (user: ActiveUser) => {
    // Générer des données spécifiques à l'utilisateur
    const chartData = irrigationDataService.generateChartData();
    setDailyData(chartData.daily);
    setWeeklyData(chartData.weekly);
    setMonthlyData(chartData.monthly);

    // S'abonner aux mises à jour de données pour cet utilisateur
    const unsubscribeData = irrigationDataService.subscribe((newChartData) => {
      console.log(`📊 Mise à jour graphique pour ${user.prenom} ${user.nom}:`, newChartData);
      setDailyData(newChartData.daily);
      setWeeklyData(newChartData.weekly);
      setMonthlyData(newChartData.monthly);
    });

    return unsubscribeData;
  };

  if (!activeUser) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Graphique d'Irrigation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun utilisateur sélectionné
            </h3>
            <p className="text-gray-600">
              Sélectionnez un acteur agricole pour voir ses données d'irrigation
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getVisibleLines = () => {
    switch (chartType) {
      case 'manual':
        return { manual: true, ml: false };
      case 'ml':
        return { manual: false, ml: true };
      default:
        return { manual: true, ml: true };
    }
  };

  const visibleLines = getVisibleLines();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{`Période: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${Number(entry.value).toFixed(3)} m³`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span>Graphique d'Irrigation</span>
            <span className="text-sm text-gray-600">
              - {activeUser.prenom} {activeUser.nom}
            </span>
          </div>
          {isRealTimeActive && (
            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-2"></div>
              Temps réel
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <ToggleGroup type="single" value={chartType} onValueChange={(value) => value && setChartType(value as any)}>
            <ToggleGroupItem value="both" className="text-xs">
              Les Deux
            </ToggleGroupItem>
            <ToggleGroupItem value="manual" className="text-xs">
              Manuel Seulement
            </ToggleGroupItem>
            <ToggleGroupItem value="ml" className="text-xs">
              ML Seulement
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <Tabs defaultValue="daily" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="daily">Jour</TabsTrigger>
            <TabsTrigger value="weekly">Semaine</TabsTrigger>
            <TabsTrigger value="monthly">Mois</TabsTrigger>
          </TabsList>
          
          <TabsContent value="daily" className="mt-4">
            {dailyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="time" 
                    interval={2}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    label={{ value: 'Quantité (m³)', angle: -90, position: 'insideLeft' }}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  
                  {visibleLines.manual && (
                    <Line 
                      type="monotone" 
                      dataKey="manualQuantity" 
                      stroke="#FF0000" 
                      strokeWidth={2}
                      dot={{ fill: '#FF0000', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, fill: '#FF0000' }}
                      name="Graphe Arrosage Manuel"
                    />
                  )}
                  
                  {visibleLines.ml && (
                    <Line 
                      type="monotone" 
                      dataKey="mlQuantity" 
                      stroke="#0000FF" 
                      strokeWidth={2}
                      dot={{ fill: '#0000FF', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, fill: '#0000FF' }}
                      name="Graphe Irrigation basé sur ML"
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Aucune donnée d'irrigation disponible pour {activeUser.prenom} {activeUser.nom}
              </div>
            )}
            <p className="text-sm text-gray-600 mt-2">
              Données d'irrigation pour {activeUser.speculation} à {activeUser.localite}
              {isRealTimeActive && (
                <span className="text-blue-600 font-medium"> - Irrigation en cours</span>
              )}
            </p>
          </TabsContent>
          
          <TabsContent value="weekly" className="mt-4">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis 
                  label={{ value: 'Quantité (m³)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                
                {visibleLines.manual && (
                  <Line 
                    type="monotone" 
                    dataKey="manualQuantity" 
                    stroke="#FF0000" 
                    strokeWidth={2}
                    dot={{ fill: '#FF0000', strokeWidth: 2, r: 4 }}
                    name="Graphe Arrosage Manuel"
                  />
                )}
                
                {visibleLines.ml && (
                  <Line 
                    type="monotone" 
                    dataKey="mlQuantity" 
                    stroke="#0000FF" 
                    strokeWidth={2}
                    dot={{ fill: '#0000FF', strokeWidth: 2, r: 4 }}
                    name="Graphe Irrigation basé sur ML"
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
            <p className="text-sm text-gray-600 mt-2">Comparaison hebdomadaire: Manuel vs ML</p>
          </TabsContent>
          
          <TabsContent value="monthly" className="mt-4">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis 
                  label={{ value: 'Quantité (m³)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                
                {visibleLines.manual && (
                  <Line 
                    type="monotone" 
                    dataKey="manualQuantity" 
                    stroke="#FF0000" 
                    strokeWidth={2}
                    dot={{ fill: '#FF0000', strokeWidth: 2, r: 4 }}
                    name="Graphe Arrosage Manuel"
                  />
                )}
                
                {visibleLines.ml && (
                  <Line 
                    type="monotone" 
                    dataKey="mlQuantity" 
                    stroke="#0000FF" 
                    strokeWidth={2}
                    dot={{ fill: '#0000FF', strokeWidth: 2, r: 4 }}
                    name="Graphe Irrigation basé sur ML"
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
            <p className="text-sm text-gray-600 mt-2">Comparaison mensuelle par semaine: Manuel vs ML</p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
