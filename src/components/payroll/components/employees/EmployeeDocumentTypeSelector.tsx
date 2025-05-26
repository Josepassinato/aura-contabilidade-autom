
import React from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EmployeeDocumentTypeSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

export function EmployeeDocumentTypeSelector({ value, onValueChange, disabled }: EmployeeDocumentTypeSelectorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="tipo-documento-funcionario">Tipo de Documento *</Label>
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione o tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="folha_pagamento">Folha de Pagamento</SelectItem>
          <SelectItem value="rescisao">Rescisão</SelectItem>
          <SelectItem value="ferias">Férias</SelectItem>
          <SelectItem value="decimo_terceiro">Décimo Terceiro</SelectItem>
          <SelectItem value="inss">INSS</SelectItem>
          <SelectItem value="fgts">FGTS</SelectItem>
          <SelectItem value="irrf">IRRF</SelectItem>
          <SelectItem value="rais">RAIS</SelectItem>
          <SelectItem value="caged">CAGED</SelectItem>
          <SelectItem value="esocial">eSocial</SelectItem>
          <SelectItem value="outros">Outros</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
