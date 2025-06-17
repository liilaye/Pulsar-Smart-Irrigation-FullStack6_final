
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
  Thermometer, 
  BarChart3, 
  Lightbulb
} from 'lucide-react';

const menuItems = [
  {
    title: "Tableau de bord",
    sectionId: "dashboard",
    icon: Home,
  },
  {
    title: "Paramètres Agro-climatiques",
    sectionId: "sensors",
    icon: Thermometer,
  },
  {
    title: "Analyses et Graphiques",
    sectionId: "analytics",
    icon: BarChart3,
  },
  {
    title: "Recommandations",
    sectionId: "recommendations",
    icon: Lightbulb,
  },
];

export function AppSidebar() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
      
      // Mettre à jour l'URL sans recharger la page
      window.history.pushState(null, '', `#${sectionId}`);
    }
  };

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
                  <SidebarMenuButton 
                    className="hover:bg-blue-50 cursor-pointer"
                    onClick={() => scrollToSection(item.sectionId)}
                  >
                    <div className="flex items-center space-x-3 text-gray-700 hover:text-blue-600">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </div>
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
