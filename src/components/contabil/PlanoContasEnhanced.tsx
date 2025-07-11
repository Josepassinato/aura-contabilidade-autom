import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  FolderTree,
  BookOpen,
  ChevronRight,
  ChevronDown,
  Building,
  TrendingUp,
  DollarSign,
  BarChart3,
  Filter,
  Download,
  Upload,
  Copy
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PlanoContas {
  id: string;
  codigo: string;
  nome: string;
  tipo: string;
  subtipo?: string;
  grau: number;
  conta_pai_id?: string;
  natureza: string;
  aceita_lancamento: boolean;
  ativo: boolean;
  observacoes?: string;
  created_at: string;
  updated_at: string;
  filhas?: PlanoContas[];
}

const tiposContaOptions = [
  { value: 'ATIVO', label: 'Ativo', color: 'bg-blue-100 text-blue-800' },
  { value: 'PASSIVO', label: 'Passivo', color: 'bg-red-100 text-red-800' },
  { value: 'PATRIMONIO_LIQUIDO', label: 'Patrimônio Líquido', color: 'bg-purple-100 text-purple-800' },
  { value: 'RECEITA', label: 'Receita', color: 'bg-green-100 text-green-800' },
  { value: 'DESPESA', label: 'Despesa', color: 'bg-orange-100 text-orange-800' }
];

const naturezaOptions = [
  { value: 'DEVEDORA', label: 'Devedora', color: 'bg-blue-100 text-blue-800' },
  { value: 'CREDORA', label: 'Credora', color: 'bg-green-100 text-green-800' }
];

