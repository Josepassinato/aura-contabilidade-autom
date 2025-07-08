import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Calculator, Building, Users, Receipt } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function DadosTeste() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Forms states
  const [clienteForm, setClienteForm] = useState({
    name: '', cnpj: '', email: '', regime: 'SIMPLES_NACIONAL'
  });

  const [obrigacaoForm, setObrigacaoForm] = useState({
    nome: '', tipo: 'DAS', prazo: '', empresa: '', status: 'pendente', prioridade: 'media'
  });

  const [funcionarioForm, setFuncionarioForm] = useState({
    name: '', cpf: '', position: '', base_salary: '', department: ''
  });

  const [documentoForm, setDocumentoForm] = useState({
    name: '', title: '', type: 'NFE', size: ''
  });

  const [dadosContabeisForm, setDadosContabeisForm] = useState({
    period: '', revenue: '', expenses: '', net_income: ''
  });

  // Create functions
  const criarCliente = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('accounting_clients')
        .insert(clienteForm);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Cliente criado com sucesso!"
      });

      setClienteForm({ name: '', cnpj: '', email: '', regime: 'SIMPLES_NACIONAL' });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const criarObrigacao = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('obrigacoes_fiscais')
        .insert({
          ...obrigacaoForm,
          client_id: '11111111-1111-1111-1111-111111111111' // Cliente teste
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Obrigação fiscal criada!"
      });

      setObrigacaoForm({
        nome: '', tipo: 'DAS', prazo: '', empresa: '', status: 'pendente', prioridade: 'media'
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const criarFuncionario = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('employees')
        .insert({
          ...funcionarioForm,
          client_id: '11111111-1111-1111-1111-111111111111',
          hire_date: new Date().toISOString().split('T')[0],
          status: 'active',
          base_salary: parseFloat(funcionarioForm.base_salary)
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Funcionário criado!"
      });

      setFuncionarioForm({
        name: '', cpf: '', position: '', base_salary: '', department: ''
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const criarDocumento = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('client_documents')
        .insert({
          ...documentoForm,
          client_id: '11111111-1111-1111-1111-111111111111',
          status: 'pendente',
          size: parseInt(documentoForm.size)
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Documento criado!"
      });

      setDocumentoForm({ name: '', title: '', type: 'NFE', size: '' });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const criarDadosContabeis = async () => {
    setIsLoading(true);
    try {
      const revenue = parseFloat(dadosContabeisForm.revenue);
      const expenses = parseFloat(dadosContabeisForm.expenses);
      const net_income = revenue - expenses;
      
      const { error } = await supabase
        .from('processed_accounting_data')
        .insert({
          client_id: '11111111-1111-1111-1111-111111111111',
          period: dadosContabeisForm.period,
          revenue,
          expenses,
          net_income,
          taxable_income: net_income,
          calculated_taxes: {
            das: net_income * 0.045,
            inss: net_income * 0.02,
            irpj: net_income * 0.015
          }
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Dados contábeis processados!"
      });

      setDadosContabeisForm({
        period: '', revenue: '', expenses: '', net_income: ''
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dados de Teste</h1>
          <p className="text-muted-foreground">
            Insira dados manualmente para testar o sistema sem APIs
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cliente Teste</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Empresa Teste LTDA</div>
              <p className="text-xs text-muted-foreground">CNPJ: 12.345.678/0001-90</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dados Disponíveis</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">15+</div>
              <p className="text-xs text-muted-foreground">Registros de exemplo</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              <Badge variant="default">Pronto para testes</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">100%</div>
              <p className="text-xs text-muted-foreground">Dados carregados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Modo</CardTitle>
              <Calculator className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Manual</div>
              <p className="text-xs text-muted-foreground">Sem dependência de APIs</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="clientes" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="clientes">Clientes</TabsTrigger>
            <TabsTrigger value="obrigacoes">Obrigações</TabsTrigger>
            <TabsTrigger value="funcionarios">Funcionários</TabsTrigger>
            <TabsTrigger value="documentos">Documentos</TabsTrigger>
            <TabsTrigger value="contabeis">Dados Contábeis</TabsTrigger>
          </TabsList>

          <TabsContent value="clientes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Criar Novo Cliente</CardTitle>
                <CardDescription>
                  Adicione um cliente manualmente para testes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="client-name">Nome da Empresa</Label>
                    <Input
                      id="client-name"
                      value={clienteForm.name}
                      onChange={(e) => setClienteForm({...clienteForm, name: e.target.value})}
                      placeholder="Ex: Empresa ABC LTDA"
                    />
                  </div>
                  <div>
                    <Label htmlFor="client-cnpj">CNPJ</Label>
                    <Input
                      id="client-cnpj"
                      value={clienteForm.cnpj}
                      onChange={(e) => setClienteForm({...clienteForm, cnpj: e.target.value})}
                      placeholder="00.000.000/0001-00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="client-email">Email</Label>
                    <Input
                      id="client-email"
                      type="email"
                      value={clienteForm.email}
                      onChange={(e) => setClienteForm({...clienteForm, email: e.target.value})}
                      placeholder="contato@empresa.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="client-regime">Regime Tributário</Label>
                    <Select value={clienteForm.regime} onValueChange={(value) => setClienteForm({...clienteForm, regime: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SIMPLES_NACIONAL">Simples Nacional</SelectItem>
                        <SelectItem value="LUCRO_PRESUMIDO">Lucro Presumido</SelectItem>
                        <SelectItem value="LUCRO_REAL">Lucro Real</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={criarCliente} disabled={isLoading}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Cliente
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="obrigacoes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Criar Obrigação Fiscal</CardTitle>
                <CardDescription>
                  Simule obrigações fiscais para o cliente teste
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="obr-nome">Nome da Obrigação</Label>
                    <Input
                      id="obr-nome"
                      value={obrigacaoForm.nome}
                      onChange={(e) => setObrigacaoForm({...obrigacaoForm, nome: e.target.value})}
                      placeholder="DAS Março 2024"
                    />
                  </div>
                  <div>
                    <Label htmlFor="obr-tipo">Tipo</Label>
                    <Select value={obrigacaoForm.tipo} onValueChange={(value) => setObrigacaoForm({...obrigacaoForm, tipo: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DAS">DAS</SelectItem>
                        <SelectItem value="GFIP">GFIP</SelectItem>
                        <SelectItem value="DCTF">DCTF</SelectItem>
                        <SelectItem value="EFD">EFD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="obr-prazo">Prazo</Label>
                    <Input
                      id="obr-prazo"
                      type="date"
                      value={obrigacaoForm.prazo}
                      onChange={(e) => setObrigacaoForm({...obrigacaoForm, prazo: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="obr-status">Status</Label>
                    <Select value={obrigacaoForm.status} onValueChange={(value) => setObrigacaoForm({...obrigacaoForm, status: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pendente">Pendente</SelectItem>
                        <SelectItem value="concluido">Concluído</SelectItem>
                        <SelectItem value="atrasado">Atrasado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="obr-empresa">Empresa</Label>
                  <Input
                    id="obr-empresa"
                    value={obrigacaoForm.empresa}
                    onChange={(e) => setObrigacaoForm({...obrigacaoForm, empresa: e.target.value})}
                    placeholder="Empresa Teste LTDA"
                  />
                </div>
                <Button onClick={criarObrigacao} disabled={isLoading}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Obrigação
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="funcionarios" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Criar Funcionário</CardTitle>
                <CardDescription>
                  Adicione funcionários para testes de folha de pagamento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="func-name">Nome</Label>
                    <Input
                      id="func-name"
                      value={funcionarioForm.name}
                      onChange={(e) => setFuncionarioForm({...funcionarioForm, name: e.target.value})}
                      placeholder="Nome do Funcionário"
                    />
                  </div>
                  <div>
                    <Label htmlFor="func-cpf">CPF</Label>
                    <Input
                      id="func-cpf"
                      value={funcionarioForm.cpf}
                      onChange={(e) => setFuncionarioForm({...funcionarioForm, cpf: e.target.value})}
                      placeholder="000.000.000-00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="func-position">Cargo</Label>
                    <Input
                      id="func-position"
                      value={funcionarioForm.position}
                      onChange={(e) => setFuncionarioForm({...funcionarioForm, position: e.target.value})}
                      placeholder="Vendedor, Gerente, etc."
                    />
                  </div>
                  <div>
                    <Label htmlFor="func-salary">Salário Base</Label>
                    <Input
                      id="func-salary"
                      type="number"
                      step="0.01"
                      value={funcionarioForm.base_salary}
                      onChange={(e) => setFuncionarioForm({...funcionarioForm, base_salary: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="func-department">Departamento</Label>
                  <Input
                    id="func-department"
                    value={funcionarioForm.department}
                    onChange={(e) => setFuncionarioForm({...funcionarioForm, department: e.target.value})}
                    placeholder="Vendas, Administração, etc."
                  />
                </div>
                <Button onClick={criarFuncionario} disabled={isLoading}>
                  <Users className="h-4 w-4 mr-2" />
                  Criar Funcionário
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documentos" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Criar Documento</CardTitle>
                <CardDescription>
                  Simule documentos para o sistema processar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="doc-name">Nome do Arquivo</Label>
                    <Input
                      id="doc-name"
                      value={documentoForm.name}
                      onChange={(e) => setDocumentoForm({...documentoForm, name: e.target.value})}
                      placeholder="documento.xml"
                    />
                  </div>
                  <div>
                    <Label htmlFor="doc-title">Título</Label>
                    <Input
                      id="doc-title"
                      value={documentoForm.title}
                      onChange={(e) => setDocumentoForm({...documentoForm, title: e.target.value})}
                      placeholder="Descrição do documento"
                    />
                  </div>
                  <div>
                    <Label htmlFor="doc-type">Tipo</Label>
                    <Select value={documentoForm.type} onValueChange={(value) => setDocumentoForm({...documentoForm, type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NFE">Nota Fiscal Eletrônica</SelectItem>
                        <SelectItem value="BALANCETE">Balancete</SelectItem>
                        <SelectItem value="DRE">DRE</SelectItem>
                        <SelectItem value="COMPROVANTE">Comprovante</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="doc-size">Tamanho (bytes)</Label>
                    <Input
                      id="doc-size"
                      type="number"
                      value={documentoForm.size}
                      onChange={(e) => setDocumentoForm({...documentoForm, size: e.target.value})}
                      placeholder="1024"
                    />
                  </div>
                </div>
                <Button onClick={criarDocumento} disabled={isLoading}>
                  <FileText className="h-4 w-4 mr-2" />
                  Criar Documento
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contabeis" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Processar Dados Contábeis</CardTitle>
                <CardDescription>
                  Simule processamento de dados contábeis mensais
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cont-period">Período</Label>
                    <Input
                      id="cont-period"
                      value={dadosContabeisForm.period}
                      onChange={(e) => setDadosContabeisForm({...dadosContabeisForm, period: e.target.value})}
                      placeholder="2024-03"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cont-revenue">Receita Bruta</Label>
                    <Input
                      id="cont-revenue"
                      type="number"
                      step="0.01"
                      value={dadosContabeisForm.revenue}
                      onChange={(e) => setDadosContabeisForm({...dadosContabeisForm, revenue: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cont-expenses">Despesas</Label>
                    <Input
                      id="cont-expenses"
                      type="number"
                      step="0.01"
                      value={dadosContabeisForm.expenses}
                      onChange={(e) => setDadosContabeisForm({...dadosContabeisForm, expenses: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label>Lucro Líquido (calculado)</Label>
                    <Input
                      value={dadosContabeisForm.revenue && dadosContabeisForm.expenses ? 
                        (parseFloat(dadosContabeisForm.revenue) - parseFloat(dadosContabeisForm.expenses)).toFixed(2) : '0.00'}
                      disabled
                    />
                  </div>
                </div>
                <Button onClick={criarDadosContabeis} disabled={isLoading}>
                  <Receipt className="h-4 w-4 mr-2" />
                  Processar Dados
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}