
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
  usarIA: boolean;
  notificarInconsistencias: boolean;
  aplicarCorrecoes: boolean;
  salvarHistorico: boolean;
  onChangeConfig: (key: string, value: boolean) => void;
}

export function ConfiguracoesAdicionais({
  usarIA,
  notificarInconsistencias,
  aplicarCorrecoes,
  salvarHistorico,
  onChangeConfig
}: ConfiguracoesAdicionaisProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center mb-2">
        <Label>Configurações Adicionais</Label>
      </div>
      
      <div className="space-y-2">
        <ConfiguracaoSwitch 
          id="usar-ia" 
          label="Usar Inteligência Artificial" 
          checked={usarIA} 
          onChange={(value) => onChangeConfig('usarIA', value)} 
        />
        
        <ConfiguracaoSwitch 
          id="notificar" 
          label="Notificar Inconsistências" 
          checked={notificarInconsistencias} 
          onChange={(value) => onChangeConfig('notificarInconsistencias', value)} 
        />
        
        <ConfiguracaoSwitch 
          id="corrigir" 
          label="Aplicar Correções Automáticas" 
          checked={aplicarCorrecoes} 
          onChange={(value) => onChangeConfig('aplicarCorrecoes', value)} 
        />
        
        <ConfiguracaoSwitch 
          id="salvar-historico" 
          label="Salvar Histórico de Verificações" 
          checked={salvarHistorico} 
          onChange={(value) => onChangeConfig('salvarHistorico', value)} 
        />
      </div>
    </div>
  );
}
