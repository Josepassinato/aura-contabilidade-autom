
import React from 'react';
import { ClientSelector } from "@/components/layout/ClientSelector";
import { IntegracoesStatusGrid } from "@/components/integracoes/IntegracoesStatusGrid";
import { IntegracaoFormsContainer } from "@/components/integracoes/IntegracaoFormsContainer";
import { EmptyClientState } from "@/components/integracoes/EmptyClientState";
import { useIntegracoesGov } from "@/hooks/useIntegracoesGov";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { BackButton } from "@/components/navigation/BackButton";
import { useAuth } from "@/contexts/auth";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

const IntegracoesGov = () => {
  const {
    selectedClientId,
    selectedClientName,
    selectedClientCnpj,
    activeTab,
    setActiveTab,
    showStateDropdown,
    setShowStateDropdown,
    selectedState,
    integracoes,
    handleClientSelect,
    handleSaveIntegracao,
    handleStateSelect
  } = useIntegracoesGov();
  
  const { enhancedLogout } = useAuth();
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <BackButton />
              <Button 
                variant="destructive" 
                size="sm" 
                className="flex items-center"
                onClick={enhancedLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Integrações Governamentais</h1>
            <p className="text-muted-foreground">
              Configure o acesso aos portais governamentais
            </p>
          </div>
          <ClientSelector onClientSelect={handleClientSelect} />
        </div>
        
        {!selectedClientId ? (
          <EmptyClientState />
        ) : (
          <>
            <IntegracoesStatusGrid integracoes={integracoes} />
            
            <IntegracaoFormsContainer
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              selectedState={selectedState}
              showStateDropdown={showStateDropdown}
              setShowStateDropdown={setShowStateDropdown}
              handleStateSelect={handleStateSelect}
              handleSaveIntegracao={handleSaveIntegracao}
              selectedClientId={selectedClientId}
              selectedClientName={selectedClientName}
              selectedClientCnpj={selectedClientCnpj}
            />
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default IntegracoesGov;
