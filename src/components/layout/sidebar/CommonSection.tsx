
import React from 'react';
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { HomeIcon, BellIcon, AlertTriangleIcon, Users, UserCheck, CreditCard } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export function CommonSection() {
  const location = useLocation();
  
  // Helper to check if a link is active
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <>
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
              <SidebarMenuButton asChild isActive={isActive('/alertas-pagamento')}>
                <Link to="/alertas-pagamento">
                  <BellIcon className="h-4 w-4 mr-2" />
                  <span>Alertas de Pagamento</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive('/gestao-riscos')}>
                <Link to="/gestao-riscos">
                  <AlertTriangleIcon className="h-4 w-4 mr-2" />
                  <span>Gestão de Riscos</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>
          Área do Cliente
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive('/client-portal')}>
                <Link to="/client-portal">
                  <UserCheck className="h-4 w-4 mr-2" />
                  <span>Portal do Cliente</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive('/client-access')}>
                <Link to="/client-access">
                  <Users className="h-4 w-4 mr-2" />
                  <span>Acesso do Cliente</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive('/plans-pricing')}>
                <Link to="/plans-pricing">
                  <CreditCard className="h-4 w-4 mr-2" />
                  <span>Planos e Preços</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  );
}
