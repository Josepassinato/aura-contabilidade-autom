
import React from "react";
import { NavLink } from "react-router-dom";
import { Settings } from "lucide-react";
import {
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export const FooterSection = () => {
  return (
    <SidebarFooter className="p-2">
      <SidebarMenu>
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
      </SidebarMenu>
    </SidebarFooter>
  );
};
