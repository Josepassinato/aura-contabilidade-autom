
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FederalForm } from "./FederalForm";
import { EstadualForm } from "./EstadualForm";

export function GovAPIConfigForm() {
  const [activeTab, setActiveTab] = useState("federal");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">APIs Governamentais</h2>
        <p className="text-sm text-muted-foreground">
          Configure as credenciais para acesso às APIs de serviços governamentais utilizados pelo sistema.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 w-full md:w-auto">
          <TabsTrigger value="federal">Federal</TabsTrigger>
          <TabsTrigger value="estadual">Estadual</TabsTrigger>
        </TabsList>
        
        <TabsContent value="federal">
          <FederalForm />
        </TabsContent>
        
        <TabsContent value="estadual">
          <EstadualForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
