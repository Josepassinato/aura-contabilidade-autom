
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { IntegracaoEstadualForm } from './IntegracaoEstadualForm';
import { SefazXmlUploader } from './SefazXmlUploader';
import { SefazScrapedDataTable } from './SefazScrapedDataTable';
import { UF } from "@/services/governamental/estadualIntegration";
import { WifiOff, Wifi } from "lucide-react";

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
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="integracao" className="flex items-center gap-2">
              <Wifi className="h-4 w-4" />
              Integração API
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <WifiOff className="h-4 w-4" />
              Upload Manual
            </TabsTrigger>
            <TabsTrigger value="dados">
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
