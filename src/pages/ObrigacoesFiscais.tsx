
import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, FileText } from "lucide-react";
import { ClientSelector } from "@/components/layout/ClientSelector";
import { ObrigacoesCalendario } from "@/components/obrigacoes/ObrigacoesCalendario";
import { ObrigacoesList } from "@/components/obrigacoes/ObrigacoesList";
import { ObrigacoesSummaryCards } from "@/components/obrigacoes/ObrigacoesSummaryCards";
import { ObrigacoesDateSelector } from "@/components/obrigacoes/ObrigacoesDateSelector";
import { getObrigacoesWithCorrectTypes } from "@/data/obrigacoesMock";

const ObrigacoesFiscais = () => {
  const [activeTab, setActiveTab] = useState("calendario");
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [ano, setAno] = useState(new Date().getFullYear());
  
  const obrigacoesWithCorrectTypes = getObrigacoesWithCorrectTypes();

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Obrigações Fiscais</h1>
          <p className="text-muted-foreground">
            Acompanhamento e gestão de obrigações fiscais e acessórias
          </p>
        </div>
        <ClientSelector />
      </div>

      <ObrigacoesSummaryCards />

      <ObrigacoesDateSelector
        mes={mes}
        setMes={setMes}
        ano={ano}
        setAno={setAno}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="calendario" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Calendário
          </TabsTrigger>
          <TabsTrigger value="lista" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Lista
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendario">
          <Card>
            <CardHeader>
              <CardTitle>Calendário de Obrigações Fiscais</CardTitle>
            </CardHeader>
            <CardContent>
              <ObrigacoesCalendario 
                mes={mes} 
                ano={ano} 
                obrigacoes={obrigacoesWithCorrectTypes}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lista">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Obrigações Fiscais</CardTitle>
            </CardHeader>
            <CardContent>
              <ObrigacoesList obrigacoes={obrigacoesWithCorrectTypes} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default ObrigacoesFiscais;
