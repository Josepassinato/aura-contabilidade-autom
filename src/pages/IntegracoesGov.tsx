
import React, { useState, useEffect } from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ClientSelector } from "@/components/layout/ClientSelector";
import { IntegracaoGovForm } from "@/components/integracoes/IntegracaoGovForm";
import { SimplesNacionalForm } from "@/components/integracoes/SimplesNacionalForm";
import { IntegracaoEstadualForm } from "@/components/integracoes/IntegracaoEstadualForm";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, AlertCircle, CheckCircle, GanttChart, MapPin } from "lucide-react";
import { IntegracaoStatus, IntegracaoEstadualStatus } from "@/components/integracoes/IntegracaoStatus";
import { saveIntegracaoEstadual, saveIntegracaoSimplesNacional, fetchIntegracoesEstaduais } from "@/services/supabase/integracoesService";
import { fetchClientById } from "@/services/supabase/clientsService";
import { getDefaultIntegracoes, ESTADOS } from "@/components/integracoes/constants";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { UF } from "@/services/governamental/estadualIntegration";

interface IntegracaoStatus {
  id: string;
  nome: string;
  status: 'conectado' | 'desconectado' | 'erro' | 'pendente';
  ultimoAcesso?: string;
  proximaRenovacao?: string;
  mensagem?: string;
}

