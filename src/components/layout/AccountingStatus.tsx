import React from 'react';
import { useAuth } from '@/contexts/auth';
import { Badge } from '@/components/ui/badge';
import { Building2, CircleDot } from 'lucide-react';

export function AccountingStatus() {
  const { profile, isAuthenticated } = useAuth();

  if (!isAuthenticated || !profile) {
    return null;
  }

  // Mapear roles para labels em português
  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'accountant':
        return 'Contador';
      case 'client':
        return 'Cliente';
      default:
        return 'Usuário';
    }
  };

  // Definir cor do badge baseado no role
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'accountant':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'client':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="flex items-center gap-2 bg-card/50 backdrop-blur-sm border rounded-lg px-3 py-2">
      <Building2 className="h-4 w-4 text-primary" />
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-foreground">
          {profile.full_name || 'Usuário'}
        </span>
        <Badge variant="secondary" className={`text-xs ${getRoleBadgeColor(profile.role)} flex items-center gap-1`}>
          <CircleDot className="h-2 w-2 animate-pulse" />
          {getRoleLabel(profile.role)}
        </Badge>
      </div>
    </div>
  );
}