
import React from 'react';
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { ESTADOS } from "./constants";
import { UF } from "@/services/governamental/estadualIntegration";

interface EstadoSelectorProps {
  selectedState: UF | null;
  onStateSelect: (uf: UF) => void;
  showDropdown: boolean;
  setShowDropdown: (show: boolean) => void;
}

export const EstadoSelector = ({ 
  selectedState, 
  onStateSelect, 
  showDropdown, 
  setShowDropdown 
}: EstadoSelectorProps) => {
  return (
    <DropdownMenu open={showDropdown} onOpenChange={setShowDropdown}>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="outline" className="flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          Selecionar Estado
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 max-h-[280px] overflow-y-auto">
        {ESTADOS.map((estado) => (
          <DropdownMenuItem key={estado.uf} onClick={() => onStateSelect(estado.uf)}>
            {estado.uf} - {estado.nome}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
