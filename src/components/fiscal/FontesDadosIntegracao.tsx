
/**
 * Componente para configuração de integração com fontes de dados fiscais
 */

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Database } from "lucide-react"; 
import { configurarFonteDados, FonteDadosConfig } from "@/services/fiscal/integration";

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

export const FontesDadosIntegracao: React.FC<FontesDadosIntegracaoProps> = ({
  cnpj = '',
  onComplete
}) => {
  const [activeTab, setActiveTab] = useState<string>("erp");
  const [isLoading, setIsLoading] = useState(false);
  
  // Campos ERP
  const [erpUrl, setErpUrl] = useState("");
  const [erpUsuario, setErpUsuario] = useState("");
  const [erpSenha, setErpSenha] = useState("");
  const [erpToken, setErpToken] = useState("");
  
  // Campos NFe
  const [nfeToken, setNfeToken] = useState("");
  const [nfeCertificado, setNfeCertificado] = useState<File | null>(null);
  const [nfeSenhaCertificado, setNfeSenhaCertificado] = useState("");
  
  // Campos Contabilidade
  const [contabilidadeUrl, setContabilidadeUrl] = useState("");
  const [contabilidadeUsuario, setContabilidadeUsuario] = useState("");
  const [contabilidadeSenha, setContabilidadeSenha] = useState("");
  const [contabilidadeIntegracao, setContabilidadeIntegracao] = useState<string>("manual");
  
  // Configurações gerais
  const [periodoInicial, setPeriodoInicial] = useState("");
  const [periodoFinal, setPeriodoFinal] = useState("");
  const [sincronizacaoAutomatica, setSincronizacaoAutomatica] = useState(false);
  
  const handleSalvarConfiguracao = async () => {
    try {
      setIsLoading(true);
      
      let config: FonteDadosConfig = {
        tipo: activeTab as 'erp' | 'contabilidade' | 'nfe' | 'manual',
        periodoInicial,
        periodoFinal,
        cnpj
      };
      
      switch (activeTab) {
        case "erp":
          config.credenciais = {
            url: erpUrl,
            usuario: erpUsuario,
            senha: erpSenha,
            token: erpToken
          };
          config.endpointUrl = erpUrl;
          break;
          
        case "nfe":
          config.credenciais = {
            token: nfeToken,
            senhaCertificado: nfeSenhaCertificado
          };
          break;
          
        case "contabilidade":
          config.credenciais = {
            url: contabilidadeUrl,
            usuario: contabilidadeUsuario,
            senha: contabilidadeSenha,
            tipoIntegracao: contabilidadeIntegracao
          };
          config.endpointUrl = contabilidadeUrl;
          break;
      }
      
      const result = await configurarFonteDados(config);
      
      if (result) {
        toast({
          title: "Integração configurada",
          description: `Fonte de dados ${activeTab.toUpperCase()} configurada com sucesso.`
        });
        
        if (onComplete) {
          onComplete();
        }
      }
    } catch (error) {
      console.error("Erro ao configurar fonte de dados:", error);
      toast({
        title: "Erro na configuração",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao salvar a configuração",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
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
              erpUrl={erpUrl}
              setErpUrl={setErpUrl}
              erpUsuario={erpUsuario}
              setErpUsuario={setErpUsuario}
              erpSenha={erpSenha}
              setErpSenha={setErpSenha}
              erpToken={erpToken}
              setErpToken={setErpToken}
            />
          </TabsContent>
          
          <TabsContent value="nfe" className="space-y-4">
            <NfeTabContent
              nfeToken={nfeToken}
              setNfeToken={setNfeToken}
              nfeCertificado={nfeCertificado}
              setNfeCertificado={setNfeCertificado}
              nfeSenhaCertificado={nfeSenhaCertificado}
              setNfeSenhaCertificado={setNfeSenhaCertificado}
            />
          </TabsContent>
          
          <TabsContent value="contabilidade" className="space-y-4">
            <ContabilidadeTabContent
              contabilidadeUrl={contabilidadeUrl}
              setContabilidadeUrl={setContabilidadeUrl}
              contabilidadeUsuario={contabilidadeUsuario}
              setContabilidadeUsuario={setContabilidadeUsuario}
              contabilidadeSenha={contabilidadeSenha}
              setContabilidadeSenha={setContabilidadeSenha}
              contabilidadeIntegracao={contabilidadeIntegracao}
              setContabilidadeIntegracao={setContabilidadeIntegracao}
            />
          </TabsContent>
          
          <TabsContent value="manual" className="space-y-4">
            <ManualTabContent />
          </TabsContent>
          
          <PeriodoSelector 
            periodoInicial={periodoInicial}
            setPeriodoInicial={setPeriodoInicial}
            periodoFinal={periodoFinal}
            setPeriodoFinal={setPeriodoFinal}
            sincronizacaoAutomatica={sincronizacaoAutomatica}
            setSincronizacaoAutomatica={setSincronizacaoAutomatica}
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
