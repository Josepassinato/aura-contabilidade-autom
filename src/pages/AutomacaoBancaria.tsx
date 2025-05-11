
import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClientSelector } from "@/components/layout/ClientSelector";
import { useAuth } from '@/contexts/auth';
import { Navigate } from 'react-router-dom';
import { toast } from "@/hooks/use-toast";
import {
  realizarPagamentoPIX,
  pagarTributo,
  agendarPagamento,
  consultarSaldoBancario,
  obterConfiguracaoBancaria,
  Transacao,
  PagamentoTributo
} from "@/services/bancario/automacaoBancaria";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AutomacaoBancaria = () => {
  const { isAuthenticated, isAccountant } = useAuth();
  const [activeTab, setActiveTab] = useState("pagamentos");
  const [isLoading, setIsLoading] = useState(false);
  const [bancoSelecionado, setBancoSelecionado] = useState(
    localStorage.getItem("banco-selecionado") || ""
  );
  const [saldo, setSaldo] = useState<number | null>(null);
  
  // Dados do formulário de pagamento
  const [formPagamento, setFormPagamento] = useState({
    valor: "",
    favorecido: "",
    documento: "",
    descricao: "",
    chavePix: "",
    dataAgendamento: ""
  });
  
  // Dados do formulário de pagamento de tributos
  const [formTributo, setFormTributo] = useState({
    tipoTributo: "DARF",
    valor: "",
    codigoBarras: "",
    dataVencimento: "",
    contribuinte: "",
    documento: ""
  });

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Only accountants should access this page
  if (!isAccountant) {
    return <Navigate to="/" replace />;
  }
  
  const verificarConfiguracao = () => {
    const config = obterConfiguracaoBancaria(bancoSelecionado);
    if (!config) {
      toast({
        title: "Configuração bancária ausente",
        description: "Configure as credenciais bancárias nas configurações antes de utilizar esta funcionalidade.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };
  
  const handleConsultarSaldo = async () => {
    if (!verificarConfiguracao()) return;
    
    try {
      setIsLoading(true);
      const valorSaldo = await consultarSaldoBancario(bancoSelecionado);
      setSaldo(valorSaldo);
      toast({
        title: "Saldo consultado",
        description: `Saldo atual: R$ ${valorSaldo.toFixed(2)}`,
      });
    } catch (error) {
      console.error("Erro ao consultar saldo:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePagamentoPIX = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificarConfiguracao()) return;
    
    try {
      if (!formPagamento.valor || !formPagamento.favorecido || !formPagamento.documento || !formPagamento.chavePix) {
        toast({
          title: "Dados incompletos",
          description: "Preencha todos os campos obrigatórios",
          variant: "destructive",
        });
        return;
      }
      
      setIsLoading(true);
      
      const dadosPagamento = {
        valor: parseFloat(formPagamento.valor),
        descricao: formPagamento.descricao || "Pagamento via PIX",
        favorecido: {
          nome: formPagamento.favorecido,
          documento: formPagamento.documento,
          chavePIX: formPagamento.chavePix
        },
        dataAgendamento: formPagamento.dataAgendamento || undefined
      };
      
      let transacao: Transacao;
      
      if (formPagamento.dataAgendamento) {
        transacao = await agendarPagamento(
          { ...dadosPagamento, tipoTransacao: 'PIX' },
          formPagamento.dataAgendamento
        );
      } else {
        transacao = await realizarPagamentoPIX(dadosPagamento);
      }
      
      console.log("Transação realizada:", transacao);
      
      // Limpar formulário
      setFormPagamento({
        valor: "",
        favorecido: "",
        documento: "",
        descricao: "",
        chavePix: "",
        dataAgendamento: ""
      });
      
    } catch (error) {
      console.error("Erro ao realizar pagamento:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePagamentoTributo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificarConfiguracao()) return;
    
    try {
      if (!formTributo.valor || !formTributo.codigoBarras || !formTributo.dataVencimento) {
        toast({
          title: "Dados incompletos",
          description: "Preencha todos os campos obrigatórios",
          variant: "destructive",
        });
        return;
      }
      
      setIsLoading(true);
      
      const dadosPagamento: Omit<PagamentoTributo, 'id' | 'status' | 'dataPagamento' | 'comprovante'> = {
        tipoTributo: formTributo.tipoTributo as any,
        valorPrincipal: parseFloat(formTributo.valor),
        valorTotal: parseFloat(formTributo.valor),
        codigoBarras: formTributo.codigoBarras,
        dataVencimento: formTributo.dataVencimento,
        contribuinte: {
          nome: formTributo.contribuinte,
          documento: formTributo.documento
        }
      };
      
      const pagamento = await pagarTributo(dadosPagamento);
      console.log("Pagamento de tributo realizado:", pagamento);
      
      // Limpar formulário
      setFormTributo({
        tipoTributo: "DARF",
        valor: "",
        codigoBarras: "",
        dataVencimento: "",
        contribuinte: "",
        documento: ""
      });
      
    } catch (error) {
      console.error("Erro ao pagar tributo:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Automação Bancária</h1>
          <p className="text-muted-foreground">
            Realize pagamentos e consultas bancárias automáticas via Open Banking
          </p>
        </div>
        <ClientSelector />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="col-span-3">
          <CardHeader className="pb-2">
            <CardTitle>Banco Conectado</CardTitle>
            <CardDescription>
              {bancoSelecionado ? bancoSelecionado : "Nenhum banco configurado"}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <div className="flex justify-between items-center w-full">
              <div>
                {saldo !== null && (
                  <div className="text-lg font-medium">
                    Saldo: <span className="text-green-600">R$ {saldo.toFixed(2)}</span>
                  </div>
                )}
              </div>
              <Button 
                variant="outline" 
                onClick={handleConsultarSaldo}
                disabled={!bancoSelecionado || isLoading}
              >
                {isLoading ? "Consultando..." : "Consultar Saldo"}
              </Button>
            </div>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Configuração</CardTitle>
          </CardHeader>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                setActiveTab("bancos");
                window.location.href = "/settings";
              }}
            >
              Configurar Bancos
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="pagamentos">Pagamentos</TabsTrigger>
          <TabsTrigger value="tributos">Pagamento de Tributos</TabsTrigger>
          <TabsTrigger value="folha">Folha de Pagamento</TabsTrigger>
          <TabsTrigger value="extratos">Extratos e Saldos</TabsTrigger>
        </TabsList>

        <TabsContent value="pagamentos">
          <Card>
            <CardHeader>
              <CardTitle>Pagamento via PIX</CardTitle>
              <CardDescription>
                Realize pagamentos automáticos para fornecedores, colaboradores ou clientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePagamentoPIX} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="valor">Valor (R$)</Label>
                    <Input
                      id="valor"
                      placeholder="0,00"
                      value={formPagamento.valor}
                      onChange={(e) => setFormPagamento({...formPagamento, valor: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="chavePix">Chave PIX</Label>
                    <Input
                      id="chavePix"
                      placeholder="CPF, CNPJ, E-mail ou Chave Aleatória"
                      value={formPagamento.chavePix}
                      onChange={(e) => setFormPagamento({...formPagamento, chavePix: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="favorecido">Nome do Favorecido</Label>
                    <Input
                      id="favorecido"
                      placeholder="Nome completo ou razão social"
                      value={formPagamento.favorecido}
                      onChange={(e) => setFormPagamento({...formPagamento, favorecido: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="documento">CPF/CNPJ</Label>
                    <Input
                      id="documento"
                      placeholder="000.000.000-00 ou 00.000.000/0000-00"
                      value={formPagamento.documento}
                      onChange={(e) => setFormPagamento({...formPagamento, documento: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="descricao">Descrição</Label>
                    <Input
                      id="descricao"
                      placeholder="Descrição do pagamento"
                      value={formPagamento.descricao}
                      onChange={(e) => setFormPagamento({...formPagamento, descricao: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dataAgendamento">Data de Agendamento (opcional)</Label>
                    <Input
                      id="dataAgendamento"
                      type="date"
                      value={formPagamento.dataAgendamento}
                      onChange={(e) => setFormPagamento({...formPagamento, dataAgendamento: e.target.value})}
                    />
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  type="submit"
                  disabled={isLoading || !bancoSelecionado}
                >
                  {isLoading ? "Processando..." : formPagamento.dataAgendamento ? "Agendar Pagamento" : "Pagar Agora"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tributos">
          <Card>
            <CardHeader>
              <CardTitle>Pagamento de Tributos</CardTitle>
              <CardDescription>
                Pague guias de tributos federais, estaduais e municipais automaticamente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePagamentoTributo} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tipoTributo">Tipo de Tributo</Label>
                    <Select
                      value={formTributo.tipoTributo}
                      onValueChange={(value) => setFormTributo({...formTributo, tipoTributo: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DARF">DARF</SelectItem>
                        <SelectItem value="GPS">GPS</SelectItem>
                        <SelectItem value="DAS">DAS</SelectItem>
                        <SelectItem value="FGTS">FGTS</SelectItem>
                        <SelectItem value="IPTU">IPTU</SelectItem>
                        <SelectItem value="IPVA">IPVA</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="valorTributo">Valor Total (R$)</Label>
                    <Input
                      id="valorTributo"
                      placeholder="0,00"
                      value={formTributo.valor}
                      onChange={(e) => setFormTributo({...formTributo, valor: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="codigoBarras">Código de Barras</Label>
                  <Input
                    id="codigoBarras"
                    placeholder="Código de barras da guia de pagamento"
                    value={formTributo.codigoBarras}
                    onChange={(e) => setFormTributo({...formTributo, codigoBarras: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dataVencimento">Data de Vencimento</Label>
                    <Input
                      id="dataVencimento"
                      type="date"
                      value={formTributo.dataVencimento}
                      onChange={(e) => setFormTributo({...formTributo, dataVencimento: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="contribuinte">Nome do Contribuinte</Label>
                    <Input
                      id="contribuinte"
                      placeholder="Nome completo ou razão social"
                      value={formTributo.contribuinte}
                      onChange={(e) => setFormTributo({...formTributo, contribuinte: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="documentoContribuinte">CPF/CNPJ do Contribuinte</Label>
                  <Input
                    id="documentoContribuinte"
                    placeholder="000.000.000-00 ou 00.000.000/0000-00"
                    value={formTributo.documento}
                    onChange={(e) => setFormTributo({...formTributo, documento: e.target.value})}
                  />
                </div>

                <Button 
                  className="w-full" 
                  type="submit"
                  disabled={isLoading || !bancoSelecionado}
                >
                  {isLoading ? "Processando..." : "Pagar Tributo"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="folha">
          <Card>
            <CardHeader>
              <CardTitle>Automação de Folha de Pagamento</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Funcionalidade de automação de folha de pagamento em desenvolvimento.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="extratos">
          <Card>
            <CardHeader>
              <CardTitle>Extratos e Saldos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Funcionalidade de consulta de extratos em desenvolvimento.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default AutomacaoBancaria;
