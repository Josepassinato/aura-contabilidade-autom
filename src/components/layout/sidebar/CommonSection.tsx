
import React from 'react';
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { HomeIcon, BellIcon, Settings2Icon } from 'lucide-react';
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
            <SidebarMenuButton asChild active={isActive('/') || isActive('/dashboard')}>
              <Link to="/">
                <HomeIcon className="h-4 w-4 mr-2" />
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild active={isActive('/notifications')}>
              <Link to="/notifications">
                <BellIcon className="h-4 w-4 mr-2" />
                <span>Notificações</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild active={isActive('/settings')}>
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
