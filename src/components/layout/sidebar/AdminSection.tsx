
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BarChart2, 
  Users, 
  Activity,
  Settings,
  Brain
} from 'lucide-react';

export function AdminSection() {
  const { pathname } = useLocation();
  
  return (
    <div className="space-y-1">
      <Link
        to="/admin/business-analytics"
        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary ${
          pathname === '/admin/business-analytics' ? 'bg-muted font-medium text-primary' : 'text-muted-foreground'
        }`}
      >
        <BarChart2 className="h-4 w-4" />
        <span>Indicadores de Negócio</span>
      </Link>
      <Link
        to="/admin/customer-management"
        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary ${
          pathname === '/admin/customer-management' ? 'bg-muted font-medium text-primary' : 'text-muted-foreground'
        }`}
      >
        <Users className="h-4 w-4" />
        <span>Gerenciar Clientes</span>
      </Link>
      <Link
        to="/admin/usage-metrics"
        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary ${
          pathname === '/admin/usage-metrics' ? 'bg-muted font-medium text-primary' : 'text-muted-foreground'
        }`}
      >
        <Activity className="h-4 w-4" />
        <span>Métricas de Uso</span>
      </Link>
      <Link
        to="/admin/openai-management"
        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary ${
          pathname === '/admin/openai-management' ? 'bg-muted font-medium text-primary' : 'text-muted-foreground'
        }`}
      >
        <Brain className="h-4 w-4" />
        <span>Gerenciar IA</span>
      </Link>
      <Link
        to="/settings"
        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary ${
          pathname === '/settings' ? 'bg-muted font-medium text-primary' : 'text-muted-foreground'
        }`}
      >
        <Settings className="h-4 w-4" />
        <span>Configurações</span>
      </Link>
    </div>
  );
}
