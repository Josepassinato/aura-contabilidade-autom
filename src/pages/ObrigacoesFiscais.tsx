
import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, CheckCircle, AlertTriangle, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ClientSelector } from "@/components/layout/ClientSelector";
import { ObrigacoesCalendario } from "@/components/obrigacoes/ObrigacoesCalendario";
import { ObrigacoesList } from "@/components/obrigacoes/ObrigacoesList";

const ObrigacoesFiscais = () => {
  const [activeTab, setActiveTab] = useState("calendario");
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [ano, setAno] = useState(new Date().getFullYear());
  
  // Fixed the status values to match the expected "pendente", "atrasado", or "concluido" types
  const obrigacoesMock = [
    {
      id: 1,
      nome: "DARF IRPJ",
      tipo: "Federal",
      prazo: "30/05/2025",
      empresa: "Empresa ABC Ltda",
      status: "pendente", // Corrected to use valid literal value
      prioridade: "alta"
    },
    {
      id: 2,
      nome: "GFIP",
      tipo: "Federal",
      prazo: "20/05/2025",
      empresa: "XYZ Comércio S.A.",
      status: "concluido", // Corrected to use valid literal value
      prioridade: "media"
    },
    {
      id: 3,
      nome: "GPS",
      tipo: "Federal",
      prazo: "15/05/2025",
      empresa: "Tech Solutions",
      status: "concluido", // Corrected to use valid literal value
      prioridade: "alta"
    },
    {
      id: 4,
      nome: "EFD ICMS/IPI",
      tipo: "Estadual",
      prazo: "10/05/2025",
      empresa: "Empresa ABC Ltda",
      status: "atrasado", // Corrected to use valid literal value
      prioridade: "alta"
    },
    {
      id: 5,
      nome: "DeSTDA",
      tipo: "Estadual",
      prazo: "28/05/2025",
      empresa: "XYZ Comércio S.A.",
      status: "pendente", // Corrected to use valid literal value
      prioridade: "media"
    },
    {
      id: 6,
      nome: "DCTF",
      tipo: "Federal",
      prazo: "22/05/2025",
      empresa: "Tech Solutions",
      status: "atrasado", // Corrected to use valid literal value
      prioridade: "media"
    },
    {
      id: 7,
      nome: "ISS",
      tipo: "Municipal",
      prazo: "10/05/2025",
      empresa: "Empresa ABC Ltda",
      status: "pendente", // Corrected to use valid literal value
      prioridade: "baixa"
    }
  ];

  // Also fix the prioridade property to match expected type
  const obrigacoesWithCorrectTypes = obrigacoesMock.map(obrigacao => ({
    ...obrigacao,
    prioridade: obrigacao.prioridade as "baixa" | "media" | "alta"
  }));

  const processarObrigacoes = () => {
    toast({
      title: "Processamento iniciado",
      description: "As obrigações fiscais estão sendo processadas automaticamente."
    });
    
    // Simulação de processamento concluído após 2 segundos
    setTimeout(() => {
      toast({
        title: "Processamento concluído",
        description: "Todas as obrigações foram processadas e atualizadas."
      });
    }, 2000);
  };

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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Clock className="h-8 w-8 mb-2 text-yellow-500 mx-auto" />
              <h3 className="text-3xl font-bold">7</h3>
              <p className="text-sm text-muted-foreground">
                Pendentes
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="h-8 w-8 mb-2 text-red-500 mx-auto" />
              <h3 className="text-3xl font-bold">2</h3>
              <p className="text-sm text-muted-foreground">
                Atrasadas
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="h-8 w-8 mb-2 text-green-500 mx-auto" />
              <h3 className="text-3xl font-bold">14</h3>
              <p className="text-sm text-muted-foreground">
                Concluídas
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Calendar className="h-8 w-8 mb-2 text-blue-500 mx-auto" />
              <h3 className="text-3xl font-bold">3</h3>
              <p className="text-sm text-muted-foreground">
                Próximos 7 dias
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between mb-6">
        <div className="flex space-x-2">
          <select 
            className="border rounded p-2"
            value={mes}
            onChange={(e) => setMes(Number(e.target.value))}
          >
            <option value="1">Janeiro</option>
            <option value="2">Fevereiro</option>
            <option value="3">Março</option>
            <option value="4">Abril</option>
            <option value="5">Maio</option>
            <option value="6">Junho</option>
            <option value="7">Julho</option>
            <option value="8">Agosto</option>
            <option value="9">Setembro</option>
            <option value="10">Outubro</option>
            <option value="11">Novembro</option>
            <option value="12">Dezembro</option>
          </select>
          
          <select
            className="border rounded p-2"
            value={ano}
            onChange={(e) => setAno(Number(e.target.value))}
          >
            <option value="2024">2024</option>
            <option value="2025">2025</option>
          </select>
        </div>
        
        <Button onClick={processarObrigacoes}>
          Processar Obrigações
        </Button>
      </div>

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
                obrigacoes={obrigacoesWithCorrectTypes} // Use the correctly typed array
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
              <ObrigacoesList obrigacoes={obrigacoesWithCorrectTypes} /> // Use the correctly typed array
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default ObrigacoesFiscais;
