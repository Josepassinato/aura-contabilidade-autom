
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield } from "lucide-react";

interface NivelValidacaoSelectorProps {
  nivelValidacao: string;
  onChange: (value: string) => void;
}

export function NivelValidacaoSelector({ nivelValidacao, onChange }: NivelValidacaoSelectorProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <Label>Nível de Validação</Label>
        <Shield className="h-4 w-4 text-muted-foreground" />
      </div>
      <Select 
        value={nivelValidacao}
        onValueChange={onChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="Selecione o nível de validação" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="basico">Básico - Verificações Essenciais</SelectItem>
          <SelectItem value="completo">Completo - Verificações Detalhadas</SelectItem>
          <SelectItem value="avancado">Avançado - Verificações Aprofundadas</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
