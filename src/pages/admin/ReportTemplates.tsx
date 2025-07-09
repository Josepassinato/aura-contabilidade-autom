import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, FileText, Calendar, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  template_type: string;
  template_config: any;
  is_active: boolean;
  created_at: string;
}

export default function ReportTemplates() {
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState<ReportTemplate | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    template_type: '',
    template_config: '{}',
    is_active: true
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('report_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar templates',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplate = async () => {
    try {
      let templateConfig;
      try {
        templateConfig = JSON.parse(formData.template_config);
      } catch {
        toast({
          title: 'Erro',
          description: 'Configuração do template deve ser um JSON válido',
          variant: 'destructive'
        });
        return;
      }

      const templateData = {
        name: formData.name,
        description: formData.description,
        template_type: formData.template_type,
        template_config: templateConfig,
        is_active: formData.is_active
      };

      if (editingTemplate) {
        const { error } = await supabase
          .from('report_templates')
          .update(templateData)
          .eq('id', editingTemplate.id);

        if (error) throw error;
        
        toast({
          title: 'Sucesso',
          description: 'Template atualizado com sucesso'
        });
      } else {
        const { error } = await supabase
          .from('report_templates')
          .insert(templateData);

        if (error) throw error;
        
        toast({
          title: 'Sucesso',
          description: 'Template criado com sucesso'
        });
      }

      setIsDialogOpen(false);
      resetForm();
      loadTemplates();
    } catch (error) {
      console.error('Erro ao salvar template:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao salvar template',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este template?')) return;

    try {
      const { error } = await supabase
        .from('report_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: 'Sucesso',
        description: 'Template excluído com sucesso'
      });
      
      loadTemplates();
    } catch (error) {
      console.error('Erro ao excluir template:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao excluir template',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      template_type: '',
      template_config: '{}',
      is_active: true
    });
    setEditingTemplate(null);
  };

  const openEditDialog = (template: ReportTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description || '',
      template_type: template.template_type,
      template_config: JSON.stringify(template.template_config, null, 2),
      is_active: template.is_active
    });
    setIsDialogOpen(true);
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'balancete': 'Balancete',
      'dre': 'DRE',
      'obrigacoes': 'Obrigações',
      'resumo_fiscal': 'Resumo Fiscal'
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Carregando templates...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Templates de Relatórios</h1>
          <p className="text-muted-foreground">Gerencie os templates para geração automática de relatórios</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Template
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? 'Editar Template' : 'Novo Template'}
              </DialogTitle>
              <DialogDescription>
                Configure os parâmetros do template de relatório
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nome do template"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descrição do template"
                />
              </div>
              
              <div>
                <Label htmlFor="type">Tipo</Label>
                <Select
                  value={formData.template_type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, template_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="balancete">Balancete</SelectItem>
                    <SelectItem value="dre">DRE</SelectItem>
                    <SelectItem value="obrigacoes">Obrigações</SelectItem>
                    <SelectItem value="resumo_fiscal">Resumo Fiscal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="config">Configuração (JSON)</Label>
                <Textarea
                  id="config"
                  value={formData.template_config}
                  onChange={(e) => setFormData(prev => ({ ...prev, template_config: e.target.value }))}
                  placeholder='{"include_charts": true, "format": "detailed"}'
                  className="font-mono text-sm"
                  rows={8}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                />
                <Label htmlFor="is_active">Ativo</Label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveTemplate}>
                {editingTemplate ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {template.name}
                    {!template.is_active && (
                      <Badge variant="secondary">Inativo</Badge>
                    )}
                  </CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(template)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteTemplate(template.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <Badge variant="outline">
                    {getTypeLabel(template.template_type)}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Criado em {new Date(template.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {templates.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum template encontrado</h3>
              <p className="text-muted-foreground mb-4">Crie seu primeiro template para começar</p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Template
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}