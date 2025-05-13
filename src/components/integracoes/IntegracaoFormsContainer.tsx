
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin } from "lucide-react";
import { IntegracaoGovForm } from "@/components/integracoes/IntegracaoGovForm";
import { SimplesNacionalForm } from "@/components/integracoes/SimplesNacionalForm";
import { IntegracaoEstadualForm } from "@/components/integracoes/IntegracaoEstadualForm";
import { EstadoSelector } from "./EstadoSelector";
import { UF } from "@/services/governamental/estadualIntegration";

interface IntegracaoFormsContainerProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedState: UF | null;
  showStateDropdown: boolean;
  setShowStateDropdown: (show: boolean) => void;
  handleStateSelect: (uf: UF) => void;
  handleSaveIntegracao: (data: any) => void;
  selectedClientId: string;
  selectedClientName: string;
  selectedClientCnpj: string;
}

export const IntegracaoFormsContainer = ({
  activeTab,
  setActiveTab,
  selectedState,
  showStateDropdown,
  setShowStateDropdown,
  handleStateSelect,
  handleSaveIntegracao,
  selectedClientId,
  selectedClientName,
  selectedClientCnpj,
}: IntegracaoFormsContainerProps) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <div className="flex items-center gap-2 mb-2">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="ecac">e-CAC</TabsTrigger>
          <TabsTrigger value="sefaz">
            SEFAZ {selectedState ? `- ${selectedState}` : ""}
          </TabsTrigger>
          <TabsTrigger value="simples_nacional">Simples Nacional</TabsTrigger>
        </TabsList>
        
        <EstadoSelector
          selectedState={selectedState}
          onStateSelect={handleStateSelect}
          showDropdown={showStateDropdown}
          setShowDropdown={setShowStateDropdown}
        />
      </div>
      
      <div className="mt-6">
        <TabsContent value="ecac">
          <IntegracaoGovForm 
            clientId={selectedClientId}
            clientName={selectedClientName}
            onSave={handleSaveIntegracao}
          />
        </TabsContent>
        
        <TabsContent value="sefaz">
          {selectedState ? (
            <IntegracaoEstadualForm 
              clientId={selectedClientId}
              clientName={selectedClientName}
              uf={selectedState}
              onSave={handleSaveIntegracao}
            />
          ) : (
            <div className="p-8 text-center border rounded-lg">
              <MapPin className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">Selecione um estado</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Escolha um estado no botão acima para configurar a integração com sua SEFAZ
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="simples_nacional">
          <SimplesNacionalForm
            clientId={selectedClientId}
            clientName={selectedClientName}
            cnpj={selectedClientCnpj}
            onSave={handleSaveIntegracao}
          />
        </TabsContent>
      </div>
    </Tabs>
  );
};
