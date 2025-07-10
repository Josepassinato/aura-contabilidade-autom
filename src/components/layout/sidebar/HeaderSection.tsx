
import React from "react";
import { Building } from "lucide-react";
import { SidebarHeader } from "@/components/ui/sidebar";

export const HeaderSection = () => {
  return (
    <SidebarHeader className="flex items-center h-16 px-4 border-b bg-gradient-primary">
      <div className="flex items-center space-x-3">
        <div className="relative">
          <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
            <Building className="h-6 w-6 text-white" />
          </div>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary-glow rounded-full animate-glow"></div>
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-white text-lg">ContaFlix</span>
          <span className="text-white/80 text-xs font-medium">Gestão Inteligente</span>
        </div>
      </div>
    </SidebarHeader>
  );
};
