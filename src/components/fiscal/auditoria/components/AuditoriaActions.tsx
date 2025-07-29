
import React from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw, Settings2, Play, PauseCircle } from "lucide-react";

interface AuditoriaActionsProps {
  ativa: boolean;
  onReset?: () => void;
  onSalvar?: () => void;
  onIniciar?: () => void;
  onParar?: () => void;
  onToggleActive?: () => void;
  onSave?: () => void;
}

export function AuditoriaActions({ 
  ativa, 
  onReset, 
  onSalvar, 
  onIniciar, 
  onParar,
  onToggleActive,
  onSave
}: AuditoriaActionsProps) {
  // Use appropriate handlers based on what's provided
  const handleReset = onReset || (() => console.log("Reset clicked"));
  const handleSave = onSave || onSalvar || (() => console.log("Save clicked"));
  const handleToggle = onToggleActive || (() => {
    if (ativa && onParar) onParar();
    if (!ativa && onIniciar) onIniciar();
  });
  
  return (
    <div className="flex justify-between w-full">
      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          onClick={handleReset}
          className="flex items-center space-x-2"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Reset</span>
        </Button>
        <Button 
          variant="outline" 
          onClick={handleSave}
          className="flex items-center space-x-2"
        >
          <Settings2 className="h-4 w-4" />
          <span>Salvar Configurações</span>
        </Button>
      </div>
      
      {ativa ? (
        <Button 
          variant="destructive" 
          onClick={handleToggle}
        >
          <PauseCircle className="mr-2 h-4 w-4" />
          Pausar Auditoria
        </Button>
      ) : (
        <Button 
          onClick={handleToggle}
          className="flex items-center space-x-2"
        >
          <Play className="h-4 w-4" />
          <span>Iniciar Auditoria Contínua</span>
        </Button>
      )}
    </div>
  );
}
