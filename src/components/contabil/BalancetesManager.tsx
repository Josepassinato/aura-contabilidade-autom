import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar,
  FileText, 
  Download, 
  Plus, 
  Search,
  Filter,
  TrendingUp,
  BarChart3,
  Users
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

interface Balancete {
  id: string;
  client_id: string;
  periodo_inicio: string;
  periodo_fim: string;
  data_geracao: string;
  tipo: string;
  status: string;
  observacoes?: string;
  client_name?: string;
}

interface BalanceteItem {
  id: string;
  balancete_id: string;
  conta_codigo: string;
  conta_nome: string;
  saldo_anterior: number;
  debitos_periodo: number;
  creditos_periodo: number;
  saldo_atual: number;
}

export function BalancetesManager() {
  const { toast } = useToast();
  const [balancetes, setBalancetes] = useState<Balancete[]>([]);
  const [selectedBalancete, setSelectedBalancete] = useState<Balancete | null>(null);
  const [balanceteItems, setBalanceteItems] = useState<BalanceteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    client_id: '',
    periodo_inicio: '',
    periodo_fim: '',
    tipo: 'VERIFICACAO',
    observacoes: ''
  });

  useEffect(() => {
    loadBalancetes();
  }, []);

  const loadBalancetes = async () => {
    try {
      const { data, error } = await supabase
        .from('balancetes')
        .select(`
          *,
          accounting_clients(name)
        `)
        .order('data_geracao', { ascending: false });

      if (error) throw error;

      const balancetesWithClient = data.map(item => ({
        ...item,
        client_name: item.accounting_clients?.name || 'N/A'
      }));

      setBalancetes(balancetesWithClient);
    } catch (error) {
      logger.error('Erro ao carregar balancetes:', error, 'BalancetesManager');
      toast({
        title: "Erro",
        description: "Não foi possível carregar os balancetes.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadBalanceteItems = async (balanceteId: string) => {
    try {
      // Simular dados dos itens do balancete (em produção viria do banco)
      const mockItems: BalanceteItem[] = [
        {
          id: '1',
          balancete_id: balanceteId,
          conta_codigo: '1.1.1.01',
          conta_nome: 'Caixa Geral',
          saldo_anterior: 15000.00,
          debitos_periodo: 25000.00,
          creditos_periodo: 12000.00,
          saldo_atual: 28000.00
        },
        {
          id: '2',
          balancete_id: balanceteId,
          conta_codigo: '1.1.2.01',
          conta_nome: 'Banco Conta Movimento',
          saldo_anterior: 45000.00,
          debitos_periodo: 35000.00,
          creditos_periodo: 20000.00,
          saldo_atual: 60000.00
        },
        {
          id: '3',
          balancete_id: balanceteId,
          conta_codigo: '2.1.1.01',
          conta_nome: 'Fornecedores',
          saldo_anterior: 8000.00,
          debitos_periodo: 5000.00,
          creditos_periodo: 15000.00,
          saldo_atual: 18000.00
        }
      ];

      setBalanceteItems(mockItems);
    } catch (error) {
      logger.error('Erro ao carregar itens do balancete:', error, 'BalancetesManager');
    }
  };

  const handleCreateBalancete = async () => {
    try {
      const { error } = await supabase
        .from('balancetes')
        .insert([formData]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Balancete criado com sucesso!"
      });

      setShowForm(false);
      setFormData({
        client_id: '',
        periodo_inicio: '',
        periodo_fim: '',
        tipo: 'VERIFICACAO',
        observacoes: ''
      });
      loadBalancetes();
    } catch (error) {
      logger.error('Erro ao criar balancete:', error, 'BalancetesManager');
      toast({
        title: "Erro",
        description: "Não foi possível criar o balancete.",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'GERADO': { variant: 'secondary' as const, label: 'Gerado' },
      'APROVADO': { variant: 'default' as const, label: 'Aprovado' },
      'PENDENTE': { variant: 'outline' as const, label: 'Pendente' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['PENDENTE'];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <BarChart3 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Carregando balancetes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Balancetes</h2>
          <p className="text-muted-foreground">
            Gerencie e visualize balancetes de verificação
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Balancete
        </Button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Balancetes</p>
                <p className="text-2xl font-bold">{balancetes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Aprovados este Mês</p>
                <p className="text-2xl font-bold">
                  {balancetes.filter(b => b.status === 'APROVADO').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Users className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Clientes Ativos</p>
                <p className="text-2xl font-bold">
                  {new Set(balancetes.map(b => b.client_id)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">Lista de Balancetes</TabsTrigger>
          <TabsTrigger value="details" disabled={!selectedBalancete}>
            Detalhes do Balancete
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Balancetes Registrados</CardTitle>
              <CardDescription>
                Lista de todos os balancetes de verificação gerados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Data de Geração</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {balancetes.map((balancete) => (
                    <TableRow key={balancete.id}>
                      <TableCell className="font-medium">
                        {balancete.client_name}
                      </TableCell>
                      <TableCell>
                        {formatDate(balancete.periodo_inicio)} - {formatDate(balancete.periodo_fim)}
                      </TableCell>
                      <TableCell>{balancete.tipo}</TableCell>
                      <TableCell>{formatDate(balancete.data_geracao)}</TableCell>
                      <TableCell>{getStatusBadge(balancete.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedBalancete(balancete);
                              loadBalanceteItems(balancete.id);
                            }}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          {selectedBalancete && (
            <Card>
              <CardHeader>
                <CardTitle>
                  Balancete - {selectedBalancete.client_name}
                </CardTitle>
                <CardDescription>
                  Período: {formatDate(selectedBalancete.periodo_inicio)} - {formatDate(selectedBalancete.periodo_fim)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Conta</TableHead>
                      <TableHead>Saldo Anterior</TableHead>
                      <TableHead>Débitos</TableHead>
                      <TableHead>Créditos</TableHead>
                      <TableHead>Saldo Atual</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {balanceteItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-mono">
                          {item.conta_codigo}
                        </TableCell>
                        <TableCell>{item.conta_nome}</TableCell>
                        <TableCell>{formatCurrency(item.saldo_anterior)}</TableCell>
                        <TableCell>{formatCurrency(item.debitos_periodo)}</TableCell>
                        <TableCell>{formatCurrency(item.creditos_periodo)}</TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(item.saldo_atual)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Modal/Form de Criação */}
      {showForm && (
        <Card className="fixed inset-4 z-50 overflow-auto bg-background border shadow-lg">
          <CardHeader>
            <CardTitle>Novo Balancete</CardTitle>
            <CardDescription>
              Criar um novo balancete de verificação
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="periodo_inicio">Data Início</Label>
                <Input
                  id="periodo_inicio"
                  type="date"
                  value={formData.periodo_inicio}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    periodo_inicio: e.target.value
                  }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="periodo_fim">Data Fim</Label>
                <Input
                  id="periodo_fim"
                  type="date"
                  value={formData.periodo_fim}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    periodo_fim: e.target.value
                  }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Balancete</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value) => setFormData(prev => ({
                  ...prev,
                  tipo: value
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VERIFICACAO">Verificação</SelectItem>
                  <SelectItem value="ANALITICO">Analítico</SelectItem>
                  <SelectItem value="SINTETICO">Sintético</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Input
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  observacoes: e.target.value
                }))}
                placeholder="Observações adicionais..."
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleCreateBalancete}>
                Criar Balancete
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}