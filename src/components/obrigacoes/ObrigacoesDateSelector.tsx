
import React from "react";
import { Button } from "@/components/ui/button";
import { processarObrigacoes } from "@/utils/obrigacoesUtils";

interface ObrigacoesDateSelectorProps {
  mes: number;
  setMes: (mes: number) => void;
  ano: number;
  setAno: (ano: number) => void;
}

export const ObrigacoesDateSelector = ({ 
  mes, 
  setMes, 
  ano, 
  setAno 
}: ObrigacoesDateSelectorProps) => {
  return (
    <div className="flex justify-between mb-6">
      <div className="flex space-x-2">
        <select 
          className="border rounded p-2"
          value={mes}
          onChange={(e) => setMes(Number(e.target.value))}
        >
          <option value="1">Janeiro</option>
          <option value="2">Fevereiro</option>
          <option value="3">Março</option>
          <option value="4">Abril</option>
          <option value="5">Maio</option>
          <option value="6">Junho</option>
          <option value="7">Julho</option>
          <option value="8">Agosto</option>
          <option value="9">Setembro</option>
          <option value="10">Outubro</option>
          <option value="11">Novembro</option>
          <option value="12">Dezembro</option>
        </select>
        
        <select
          className="border rounded p-2"
          value={ano}
          onChange={(e) => setAno(Number(e.target.value))}
        >
          <option value="2024">2024</option>
          <option value="2025">2025</option>
        </select>
      </div>
      
      <Button onClick={processarObrigacoes}>
        Processar Obrigações
      </Button>
    </div>
  );
};
