import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  Users,
  FileText,
  Calculator,
  BarChart3,
  Settings,
  Bell,
  CreditCard,
  Building2,
  Calendar,
  Shield,
  Zap,
  HelpCircle,
  LogOut
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const mainNavItems = [
  { title: 'Dashboard', url: '/', icon: Home },
  { title: 'Clientes', url: '/clients', icon: Users },
  { title: 'Documentos', url: '/documents', icon: FileText },
  { title: 'Contabilidade', url: '/accounting', icon: Calculator },
  { title: 'Analytics', url: '/analytics', icon: BarChart3 },
];

const toolsItems = [
  { title: 'Fechamento', url: '/closing', icon: Calendar },
  { title: 'Pagamentos', url: '/payments', icon: CreditCard },
  { title: 'Integrações', url: '/integrations', icon: Building2 },
  { title: 'Automação', url: '/automation', icon: Zap },
];

const systemItems = [
  { title: 'Configurações', url: '/settings', icon: Settings },
  { title: 'Segurança', url: '/security', icon: Shield },
  { title: 'Suporte', url: '/support', icon: HelpCircle },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === 'collapsed';

  const isActive = (path: string) => {
    if (path === '/') {
      return currentPath === '/';
    }
    return currentPath.startsWith(path);
  };

  const getNavClassName = (path: string) =>
    isActive(path)
      ? 'bg-primary/10 text-primary font-medium border-r-2 border-primary'
      : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground';

  return (
    <Sidebar className={collapsed ? 'w-16' : 'w-64'} variant="sidebar" collapsible="icon">
      <SidebarContent className="bg-card border-r">
        {/* Logo Section */}
        <div className="p-4 border-b">
          {!collapsed ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">C</span>
              </div>
              <div>
                <h2 className="font-semibold text-lg">ContaFlix</h2>
                <p className="text-xs text-muted-foreground">Contabilidade Inteligente</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">C</span>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-auto">
          {/* Main Navigation */}
          <SidebarGroup className="px-2 py-4">
            <SidebarGroupLabel className={collapsed ? 'sr-only' : ''}>
              Principal
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {mainNavItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${getNavClassName(
                          item.url
                        )}`}
                      >
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <Separator />

          {/* Tools Section */}
          <SidebarGroup className="px-2 py-4">
            <SidebarGroupLabel className={collapsed ? 'sr-only' : ''}>
              Ferramentas
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {toolsItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${getNavClassName(
                          item.url
                        )}`}
                      >
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
                        {item.title === 'Pagamentos' && !collapsed && (
                          <Badge variant="secondary" className="ml-auto text-xs">
                            3
                          </Badge>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <Separator />

          {/* System Section */}
          <SidebarGroup className="px-2 py-4">
            <SidebarGroupLabel className={collapsed ? 'sr-only' : ''}>
              Sistema
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {systemItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${getNavClassName(
                          item.url
                        )}`}
                      >
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>

        {/* Bottom Section */}
        <div className="border-t p-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <button className="flex items-center gap-3 px-3 py-2 rounded-lg w-full text-left hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-all">
                  <LogOut className="h-4 w-4 flex-shrink-0" />
                  {!collapsed && <span>Sair</span>}
                </button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}