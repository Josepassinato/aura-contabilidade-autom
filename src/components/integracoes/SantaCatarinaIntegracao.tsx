import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioItem } from "@/components/ui/radio-group";
import { toast } from "@/hooks/use-toast";
import { 
  configurarIntegraContadorSC,
  configurarNfceSC, 
  SerproIntegraContadorConfig,
  NfceScConfig
} from "@/services/governamental/sefazScraperService";
import { FileUp, Info, CheckCircle, AlertTriangle } from "lucide-react";
import { SefazScrapedDataTable } from './SefazScrapedDataTable';

interface SantaCatarinaIntegracaoProps {
  clientId: string;
  clientName?: string;
}

export function SantaCatarinaIntegracao({ clientId, clientName }: SantaCatarinaIntegracaoProps) {
  const [activeTab, setActiveTab] = useState("integracao");
  const [serproLoading, setSerproLoading] = useState(false);
  const [nfceLoading, setNfceLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Estado para formulário do Serpro Integra Contador
  const [serproConfig, setSerproConfig] = useState<SerproIntegraContadorConfig>({
    certificadoDigital: '',
    senhaCertificado: '',
    procuracaoEletronica: false
  });
  
  // Estado para formulário de NFC-e
  const [nfceConfig, setNfceConfig] = useState<NfceScConfig>({
    dtecUsuario: '',
    dtecSenha: '',
    tipoTTD: '706',
    cscCodigo: '',
    cscToken: ''
  });
  
  // Handler para upload de arquivo de certificado
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setSerproConfig(prev => ({ 
        ...prev, 
        certificadoDigital: e.target.files[0].name 
      }));
    }
  };
  
  // Enviar configuração do Serpro Integra Contador
  const handleSerproSubmit = async () => {
    if (!clientId) return;
    
    if (!serproConfig.certificadoDigital) {
      toast({
        title: "Certificado obrigatório",
        description: "O certificado digital e-CNPJ é necessário para a integração",
        variant: "destructive"
      });
      return;
    }
    
    setSerproLoading(true);
    
    try {
      const resultado = await configurarIntegraContadorSC(clientId, serproConfig);
      
      if (resultado.success) {
        // Mudar para a guia de dados coletados
        setActiveTab("dados");
      }
    } finally {
      setSerproLoading(false);
    }
  };
  
  // Enviar configuração da NFC-e
  const handleNfceSubmit = async () => {
    if (!clientId) return;
    
    if (!nfceConfig.dtecUsuario || !nfceConfig.dtecSenha) {
      toast({
        title: "Campos obrigatórios",
        description: "Usuário e senha do DTEC são obrigatórios",
        variant: "destructive"
      });
      return;
    }
    
    setNfceLoading(true);
    
    try {
      const resultado = await configurarNfceSC(clientId, nfceConfig);
      
      if (resultado.success) {
        toast({
          title: "NFC-e configurada",
          description: "As credenciais para NFC-e foram salvas com sucesso"
        });
      }
    } finally {
      setNfceLoading(false);
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Integração SEFAZ Santa Catarina
          {clientName && <span className="text-sm font-normal">- {clientName}</span>}
        </CardTitle>
        <CardDescription>
          Configure a integração com o sistema SEFAZ SC e o Serpro Integra Contador
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="integracao">Integra Contador</TabsTrigger>
            <TabsTrigger value="nfce">NFC-e Santa Catarina</TabsTrigger>
            <TabsTrigger value="dados">Dados Coletados</TabsTrigger>
          </TabsList>
          
          <TabsContent value="integracao" className="space-y-6 pt-4">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-blue-800">Sobre o Integra Contador</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    O Integra Contador é uma solução do Serpro que oferece acesso automatizado a 
                    diversos dados fiscais dos seus clientes, como notas fiscais eletrônicas, 
                    certidões negativas e informações cadastrais.
                  </p>
                  <ul className="mt-2 text-sm text-blue-700 list-disc list-inside">
                    <li>Para utilizar, é necessário contratar o serviço na Loja do Serpro</li>
                    <li>Utilize um certificado digital e-CNPJ para autenticação</li>
                    <li>É necessária procuração eletrônica dos seus clientes no portal e-CAC</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="certificado">Certificado Digital e-CNPJ</Label>
                <div className="flex gap-2">
                  <Input
                    id="certificado-upload"
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <Input
                    id="certificado"
                    value={serproConfig.certificadoDigital}
                    readOnly
                    placeholder="Nenhum arquivo selecionado"
                  />
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('certificado-upload')?.click()}
                  >
                    <FileUp className="h-4 w-4 mr-2" />
                    Selecionar
                  </Button>
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="senhaCertificado">Senha do Certificado</Label>
                <Input
                  id="senhaCertificado"
                  type="password"
                  value={serproConfig.senhaCertificado}
                  onChange={(e) => setSerproConfig(prev => ({ 
                    ...prev, 
                    senhaCertificado: e.target.value 
                  }))}
                  placeholder="Digite a senha do certificado digital"
                />
              </div>
              
              <div className="flex items-center space-x-2 mt-2">
                <Checkbox 
                  id="procuracao" 
                  checked={serproConfig.procuracaoEletronica}
                  onCheckedChange={(checked) => setSerproConfig(prev => ({
                    ...prev,
                    procuracaoEletronica: checked === true
                  }))}
                />
                <Label 
                  htmlFor="procuracao" 
                  className="text-sm font-normal"
                >
                  Confirmo que possuo procuração eletrônica dos clientes no e-CAC
                </Label>
              </div>
            </div>
            
            <div className="pt-4 flex justify-end">
              <Button onClick={handleSerproSubmit} disabled={serproLoading}>
                {serproLoading ? "Configurando..." : "Configurar Integração"}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="nfce" className="space-y-6 pt-4">
            <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-amber-800">Configuração NFC-e de Santa Catarina</h4>
                  <p className="text-sm text-amber-700 mt-1">
                    Para acessar ou emitir a Nota Fiscal do Consumidor Eletrônica (NFC-e) em SC, é necessário:
                  </p>
                  <ul className="mt-2 text-sm text-amber-700 list-decimal list-inside">
                    <li>Cadastro no Domicílio Tributário Eletrônico do Contribuinte (DTEC)</li>
                    <li>Requerer o Tratamento Tributário Diferenciado (TTD) no SAT</li>
                    <li>Gerar o Código de Segurança do Contribuinte (CSC)</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="dtecUsuario">Usuário DTEC</Label>
                <Input
                  id="dtecUsuario"
                  value={nfceConfig.dtecUsuario}
                  onChange={(e) => setNfceConfig(prev => ({
                    ...prev,
                    dtecUsuario: e.target.value
                  }))}
                  placeholder="Usuário do DTEC"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="dtecSenha">Senha DTEC</Label>
                <Input
                  id="dtecSenha"
                  type="password"
                  value={nfceConfig.dtecSenha}
                  onChange={(e) => setNfceConfig(prev => ({
                    ...prev,
                    dtecSenha: e.target.value
                  }))}
                  placeholder="Senha do DTEC"
                />
              </div>
              
              <div className="grid gap-2">
                <Label>Tipo de TTD</Label>
                <RadioGroup 
                  value={nfceConfig.tipoTTD} 
                  onValueChange={(value: '706' | '707') => setNfceConfig(prev => ({
                    ...prev,
                    tipoTTD: value
                  }))}
                >
                  <div className="flex items-center space-x-2">
                    <RadioItem value="706" id="ttd-706" />
                    <Label htmlFor="ttd-706">TTD 706 - Emissão Normal</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioItem value="707" id="ttd-707" />
                    <Label htmlFor="ttd-707">TTD 707 - Contingência</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="cscCodigo">Código CSC (opcional)</Label>
                <Input
                  id="cscCodigo"
                  value={nfceConfig.cscCodigo}
                  onChange={(e) => setNfceConfig(prev => ({
                    ...prev,
                    cscCodigo: e.target.value
                  }))}
                  placeholder="Código de Segurança do Contribuinte"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="cscToken">Token CSC (opcional)</Label>
                <Input
                  id="cscToken"
                  value={nfceConfig.cscToken}
                  onChange={(e) => setNfceConfig(prev => ({
                    ...prev,
                    cscToken: e.target.value
                  }))}
                  placeholder="Token do CSC"
                />
              </div>
            </div>
            
            <div className="pt-4 flex justify-end">
              <Button onClick={handleNfceSubmit} disabled={nfceLoading}>
                {nfceLoading ? "Configurando..." : "Configurar NFC-e"}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="dados">
            <SefazScrapedDataTable 
              clientId={clientId}
              clientName={clientName || ""}
              uf="SC"
            />
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-4">
        <Button variant="outline" onClick={() => setActiveTab("integracao")}>
          Voltar para Integração
        </Button>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CheckCircle className="h-4 w-4" />
          Integração SEFAZ-SC
        </div>
      </CardFooter>
    </Card>
  );
}
