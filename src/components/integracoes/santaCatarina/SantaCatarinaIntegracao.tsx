
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { IntegraContadorForm } from './IntegraContadorForm';
import { NfceForm } from './NfceForm';
import { SefazScrapedDataTable } from '../SefazScrapedDataTable';
import { SefazXmlUploader } from '../SefazXmlUploader';
import { CheckCircle, Wifi, WifiOff, Database } from "lucide-react";

interface SantaCatarinaIntegracaoProps {
  clientId: string;
  clientName?: string;
}

export function SantaCatarinaIntegracao({ clientId, clientName }: SantaCatarinaIntegracaoProps) {
  const [activeTab, setActiveTab] = useState("integraContador");
  const [serproLoading, setSerproLoading] = useState(false);
  const [nfceLoading, setNfceLoading] = useState(false);
  
  // Handlers para submissão de formulários
  const handleSerproSubmit = async (serproConfig: any) => {
    if (!clientId) return;
    
    setSerproLoading(true);
    
    try {
      // Simular envio de configuração
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Integra Contador configurado",
        description: "Acesso ao Serpro Integra Contador configurado com sucesso"
      });
      
      // Mudar para a guia de dados coletados
      setActiveTab("dados");
    } finally {
      setSerproLoading(false);
    }
  };
  
  const handleNfceSubmit = async (nfceConfig: any) => {
    if (!clientId) return;
    
    setNfceLoading(true);
    
    try {
      // Simular envio de configuração
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "NFC-e configurada",
        description: "As credenciais para NFC-e foram salvas com sucesso"
      });
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
          Configure a integração com o sistema SEFAZ SC, Serpro Integra Contador ou envie XMLs manualmente
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="integraContador" className="flex items-center gap-2">
              <Wifi className="h-4 w-4" />
              Integra Contador
            </TabsTrigger>
            <TabsTrigger value="nfce" className="flex items-center gap-2">
              <Wifi className="h-4 w-4" />
              NFC-e Santa Catarina
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <WifiOff className="h-4 w-4" />
              Upload Manual
            </TabsTrigger>
            <TabsTrigger value="dados" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Dados Coletados
            </TabsTrigger>
          </TabsList>
          
          {/* Tab content for Integra Contador */}
          <TabsContent value="integraContador" className="space-y-6 pt-4">
            <IntegraContadorForm 
              onSubmit={handleSerproSubmit}
              loading={serproLoading}
            />
          </TabsContent>
          
          {/* Tab content for NFC-e */}
          <TabsContent value="nfce" className="space-y-6 pt-4">
            <NfceForm
              onSubmit={handleNfceSubmit}
              loading={nfceLoading}
            />
          </TabsContent>

          {/* Tab content for Upload Manual */}
          <TabsContent value="upload" className="mt-4">
            <SefazXmlUploader
              clientId={clientId}
              clientName={clientName}
              onUploadComplete={() => setActiveTab("dados")}
            />
          </TabsContent>
          
          {/* Tab content for data display */}
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
        <Button variant="outline" onClick={() => setActiveTab("integraContador")}>
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
