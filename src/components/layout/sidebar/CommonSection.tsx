
import React from 'react';
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { HomeIcon, BellIcon, Settings2Icon, TestTubeIcon, AlertTriangleIcon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export function CommonSection() {
  const location = useLocation();
  
  // Helper to check if a link is active
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>
        Menu Principal
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/') || isActive('/dashboard')}>
              <Link to="/">
                <HomeIcon className="h-4 w-4 mr-2" />
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/notifications')}>
              <Link to="/notifications">
                <BellIcon className="h-4 w-4 mr-2" />
                <span>Notificações</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/monitor-anomalias')}>
              <Link to="/monitor-anomalias">
                <AlertTriangleIcon className="h-4 w-4 mr-2" />
                <span>Monitor de Anomalias</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/dados-teste')}>
              <Link to="/dados-teste">
                <TestTubeIcon className="h-4 w-4 mr-2" />
                <span>Dados de Teste</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/settings')}>
              <Link to="/settings">
                <Settings2Icon className="h-4 w-4 mr-2" />
                <span>Configurações</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
