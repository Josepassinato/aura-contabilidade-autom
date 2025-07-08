import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  FolderTree,
  BookOpen,
  ChevronRight,
  ChevronDown
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
}

export function PlanoContasManager() {
  const [contas, setContas] = useState<PlanoContas[]>([]);
  const [filteredContas, setFilteredContas] = useState<PlanoContas[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTipo, setSelectedTipo] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingConta, setEditingConta] = useState<PlanoContas | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
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

  const tiposContaOptions = [
    { value: 'ATIVO', label: 'Ativo' },
    { value: 'PASSIVO', label: 'Passivo' },
    { value: 'PATRIMONIO_LIQUIDO', label: 'Patrimônio Líquido' },
    { value: 'RECEITA', label: 'Receita' },
    { value: 'DESPESA', label: 'Despesa' }
  ];

  const naturezaOptions = [
    { value: 'DEVEDORA', label: 'Devedora' },
    { value: 'CREDORA', label: 'Credora' }
  ];

  // Carregar plano de contas
  const loadPlanoContas = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('plano_contas')
        .select('*')
        .order('codigo');

      if (error) throw error;
      setContas(data || []);
      setFilteredContas(data || []);
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

  useEffect(() => {
    loadPlanoContas();
  }, []);

  // Filtrar contas
  useEffect(() => {
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

    setFilteredContas(filtered);
  }, [contas, searchTerm, selectedTipo]);

  // Salvar conta
  const handleSave = async () => {
    try {
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

  // Excluir conta
  const handleDelete = async (conta: PlanoContas) => {
    if (!confirm(`Tem certeza que deseja excluir a conta "${conta.nome}"?`)) {
      return;
    }

    try {
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

  // Resetar formulário
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

  // Abrir diálogo para edição
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

  // Abrir diálogo para nova conta
  const handleNew = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  // Organizar contas em árvore hierárquica
  const organizeContasTree = (contas: PlanoContas[]) => {
    const contasByGrau: { [key: number]: PlanoContas[] } = {};
    
    contas.forEach(conta => {
      if (!contasByGrau[conta.grau]) {
        contasByGrau[conta.grau] = [];
      }
      contasByGrau[conta.grau].push(conta);
    });

    return contasByGrau;
  };

  const contasByGrau = organizeContasTree(filteredContas);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Plano de Contas</h2>
          <p className="text-muted-foreground">
            Gerencie as contas contábeis da empresa
          </p>
        </div>
        <Button onClick={handleNew}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Conta
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
                  placeholder="Código ou nome da conta..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="tipo">Tipo de Conta</Label>
              <Select value={selectedTipo} onValueChange={setSelectedTipo}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
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
          </div>
        </CardContent>
      </Card>

      {/* Lista de Contas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderTree className="h-5 w-5" />
            Estrutura do Plano de Contas
          </CardTitle>
          <CardDescription>
            {filteredContas.length} conta(s) encontrada(s)
          </CardDescription>
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
                  <TableHead>Grau</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : filteredContas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Nenhuma conta encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredContas.map((conta) => (
                    <TableRow key={conta.id}>
                      <TableCell className="font-mono">
                        {conta.codigo}
                      </TableCell>
                      <TableCell>
                        <div style={{ paddingLeft: `${(conta.grau - 1) * 20}px` }}>
                          {conta.nome}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {tiposContaOptions.find(t => t.value === conta.tipo)?.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={conta.natureza === 'DEVEDORA' ? 'default' : 'secondary'}>
                          {conta.natureza}
                        </Badge>
                      </TableCell>
                      <TableCell>{conta.grau}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
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
                        <div className="flex gap-2">
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
                            onClick={() => handleDelete(conta)}
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
                    .filter(c => c.grau < formData.grau)
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
              <Label htmlFor="aceita_lancamento">Aceita Lançamento</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="ativo"
                checked={formData.ativo}
                onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
              />
              <Label htmlFor="ativo">Ativa</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              {editingConta ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}