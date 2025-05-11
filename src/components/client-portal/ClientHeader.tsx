
import React from "react";
import { Button } from "@/components/ui/button";
import { LogOut, Building } from "lucide-react";

interface ClientHeaderProps {
  clientName: string;
  onLogout: () => void;
}

export const ClientHeader = ({ clientName, onLogout }: ClientHeaderProps) => (
  <header className="h-16 px-6 border-b flex items-center justify-between bg-background">
    <div className="flex items-center space-x-2">
      <Building className="h-5 w-5 text-primary" />
      <h1 className="text-lg font-medium">{clientName}</h1>
    </div>
    <Button variant="outline" size="sm" onClick={onLogout}>
      <LogOut className="h-4 w-4 mr-2" />
      Sair
    </Button>
  </header>
);
