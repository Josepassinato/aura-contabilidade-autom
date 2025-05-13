
import React from "react";
import { NavLink } from "react-router-dom";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  ArrowDownToLine,
  CreditCard,
  Users,
  Bot,
} from "lucide-react";

export function AccountantSection() {
  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>Administração</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <NavLink
                  to="/client-access"
                  className={({ isActive }) =>
                    isActive ? "bg-secondary" : undefined
                  }
                >
                  <Users className="h-5 w-5" />
                  <span>Portal de Clientes</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <NavLink
                  to="/plans"
                  className={({ isActive }) =>
                    isActive ? "bg-secondary" : undefined
                  }
                >
                  <CreditCard className="h-5 w-5" />
                  <span>Planos e Preços</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <NavLink
                  to="/relatorios-ia"
                  className={({ isActive }) =>
                    isActive ? "bg-secondary" : undefined
                  }
                >
                  <Bot className="h-5 w-5" />
                  <span>IA & Relatórios</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  );
}
