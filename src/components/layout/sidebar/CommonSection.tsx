
import React from "react";
import { NavLink } from "react-router-dom";
import { 
  PiggyBank, 
  BarChart3, 
  Landmark,
  Calendar,
  FileText,
  Calculator,
  Users,
  Building,
  Database,
  PieChart,
  CreditCard,
  KeyRound,
  Settings,
  FileBarChart,
  Box,
  Bell
} from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export const CommonSection = () => {
  return (
    <>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <NavLink
            to="/"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2 transition-colors",
                isActive ? "bg-accent" : "hover:bg-accent hover:text-accent-foreground"
              )
            }
          >
            <PiggyBank className="h-5 w-5" />
            <span>Dashboard</span>
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>

      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <NavLink
            to="/obrigacoes-fiscais"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2 transition-colors",
                isActive ? "bg-accent" : "hover:bg-accent hover:text-accent-foreground"
              )
            }
          >
            <Calendar className="h-5 w-5" />
            <span>Obrigações Fiscais</span>
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>

      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <NavLink
            to="/calculos-fiscais"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2 transition-colors",
                isActive ? "bg-accent" : "hover:bg-accent hover:text-accent-foreground"
              )
            }
          >
            <Calculator className="h-5 w-5" />
            <span>Cálculos Fiscais</span>
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>

      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <NavLink
            to="/guias-fiscais"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2 transition-colors",
                isActive ? "bg-accent" : "hover:bg-accent hover:text-accent-foreground"
              )
            }
          >
            <FileText className="h-5 w-5" />
            <span>Guias Fiscais</span>
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>

      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <NavLink
            to="/folha-pagamento"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2 transition-colors",
                isActive ? "bg-accent" : "hover:bg-accent hover:text-accent-foreground"
              )
            }
          >
            <Users className="h-5 w-5" />
            <span>Folha de Pagamento</span>
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>

      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <NavLink
            to="/gerenciar-clientes"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2 transition-colors",
                isActive ? "bg-accent" : "hover:bg-accent hover:text-accent-foreground"
              )
            }
          >
            <Building className="h-5 w-5" />
            <span>Gerenciar Clientes</span>
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>

      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <NavLink
            to="/relatorios-financeiros"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2 transition-colors",
                isActive ? "bg-accent" : "hover:bg-accent hover:text-accent-foreground"
              )
            }
          >
            <BarChart3 className="h-5 w-5" />
            <span>Relatórios Financeiros</span>
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>

      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <NavLink
            to="/relatorios-ia"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2 transition-colors",
                isActive ? "bg-accent" : "hover:bg-accent hover:text-accent-foreground"
              )
            }
          >
            <FileBarChart className="h-5 w-5" />
            <span>Relatórios por IA</span>
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>

      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <NavLink
            to="/apuracao-automatica"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2 transition-colors",
                isActive ? "bg-accent" : "hover:bg-accent hover:text-accent-foreground"
              )
            }
          >
            <Database className="h-5 w-5" />
            <span>Apuração Automática</span>
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
      
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <NavLink
            to="/analises-preditivas"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2 transition-colors",
                isActive ? "bg-accent" : "hover:bg-accent hover:text-accent-foreground"
              )
            }
          >
            <PieChart className="h-5 w-5" />
            <span>Análises Preditivas</span>
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
      
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <NavLink
            to="/automacao-bancaria"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2 transition-colors",
                isActive ? "bg-accent" : "hover:bg-accent hover:text-accent-foreground"
              )
            }
          >
            <Landmark className="h-5 w-5" />
            <span>Automação Bancária</span>
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>

      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <NavLink
            to="/regime-fiscal"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2 transition-colors",
                isActive ? "bg-accent" : "hover:bg-accent hover:text-accent-foreground"
              )
            }
          >
            <Box className="h-5 w-5" />
            <span>Regime Fiscal</span>
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>

      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <NavLink
            to="/integracoes-gov"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2 transition-colors",
                isActive ? "bg-accent" : "hover:bg-accent hover:text-accent-foreground"
              )
            }
          >
            <KeyRound className="h-5 w-5" />
            <span>Integrações Gov</span>
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>

      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <NavLink
            to="/integracoes-estaduais"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2 transition-colors",
                isActive ? "bg-accent" : "hover:bg-accent hover:text-accent-foreground"
              )
            }
          >
            <KeyRound className="h-5 w-5" />
            <span>Integrações Estaduais</span>
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>

      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <NavLink
            to="/notifications"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2 transition-colors",
                isActive ? "bg-accent" : "hover:bg-accent hover:text-accent-foreground"
              )
            }
          >
            <Bell className="h-5 w-5" />
            <span>Notificações</span>
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>

      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2 transition-colors",
                isActive ? "bg-accent" : "hover:bg-accent hover:text-accent-foreground"
              )
            }
          >
            <Settings className="h-5 w-5" />
            <span>Configurações</span>
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </>
  );
};

