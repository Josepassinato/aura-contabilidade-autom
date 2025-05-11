
import React from "react";
import { NavLink } from "react-router-dom";
import { 
  PiggyBank, 
  BarChart3, 
  Landmark
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
    </>
  );
};