const IntegracoesGov = () => {
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedClientName, setSelectedClientName] = useState<string>('');
  const [selectedClientCnpj, setSelectedClientCnpj] = useState<string>('');
  const [activeTab, setActiveTab] = useState("ecac");
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [selectedState, setSelectedState] = useState<UF | null>(null);
  
  // Estado para as integrações
  const [integracoes, setIntegracoes] = useState<IntegracaoStatus[]>([
    {
      id: "ecac",
      nome: "e-CAC (Receita Federal)",
      status: 'desconectado',
    },
    {
      id: "sefaz_sp",
      nome: "SEFAZ-SP",
      status: 'desconectado',
    },
    {
      id: "sefaz_rj",
      nome: "SEFAZ-RJ",
      status: 'desconectado',
    },
    {
      id: "simples_nacional",
      nome: "Portal Simples Nacional",
      status: 'desconectado',
    },
  ]);
  
  const handleClientSelect = async (client: { id: string, name: string, cnpj?: string }) => {
    setSelectedClientId(client.id);
    setSelectedClientName(client.name);
    setSelectedClientCnpj(client.cnpj || '');
    
    if (!client.id) {
      // Resetar integrações para o estado inicial
      setIntegracoes([
        {
          id: "ecac",
          nome: "e-CAC (Receita Federal)",
          status: 'desconectado',
        },
        {
          id: "sefaz_sp",
          nome: "SEFAZ-SP",
          status: 'desconectado',
        },
        {
          id: "sefaz_rj",
          nome: "SEFAZ-RJ",
          status: 'desconectado',
        },
        {
          id: "simples_nacional",
          nome: "Portal Simples Nacional",
          status: 'desconectado',
        },
      ]);
      return;
    }
    
    // Se não tiver CNPJ, tenta buscar do Supabase
    if (!client.cnpj) {
      const clientData = await fetchClientById(client.id);
      if (clientData?.cnpj) {
        setSelectedClientCnpj(clientData.cnpj);
      }
    }
    
    // Buscar integrações estaduais do cliente
    try {
      const integracoesEstadual = await fetchIntegracoesEstaduais(client.id);
      
      // Atualizar status das integrações com SEFAZ
      const updatedIntegracoes = [...integracoes];
      
      // Atualizar SEFAZ-SP
      const spIntegracao = integracoesEstadual.find(i => i.uf === "SP");
      if (spIntegracao) {
        const index = updatedIntegracoes.findIndex(i => i.id === "sefaz_sp");
        if (index >= 0) {
          updatedIntegracoes[index] = {
            ...updatedIntegracoes[index],
            status: spIntegracao.status,
            ultimoAcesso: spIntegracao.ultimoAcesso,
            proximaRenovacao: spIntegracao.proximaRenovacao,
            mensagem: spIntegracao.mensagemErro // Fixed: using mensagemErro instead of mensagem
          };
        }
      }
      
      // Atualizar SEFAZ-RJ
      const rjIntegracao = integracoesEstadual.find(i => i.uf === "RJ");
      if (rjIntegracao) {
        const index = updatedIntegracoes.findIndex(i => i.id === "sefaz_rj");
        if (index >= 0) {
          updatedIntegracoes[index] = {
            ...updatedIntegracoes[index],
            status: rjIntegracao.status,
            ultimoAcesso: rjIntegracao.ultimoAcesso,
            proximaRenovacao: rjIntegracao.proximaRenovacao,
            mensagem: rjIntegracao.mensagemErro // Fixed: using mensagemErro instead of mensagem
          };
        }
      }
      
      setIntegracoes(updatedIntegracoes);
      
    } catch (error) {
      console.error("Erro ao buscar integrações:", error);
    }
  };
  
  const handleSaveIntegracao = async (data: any) => {
    // Atualizar o status da integração baseado na aba ativa
    let saved = false;
    
    try {
      switch (activeTab) {
        case "ecac":
          // TODO: Implementar integração com e-CAC no Supabase
          saved = true;
          break;
          
        case "sefaz":
          if (selectedState) {
            saved = await saveIntegracaoEstadual(selectedClientId, selectedState, data);
          }
          break;
          
        case "simples_nacional":
          saved = await saveIntegracaoSimplesNacional(selectedClientId, selectedClientCnpj, data);
          break;
      }
      
      if (!saved) {
        throw new Error("Falha ao salvar configuração");
      }
      
      // Atualizar o estado local
      setIntegracoes(prev => prev.map(integracao => 
        integracao.id === activeTab || (activeTab === "sefaz" && integracao.id === `sefaz_${selectedState?.toLowerCase()}`) ? {
          ...integracao,
          status: 'conectado',
          ultimoAcesso: new Date().toLocaleString('pt-BR'),
          proximaRenovacao: new Date(Date.now() + 30*24*60*60*1000).toLocaleString('pt-BR'),
        } : integracao
      ));
    } catch (error) {
      console.error("Erro ao salvar integração:", error);
    }
  };
  
  const handleStateSelect = (uf: UF) => {
    setSelectedState(uf);
    setActiveTab("sefaz");
    setShowStateDropdown(false);
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
            <h1 className="text-2xl font-bold tracking-tight">Integrações Governamentais</h1>
            <p className="text-muted-foreground">
              Configure o acesso aos portais governamentais
            </p>
          </div>
          <ClientSelector onClientSelect={handleClientSelect} />
        </div>
        
        {!selectedClientId ? (
          <div className="p-8 text-center border rounded-lg">
            <Building2 className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">Selecione um cliente</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Escolha um cliente para configurar suas integrações
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
                  Visualize o status atual das integrações configuradas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="flex items-center gap-2 mb-2">
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger value="ecac">e-CAC</TabsTrigger>
                  <TabsTrigger value="sefaz">
                    SEFAZ {selectedState ? `- ${selectedState}` : ""}
                  </TabsTrigger>
                  <TabsTrigger value="simples_nacional">Simples Nacional</TabsTrigger>
                </TabsList>
                
                <DropdownMenu open={showStateDropdown} onOpenChange={setShowStateDropdown}>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline" className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      Selecionar Estado
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 max-h-[280px] overflow-y-auto">
                    {ESTADOS.map((estado) => (
                      <DropdownMenuItem key={estado.uf} onClick={() => handleStateSelect(estado.uf)}>
                        {estado.uf} - {estado.nome}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div className="mt-6">
                <TabsContent value="ecac">
                  <IntegracaoGovForm 
                    clientId={selectedClientId}
                    clientName={selectedClientName}
                    onSave={handleSaveIntegracao}
                  />
                </TabsContent>
                
                <TabsContent value="sefaz">
                  {selectedState ? (
                    <IntegracaoEstadualForm 
                      clientId={selectedClientId}
                      clientName={selectedClientName}
                      uf={selectedState}
                      onSave={handleSaveIntegracao}
                    />
                  ) : (
                    <div className="p-8 text-center border rounded-lg">
                      <MapPin className="mx-auto h-12 w-12 text-muted-foreground/50" />
                      <h3 className="mt-4 text-lg font-medium">Selecione um estado</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Escolha um estado no botão acima para configurar a integração com sua SEFAZ
                      </p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="simples_nacional">
                  <SimplesNacionalForm
                    clientId={selectedClientId}
                    clientName={selectedClientName}
                    cnpj={selectedClientCnpj}
                    onSave={handleSaveIntegracao}
                  />
                </TabsContent>
              </div>
            </Tabs>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default IntegracoesGov;
