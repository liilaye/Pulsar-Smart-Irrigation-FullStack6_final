
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DropletIcon } from 'lucide-react';

const dailyData = [
  { name: 'Lun', quantity: 45 },
  { name: 'Mar', quantity: 38 },
  { name: 'Mer', quantity: 52 },
  { name: 'Jeu', quantity: 41 },
  { name: 'Ven', quantity: 48 },
  { name: 'Sam', quantity: 35 },
  { name: 'Dim', quantity: 42 },
];

const weeklyData = [
  { name: 'S1', quantity: 285 },
  { name: 'S2', quantity: 312 },
  { name: 'S3', quantity: 298 },
  { name: 'S4', quantity: 275 },
];

const monthlyData = [
  { name: 'Jan', quantity: 1250 },
  { name: 'Fév', quantity: 1180 },
  { name: 'Mar', quantity: 1420 },
  { name: 'Avr', quantity: 1350 },
  { name: 'Mai', quantity: 1580 },
  { name: 'Jun', quantity: 1720 },
];

export const WaterChart = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <DropletIcon className="h-5 w-5 text-blue-600" />
          <span>Quantité d'Eau Utilisée</span>
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
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} L`, 'Quantité']} />
                <Bar dataKey="quantity" fill="#0505FB" />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-sm text-gray-600 mt-2">Quantité en litres par jour</p>
          </TabsContent>
          
          <TabsContent value="weekly" className="mt-4">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} L`, 'Quantité']} />
                <Bar dataKey="quantity" fill="#0505FB" />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-sm text-gray-600 mt-2">Quantité en litres par semaine</p>
          </TabsContent>
          
          <TabsContent value="monthly" className="mt-4">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} L`, 'Quantité']} />
                <Bar dataKey="quantity" fill="#0505FB" />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-sm text-gray-600 mt-2">Quantité en litres par mois</p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
