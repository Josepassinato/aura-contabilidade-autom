
import React from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface ConfiguracaoSwitchProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function ConfiguracaoSwitch({ id, label, checked, onChange }: ConfiguracaoSwitchProps) {
  return (
    <div className="flex items-center justify-between">
      <Label htmlFor={id} className="flex items-center space-x-2">
        <span>{label}</span>
      </Label>
      <Switch 
        id={id}
        checked={checked}
        onCheckedChange={onChange}
      />
    </div>
  );
}

interface ConfiguracoesAdicionaisProps {
  usarContextoHistorico: boolean;
  setUsarContextoHistorico: React.Dispatch<React.SetStateAction<boolean>>;
  validacaoCruzada: boolean;
  setValidacaoCruzada: React.Dispatch<React.SetStateAction<boolean>>;
  gravarHistoricoDecisoes: boolean;
  setGravarHistoricoDecisoes: React.Dispatch<React.SetStateAction<boolean>>;
}

export function ConfiguracoesAdicionais({
  usarContextoHistorico,
  setUsarContextoHistorico,
  validacaoCruzada,
  setValidacaoCruzada,
  gravarHistoricoDecisoes,
  setGravarHistoricoDecisoes
}: ConfiguracoesAdicionaisProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center mb-2">
        <Label>Configurações Adicionais</Label>
      </div>
      
      <div className="space-y-2">
        <ConfiguracaoSwitch 
          id="usar-contexto" 
          label="Usar Contexto Histórico" 
          checked={usarContextoHistorico} 
          onChange={setUsarContextoHistorico} 
        />
        
        <ConfiguracaoSwitch 
          id="validacao-cruzada" 
          label="Ativar Validação Cruzada" 
          checked={validacaoCruzada} 
          onChange={setValidacaoCruzada} 
        />
        
        <ConfiguracaoSwitch 
          id="gravar-historico" 
          label="Gravar Histórico de Decisões" 
          checked={gravarHistoricoDecisoes} 
          onChange={setGravarHistoricoDecisoes} 
        />
      </div>
    </div>
  );
}
