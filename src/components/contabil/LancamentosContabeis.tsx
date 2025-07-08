import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  BookOpen,
  Calendar as CalendarIcon,
  DollarSign,
  FileText,
  Minus
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PlanoContas {
  id: string;
  codigo: string;
  nome: string;
  aceita_lancamento: boolean;
}

interface CentroCusto {
  id: string;
  codigo: string;
  nome: string;
}

interface LancamentoContabil {
  id: string;
  numero_lancamento: string;
  data_lancamento: string;
  data_competencia: string;
  historico: string;
  valor_total: number;
  tipo_documento?: string;
  numero_documento?: string;
  origem: string;
  status: string;
  observacoes?: string;
  client_id: string;
  created_at: string;
}

interface ItemLancamento {
  id?: string;
  conta_id: string;
  centro_custo_id?: string;
  tipo_movimento: 'DEBITO' | 'CREDITO';
  valor: number;
  historico_complementar?: string;
}

export function LancamentosContabeis() {
  const [lancamentos, setLancamentos] = useState<LancamentoContabil[]>([]);
  const [contas, setContas] = useState<PlanoContas[]>([]);
  const [centrosCusto, setCentrosCusto] = useState<CentroCusto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLancamento, setEditingLancamento] = useState<LancamentoContabil | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    numero_lancamento: '',
    data_lancamento: new Date(),
    data_competencia: new Date(),
    historico: '',
    tipo_documento: '',
    numero_documento: '',
    observacoes: ''
  });

  const [itensLancamento, setItensLancamento] = useState<ItemLancamento[]>([
    { conta_id: '', tipo_movimento: 'DEBITO' as const, valor: 0 },
    { conta_id: '', tipo_movimento: 'CREDITO' as const, valor: 0 }
  ]);

  // Carregar dados iniciais
  const loadData = async () => {
    try {
      setIsLoading(true);
      
      const [lancamentosResponse, contasResponse, centrosResponse] = await Promise.all([
        supabase
          .from('lancamentos_contabeis')
          .select('*')
          .order('data_lancamento', { ascending: false }),
        supabase
          .from('plano_contas')
          .select('id, codigo, nome, aceita_lancamento')
          .eq('aceita_lancamento', true)
          .eq('ativo', true)
          .order('codigo'),
        supabase
          .from('centro_custos')
          .select('id, codigo, nome')
          .eq('ativo', true)
          .order('codigo')
      ]);

      if (lancamentosResponse.error) throw lancamentosResponse.error;
      if (contasResponse.error) throw contasResponse.error;
      if (centrosResponse.error) throw centrosResponse.error;

      setLancamentos(lancamentosResponse.data || []);
      setContas(contasResponse.data || []);
      setCentrosCusto(centrosResponse.data || []);
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Calcular próximo número de lançamento
  const getNextLancamentoNumber = () => {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    
    const lancamentosDoMes = lancamentos.filter(l => {
      const dataLanc = new Date(l.data_lancamento);
      return dataLanc.getFullYear() === ano && dataLanc.getMonth() === hoje.getMonth();
    });

    const proximoNumero = lancamentosDoMes.length + 1;
    return `${ano}${mes}${String(proximoNumero).padStart(4, '0')}`;
  };

  // Validar balanceamento do lançamento
  const isLancamentoBalanceado = () => {
    const totalDebitos = itensLancamento
      .filter(item => item.tipo_movimento === 'DEBITO')
      .reduce((sum, item) => sum + (item.valor || 0), 0);
    
    const totalCreditos = itensLancamento
      .filter(item => item.tipo_movimento === 'CREDITO')
      .reduce((sum, item) => sum + (item.valor || 0), 0);

    return Math.abs(totalDebitos - totalCreditos) < 0.01; // Tolerância para erros de ponto flutuante
  };

  // Salvar lançamento
  const handleSave = async () => {
    try {
      if (!isLancamentoBalanceado()) {
        toast({
          title: "Erro",
          description: "O lançamento não está balanceado. O total de débitos deve ser igual ao total de créditos.",
          variant: "destructive"
        });
        return;
      }

      const valorTotal = itensLancamento
        .filter(item => item.tipo_movimento === 'DEBITO')
        .reduce((sum, item) => sum + (item.valor || 0), 0);

      const lancamentoData = {
        numero_lancamento: formData.numero_lancamento || getNextLancamentoNumber(),
        data_lancamento: format(formData.data_lancamento, 'yyyy-MM-dd'),
        data_competencia: format(formData.data_competencia, 'yyyy-MM-dd'),
        historico: formData.historico,
        valor_total: valorTotal,
        tipo_documento: formData.tipo_documento || null,
        numero_documento: formData.numero_documento || null,
        observacoes: formData.observacoes || null,
        origem: 'MANUAL',
        status: 'LANCADO',
        client_id: '00000000-0000-0000-0000-000000000000' // Placeholder - replace with actual client
      };

      if (editingLancamento) {
        // Atualizar lançamento existente
        const { error: lancamentoError } = await supabase
          .from('lancamentos_contabeis')
          .update(lancamentoData)
          .eq('id', editingLancamento.id);

        if (lancamentoError) throw lancamentoError;

        // Deletar itens existentes e criar novos
        await supabase
          .from('lancamentos_itens')
          .delete()
          .eq('lancamento_id', editingLancamento.id);

        const itensData = itensLancamento
          .filter(item => item.conta_id && item.valor > 0)
          .map(item => ({
            lancamento_id: editingLancamento.id,
            conta_id: item.conta_id,
            centro_custo_id: item.centro_custo_id || null,
            tipo_movimento: item.tipo_movimento,
            valor: item.valor,
            historico_complementar: item.historico_complementar || null
          }));

        const { error: itensError } = await supabase
          .from('lancamentos_itens')
          .insert(itensData);

        if (itensError) throw itensError;

        toast({
          title: "Sucesso",
          description: "Lançamento atualizado com sucesso."
        });
      } else {
        // Criar novo lançamento
        const { data: novoLancamento, error: lancamentoError } = await supabase
          .from('lancamentos_contabeis')
          .insert(lancamentoData)
          .select()
          .single();

        if (lancamentoError) throw lancamentoError;

        const itensData = itensLancamento
          .filter(item => item.conta_id && item.valor > 0)
          .map(item => ({
            lancamento_id: novoLancamento.id,
            conta_id: item.conta_id,
            centro_custo_id: item.centro_custo_id || null,
            tipo_movimento: item.tipo_movimento,
            valor: item.valor,
            historico_complementar: item.historico_complementar || null
          }));

        const { error: itensError } = await supabase
          .from('lancamentos_itens')
          .insert(itensData);

        if (itensError) throw itensError;

        toast({
          title: "Sucesso",
          description: "Lançamento criado com sucesso."
        });
      }

      setIsDialogOpen(false);
      resetForm();
      loadData();
    } catch (error: any) {
      console.error('Erro ao salvar lançamento:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível salvar o lançamento.",
        variant: "destructive"
      });
    }
  };

  // Resetar formulário
  const resetForm = () => {
    setFormData({
      numero_lancamento: '',
      data_lancamento: new Date(),
      data_competencia: new Date(),
      historico: '',
      tipo_documento: '',
      numero_documento: '',
      observacoes: ''
    });
    setItensLancamento([
      { conta_id: '', tipo_movimento: 'DEBITO', valor: 0 },
      { conta_id: '', tipo_movimento: 'CREDITO', valor: 0 }
    ]);
    setEditingLancamento(null);
  };

  // Adicionar item ao lançamento
  const addItem = (tipo: 'DEBITO' | 'CREDITO') => {
    setItensLancamento([
      ...itensLancamento,
      { conta_id: '', tipo_movimento: tipo, valor: 0 }
    ]);
  };

  // Remover item do lançamento
  const removeItem = (index: number) => {
    if (itensLancamento.length > 2) {
      setItensLancamento(itensLancamento.filter((_, i) => i !== index));
    }
  };

  // Atualizar item do lançamento
  const updateItem = (index: number, field: keyof ItemLancamento, value: any) => {
    const updatedItems = [...itensLancamento];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setItensLancamento(updatedItems);
  };

  // Filtrar lançamentos
  const filteredLancamentos = lancamentos.filter(lancamento => {
    const matchesSearch = searchTerm === '' || 
      lancamento.numero_lancamento.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lancamento.historico.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === '' || lancamento.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calcular totais dos itens
  const totalDebitos = itensLancamento
    .filter(item => item.tipo_movimento === 'DEBITO')
    .reduce((sum, item) => sum + (item.valor || 0), 0);
  
  const totalCreditos = itensLancamento
    .filter(item => item.tipo_movimento === 'CREDITO')
    .reduce((sum, item) => sum + (item.valor || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Lançamentos Contábeis</h2>
          <p className="text-muted-foreground">
            Gerencie os lançamentos contábeis da empresa
          </p>
        </div>
        <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Lançamento
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Número ou histórico..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os status</SelectItem>
                  <SelectItem value="RASCUNHO">Rascunho</SelectItem>
                  <SelectItem value="LANCADO">Lançado</SelectItem>
                  <SelectItem value="CANCELADO">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Lançamentos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Lançamentos Contábeis
          </CardTitle>
          <CardDescription>
            {filteredLancamentos.length} lançamento(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Histórico</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : filteredLancamentos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Nenhum lançamento encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLancamentos.map((lancamento) => (
                    <TableRow key={lancamento.id}>
                      <TableCell className="font-mono">
                        {lancamento.numero_lancamento}
                      </TableCell>
                      <TableCell>
                        {format(new Date(lancamento.data_lancamento), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {lancamento.historico}
                      </TableCell>
                      <TableCell>
                        R$ {lancamento.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          lancamento.status === 'LANCADO' ? 'default' :
                          lancamento.status === 'RASCUNHO' ? 'secondary' : 'destructive'
                        }>
                          {lancamento.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingLancamento(lancamento);
                              setFormData({
                                numero_lancamento: lancamento.numero_lancamento,
                                data_lancamento: new Date(lancamento.data_lancamento),
                                data_competencia: new Date(lancamento.data_competencia),
                                historico: lancamento.historico,
                                tipo_documento: lancamento.tipo_documento || '',
                                numero_documento: lancamento.numero_documento || '',
                                observacoes: lancamento.observacoes || ''
                              });
                              setIsDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                              if (confirm('Tem certeza que deseja excluir este lançamento?')) {
                                try {
                                  const { error } = await supabase
                                    .from('lancamentos_contabeis')
                                    .delete()
                                    .eq('id', lancamento.id);
                                  
                                  if (error) throw error;
                                  
                                  toast({
                                    title: "Sucesso",
                                    description: "Lançamento excluído com sucesso."
                                  });
                                  
                                  loadData();
                                } catch (error: any) {
                                  toast({
                                    title: "Erro",
                                    description: "Não foi possível excluir o lançamento.",
                                    variant: "destructive"
                                  });
                                }
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Dialog para Novo/Editar Lançamento */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingLancamento ? 'Editar Lançamento' : 'Novo Lançamento'}
            </DialogTitle>
            <DialogDescription>
              {editingLancamento 
                ? 'Edite as informações do lançamento contábil.' 
                : 'Crie um novo lançamento contábil. Lembre-se que o total de débitos deve ser igual ao total de créditos.'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Dados do Lançamento */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="numero">Número do Lançamento</Label>
                <Input
                  id="numero"
                  value={formData.numero_lancamento}
                  onChange={(e) => setFormData({ ...formData, numero_lancamento: e.target.value })}
                  placeholder={getNextLancamentoNumber()}
                />
              </div>
              <div>
                <Label>Data do Lançamento</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.data_lancamento && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.data_lancamento ? (
                        format(formData.data_lancamento, "PPP", { locale: ptBR })
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.data_lancamento}
                      onSelect={(date) => date && setFormData({ ...formData, data_lancamento: date })}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label>Data de Competência</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.data_competencia && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.data_competencia ? (
                        format(formData.data_competencia, "PPP", { locale: ptBR })
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.data_competencia}
                      onSelect={(date) => date && setFormData({ ...formData, data_competencia: date })}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label htmlFor="tipo_doc">Tipo de Documento</Label>
                <Input
                  id="tipo_doc"
                  value={formData.tipo_documento}
                  onChange={(e) => setFormData({ ...formData, tipo_documento: e.target.value })}
                  placeholder="Ex: Nota Fiscal, Recibo"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="historico">Histórico *</Label>
                <Textarea
                  id="historico"
                  value={formData.historico}
                  onChange={(e) => setFormData({ ...formData, historico: e.target.value })}
                  placeholder="Descrição do lançamento contábil"
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="numero_doc">Número do Documento</Label>
                <Input
                  id="numero_doc"
                  value={formData.numero_documento}
                  onChange={(e) => setFormData({ ...formData, numero_documento: e.target.value })}
                  placeholder="Número do documento"
                />
              </div>
              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Input
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  placeholder="Observações adicionais"
                />
              </div>
            </div>

            {/* Itens do Lançamento */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Itens do Lançamento</h3>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addItem('DEBITO')}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Débito
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addItem('CREDITO')}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Crédito
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                {itensLancamento.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end p-3 border rounded-lg">
                    <div className="col-span-1">
                      <Badge variant={item.tipo_movimento === 'DEBITO' ? 'default' : 'secondary'}>
                        {item.tipo_movimento === 'DEBITO' ? 'D' : 'C'}
                      </Badge>
                    </div>
                    <div className="col-span-4">
                      <Label>Conta Contábil</Label>
                      <Select
                        value={item.conta_id}
                        onValueChange={(value) => updateItem(index, 'conta_id', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma conta" />
                        </SelectTrigger>
                        <SelectContent>
                          {contas.map((conta) => (
                            <SelectItem key={conta.id} value={conta.id}>
                              {conta.codigo} - {conta.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Label>Centro de Custo</Label>
                      <Select
                        value={item.centro_custo_id || ''}
                        onValueChange={(value) => updateItem(index, 'centro_custo_id', value || undefined)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Opcional" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Nenhum</SelectItem>
                          {centrosCusto.map((centro) => (
                            <SelectItem key={centro.id} value={centro.id}>
                              {centro.codigo} - {centro.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Label>Valor</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.valor || ''}
                        onChange={(e) => updateItem(index, 'valor', parseFloat(e.target.value) || 0)}
                        placeholder="0,00"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Histórico Complementar</Label>
                      <Input
                        value={item.historico_complementar || ''}
                        onChange={(e) => updateItem(index, 'historico_complementar', e.target.value)}
                        placeholder="Opcional"
                      />
                    </div>
                    <div className="col-span-1">
                      {itensLancamento.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(index)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Totais */}
              <div className="grid grid-cols-3 gap-4 mt-4 p-4 bg-muted/50 rounded-lg">
                <div className="text-center">
                  <Label>Total Débitos</Label>
                  <div className="text-lg font-semibold">
                    R$ {totalDebitos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="text-center">
                  <Label>Total Créditos</Label>
                  <div className="text-lg font-semibold">
                    R$ {totalCreditos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="text-center">
                  <Label>Diferença</Label>
                  <div className={cn(
                    "text-lg font-semibold",
                    isLancamentoBalanceado() ? "text-green-600" : "text-red-600"
                  )}>
                    R$ {Math.abs(totalDebitos - totalCreditos).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  {isLancamentoBalanceado() && (
                    <Badge variant="default" className="mt-1">Balanceado</Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!isLancamentoBalanceado() || !formData.historico || totalDebitos === 0}
            >
              {editingLancamento ? 'Atualizar' : 'Lançar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}