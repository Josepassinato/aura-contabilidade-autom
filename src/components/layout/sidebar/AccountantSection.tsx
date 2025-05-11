
import React from "react";
import { NavLink } from "react-router-dom";
import { 
  Users, 
  CalendarClock, 
  Receipt, 
  FileText, 
  Calculator,
  Briefcase,
  Brain
} from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export const AccountantSection = () => {
  return (
    <>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <NavLink
            to="/clientes"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2 transition-colors",
                isActive ? "bg-accent" : "hover:bg-accent hover:text-accent-foreground"
              )
            }
          >
            <Users className="h-5 w-5" />
            <span>Clientes</span>
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>

      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <NavLink
            to="/obrigacoes"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2 transition-colors",
                isActive ? "bg-accent" : "hover:bg-accent hover:text-accent-foreground"
              )
            }
          >
            <CalendarClock className="h-5 w-5" />
            <span>Obrigações Fiscais</span>
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
            <Receipt className="h-5 w-5" />
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
            <Briefcase className="h-5 w-5" />
            <span>Folha de Pagamento</span>
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
            to="/analises-preditivas"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2 transition-colors",
                isActive ? "bg-accent" : "hover:bg-accent hover:text-accent-foreground"
              )
            }
          >
            <Brain className="h-5 w-5" />
            <span>Análises Preditivas</span>
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
            <FileText className="h-5 w-5" />
            <span>Apuração Automática</span>
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </>
  );
};
