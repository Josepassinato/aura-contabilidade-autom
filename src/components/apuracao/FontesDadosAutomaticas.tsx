
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Database, 
  Receipt, 
  FileText, 
  CreditCard, 
  RefreshCw, 
  Clock, 
  AlertCircle
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ConfiguracaoProps {
  onSave: (config: FonteDadosConfig) => void;
  configInicial?: FonteDadosConfig;
}

export interface FonteDadosConfig {
  tipo: 'ocr' | 'openbanking' | 'api_fiscal' | 'erp';
  agendamento: 'diario' | 'semanal' | 'mensal' | 'sob_demanda';
  integracao_continua: boolean;
  processamento_automatico: boolean;
  credenciais: Record<string, string>;
  endpoints?: string[];
  configuracoes_adicionais?: Record<string, any>;
}

export function FontesDadosAutomaticas({ onSave, configInicial }: ConfiguracaoProps) {
  const [activeTab, setActiveTab] = useState<string>("ocr");
  const [config, setConfig] = useState<FonteDadosConfig>(configInicial || {
    tipo: 'ocr',
    agendamento: 'diario',
    integracao_continua: true,
    processamento_automatico: false,
    credenciais: {},
    endpoints: [],
    configuracoes_adicionais: {}
  });

  const handleChange = (key: keyof FonteDadosConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleCredentialChange = (key: string, value: string) => {
    setConfig(prev => ({
      ...prev,
      credenciais: {
        ...prev.credenciais,
        [key]: value
      }
    }));
  };

  const handleSave = () => {
    // Validação básica
    if (config.tipo === 'ocr' && !config.credenciais.api_key) {
      toast({
        title: "Configuração incompleta",
        description: "A chave de API para OCR é obrigatória",
        variant: "destructive"
      });
      return;
    }

    if (config.tipo === 'openbanking' && !config.credenciais.client_id) {
      toast({
        title: "Configuração incompleta",
        description: "O ID do cliente para Open Banking é obrigatório",
        variant: "destructive"
      });
      return;
    }

    // Atualizar o tipo com base na aba ativa
    const tipoConfigurado = activeTab as 'ocr' | 'openbanking' | 'api_fiscal' | 'erp';
    const configFinal = { ...config, tipo: tipoConfigurado };
    
    onSave(configFinal);
    toast({
      title: "Configuração salva",
      description: `Fonte de dados ${tipoConfigurado.toUpperCase()} configurada com sucesso`
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Configuração de Fontes de Dados Automáticas</CardTitle>
        <CardDescription>
          Configure as integrações para ingestão automática de dados contábeis e fiscais
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-4 gap-4">
            <TabsTrigger value="ocr" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              OCR Documentos
            </TabsTrigger>
            <TabsTrigger value="openbanking" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Open Banking
            </TabsTrigger>
            <TabsTrigger value="api_fiscal" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              API Fiscal
            </TabsTrigger>
            <TabsTrigger value="erp" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Integração ERP
            </TabsTrigger>
          </TabsList>

          {/* Configuração OCR */}
          <TabsContent value="ocr" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="ocr_provider">Provedor de OCR</Label>
                <select 
                  id="ocr_provider" 
                  className="w-full mt-1 p-2 border rounded"
                  value={config.configuracoes_adicionais?.ocr_provider || "aws"}
                  onChange={(e) => handleChange('configuracoes_adicionais', {
                    ...config.configuracoes_adicionais,
                    ocr_provider: e.target.value
                  })}
                >
                  <option value="aws">AWS Textract</option>
                  <option value="google">Google Document AI</option>
                  <option value="azure">Azure Form Recognizer</option>
                  <option value="tesseract">Tesseract OCR</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ocr_api_key">Chave de API</Label>
                <Input 
                  id="ocr_api_key"
                  type="password"
                  value={config.credenciais.api_key || ''}
                  onChange={(e) => handleCredentialChange('api_key', e.target.value)}
                  placeholder="Chave de API do serviço OCR"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="ocr_auto_categorize"
                  checked={config.configuracoes_adicionais?.auto_categorize || false}
                  onCheckedChange={(checked) => handleChange('configuracoes_adicionais', {
                    ...config.configuracoes_adicionais,
                    auto_categorize: checked
                  })}
                />
                <Label htmlFor="ocr_auto_categorize">
                  Categorização automática de documentos
                </Label>
              </div>
            </div>
          </TabsContent>

          {/* Configuração Open Banking */}
          <TabsContent value="openbanking" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="ob_banco">Instituição Financeira</Label>
                <select 
                  id="ob_banco" 
                  className="w-full mt-1 p-2 border rounded"
                  value={config.configuracoes_adicionais?.banco || ""}
                  onChange={(e) => handleChange('configuracoes_adicionais', {
                    ...config.configuracoes_adicionais,
                    banco: e.target.value
                  })}
                >
                  <option value="">Selecionar banco...</option>
                  <option value="bb">Banco do Brasil</option>
                  <option value="bradesco">Bradesco</option>
                  <option value="itau">Itaú</option>
                  <option value="santander">Santander</option>
                  <option value="caixa">Caixa Econômica Federal</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ob_client_id">Client ID</Label>
                  <Input 
                    id="ob_client_id"
                    value={config.credenciais.client_id || ''}
                    onChange={(e) => handleCredentialChange('client_id', e.target.value)}
                    placeholder="ID do Cliente Open Banking"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ob_client_secret">Client Secret</Label>
                  <Input 
                    id="ob_client_secret"
                    type="password"
                    value={config.credenciais.client_secret || ''}
                    onChange={(e) => handleCredentialChange('client_secret', e.target.value)}
                    placeholder="Client Secret"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ob_redirect_uri">URI de Redirecionamento</Label>
                <Input 
                  id="ob_redirect_uri"
                  value={config.credenciais.redirect_uri || window.location.origin + '/callback/openbanking'}
                  onChange={(e) => handleCredentialChange('redirect_uri', e.target.value)}
                  placeholder="URL de callback"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="ob_fetch_transactions"
                  checked={config.configuracoes_adicionais?.fetch_transactions !== false}
                  onCheckedChange={(checked) => handleChange('configuracoes_adicionais', {
                    ...config.configuracoes_adicionais,
                    fetch_transactions: checked
                  })}
                />
                <Label htmlFor="ob_fetch_transactions">
                  Buscar transações bancárias automaticamente
                </Label>
              </div>
            </div>
          </TabsContent>

          {/* Configuração API Fiscal */}
          <TabsContent value="api_fiscal" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="fiscal_provider">Provedor de API Fiscal</Label>
                <select 
                  id="fiscal_provider" 
                  className="w-full mt-1 p-2 border rounded"
                  value={config.configuracoes_adicionais?.fiscal_provider || ""}
                  onChange={(e) => handleChange('configuracoes_adicionais', {
                    ...config.configuracoes_adicionais,
                    fiscal_provider: e.target.value
                  })}
                >
                  <option value="">Selecionar provedor...</option>
                  <option value="arquivei">Arquivei</option>
                  <option value="contabilone">ContabilOne</option>
                  <option value="fiscal_tech">FiscalTech</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fiscal_api_key">Chave de API</Label>
                <Input 
                  id="fiscal_api_key"
                  type="password"
                  value={config.credenciais.api_key_fiscal || ''}
                  onChange={(e) => handleCredentialChange('api_key_fiscal', e.target.value)}
                  placeholder="Chave de API do serviço fiscal"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fiscal_api_url">URL da API</Label>
                <Input 
                  id="fiscal_api_url"
                  value={config.credenciais.api_url || ''}
                  onChange={(e) => handleCredentialChange('api_url', e.target.value)}
                  placeholder="URL base da API fiscal"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="fiscal_auto_validation"
                  checked={config.configuracoes_adicionais?.validate_automatically || false}
                  onCheckedChange={(checked) => handleChange('configuracoes_adicionais', {
                    ...config.configuracoes_adicionais,
                    validate_automatically: checked
                  })}
                />
                <Label htmlFor="fiscal_auto_validation">
                  Validação automática de notas fiscais
                </Label>
              </div>
            </div>
          </TabsContent>

          {/* Configuração ERP */}
          <TabsContent value="erp" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="erp_tipo">Sistema ERP</Label>
                <select 
                  id="erp_tipo" 
                  className="w-full mt-1 p-2 border rounded"
                  value={config.configuracoes_adicionais?.erp_tipo || ""}
                  onChange={(e) => handleChange('configuracoes_adicionais', {
                    ...config.configuracoes_adicionais,
                    erp_tipo: e.target.value
                  })}
                >
                  <option value="">Selecionar ERP...</option>
                  <option value="totvs">TOTVS Protheus</option>
                  <option value="sap">SAP Business One</option>
                  <option value="oracle">Oracle NetSuite</option>
                  <option value="dynamics">Microsoft Dynamics</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="erp_url">URL de Conexão</Label>
                <Input 
                  id="erp_url"
                  value={config.credenciais.url || ''}
                  onChange={(e) => handleCredentialChange('url', e.target.value)}
                  placeholder="URL do endpoint do ERP"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="erp_username">Usuário</Label>
                  <Input 
                    id="erp_username"
                    value={config.credenciais.username || ''}
                    onChange={(e) => handleCredentialChange('username', e.target.value)}
                    placeholder="Nome de usuário"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="erp_password">Senha</Label>
                  <Input 
                    id="erp_password"
                    type="password"
                    value={config.credenciais.password || ''}
                    onChange={(e) => handleCredentialChange('password', e.target.value)}
                    placeholder="Senha"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="erp_sync_products"
                  checked={config.configuracoes_adicionais?.sync_products || false}
                  onCheckedChange={(checked) => handleChange('configuracoes_adicionais', {
                    ...config.configuracoes_adicionais,
                    sync_products: checked
                  })}
                />
                <Label htmlFor="erp_sync_products">
                  Sincronizar catálogo de produtos
                </Label>
              </div>
            </div>
          </TabsContent>

          {/* Configurações Comuns */}
          <div className="mt-6 border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Configurações de Agendamento</h3>
            
            <div className="space-y-4">
              <div className="flex flex-col space-y-2">
                <Label htmlFor="agendamento">Frequência de Ingestão</Label>
                <select 
                  id="agendamento" 
                  className="w-full p-2 border rounded"
                  value={config.agendamento}
                  onChange={(e) => handleChange('agendamento', e.target.value)}
                >
                  <option value="diario">Diário</option>
                  <option value="semanal">Semanal</option>
                  <option value="mensal">Mensal</option>
                  <option value="sob_demanda">Sob demanda</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex flex-col space-y-1">
                  <h4 className="font-medium">Integração Contínua</h4>
                  <p className="text-sm text-muted-foreground">
                    Processar novos dados à medida que são recebidos
                  </p>
                </div>
                <Switch
                  checked={config.integracao_continua}
                  onCheckedChange={(checked) => handleChange('integracao_continua', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex flex-col space-y-1">
                  <h4 className="font-medium">Processamento Automático</h4>
                  <p className="text-sm text-muted-foreground">
                    Realizar apuração automaticamente após ingestão
                  </p>
                </div>
                <Switch
                  checked={config.processamento_automatico}
                  onCheckedChange={(checked) => handleChange('processamento_automatico', checked)}
                />
              </div>
            </div>
          </div>
        </Tabs>

        <div className="flex justify-end mt-6">
          <Button 
            variant="outline" 
            className="mr-2"
            onClick={() => setActiveTab("ocr")}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSave}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Salvar Configuração
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
