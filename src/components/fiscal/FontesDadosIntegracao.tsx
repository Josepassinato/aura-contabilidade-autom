
import React, { useState } from 'react';
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  configurarFonteDados,
  FonteDadosConfig
} from "@/services/fiscal/dataSourcesIntegration";
import { FileDatabase, ServerCog, Receipt, PenLine, CircleCheck, RefreshCw } from "lucide-react";

export function FontesDadosIntegracao() {
  const [activeTab, setActiveTab] = useState<string>("erp");
  const [isConfiguring, setIsConfiguring] = useState(false);
  
  // Estados para configurações de cada tipo de fonte
  const [erpConfig, setErpConfig] = useState<{
    url: string;
    username: string;
    password: string;
  }>({
    url: '',
    username: '',
    password: '',
  });
  
  const [nfeConfig, setNfeConfig] = useState<{
    certificado: string;
    senha: string;
  }>({
    certificado: '',
    senha: '',
  });
  
  const [contabilConfig, setContabilConfig] = useState<{
    sistema: string;
    token: string;
  }>({
    sistema: 'dominio',
    token: '',
  });

  // Verificar se há configuração salva
  React.useEffect(() => {
    const loadSavedConfigs = () => {
      try {
        // Carregar configurações salvas do localStorage
        const erpConfigSaved = localStorage.getItem('fonte-dados-erp');
        const nfeConfigSaved = localStorage.getItem('fonte-dados-nfe');
        const contabilConfigSaved = localStorage.getItem('fonte-dados-contabilidade');
        
        if (erpConfigSaved) {
          const config = JSON.parse(erpConfigSaved);
          setErpConfig({
            url: config.endpointUrl || '',
            username: config.credenciais?.username || '',
            password: config.credenciais?.password || '',
          });
        }
        
        if (nfeConfigSaved) {
          const config = JSON.parse(nfeConfigSaved);
          setNfeConfig({
            certificado: config.credenciais?.certificado || '',
            senha: config.credenciais?.senha || '',
          });
        }
        
        if (contabilConfigSaved) {
          const config = JSON.parse(contabilConfigSaved);
          setContabilConfig({
            sistema: config.sistema || 'dominio',
            token: config.credenciais?.token || '',
          });
        }
      } catch (error) {
        console.error('Erro ao carregar configurações salvas:', error);
      }
    };
    
    loadSavedConfigs();
  }, []);

  const handleSaveConfig = async () => {
    setIsConfiguring(true);
    
    try {
      let config: FonteDadosConfig;
      
      switch (activeTab) {
        case 'erp':
          config = {
            tipo: 'erp',
            endpointUrl: erpConfig.url,
            credenciais: {
              username: erpConfig.username,
              password: erpConfig.password,
            }
          };
          break;
        
        case 'nfe':
          config = {
            tipo: 'nfe',
            credenciais: {
              certificado: nfeConfig.certificado,
              senha: nfeConfig.senha,
            }
          };
          break;
          
        case 'contabilidade':
          config = {
            tipo: 'contabilidade',
            credenciais: {
              sistema: contabilConfig.sistema,
              token: contabilConfig.token,
            }
          };
          break;
          
        case 'manual':
          config = {
            tipo: 'manual'
          };
          break;
          
        default:
          throw new Error("Tipo de fonte de dados inválido");
      }
      
      const success = await configurarFonteDados(config);
      
      if (success) {
        toast({
          title: "Configuração salva",
          description: "Integração com fonte de dados configurada com sucesso",
        });
      }
      
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao salvar a configuração",
        variant: "destructive",
      });
    } finally {
      setIsConfiguring(false);
    }
  };

  const getStatusBadge = (tipo: string) => {
    const configSaved = localStorage.getItem(`fonte-dados-${tipo}`);
    
    if (configSaved) {
      return (
        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors bg-green-100 text-green-800 border-transparent">
          <CircleCheck className="w-3 h-3 mr-1" />
          Configurado
        </div>
      );
    }
    
    return (
      <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors bg-gray-100 text-gray-800 border-transparent">
        Não configurado
      </div>
    );
  };

  const handleTestarConexao = () => {
    toast({
      title: "Testando conexão",
      description: "Teste de conexão iniciado. Aguarde...",
    });
    
    // Simulação de teste
    setTimeout(() => {
      toast({
        title: "Teste concluído",
        description: "Conexão testada com sucesso.",
      });
    }, 2000);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Integração com Fontes de Dados</CardTitle>
        <CardDescription>
          Configure as fontes de dados para cálculos fiscais automatizados
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="erp" className="flex items-center gap-1">
              <ServerCog className="w-4 h-4" />
              <span>ERP</span>
              {getStatusBadge('erp')}
            </TabsTrigger>
            <TabsTrigger value="nfe" className="flex items-center gap-1">
              <Receipt className="w-4 h-4" />
              <span>NFe</span>
              {getStatusBadge('nfe')}
            </TabsTrigger>
            <TabsTrigger value="contabilidade" className="flex items-center gap-1">
              <FileDatabase className="w-4 h-4" />
              <span>Contabilidade</span>
              {getStatusBadge('contabilidade')}
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center gap-1">
              <PenLine className="w-4 h-4" />
              <span>Manual</span>
              {getStatusBadge('manual')}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="erp" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="erp-url">URL da API do ERP</Label>
              <Input
                id="erp-url"
                placeholder="https://api.erp.exemplo.com.br"
                value={erpConfig.url}
                onChange={(e) => setErpConfig({...erpConfig, url: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="erp-username">Usuário da API</Label>
                <Input
                  id="erp-username"
                  placeholder="Usuário"
                  value={erpConfig.username}
                  onChange={(e) => setErpConfig({...erpConfig, username: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="erp-password">Senha da API</Label>
                <Input
                  id="erp-password"
                  type="password"
                  placeholder="Senha"
                  value={erpConfig.password}
                  onChange={(e) => setErpConfig({...erpConfig, password: e.target.value})}
                />
              </div>
            </div>
            
            <div className="pt-2">
              <Button variant="outline" onClick={handleTestarConexao}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Testar Conexão
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="nfe" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nfe-certificado">Certificado Digital</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="nfe-certificado"
                  placeholder="Selecione o arquivo do certificado"
                  value={nfeConfig.certificado}
                  onChange={(e) => setNfeConfig({...nfeConfig, certificado: e.target.value})}
                />
                <Button variant="outline" className="whitespace-nowrap">
                  Escolher Arquivo
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Selecione um arquivo .pfx contendo seu certificado digital
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="nfe-senha">Senha do Certificado</Label>
              <Input
                id="nfe-senha"
                type="password"
                placeholder="Senha"
                value={nfeConfig.senha}
                onChange={(e) => setNfeConfig({...nfeConfig, senha: e.target.value})}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="contabilidade" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contabil-sistema">Sistema Contábil</Label>
              <Select
                value={contabilConfig.sistema}
                onValueChange={(value) => setContabilConfig({...contabilConfig, sistema: value})}
              >
                <SelectTrigger id="contabil-sistema">
                  <SelectValue placeholder="Selecione um sistema" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dominio">Domínio Sistemas</SelectItem>
                  <SelectItem value="fortes">Fortes Contábil</SelectItem>
                  <SelectItem value="alterdata">Alterdata</SelectItem>
                  <SelectItem value="contmatic">Contmatic</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contabil-token">Token de Integração</Label>
              <Input
                id="contabil-token"
                placeholder="Token de API"
                value={contabilConfig.token}
                onChange={(e) => setContabilConfig({...contabilConfig, token: e.target.value})}
              />
              <p className="text-sm text-muted-foreground">
                Obtenha o token de integração no painel de administração do seu sistema contábil
              </p>
            </div>
            
            <div className="pt-2">
              <Button variant="outline" onClick={handleTestarConexao}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Verificar Conexão
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="manual" className="space-y-4">
            <div className="p-6 text-center border-2 border-dashed rounded-lg">
              <PenLine className="w-12 h-12 mx-auto text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">Entrada Manual de Dados</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                A entrada manual permite o uso do sistema sem integrações automáticas.
                Os dados precisarão ser inseridos manualmente a cada período fiscal.
              </p>
            </div>
            
            <p className="text-sm">
              Não são necessárias configurações adicionais para entrada manual. 
              Os formulários de entrada de dados estarão disponíveis durante o processo de cálculo.
            </p>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={handleSaveConfig} 
          disabled={isConfiguring}
          className="ml-auto"
        >
          {isConfiguring ? "Salvando..." : "Salvar Configuração"}
        </Button>
      </CardFooter>
    </Card>
  );
}
