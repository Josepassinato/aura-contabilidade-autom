
/**
 * Componente para configuração de integração com fontes de dados fiscais
 */

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database } from "lucide-react"; 
import { useFonteDadosForm } from "@/hooks/useFonteDadosForm";

// Import sub-components
import ErpTabContent from "./fontesdados/ErpTabContent";
import NfeTabContent from "./fontesdados/NfeTabContent";
import ContabilidadeTabContent from "./fontesdados/ContabilidadeTabContent";
import ManualTabContent from "./fontesdados/ManualTabContent";
import PeriodoSelector from "./fontesdados/PeriodoSelector";

export interface FontesDadosIntegracaoProps {
  cnpj?: string;
  onComplete?: () => void;
}

export const FontesDadosIntegracao: React.FC<FontesDadosIntegracaoProps> = ({ cnpj = '', onComplete }) => {
  const { 
    activeTab, 
    setActiveTab, 
    isLoading, 
    formState, 
    updateField, 
    handleSalvarConfiguracao 
  } = useFonteDadosForm({ cnpj, onComplete });
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Configuração de Fontes de Dados
        </CardTitle>
        <CardDescription>
          Configure as integrações com sistemas para obtenção automática de dados fiscais
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="erp">ERP</TabsTrigger>
            <TabsTrigger value="nfe">NFe</TabsTrigger>
            <TabsTrigger value="contabilidade">Contabilidade</TabsTrigger>
            <TabsTrigger value="manual">Manual</TabsTrigger>
          </TabsList>
          
          <TabsContent value="erp" className="space-y-4">
            <ErpTabContent
              erpUrl={formState.erpUrl}
              setErpUrl={(value) => updateField('erpUrl', value)}
              erpUsuario={formState.erpUsuario}
              setErpUsuario={(value) => updateField('erpUsuario', value)}
              erpSenha={formState.erpSenha}
              setErpSenha={(value) => updateField('erpSenha', value)}
              erpToken={formState.erpToken}
              setErpToken={(value) => updateField('erpToken', value)}
            />
          </TabsContent>
          
          <TabsContent value="nfe" className="space-y-4">
            <NfeTabContent
              nfeToken={formState.nfeToken}
              setNfeToken={(value) => updateField('nfeToken', value)}
              nfeCertificado={formState.nfeCertificado}
              setNfeCertificado={(value) => updateField('nfeCertificado', value)}
              nfeSenhaCertificado={formState.nfeSenhaCertificado}
              setNfeSenhaCertificado={(value) => updateField('nfeSenhaCertificado', value)}
            />
          </TabsContent>
          
          <TabsContent value="contabilidade" className="space-y-4">
            <ContabilidadeTabContent
              contabilidadeUrl={formState.contabilidadeUrl}
              setContabilidadeUrl={(value) => updateField('contabilidadeUrl', value)}
              contabilidadeUsuario={formState.contabilidadeUsuario}
              setContabilidadeUsuario={(value) => updateField('contabilidadeUsuario', value)}
              contabilidadeSenha={formState.contabilidadeSenha}
              setContabilidadeSenha={(value) => updateField('contabilidadeSenha', value)}
              contabilidadeIntegracao={formState.contabilidadeIntegracao}
              setContabilidadeIntegracao={(value) => updateField('contabilidadeIntegracao', value)}
            />
          </TabsContent>
          
          <TabsContent value="manual" className="space-y-4">
            <ManualTabContent />
          </TabsContent>
          
          <PeriodoSelector 
            periodoInicial={formState.periodoInicial}
            setPeriodoInicial={(value) => updateField('periodoInicial', value)}
            periodoFinal={formState.periodoFinal}
            setPeriodoFinal={(value) => updateField('periodoFinal', value)}
            sincronizacaoAutomatica={formState.sincronizacaoAutomatica}
            setSincronizacaoAutomatica={(value) => updateField('sincronizacaoAutomatica', value)}
          />
        </Tabs>
      </CardContent>
      
      <CardFooter>
        <div className="flex justify-end w-full">
          <Button
            onClick={handleSalvarConfiguracao}
            disabled={isLoading}
          >
            {isLoading ? "Salvando..." : "Salvar Configuração"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default FontesDadosIntegracao;
