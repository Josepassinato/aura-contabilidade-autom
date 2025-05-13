
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { GanttChart } from "lucide-react";
import { RadioGroup } from "@/components/ui/radio-group";
import { IntegracaoStatus, IntegracaoEstadualStatus } from './IntegracaoStatus';
import { UF } from '@/services/governamental/estadualIntegration';

interface IntegracaoStatusGridProps {
  integracoes: IntegracaoEstadualStatus[];
  selectedUf?: UF;
  onUfSelect: (uf: UF) => void;
}

export function IntegracaoStatusGrid({ integracoes, selectedUf, onUfSelect }: IntegracaoStatusGridProps) {
  const handleSelectIntegracao = (integracao: IntegracaoEstadualStatus) => {
    onUfSelect(integracao.uf);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <GanttChart className="h-5 w-5 text-primary" />
          <CardTitle>Status das Integrações</CardTitle>
        </div>
        <CardDescription>
          Selecione uma SEFAZ para configurar a integração
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" 
          value={selectedUf}
          onValueChange={(value) => {
            const selectedIntegracao = integracoes.find(i => i.uf === value);
            if (selectedIntegracao) {
              onUfSelect(selectedIntegracao.uf);
            }
          }}
        >
          {integracoes.map((integracao) => (
            <IntegracaoStatus 
              key={integracao.id} 
              integracao={integracao} 
              onSelect={() => handleSelectIntegracao(integracao)}
              isSelected={selectedUf === integracao.uf}
            />
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
