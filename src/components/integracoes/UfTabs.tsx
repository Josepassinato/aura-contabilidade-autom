
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { IntegracaoEstadualForm } from "@/components/integracoes/IntegracaoEstadualForm";
import { UF } from "@/services/governamental/estadualIntegration";

interface UfTabsProps {
  estados: Array<{uf: UF, nome: string}>;
  activeTab: UF;
  setActiveTab: (value: UF) => void;
  clientId: string;
  clientName: string;
  onSave: (data: any) => void;
}

export function UfTabs({ estados, activeTab, setActiveTab, clientId, clientName, onSave }: UfTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as UF)}>
      <TabsList className="grid w-full grid-cols-5">
        {estados.map((estado) => (
          <TabsTrigger key={estado.uf} value={estado.uf}>{estado.nome}</TabsTrigger>
        ))}
      </TabsList>
      
      <div className="mt-6">
        {estados.map((estado) => (
          <TabsContent key={estado.uf} value={estado.uf}>
            <IntegracaoEstadualForm 
              clientId={clientId}
              clientName={clientName}
              uf={estado.uf}
              onSave={onSave}
            />
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
}
