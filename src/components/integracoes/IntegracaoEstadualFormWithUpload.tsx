
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { IntegracaoEstadualForm } from './IntegracaoEstadualForm';
import { SefazXmlUploader } from './SefazXmlUploader';
import { SefazScrapedDataTable } from './SefazScrapedDataTable';
import { UF } from "@/services/governamental/estadualIntegration";
import { WifiOff, Wifi, Database } from "lucide-react";

interface IntegracaoEstadualFormWithUploadProps {
  uf: UF;
  clientId: string;
  clientName: string;
  onSave: (data: any) => Promise<void>;
}

export function IntegracaoEstadualFormWithUpload({ 
  uf, 
  clientId, 
  clientName, 
  onSave 
}: IntegracaoEstadualFormWithUploadProps) {
  const [activeTab, setActiveTab] = useState("integracao");

  return (
    <Card>
      <CardHeader>
        <CardTitle>SEFAZ-{uf} - {clientName}</CardTitle>
        <CardDescription>
          Configure a integração automática ou envie arquivos XML manualmente
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="integracao" className="flex items-center gap-2">
              <Wifi className="h-4 w-4" />
              Credenciais
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
          
          <TabsContent value="integracao" className="mt-4">
            <IntegracaoEstadualForm
              uf={uf}
              clientId={clientId}
              clientName={clientName}
              onSave={onSave}
            />
          </TabsContent>
          
          <TabsContent value="upload" className="mt-4">
            <SefazXmlUploader
              clientId={clientId}
              clientName={clientName}
              onUploadComplete={() => setActiveTab("dados")}
            />
          </TabsContent>
          
          <TabsContent value="dados" className="mt-4">
            <SefazScrapedDataTable
              clientId={clientId}
              clientName={clientName}
              uf={uf}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
