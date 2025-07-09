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
import { 
  Plus, 
  Edit, 
  Trash2, 
  Target,
  BarChart3,
  TrendingUp,
  Building,
  Calculator
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

export function CentroCustosManager() {
  const { toast } = useToast();
  const [centrosCusto, setCentrosCusto] = useState<CentroCusto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCentro, setEditingCentro] = useState<CentroCusto | null>(null);
  const [formData, setFormData] = useState({
    codigo: '',
    nome: '',
    descricao: '',
    ativo: true
  });

  useEffect(() => {
    loadCentrosCusto();
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

  const handleSubmit = async () => {
    try {
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

  const activeCentros = centrosCusto.filter(c => c.ativo);
  const inactiveCentros = centrosCusto.filter(c => !c.ativo);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Centro de Custos</h2>
          <p className="text-muted-foreground">
            Configure e gerencie centros de custos para análise contábil
          </p>
        </div>
        <Button onClick={() => openForm()} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Centro de Custo
        </Button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{centrosCusto.length}</p>
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
                <p className="text-sm text-muted-foreground">Ativos</p>
                <p className="text-2xl font-bold text-green-600">{activeCentros.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <Building className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Inativos</p>
                <p className="text-2xl font-bold text-red-600">{inactiveCentros.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calculator className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Utilizados</p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Centros de Custo */}
      <Card>
        <CardHeader>
          <CardTitle>Centros de Custo Cadastrados</CardTitle>
          <CardDescription>
            Lista de todos os centros de custo configurados no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {centrosCusto.map((centro) => (
                <TableRow key={centro.id}>
                  <TableCell className="font-mono font-medium">
                    {centro.codigo}
                  </TableCell>
                  <TableCell className="font-medium">
                    {centro.nome}
                  </TableCell>
                  <TableCell>
                    {centro.descricao || '-'}
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
                    {formatDate(centro.created_at)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openForm(centro)}
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
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {centrosCusto.length === 0 && (
            <div className="text-center py-8">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Nenhum centro de custo cadastrado ainda.
              </p>
              <Button onClick={() => openForm()} className="mt-4 gap-2">
                <Plus className="h-4 w-4" />
                Criar Primeiro Centro de Custo
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Formulário */}
      <Dialog open={showForm} onOpenChange={closeForm}>
        <DialogContent>
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
                <Label htmlFor="codigo">Código</Label>
                <Input
                  id="codigo"
                  value={formData.codigo}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    codigo: e.target.value
                  }))}
                  placeholder="Ex: CC001"
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
              <Label htmlFor="nome">Nome</Label>
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
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSubmit}>
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