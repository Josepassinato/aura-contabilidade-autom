
import React from "react";
import { Building } from "lucide-react";
import { SidebarHeader } from "@/components/ui/sidebar";

export const HeaderSection = () => {
  return (
    <SidebarHeader className="flex items-center h-14 px-4 border-b">
      <div className="flex items-center space-x-2">
        <Building className="h-6 w-6" />
        <span className="font-semibold">Contábil App</span>
      </div>
    </SidebarHeader>
  );
};
