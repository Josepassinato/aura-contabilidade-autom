
import React, { useState } from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ClientSelector } from "@/components/layout/ClientSelector";
import { IntegracaoEstadualForm } from "@/components/integracoes/IntegracaoEstadualForm";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Building2, AlertCircle, CheckCircle, GanttChart } from "lucide-react";
import { UF } from "@/services/governamental/estadualIntegration";

interface IntegracaoEstadualStatus {
  id: string;
  nome: string;
  uf: UF;
  status: 'conectado' | 'desconectado' | 'erro' | 'pendente';
  ultimoAcesso?: string;
  proximaRenovacao?: string;
  mensagem?: string;
}

const estados: Array<{uf: UF, nome: string}> = [
  { uf: 'SP', nome: 'São Paulo' },
  { uf: 'RJ', nome: 'Rio de Janeiro' },
  { uf: 'MG', nome: 'Minas Gerais' },
  { uf: 'RS', nome: 'Rio Grande do Sul' },
  { uf: 'PR', nome: 'Paraná' }
];

const IntegracoesEstaduais = () => {
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedClientName, setSelectedClientName] = useState<string>('');
  const [activeTab, setActiveTab] = useState<UF>("SP");
  
  // Estado para simular os status de integração
  const [integracoes, setIntegracoes] = useState<IntegracaoEstadualStatus[]>([
    {
      id: "sefaz_sp",
      nome: "SEFAZ-SP",
      uf: "SP",
      status: 'desconectado',
    },
    {
      id: "sefaz_rj",
      nome: "SEFAZ-RJ",
      uf: "RJ",
      status: 'desconectado',
    },
    {
      id: "sefaz_mg",
      nome: "SEFAZ-MG",
      uf: "MG",
      status: 'desconectado',
    },
    {
      id: "sefaz_rs",
      nome: "SEFAZ-RS",
      uf: "RS",
      status: 'desconectado',
    },
    {
      id: "sefaz_pr",
      nome: "SEFAZ-PR",
      uf: "PR",
      status: 'desconectado',
    },
  ]);
  
  const handleClientSelect = (client: { id: string, name: string }) => {
    setSelectedClientId(client.id);
    setSelectedClientName(client.name);
    
    // Simular dados de integrações para esse cliente
    if (client.id === "1") {
      setIntegracoes([
        {
          id: "sefaz_sp",
          nome: "SEFAZ-SP",
          uf: "SP",
          status: 'conectado',
          ultimoAcesso: "10/05/2025 15:30",
          proximaRenovacao: "10/06/2025",
        },
        {
          id: "sefaz_rj",
          nome: "SEFAZ-RJ",
          uf: "RJ",
          status: 'erro',
          ultimoAcesso: "05/05/2025 10:15",
          mensagem: "Certificado expirado"
        },
        {
          id: "sefaz_mg",
          nome: "SEFAZ-MG",
          uf: "MG",
          status: 'desconectado',
        },
        {
          id: "sefaz_rs",
          nome: "SEFAZ-RS",
          uf: "RS",
          status: 'conectado',
          ultimoAcesso: "09/05/2025 08:45",
          proximaRenovacao: "09/06/2025",
        },
        {
          id: "sefaz_pr",
          nome: "SEFAZ-PR",
          uf: "PR",
          status: 'desconectado',
        },
      ]);
    } else {
      setIntegracoes([
        {
          id: "sefaz_sp",
          nome: "SEFAZ-SP",
          uf: "SP",
          status: 'desconectado',
        },
        {
          id: "sefaz_rj",
          nome: "SEFAZ-RJ",
          uf: "RJ",
          status: 'desconectado',
        },
        {
          id: "sefaz_mg",
          nome: "SEFAZ-MG",
          uf: "MG",
          status: 'desconectado',
        },
        {
          id: "sefaz_rs",
          nome: "SEFAZ-RS",
          uf: "RS",
          status: 'desconectado',
        },
        {
          id: "sefaz_pr",
          nome: "SEFAZ-PR",
          uf: "PR",
          status: 'desconectado',
        },
      ]);
    }
  };
  
  const handleSaveIntegracao = (data: any) => {
    // Atualizar o status da integração
    setIntegracoes(prev => prev.map(integracao => 
      integracao.uf === activeTab ? {
        ...integracao,
        status: 'conectado',
        ultimoAcesso: new Date().toLocaleString('pt-BR'),
        proximaRenovacao: new Date(Date.now() + 30*24*60*60*1000).toLocaleString('pt-BR'),
      } : integracao
    ));
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'conectado':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Conectado</Badge>;
      case 'desconectado':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Desconectado</Badge>;
      case 'erro':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Erro</Badge>;
      case 'pendente':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pendente</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Integrações Estaduais</h1>
            <p className="text-muted-foreground">
              Configure o acesso aos portais das secretarias estaduais da fazenda
            </p>
          </div>
          <ClientSelector onClientSelect={handleClientSelect} />
        </div>
        
        {!selectedClientId ? (
          <div className="p-8 text-center border rounded-lg">
            <Building2 className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">Selecione um cliente</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Escolha um cliente para configurar suas integrações estaduais
            </p>
          </div>
        ) : (
          <>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <GanttChart className="h-5 w-5 text-primary" />
                  <CardTitle>Status das Integrações</CardTitle>
                </div>
                <CardDescription>
                  Visualize o status atual das integrações com as SEFAZs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {integracoes.map((integracao) => (
                    <div key={integracao.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">{integracao.nome}</h3>
                        {getStatusBadge(integracao.status)}
                      </div>
                      
                      <div className="mt-2 space-y-1 text-sm">
                        {integracao.ultimoAcesso && (
                          <p className="text-muted-foreground">
                            Último acesso: {integracao.ultimoAcesso}
                          </p>
                        )}
                        {integracao.proximaRenovacao && (
                          <p className="text-muted-foreground">
                            Próxima renovação: {integracao.proximaRenovacao}
                          </p>
                        )}
                      </div>
                      
                      {integracao.status === 'erro' && integracao.mensagem && (
                        <Alert variant="destructive" className="mt-2 py-2">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Erro de conexão</AlertTitle>
                          <AlertDescription>{integracao.mensagem}</AlertDescription>
                        </Alert>
                      )}
                      
                      {integracao.status === 'conectado' && (
                        <Alert className="mt-2 py-2 bg-green-50">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <AlertTitle className="text-green-800">Conectado</AlertTitle>
                          <AlertDescription className="text-green-700">
                            Integração funcionando corretamente
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as UF)}>
              <TabsList className="grid w-full grid-cols-5">
                {estados.map((estado) => (
                  <TabsTrigger key={estado.uf} value={estado.uf}>{estado.nome}</TabsTrigger>
                ))}
              </TabsList>
              
              <div className="mt-6">
                {estados.map((estado) => (
                  <TabsContent key={estado.uf} value={estado.uf}>
                    <IntegracaoEstadualForm 
                      clientId={selectedClientId}
                      clientName={selectedClientName}
                      uf={estado.uf}
                      onSave={handleSaveIntegracao}
                    />
                  </TabsContent>
                ))}
              </div>
            </Tabs>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default IntegracoesEstaduais;
