
import React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { 
  Home, 
  Droplets, 
  Thermometer, 
  BarChart3, 
  Settings,
  Lightbulb
} from 'lucide-react';

const menuItems = [
  {
    title: "Tableau de bord",
    url: "#dashboard",
    icon: Home,
  },
  {
    title: "Irrigation",
    url: "#irrigation",
    icon: Droplets,
  },
  {
    title: "Paramètres Agro-climatiques",
    url: "#sensors",
    icon: Thermometer,
  },
  {
    title: "Analyses",
    url: "#analytics",
    icon: BarChart3,
  },
  {
    title: "Recommandations",
    url: "#recommendations",
    icon: Lightbulb,
  },
  {
    title: "Paramètres",
    url: "#settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  return (
    <Sidebar className="border-r border-gray-200">
      <SidebarContent className="bg-white">
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-600 font-medium">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="hover:bg-blue-50">
                    <a href={item.url} className="flex items-center space-x-3 text-gray-700 hover:text-blue-600">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
