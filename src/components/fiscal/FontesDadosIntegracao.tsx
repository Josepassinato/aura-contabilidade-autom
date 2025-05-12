
/**
 * Componente para configuração de integração com fontes de dados fiscais
 */

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Database } from "lucide-react"; 
import { configurarFonteDados, FonteDadosConfig } from "@/services/fiscal/dataSourcesIntegration";

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
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="erp_url">URL da API</Label>
                <Input 
                  id="erp_url" 
                  placeholder="https://api.seuerppreferido.com.br/v1" 
                  value={erpUrl}
                  onChange={(e) => setErpUrl(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="erp_usuario">Usuário</Label>
                  <Input 
                    id="erp_usuario" 
                    placeholder="usuario_api" 
                    value={erpUsuario}
                    onChange={(e) => setErpUsuario(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="erp_senha">Senha</Label>
                  <Input 
                    id="erp_senha" 
                    type="password" 
                    placeholder="********" 
                    value={erpSenha}
                    onChange={(e) => setErpSenha(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="erp_token">Token de API (se necessário)</Label>
                <Input 
                  id="erp_token" 
                  placeholder="Token de acesso" 
                  value={erpToken}
                  onChange={(e) => setErpToken(e.target.value)}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="nfe" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nfe_token">Token de acesso</Label>
                <Input 
                  id="nfe_token" 
                  placeholder="Token de API da SEFAZ ou provedor" 
                  value={nfeToken}
                  onChange={(e) => setNfeToken(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="nfe_certificado">Certificado Digital</Label>
                <Input 
                  id="nfe_certificado" 
                  type="file" 
                  accept=".pfx,.p12"
                  onChange={(e) => setNfeCertificado(e.target.files ? e.target.files[0] : null)}
                />
                <p className="text-xs text-muted-foreground">Certificado digital no formato PFX ou P12</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="nfe_senha_certificado">Senha do Certificado</Label>
                <Input 
                  id="nfe_senha_certificado" 
                  type="password" 
                  placeholder="********" 
                  value={nfeSenhaCertificado}
                  onChange={(e) => setNfeSenhaCertificado(e.target.value)}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="contabilidade" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contabilidade_url">URL do Sistema Contábil</Label>
                <Input 
                  id="contabilidade_url" 
                  placeholder="https://sistema.contabilidade.com.br/api" 
                  value={contabilidadeUrl}
                  onChange={(e) => setContabilidadeUrl(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contabilidade_usuario">Usuário</Label>
                  <Input 
                    id="contabilidade_usuario" 
                    placeholder="Usuario do sistema contábil" 
                    value={contabilidadeUsuario}
                    onChange={(e) => setContabilidadeUsuario(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contabilidade_senha">Senha</Label>
                  <Input 
                    id="contabilidade_senha" 
                    type="password" 
                    placeholder="********" 
                    value={contabilidadeSenha}
                    onChange={(e) => setContabilidadeSenha(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contabilidade_integracao">Tipo de Integração</Label>
                <Select 
                  value={contabilidadeIntegracao} 
                  onValueChange={setContabilidadeIntegracao}
                >
                  <SelectTrigger id="contabilidade_integracao">
                    <SelectValue placeholder="Selecione o tipo de integração" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="api">API Direta</SelectItem>
                    <SelectItem value="importacao">Importação de Arquivos</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="manual" className="space-y-4">
            <div className="border rounded-md p-4 bg-muted/50">
              <p className="text-sm">
                Na configuração manual, os dados fiscais e contábeis serão inseridos diretamente no sistema
                ou importados através de planilhas. Configure abaixo o período para busca inicial dos dados.
              </p>
            </div>
          </TabsContent>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 border-t pt-4">
            <div className="space-y-2">
              <Label htmlFor="periodo_inicial">Período Inicial</Label>
              <Input 
                id="periodo_inicial" 
                type="month" 
                placeholder="YYYY-MM" 
                value={periodoInicial}
                onChange={(e) => setPeriodoInicial(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="periodo_final">Período Final (opcional)</Label>
              <Input 
                id="periodo_final" 
                type="month" 
                placeholder="YYYY-MM" 
                value={periodoFinal}
                onChange={(e) => setPeriodoFinal(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2 mt-4">
            <Switch 
              id="sincronizacao" 
              checked={sincronizacaoAutomatica}
              onCheckedChange={setSincronizacaoAutomatica}
            />
            <Label htmlFor="sincronizacao">Sincronização automática</Label>
          </div>
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
