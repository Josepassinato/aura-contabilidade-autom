import React from 'react';
import { useAuth } from '@/contexts/auth';
import { Badge } from '@/components/ui/badge';
import { Building2, CircleDot } from 'lucide-react';

export function AccountingStatus() {
  const { profile, isAuthenticated } = useAuth();

  if (!isAuthenticated || !profile) {
    return null;
  }

  const isAccountant = profile.role === 'accountant' || profile.role === 'admin';
  
  if (!isAccountant) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 bg-card/50 backdrop-blur-sm border rounded-lg px-3 py-2">
      <Building2 className="h-4 w-4 text-primary" />
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-foreground">
          {profile.full_name || 'Contador'}
        </span>
        <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 flex items-center gap-1">
          <CircleDot className="h-2 w-2 animate-pulse text-green-600" />
          Online
        </Badge>
      </div>
    </div>
  );
}