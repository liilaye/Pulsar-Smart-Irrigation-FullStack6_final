
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useMQTT } from '@/hooks/useMQTT';
import { irrigationDataService, DailyIrrigationData, WeeklyIrrigationData, MonthlyIrrigationData } from '@/services/irrigationDataService';

export const WaterChart = () => {
  const [dailyData, setDailyData] = useState<DailyIrrigationData[]>([]);
  const [weeklyData, setWeeklyData] = useState<WeeklyIrrigationData[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyIrrigationData[]>([]);
  const [isRealTimeActive, setIsRealTimeActive] = useState(false);
  const { irrigationStatus } = useMQTT();

  useEffect(() => {
    // Initialiser avec les données existantes
    const chartData = irrigationDataService.generateChartData();
    setDailyData(chartData.daily);
    setWeeklyData(chartData.weekly);
    setMonthlyData(chartData.monthly);

    // S'abonner aux mises à jour de données
    const unsubscribe = irrigationDataService.subscribe((newChartData) => {
      console.log('📊 Mise à jour graphique avec nouvelles données:', newChartData);
      setDailyData(newChartData.daily);
      setWeeklyData(newChartData.weekly);
      setMonthlyData(newChartData.monthly);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    setIsRealTimeActive(irrigationStatus);
  }, [irrigationStatus]);

  // Simulation de mise à jour en temps réel pendant l'irrigation active
  useEffect(() => {
    if (isRealTimeActive) {
      const interval = setInterval(() => {
        setDailyData(prevData => {
          const newData = [...prevData];
          const currentHour = new Date().getHours();
          const currentIndex = newData.findIndex(item => item.time === `${currentHour.toString().padStart(2, '0')}:00`);
          
          if (currentIndex !== -1) {
            newData[currentIndex] = {
              ...newData[currentIndex],
              quantity: newData[currentIndex].quantity + 0.001 // Simulation progression
            };
          }
          
          return newData;
        });
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [isRealTimeActive]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Quantité d'Eau Utilisée</span>
          {isRealTimeActive && (
            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-2"></div>
              Temps réel
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="daily" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="daily">Jour</TabsTrigger>
            <TabsTrigger value="weekly">Semaine</TabsTrigger>
            <TabsTrigger value="monthly">Mois</TabsTrigger>
          </TabsList>
          
          <TabsContent value="daily" className="mt-4">
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
                <Tooltip 
                  formatter={(value) => [`${Number(value).toFixed(3)} m³`, 'Quantité']}
                  labelFormatter={(label) => `Heure: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="quantity" 
                  stroke="#0505FB" 
                  strokeWidth={2}
                  dot={{ fill: '#0505FB', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#0505FB' }}
                />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-sm text-gray-600 mt-2">
              Quantité d'eau utilisée par heure (données réelles Flask)
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
                <Tooltip formatter={(value) => [`${Number(value).toFixed(3)} m³`, 'Quantité']} />
                <Line 
                  type="monotone" 
                  dataKey="quantity" 
                  stroke="#0505FB" 
                  strokeWidth={2}
                  dot={{ fill: '#0505FB', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-sm text-gray-600 mt-2">Quantité d'eau utilisée par jour</p>
          </TabsContent>
          
          <TabsContent value="monthly" className="mt-4">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis 
                  label={{ value: 'Quantité (m³)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip formatter={(value) => [`${Number(value).toFixed(3)} m³`, 'Quantité']} />
                <Line 
                  type="monotone" 
                  dataKey="quantity" 
                  stroke="#0505FB" 
                  strokeWidth={2}
                  dot={{ fill: '#0505FB', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-sm text-gray-600 mt-2">Quantité d'eau utilisée par semaine</p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
