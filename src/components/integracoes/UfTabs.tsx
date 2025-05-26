
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IntegracaoEstadualFormWithUpload } from './IntegracaoEstadualFormWithUpload';
import { SantaCatarinaIntegracao } from './SantaCatarinaIntegracao';
import { UF } from "@/services/governamental/estadualIntegration";

interface Estado {
  uf: UF;
  nome: string;
  disponivel: boolean;
}

interface UfTabsProps {
  estados: Estado[];
  activeTab: UF;
  setActiveTab: (uf: UF) => void;
  clientId: string;
  clientName: string;
  onSave: (data: any) => Promise<void>;
}

export function UfTabs({ 
  estados, 
  activeTab, 
  setActiveTab, 
  clientId, 
  clientName, 
  onSave 
}: UfTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-1 h-auto">
        {estados.slice(0, 12).map((estado) => (
          <TabsTrigger 
            key={estado.uf} 
            value={estado.uf}
            className="text-xs p-2"
            disabled={!estado.disponivel}
          >
            {estado.uf}
          </TabsTrigger>
        ))}
      </TabsList>

      {estados.map((estado) => (
        <TabsContent key={estado.uf} value={estado.uf} className="mt-6">
          {estado.uf === 'SC' ? (
            <SantaCatarinaIntegracao 
              clientId={clientId}
              clientName={clientName}
            />
          ) : (
            <IntegracaoEstadualFormWithUpload
              uf={estado.uf}
              clientId={clientId}
              clientName={clientName}
              onSave={onSave}
            />
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
}
