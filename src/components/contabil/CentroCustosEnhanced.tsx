import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Target,
  BarChart3,
  TrendingUp,
  Building,
  Calculator,
  Search,
  Filter,
  Download,
  PieChart,
  DollarSign,
  Users,
  Activity
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CentroCusto {
  id: string;
  codigo: string;
  nome: string;
  descricao?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

interface CentroCustoAnalytics {
  id: string;
  total_custos: number;
  total_receitas: number;
  percentual_uso: number;
  lancamentos_mes: number;
}

export function CentroCustosEnhanced() {
  const { toast } = useToast();
  const [centrosCusto, setCentrosCusto] = useState<CentroCusto[]>([]);
  const [analytics, setAnalytics] = useState<Record<string, CentroCustoAnalytics>>({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCentro, setEditingCentro] = useState<CentroCusto | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyActive, setShowOnlyActive] = useState(true);
  const [formData, setFormData] = useState({
    codigo: '',
    nome: '',
    descricao: '',
    ativo: true
  });

  useEffect(() => {
    loadCentrosCusto();
    loadAnalytics();
  }, []);

  const loadCentrosCusto = async () => {
    try {
      const { data, error } = await supabase
        .from('centro_custos')
        .select('*')
        .order('codigo');

      if (error) throw error;
      setCentrosCusto(data || []);
    } catch (error) {
      console.error('Erro ao carregar centros de custo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os centros de custo.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      // Simular analytics - em produção, isso viria de uma view ou função do banco
      const mockAnalytics: Record<string, CentroCustoAnalytics> = {};
      
      // Para cada centro de custo, simular alguns dados
      centrosCusto.forEach(centro => {
        mockAnalytics[centro.id] = {
          id: centro.id,
          total_custos: Math.random() * 50000,
          total_receitas: Math.random() * 80000,
          percentual_uso: Math.random() * 100,
          lancamentos_mes: Math.floor(Math.random() * 200)
        };
      });
      
      setAnalytics(mockAnalytics);
    } catch (error) {
      console.error('Erro ao carregar analytics:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      // Validações
      if (!formData.codigo || !formData.nome) {
        toast({
          title: "Erro de Validação",
          description: "Código e Nome são obrigatórios.",
          variant: "destructive"
        });
        return;
      }

      // Verificar se código já existe
      const { data: existingCentro } = await supabase
        .from('centro_custos')
        .select('id')
        .eq('codigo', formData.codigo)
        .neq('id', editingCentro?.id || '');

      if (existingCentro && existingCentro.length > 0) {
        toast({
          title: "Erro de Validação",
          description: "Já existe um centro de custo com este código.",
          variant: "destructive"
        });
        return;
      }

      if (editingCentro) {
        const { error } = await supabase
          .from('centro_custos')
          .update(formData)
          .eq('id', editingCentro.id);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Centro de custo atualizado com sucesso!"
        });
      } else {
        const { error } = await supabase
          .from('centro_custos')
          .insert([formData]);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Centro de custo criado com sucesso!"
        });
      }

      closeForm();
      loadCentrosCusto();
      loadAnalytics();
    } catch (error) {
      console.error('Erro ao salvar centro de custo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o centro de custo.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // Verificar se há lançamentos associados
      const { data: lancamentos } = await supabase
        .from('lancamentos_itens')
        .select('id')
        .eq('centro_custo_id', id)
        .limit(1);

      if (lancamentos && lancamentos.length > 0) {
        toast({
          title: "Erro",
          description: "Não é possível excluir um centro de custo que possui lançamentos associados.",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('centro_custos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Centro de custo excluído com sucesso!"
      });

      loadCentrosCusto();
    } catch (error) {
      console.error('Erro ao excluir centro de custo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o centro de custo.",
        variant: "destructive"
      });
    }
  };

  const handleToggleStatus = async (centro: CentroCusto) => {
    try {
      const { error } = await supabase
        .from('centro_custos')
        .update({ ativo: !centro.ativo })
        .eq('id', centro.id);

      if (error) throw error;

      loadCentrosCusto();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status.",
        variant: "destructive"
      });
    }
  };

  const openForm = (centro?: CentroCusto) => {
    if (centro) {
      setEditingCentro(centro);
      setFormData({
        codigo: centro.codigo,
        nome: centro.nome,
        descricao: centro.descricao || '',
        ativo: centro.ativo
      });
    } else {
      setEditingCentro(null);
      setFormData({
        codigo: '',
        nome: '',
        descricao: '',
        ativo: true
      });
    }
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingCentro(null);
    setFormData({
      codigo: '',
      nome: '',
      descricao: '',
      ativo: true
    });
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

  const getFilteredCentros = () => {
    return centrosCusto.filter(centro => {
      const matchesSearch = !searchTerm || 
        centro.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        centro.nome.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = !showOnlyActive || centro.ativo;
      
      return matchesSearch && matchesStatus;
    });
  };

  const getEstatisticas = () => {
    const filteredCentros = getFilteredCentros();
    const total = centrosCusto.length;
    const ativos = centrosCusto.filter(c => c.ativo).length;
    const inativos = total - ativos;
    
    const totalCustos = Object.values(analytics).reduce((acc, curr) => acc + curr.total_custos, 0);
    const totalReceitas = Object.values(analytics).reduce((acc, curr) => acc + curr.total_receitas, 0);
    const totalLancamentos = Object.values(analytics).reduce((acc, curr) => acc + curr.lancamentos_mes, 0);

    return {
      total,
      ativos,
      inativos,
      totalCustos,
      totalReceitas,
      totalLancamentos,
      resultadoMes: totalReceitas - totalCustos
    };
  };

  const stats = getEstatisticas();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Target className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Carregando centros de custo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Centros de Custo</h2>
          <p className="text-muted-foreground">
            Gerencie centros de custo para análise contábil detalhada
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Relatório
          </Button>
          <Button onClick={() => openForm()} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Centro
          </Button>
        </div>
      </div>

      {/* Cards de Resumo Avançado */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Centros</p>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-green-600 mt-1">
                  {stats.ativos} ativos
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Custos do Mês</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(stats.totalCustos)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Valor acumulado
                </p>
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
                <p className="text-sm text-muted-foreground">Receitas do Mês</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats.totalReceitas)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Valor acumulado
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-lg ${stats.resultadoMes >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                <BarChart3 className={`h-6 w-6 ${stats.resultadoMes >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Resultado</p>
                <p className={`text-2xl font-bold ${stats.resultadoMes >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(stats.resultadoMes)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Receitas - Custos
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Código ou nome..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-end">
              <div className="flex items-center space-x-2">
                <Switch
                  id="active-only"
                  checked={showOnlyActive}
                  onCheckedChange={setShowOnlyActive}
                />
                <Label htmlFor="active-only">Apenas ativos</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela Aprimorada */}
      <Card>
        <CardHeader>
          <CardTitle>Centros de Custo Cadastrados</CardTitle>
          <CardDescription>
            Lista completa com informações de performance e utilização
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Custos do Mês</TableHead>
                  <TableHead>Receitas do Mês</TableHead>
                  <TableHead>Utilização</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getFilteredCentros().map((centro) => {
                  const analytic = analytics[centro.id] || {
                    total_custos: 0,
                    total_receitas: 0,
                    percentual_uso: 0,
                    lancamentos_mes: 0
                  };

                  return (
                    <TableRow key={centro.id}>
                      <TableCell className="font-mono font-medium">
                        {centro.codigo}
                      </TableCell>
                      <TableCell className="font-medium">
                        {centro.nome}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[200px]">
                          {centro.descricao ? (
                            <p className="text-sm text-muted-foreground truncate" title={centro.descricao}>
                              {centro.descricao}
                            </p>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-right">
                          <p className="font-medium text-red-600">
                            {formatCurrency(analytic.total_custos)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {analytic.lancamentos_mes} lançamentos
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-right">
                          <p className="font-medium text-green-600">
                            {formatCurrency(analytic.total_receitas)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Margem: {((analytic.total_receitas - analytic.total_custos) / analytic.total_receitas * 100).toFixed(1)}%
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">{analytic.percentual_uso.toFixed(1)}%</span>
                          </div>
                          <Progress value={analytic.percentual_uso} className="h-2" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant={centro.ativo ? 'default' : 'secondary'}>
                            {centro.ativo ? 'Ativo' : 'Inativo'}
                          </Badge>
                          <Switch
                            checked={centro.ativo}
                            onCheckedChange={() => handleToggleStatus(centro)}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openForm(centro)}
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (confirm('Deseja realmente excluir este centro de custo?')) {
                                handleDelete(centro.id);
                              }
                            }}
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {getFilteredCentros().length === 0 && (
              <div className="text-center py-12">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium">Nenhum centro de custo encontrado</p>
                <p className="text-muted-foreground mb-6">
                  {searchTerm ? 'Ajuste os filtros ou ' : ''}
                  Comece criando seu primeiro centro de custo
                </p>
                <Button onClick={() => openForm()} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Criar Centro de Custo
                </Button>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Dialog do Formulário Aprimorado */}
      <Dialog open={showForm} onOpenChange={closeForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingCentro ? 'Editar Centro de Custo' : 'Novo Centro de Custo'}
            </DialogTitle>
            <DialogDescription>
              Configure as informações do centro de custo para análise contábil
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="codigo">Código *</Label>
                <Input
                  id="codigo"
                  value={formData.codigo}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    codigo: e.target.value.toUpperCase()
                  }))}
                  placeholder="Ex: CC001"
                  className="uppercase"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ativo">Status</Label>
                <div className="flex items-center gap-2 h-10">
                  <Switch
                    id="ativo"
                    checked={formData.ativo}
                    onCheckedChange={(checked) => setFormData(prev => ({
                      ...prev,
                      ativo: checked
                    }))}
                  />
                  <Label htmlFor="ativo">
                    {formData.ativo ? 'Ativo' : 'Inativo'}
                  </Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  nome: e.target.value
                }))}
                placeholder="Nome do centro de custo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  descricao: e.target.value
                }))}
                placeholder="Descrição detalhada do centro de custo..."
                rows={4}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSubmit} className="flex-1">
                {editingCentro ? 'Atualizar' : 'Criar'} Centro de Custo
              </Button>
              <Button variant="outline" onClick={closeForm}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}