export function PlanoContasEnhanced() {
  const [contas, setContas] = useState<PlanoContas[]>([]);
  const [filteredContas, setFilteredContas] = useState<PlanoContas[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTipo, setSelectedTipo] = useState<string>('');
  const [selectedNatureza, setSelectedNatureza] = useState<string>('');
  const [showOnlyActive, setShowOnlyActive] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingConta, setEditingConta] = useState<PlanoContas | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'table' | 'tree'>('tree');
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    codigo: '',
    nome: '',
    tipo: '',
    subtipo: '',
    grau: 1,
    conta_pai_id: '',
    natureza: 'DEVEDORA',
    aceita_lancamento: true,
    ativo: true,
    observacoes: ''
  });

  useEffect(() => {
    loadPlanoContas();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [contas, searchTerm, selectedTipo, selectedNatureza, showOnlyActive]);

  const loadPlanoContas = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('plano_contas')
        .select('*')
        .order('codigo');

      if (error) throw error;
      setContas(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar plano de contas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o plano de contas.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = contas;

    if (searchTerm) {
      filtered = filtered.filter(conta => 
        conta.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conta.nome.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedTipo) {
      filtered = filtered.filter(conta => conta.tipo === selectedTipo);
    }

    if (selectedNatureza) {
      filtered = filtered.filter(conta => conta.natureza === selectedNatureza);
    }

    if (showOnlyActive) {
      filtered = filtered.filter(conta => conta.ativo);
    }

    setFilteredContas(filtered);
  };

  const handleSave = async () => {
    try {
      // Validações
      if (!formData.codigo || !formData.nome || !formData.tipo) {
        toast({
          title: "Erro de Validação",
          description: "Campos obrigatórios: Código, Nome e Tipo.",
          variant: "destructive"
        });
        return;
      }

      // Verificar se código já existe
      const { data: existingConta } = await supabase
        .from('plano_contas')
        .select('id')
        .eq('codigo', formData.codigo)
        .neq('id', editingConta?.id || '');

      if (existingConta && existingConta.length > 0) {
        toast({
          title: "Erro de Validação",
          description: "Já existe uma conta com este código.",
          variant: "destructive"
        });
        return;
      }

      if (editingConta) {
        const { error } = await supabase
          .from('plano_contas')
          .update(formData)
          .eq('id', editingConta.id);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Conta atualizada com sucesso."
        });
      } else {
        const { error } = await supabase
          .from('plano_contas')
          .insert(formData);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Conta criada com sucesso."
        });
      }

      setIsDialogOpen(false);
      resetForm();
      loadPlanoContas();
    } catch (error: any) {
      console.error('Erro ao salvar conta:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível salvar a conta.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (conta: PlanoContas) => {
    if (!confirm(`Tem certeza que deseja excluir a conta "${conta.nome}"?`)) {
      return;
    }

    try {
      // Verificar se a conta tem contas filhas
      const { data: contasFilhas } = await supabase
        .from('plano_contas')
        .select('id')
        .eq('conta_pai_id', conta.id);

      if (contasFilhas && contasFilhas.length > 0) {
        toast({
          title: "Erro",
          description: "Não é possível excluir uma conta que possui contas filhas.",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('plano_contas')
        .delete()
        .eq('id', conta.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Conta excluída com sucesso."
      });

      loadPlanoContas();
    } catch (error: any) {
      console.error('Erro ao excluir conta:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível excluir a conta.",
        variant: "destructive"
      });
    }
  };

  const handleDuplicate = (conta: PlanoContas) => {
    setFormData({
      codigo: '',
      nome: `${conta.nome} (Cópia)`,
      tipo: conta.tipo,
      subtipo: conta.subtipo || '',
      grau: conta.grau,
      conta_pai_id: conta.conta_pai_id || '',
      natureza: conta.natureza,
      aceita_lancamento: conta.aceita_lancamento,
      ativo: true,
      observacoes: conta.observacoes || ''
    });
    setEditingConta(null);
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      codigo: '',
      nome: '',
      tipo: '',
      subtipo: '',
      grau: 1,
      conta_pai_id: '',
      natureza: 'DEVEDORA',
      aceita_lancamento: true,
      ativo: true,
      observacoes: ''
    });
    setEditingConta(null);
  };

  const handleEdit = (conta: PlanoContas) => {
    setFormData({
      codigo: conta.codigo,
      nome: conta.nome,
      tipo: conta.tipo,
      subtipo: conta.subtipo || '',
      grau: conta.grau,
      conta_pai_id: conta.conta_pai_id || '',
      natureza: conta.natureza,
      aceita_lancamento: conta.aceita_lancamento,
      ativo: conta.ativo,
      observacoes: conta.observacoes || ''
    });
    setEditingConta(conta);
    setIsDialogOpen(true);
  };

  const handleNew = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const organizeContasTree = (contas: PlanoContas[]): PlanoContas[] => {
    const contasMap = new Map<string, PlanoContas>();
    const rootContas: PlanoContas[] = [];

    // Criar map de todas as contas
    contas.forEach(conta => {
      contasMap.set(conta.id, { ...conta, filhas: [] });
    });

    // Organizar hierarquia
    contas.forEach(conta => {
      const contaComFilhas = contasMap.get(conta.id)!;
      if (conta.conta_pai_id) {
        const pai = contasMap.get(conta.conta_pai_id);
        if (pai) {
          pai.filhas!.push(contaComFilhas);
        } else {
          rootContas.push(contaComFilhas);
        }
      } else {
        rootContas.push(contaComFilhas);
      }
    });

    return rootContas.sort((a, b) => a.codigo.localeCompare(b.codigo));
  };

  const toggleExpanded = (contaId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(contaId)) {
      newExpanded.delete(contaId);
    } else {
      newExpanded.add(contaId);
    }
    setExpandedNodes(newExpanded);
  };

  const renderTreeNode = (conta: PlanoContas, level: number = 0) => {
    const hasFilhas = conta.filhas && conta.filhas.length > 0;
    const isExpanded = expandedNodes.has(conta.id);
    const tipoOption = tiposContaOptions.find(t => t.value === conta.tipo);
    const naturezaOption = naturezaOptions.find(n => n.value === conta.natureza);

    return (
      <React.Fragment key={conta.id}>
        <TableRow className={level > 0 ? 'bg-muted/30' : ''}>
          <TableCell>
            <div className="flex items-center" style={{ paddingLeft: `${level * 24}px` }}>
              {hasFilhas ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 h-auto mr-2"
                  onClick={() => toggleExpanded(conta.id)}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              ) : (
                <div className="w-6 mr-2" />
              )}
              <div>
                <p className="font-mono font-medium">{conta.codigo}</p>
                {level > 0 && (
                  <p className="text-xs text-muted-foreground">Nível {conta.grau}</p>
                )}
              </div>
            </div>
          </TableCell>
          <TableCell>
            <div>
              <p className="font-medium">{conta.nome}</p>
              {conta.observacoes && (
                <p className="text-xs text-muted-foreground mt-1">
                  {conta.observacoes.substring(0, 50)}
                  {conta.observacoes.length > 50 && '...'}
                </p>
              )}
            </div>
          </TableCell>
          <TableCell>
            <Badge className={tipoOption?.color}>
              {tipoOption?.label || conta.tipo}
            </Badge>
          </TableCell>
          <TableCell>
            <Badge className={naturezaOption?.color}>
              {naturezaOption?.label || conta.natureza}
            </Badge>
          </TableCell>
          <TableCell>
            <div className="flex gap-1">
              <Badge variant={conta.ativo ? 'default' : 'secondary'}>
                {conta.ativo ? 'Ativa' : 'Inativa'}
              </Badge>
              {conta.aceita_lancamento && (
                <Badge variant="outline">
                  Lançamento
                </Badge>
              )}
            </div>
          </TableCell>
          <TableCell>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit(conta)}
                title="Editar"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDuplicate(conta)}
                title="Duplicar"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(conta)}
                title="Excluir"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </TableCell>
        </TableRow>
        {hasFilhas && isExpanded && conta.filhas!.map(filha => 
          renderTreeNode(filha, level + 1)
        )}
      </React.Fragment>
    );
  };

  const getResumoEstatisticas = () => {
    const total = contas.length;
    const ativas = contas.filter(c => c.ativo).length;
    const porTipo = tiposContaOptions.map(tipo => ({
      tipo: tipo.label,
      count: contas.filter(c => c.tipo === tipo.value).length,
      color: tipo.color
    }));

    return { total, ativas, porTipo };
  };

  const stats = getResumoEstatisticas();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <BookOpen className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Carregando plano de contas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Plano de Contas</h2>
          <p className="text-muted-foreground">
            Gerencie a estrutura contábil da empresa
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Importar
          </Button>
          <Button onClick={handleNew}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Conta
          </Button>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Contas</p>
                <p className="text-2xl font-bold">{stats.total}</p>
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
                <p className="text-sm text-muted-foreground">Contas Ativas</p>
                <p className="text-2xl font-bold text-green-600">{stats.ativas}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tipos Configurados</p>
                <p className="text-2xl font-bold">{stats.porTipo.filter(t => t.count > 0).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Building className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Níveis Hierárquicos</p>
                <p className="text-2xl font-bold">{Math.max(...contas.map(c => c.grau), 0)}</p>
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
            Filtros e Visualização
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
            <div>
              <Label htmlFor="tipo">Tipo</Label>
              <Select value={selectedTipo} onValueChange={setSelectedTipo}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os tipos</SelectItem>
                  {tiposContaOptions.map((tipo) => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="natureza">Natureza</Label>
              <Select value={selectedNatureza} onValueChange={setSelectedNatureza}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as naturezas</SelectItem>
                  {naturezaOptions.map((natureza) => (
                    <SelectItem key={natureza.value} value={natureza.value}>
                      {natureza.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Visualização</Label>
              <Select value={viewMode} onValueChange={(value: 'table' | 'tree') => setViewMode(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tree">Árvore Hierárquica</SelectItem>
                  <SelectItem value="table">Tabela Simples</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <div className="flex items-center space-x-2">
                <Switch
                  id="active-only"
                  checked={showOnlyActive}
                  onCheckedChange={setShowOnlyActive}
                />
                <Label htmlFor="active-only">Apenas ativas</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Contas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderTree className="h-5 w-5" />
              {viewMode === 'tree' ? 'Estrutura Hierárquica' : 'Lista de Contas'}
            </div>
            <Badge variant="outline">
              {filteredContas.length} conta(s)
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Natureza</TableHead>
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
                ) : filteredContas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center gap-4">
                        <BookOpen className="h-12 w-12 text-muted-foreground" />
                        <div>
                          <p className="text-lg font-medium">Nenhuma conta encontrada</p>
                          <p className="text-muted-foreground">
                            Ajuste os filtros ou adicione uma nova conta
                          </p>
                        </div>
                        <Button onClick={handleNew}>
                          <Plus className="h-4 w-4 mr-2" />
                          Criar Primeira Conta
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : viewMode === 'tree' ? (
                  organizeContasTree(filteredContas).map(conta => renderTreeNode(conta))
                ) : (
                  filteredContas.map((conta) => {
                    const tipoOption = tiposContaOptions.find(t => t.value === conta.tipo);
                    const naturezaOption = naturezaOptions.find(n => n.value === conta.natureza);
                    
                    return (
                      <TableRow key={conta.id}>
                        <TableCell className="font-mono font-medium">
                          {conta.codigo}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{conta.nome}</p>
                            <p className="text-xs text-muted-foreground">Grau {conta.grau}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={tipoOption?.color}>
                            {tipoOption?.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={naturezaOption?.color}>
                            {naturezaOption?.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Badge variant={conta.ativo ? 'default' : 'secondary'}>
                              {conta.ativo ? 'Ativa' : 'Inativa'}
                            </Badge>
                            {conta.aceita_lancamento && (
                              <Badge variant="outline">Lançamento</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(conta)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDuplicate(conta)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(conta)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Dialog para Nova/Editar Conta */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingConta ? 'Editar Conta' : 'Nova Conta'}
            </DialogTitle>
            <DialogDescription>
              {editingConta 
                ? 'Edite as informações da conta contábil.' 
                : 'Crie uma nova conta no plano de contas.'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="codigo">Código *</Label>
              <Input
                id="codigo"
                value={formData.codigo}
                onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                placeholder="Ex: 1.1.01.001"
              />
            </div>
            <div>
              <Label htmlFor="grau">Grau</Label>
              <Input
                id="grau"
                type="number"
                min="1"
                max="10"
                value={formData.grau}
                onChange={(e) => setFormData({ ...formData, grau: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="nome">Nome da Conta *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Nome da conta contábil"
              />
            </div>
            <div>
              <Label htmlFor="tipo">Tipo *</Label>
              <Select value={formData.tipo} onValueChange={(value) => setFormData({ ...formData, tipo: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {tiposContaOptions.map((tipo) => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="natureza">Natureza *</Label>
              <Select value={formData.natureza} onValueChange={(value) => setFormData({ ...formData, natureza: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {naturezaOptions.map((natureza) => (
                    <SelectItem key={natureza.value} value={natureza.value}>
                      {natureza.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="subtipo">Subtipo</Label>
              <Input
                id="subtipo"
                value={formData.subtipo}
                onChange={(e) => setFormData({ ...formData, subtipo: e.target.value })}
                placeholder="Subtipo da conta"
              />
            </div>
            <div>
              <Label htmlFor="conta_pai">Conta Pai</Label>
              <Select value={formData.conta_pai_id} onValueChange={(value) => setFormData({ ...formData, conta_pai_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a conta pai" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhuma</SelectItem>
                  {contas
                    .filter(c => c.id !== editingConta?.id)
                    .map((conta) => (
                      <SelectItem key={conta.id} value={conta.id}>
                        {conta.codigo} - {conta.nome}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                placeholder="Observações sobre a conta"
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="aceita_lancamento"
                checked={formData.aceita_lancamento}
                onCheckedChange={(checked) => setFormData({ ...formData, aceita_lancamento: checked })}
              />
              <Label htmlFor="aceita_lancamento">Aceita lançamentos</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="ativo"
                checked={formData.ativo}
                onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
              />
              <Label htmlFor="ativo">Conta ativa</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              {editingConta ? 'Atualizar' : 'Criar'} Conta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}