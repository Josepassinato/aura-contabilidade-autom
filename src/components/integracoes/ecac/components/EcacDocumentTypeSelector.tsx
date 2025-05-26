
import React from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EcacDocumentTypeSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

const tiposDocumento = [
  'declaracao_irpj',
  'declaracao_irpf',
  'dctf',
  'dirf',
  'dimof',
  'certidao_negativa',
  'extrato_irpj',
  'parcelamento',
  'consulta_debitos',
  'outros'
];

export function EcacDocumentTypeSelector({ value, onValueChange, disabled }: EcacDocumentTypeSelectorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="tipo-documento">Tipo de Documento *</Label>
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione o tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="declaracao_irpj">Declaração IRPJ</SelectItem>
          <SelectItem value="declaracao_irpf">Declaração IRPF</SelectItem>
          <SelectItem value="dctf">DCTF</SelectItem>
          <SelectItem value="dirf">DIRF</SelectItem>
          <SelectItem value="dimof">DIMOF</SelectItem>
          <SelectItem value="certidao_negativa">Certidão Negativa</SelectItem>
          <SelectItem value="extrato_irpj">Extrato IRPJ</SelectItem>
          <SelectItem value="parcelamento">Parcelamento</SelectItem>
          <SelectItem value="consulta_debitos">Consulta de Débitos</SelectItem>
          <SelectItem value="outros">Outros</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
