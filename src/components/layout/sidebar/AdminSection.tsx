
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BarChart3, Settings, Users, TrendingUp, Activity, Brain } from 'lucide-react';

export const AdminSection = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <div className="space-y-1">
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
          Administração
        </h2>
      </div>
      
      <div className="px-3 space-y-1">
        <Button 
          variant={isActive('/admin/business-analytics') ? 'secondary' : 'ghost'} 
          className="w-full justify-start" 
          asChild
        >
          <Link to="/admin/business-analytics">
            <BarChart3 className="mr-2 h-4 w-4" />
            Analytics
          </Link>
        </Button>
        
        <Button 
          variant={isActive('/admin/customer-management') ? 'secondary' : 'ghost'} 
          className="w-full justify-start" 
          asChild
        >
          <Link to="/admin/customer-management">
            <Users className="mr-2 h-4 w-4" />
            Clientes
          </Link>
        </Button>
        
        <Button 
          variant={isActive('/admin/usage-metrics') ? 'secondary' : 'ghost'} 
          className="w-full justify-start" 
          asChild
        >
          <Link to="/admin/usage-metrics">
            <Activity className="mr-2 h-4 w-4" />
            Métricas de Uso
          </Link>
        </Button>
        
        <Button 
          variant={isActive('/admin/openai-management') ? 'secondary' : 'ghost'} 
          className="w-full justify-start" 
          asChild
        >
          <Link to="/admin/openai-management">
            <Brain className="mr-2 h-4 w-4" />
            Gerenciar OpenAI
          </Link>
        </Button>
        
        <Button 
          variant={isActive('/admin/user-management') ? 'secondary' : 'ghost'} 
          className="w-full justify-start" 
          asChild
        >
          <Link to="/admin/user-management">
            <Settings className="mr-2 h-4 w-4" />
            Usuários
          </Link>
        </Button>
      </div>
    </div>
  );
};
