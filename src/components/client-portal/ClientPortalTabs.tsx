
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const ClientPortalTabs = () => {
  return (
    <Tabs defaultValue="fiscal" className="w-full">
      <TabsList>
        <TabsTrigger value="fiscal">Obrigações Fiscais</TabsTrigger>
        <TabsTrigger value="accounting">Contabilidade</TabsTrigger>
        <TabsTrigger value="reports">Relatórios</TabsTrigger>
      </TabsList>
      <div className="p-4 border rounded-lg mt-4">
        <TabsContent value="fiscal">
          <h2 className="text-lg font-medium mb-4">Calendário Fiscal</h2>
          <p className="text-muted-foreground">
            Aqui você encontra todas as suas obrigações fiscais, prazos e valores.
            Fale com a assistente de IA para obter detalhes específicos.
          </p>
        </TabsContent>
        <TabsContent value="accounting">
          <h2 className="text-lg font-medium mb-4">Registros Contábeis</h2>
          <p className="text-muted-foreground">
            Visualize seus demonstrativos contábeis, balancetes e outros documentos.
            A assistente de IA pode gerar relatórios personalizados conforme sua necessidade.
          </p>
        </TabsContent>
        <TabsContent value="reports">
          <h2 className="text-lg font-medium mb-4">Relatórios Gerenciais</h2>
          <p className="text-muted-foreground">
            Acompanhe indicadores financeiros e relatórios gerenciais da sua empresa.
            Pergunte à assistente de IA para analisar tendências e oportunidades.
          </p>
        </TabsContent>
      </div>
    </Tabs>
  );
};
