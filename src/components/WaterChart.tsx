
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useMQTT } from '@/hooks/useMQTT';

// Données simulées pour les différentes périodes
const generateDailyData = () => {
  const data = [];
  for (let i = 0; i < 24; i++) {
    data.push({
      time: `${i.toString().padStart(2, '0')}:00`,
      quantity: Math.random() * 0.5 + 0.1 // 0.1 à 0.6 m³
    });
  }
  return data;
};

const generateWeeklyData = () => {
  return [
    { time: 'Lun', quantity: 2.8 },
    { time: 'Mar', quantity: 3.2 },
    { time: 'Mer', quantity: 2.1 },
    { time: 'Jeu', quantity: 3.8 },
    { time: 'Ven', quantity: 2.9 },
    { time: 'Sam', quantity: 1.5 },
    { time: 'Dim', quantity: 2.2 },
  ];
};

const generateMonthlyData = () => {
  return [
    { time: 'S1', quantity: 15.2 },
    { time: 'S2', quantity: 18.1 },
    { time: 'S3', quantity: 12.8 },
    { time: 'S4', quantity: 16.5 },
  ];
};

export const WaterChart = () => {
  const [dailyData, setDailyData] = useState(generateDailyData());
  const { irrigationStatus } = useMQTT();

  // Simulation de mise à jour en temps réel
  useEffect(() => {
    if (irrigationStatus) {
      const interval = setInterval(() => {
        setDailyData(prevData => {
          const newData = [...prevData];
          const currentHour = new Date().getHours();
          const currentIndex = newData.findIndex(item => item.time === `${currentHour.toString().padStart(2, '0')}:00`);
          
          if (currentIndex !== -1) {
            newData[currentIndex] = {
              ...newData[currentIndex],
              quantity: newData[currentIndex].quantity + 0.01 // Augmentation progressive
            };
          }
          
          return newData;
        });
      }, 5000); // Mise à jour toutes les 5 secondes

      return () => clearInterval(interval);
    }
  }, [irrigationStatus]);

  const weeklyData = generateWeeklyData();
  const monthlyData = generateMonthlyData();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quantité d'Eau Utilisée</CardTitle>
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
                  formatter={(value) => [`${Number(value).toFixed(2)} m³`, 'Quantité']}
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
              Quantité en mètres cubes par heure
              {irrigationStatus && (
                <span className="text-blue-600 font-medium"> - Mise à jour en temps réel</span>
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
                <Tooltip formatter={(value) => [`${value} m³`, 'Quantité']} />
                <Line 
                  type="monotone" 
                  dataKey="quantity" 
                  stroke="#0505FB" 
                  strokeWidth={2}
                  dot={{ fill: '#0505FB', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-sm text-gray-600 mt-2">Quantité en mètres cubes par jour</p>
          </TabsContent>
          
          <TabsContent value="monthly" className="mt-4">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis 
                  label={{ value: 'Quantité (m³)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip formatter={(value) => [`${value} m³`, 'Quantité']} />
                <Line 
                  type="monotone" 
                  dataKey="quantity" 
                  stroke="#0505FB" 
                  strokeWidth={2}
                  dot={{ fill: '#0505FB', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-sm text-gray-600 mt-2">Quantité en mètres cubes par semaine</p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
