
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

interface PeriodoSelectorProps {
  periodoInicial: string;
  setPeriodoInicial: (value: string) => void;
  periodoFinal: string;
  setPeriodoFinal: (value: string) => void;
  sincronizacaoAutomatica: boolean;
  setSincronizacaoAutomatica: (value: boolean) => void;
}

export const PeriodoSelector: React.FC<PeriodoSelectorProps> = ({
  periodoInicial,
  setPeriodoInicial,
  periodoFinal,
  setPeriodoFinal,
  sincronizacaoAutomatica,
  setSincronizacaoAutomatica,
}) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 border-t pt-4">
        <div className="space-y-2">
          <Label htmlFor="periodo_inicial">Período Inicial</Label>
          <Input 
            id="periodo_inicial" 
            type="month" 
            placeholder="YYYY-MM" 
            value={periodoInicial}
            onChange={(e) => setPeriodoInicial(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="periodo_final">Período Final (opcional)</Label>
          <Input 
            id="periodo_final" 
            type="month" 
            placeholder="YYYY-MM" 
            value={periodoFinal}
            onChange={(e) => setPeriodoFinal(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-2 mt-4">
        <Switch 
          id="sincronizacao" 
          checked={sincronizacaoAutomatica}
          onCheckedChange={setSincronizacaoAutomatica}
        />
        <Label htmlFor="sincronizacao">Sincronização automática</Label>
      </div>
    </>
  );
};

export default PeriodoSelector;
