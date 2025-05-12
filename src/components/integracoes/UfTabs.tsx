
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UF } from "@/services/governamental/estadualIntegration";
import { IntegracaoEstadualForm } from './IntegracaoEstadualForm';

interface UfTabsProps {
  estados: Array<{uf: UF, nome: string}>;
  activeTab: UF;
  setActiveTab: (uf: UF) => void;
  clientId: string;
  clientName?: string;
  onSave: (data: any) => void;
}

export function UfTabs({ estados, activeTab, setActiveTab, clientId, clientName, onSave }: UfTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={(value: UF) => setActiveTab(value)}>
      <TabsList className="flex flex-wrap">
        {estados.map(estado => (
          <TabsTrigger key={estado.uf} value={estado.uf} className="flex-grow">
            {estado.uf} - {estado.nome}
          </TabsTrigger>
        ))}
      </TabsList>
      
      {estados.map(estado => (
        <TabsContent key={estado.uf} value={estado.uf}>
          <IntegracaoEstadualForm 
            clientId={clientId}
            clientName={clientName}
            uf={estado.uf}
            onSave={onSave}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
}
