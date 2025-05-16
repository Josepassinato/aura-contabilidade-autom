
import React from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw, Settings2, Play } from "lucide-react";

interface AuditoriaActionsProps {
  ativa: boolean;
  onReset: () => void;
  onSalvar: () => void;
  onIniciar: () => void;
  onParar: () => void;
}

export function AuditoriaActions({ ativa, onReset, onSalvar, onIniciar, onParar }: AuditoriaActionsProps) {
  return (
    <div className="flex justify-between pt-4 border-t">
      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          onClick={onReset}
          className="flex items-center space-x-2"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Reset</span>
        </Button>
        <Button 
          variant="outline" 
          onClick={onSalvar}
          className="flex items-center space-x-2"
        >
          <Settings2 className="h-4 w-4" />
          <span>Salvar Configurações</span>
        </Button>
      </div>
      
      {ativa ? (
        <Button 
          variant="destructive" 
          onClick={onParar}
        >
          Pausar Auditoria
        </Button>
      ) : (
        <Button 
          onClick={onIniciar}
          className="flex items-center space-x-2"
        >
          <Play className="h-4 w-4" />
          <span>Iniciar Auditoria Contínua</span>
        </Button>
      )}
    </div>
  );
}
