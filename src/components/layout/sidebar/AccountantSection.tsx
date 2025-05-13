
import React from "react";
import { Link } from "react-router-dom";
import { SidebarGroup, SidebarMenuItem, SidebarMenu, SidebarMenuButton } from "@/components/ui/sidebar";
import {
  BarChart,
  Users,
  FileBox,
  Calendar,
  FileText,
  Calculator,
  LucideIcon,
  PieChart,
  UserCog,
  Activity,
  Zap,
  Database
} from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { Separator } from "@/components/ui/separator";

export function AccountantSection() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const { isAdmin } = useAuth();

  if (!isAdmin) return null;

  return (
    <>
      <Separator className="my-2" />
      
      <SidebarGroup>
        <SidebarMenuItem title="Administração">
          <SidebarMenu>
            <SidebarMenuButton asChild isActive={isActive("/admin/business-analytics")}>
              <Link to="/admin/business-analytics">
                <PieChart className="h-4 w-4" />
                <span>Analytics de Negócio</span>
              </Link>
            </SidebarMenuButton>
            
            <SidebarMenuButton asChild isActive={isActive("/admin/customer-management")}>
              <Link to="/admin/customer-management">
                <UserCog className="h-4 w-4" />
                <span>Gestão de Clientes</span>
              </Link>
            </SidebarMenuButton>
            
            <SidebarMenuButton asChild isActive={isActive("/admin/usage-metrics")}>
              <Link to="/admin/usage-metrics">
                <Activity className="h-4 w-4" />
                <span>Métricas de Uso</span>
              </Link>
            </SidebarMenuButton>
            
            <SidebarMenuButton asChild isActive={isActive("/admin/openai-management")}>
              <Link to="/admin/openai-management">
                <Zap className="h-4 w-4" />
                <span>Gestão de IA</span>
              </Link>
            </SidebarMenuButton>
            
            <SidebarMenuButton asChild isActive={isActive("/settings")}>
              <Link to="/settings">
                <Database className="h-4 w-4" />
                <span>Configurações</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenu>
        </SidebarMenuItem>
      </SidebarGroup>
    </>
  );
}
