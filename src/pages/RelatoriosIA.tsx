
import React, { useState } from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ClientSelector } from "@/components/layout/ClientSelector";
import { GeracaoRelatorioPorVoz } from "@/components/relatorios/GeracaoRelatorioPorVoz";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Clock, Check, Building2, BarChart4 } from "lucide-react";

interface RelatorioHistorico {
  id: string;
  nome: string;
  tipo: string;
  dataGeracao: string;
  solicitadoPor: string;
  status: 'disponível' | 'expirado' | 'processando';
}

const RelatoriosIA = () => {
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedClientName, setSelectedClientName] = useState<string>('');
  const [activeTab, setActiveTab] = useState("solicitar");
  const [historico, setHistorico] = useState<RelatorioHistorico[]>([]);
  
  const handleClientSelect = (client: { id: string, name: string }) => {
    setSelectedClientId(client.id);
    setSelectedClientName(client.name);
    
    // Simular histórico de relatórios
    if (client.id === "1") {
      setHistorico([
        {
          id: "1",
          nome: "Relatório de Faturamento - Abril/2025",
          tipo: "Faturamento",
          dataGeracao: "10/05/2025 15:30",
          solicitadoPor: "Maria Silva (via voz)",
          status: 'disponível'
        },
        {
          id: "2",
          nome: "DRE - 1º Trimestre 2025",
          tipo: "Demonstrativo",
          dataGeracao: "05/05/2025 10:15",
          solicitadoPor: "João Santos (via chat)",
          status: 'disponível'
        },
        {
          id: "3",
          nome: "Balanço Patrimonial - Março/2025",
          tipo: "Contábil",
          dataGeracao: "28/04/2025 14:22",
          solicitadoPor: "Sistema (automático)",
          status: 'disponível'
        },
        {
          id: "4",
          nome: "Relatório de Impostos - Março/2025",
          tipo: "Fiscal",
          dataGeracao: "26/04/2025 09:15",
          solicitadoPor: "Maria Silva (via voz)",
          status: 'expirado'
        }
      ]);
    } else {
      setHistorico([]);
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'disponível':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Disponível</Badge>;
      case 'expirado':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Expirado</Badge>;
      case 'processando':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Processando</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Relatórios por IA</h1>
            <p className="text-muted-foreground">
              Solicite e gerencie relatórios usando comandos de voz ou texto
            </p>
          </div>
          <ClientSelector onClientSelect={handleClientSelect} />
        </div>
        
        {!selectedClientId ? (
          <div className="p-8 text-center border rounded-lg">
            <Building2 className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">Selecione um cliente</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Escolha um cliente para gerenciar seus relatórios
            </p>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="solicitar">Solicitar Relatório</TabsTrigger>
              <TabsTrigger value="historico">Histórico</TabsTrigger>
            </TabsList>
            
            <div className="mt-6">
              <TabsContent value="solicitar">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <GeracaoRelatorioPorVoz 
                    clientId={selectedClientId}
                    clientName={selectedClientName}
                  />
                  
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <BarChart4 className="h-5 w-5 text-primary" />
                        <CardTitle>Sugestões de Relatórios</CardTitle>
                      </div>
                      <CardDescription>
                        Relatórios recomendados com base no perfil do cliente
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="border rounded-lg p-4 hover:bg-secondary/10 cursor-pointer transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="bg-primary/10 p-2 rounded-full">
                            <FileText className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium">Relatório de Faturamento</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              Comparativo dos últimos 3 meses com gráficos e análises de tendência
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border rounded-lg p-4 hover:bg-secondary/10 cursor-pointer transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="bg-primary/10 p-2 rounded-full">
                            <Clock className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium">Obrigações Fiscais Pendentes</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              Relatório das próximas obrigações com prazos e valores estimados
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border rounded-lg p-4 hover:bg-secondary/10 cursor-pointer transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="bg-primary/10 p-2 rounded-full">
                            <Check className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium">Situação Fiscal</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              Status de regularidade com análise de pendências e recomendações
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="historico">
                <Card>
                  <CardHeader>
                    <CardTitle>Histórico de Relatórios</CardTitle>
                    <CardDescription>
                      Relatórios solicitados anteriormente
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {historico.length > 0 ? (
                      <div className="divide-y">
                        {historico.map((relatorio) => (
                          <div key={relatorio.id} className="py-4 first:pt-0 last:pb-0">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium">{relatorio.nome}</h3>
                                <div className="text-sm text-muted-foreground mt-1">
                                  <span className="inline-block mr-4">
                                    Tipo: {relatorio.tipo}
                                  </span>
                                  <span className="inline-block mr-4">
                                    Gerado em: {relatorio.dataGeracao}
                                  </span>
                                  <p>
                                    Solicitado por: {relatorio.solicitadoPor}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {getStatusBadge(relatorio.status)}
                                {relatorio.status === 'disponível' && (
                                  <Button variant="outline" size="sm">
                                    <FileText className="h-4 w-4 mr-1" />
                                    Download
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center py-8 text-muted-foreground">
                        Nenhum relatório encontrado no histórico
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
};

export default RelatoriosIA;
