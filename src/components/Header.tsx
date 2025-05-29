
import React from 'react';
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Bell, User, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const Header = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <SidebarTrigger />
          <div className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/1b09c49e-e955-4f4f-9ddc-ee549e0c50f6.png" 
              alt="PulsarInfinite Logo" 
              className="h-12 w-auto object-contain"
            />
            <div>
              <h1 className="text-xl font-bold" style={{ color: '#0505FB' }}>
                PulsarInfinite
              </h1>
              <p className="text-sm text-gray-600">Plateforme Agricole Intelligente</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">Culture: Arachide</p>
            <p className="text-xs text-gray-600">Taiba Ndiaye, Thiès</p>
          </div>
          <button className="p-2 text-gray-600 hover:text-gray-900">
            <Bell className="h-5 w-5" />
          </button>
          <button className="p-2 text-gray-600 hover:text-gray-900">
            <User className="h-5 w-5" />
          </button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleLogout}
            className="flex items-center space-x-2"
          >
            <LogOut className="h-4 w-4" />
            <span>Déconnexion</span>
          </Button>
        </div>
      </div>
    </header>
  );
};
