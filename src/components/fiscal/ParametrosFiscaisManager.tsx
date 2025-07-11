import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  History, 
  Calculator,
  FileText,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ParametroFiscal {
  id: string;
  tipo: string;
  parametros: any;
  versao: string;
  ativo: boolean;
  data_atualizacao: string;
  consultoria_id?: string;
  aplicado_em?: string;
  created_at: string;
}

interface TipoParametro {
  key: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  campos: CampoParametro[];
}

interface CampoParametro {
  key: string;
  label: string;
  type: 'number' | 'text' | 'boolean' | 'percentage';
  required?: boolean;
  min?: number;
  max?: number;
  description?: string;
}

const tiposParametros: TipoParametro[] = [
  {
    key: 'irpj',
    label: 'IRPJ',
    icon: <Calculator className="h-4 w-4" />,
    description: 'Parâmetros do Imposto de Renda Pessoa Jurídica',
    campos: [
      { key: 'aliquota_lucro_real', label: 'Alíquota Lucro Real (%)', type: 'percentage', required: true, min: 0, max: 100 },
      { key: 'aliquota_lucro_presumido', label: 'Alíquota Lucro Presumido (%)', type: 'percentage', required: true, min: 0, max: 100 },
      { key: 'adicional_irpj', label: 'Adicional IRPJ (%)', type: 'percentage', required: true, min: 0, max: 100 },
      { key: 'limite_lucro_real', label: 'Limite Lucro Real (R$)', type: 'number', required: true, min: 0 },
      { key: 'base_calculo_presumido', label: 'Base de Cálculo Presumido (%)', type: 'percentage', required: true, min: 0, max: 100 }
    ]
  },
  {
    key: 'csll',
    label: 'CSLL',
    icon: <FileText className="h-4 w-4" />,
    description: 'Parâmetros da Contribuição Social sobre o Lucro Líquido',
    campos: [
      { key: 'aliquota_geral', label: 'Alíquota Geral (%)', type: 'percentage', required: true, min: 0, max: 100 },
      { key: 'aliquota_instituicoes_financeiras', label: 'Alíquota Inst. Financeiras (%)', type: 'percentage', required: true, min: 0, max: 100 },
      { key: 'base_calculo_presumido', label: 'Base de Cálculo Presumido (%)', type: 'percentage', required: true, min: 0, max: 100 }
    ]
  },
  {
    key: 'pis_cofins',
    label: 'PIS/COFINS',
    icon: <TrendingUp className="h-4 w-4" />,
    description: 'Parâmetros do PIS e COFINS',
    campos: [
      { key: 'pis_nao_cumulativo', label: 'PIS Não Cumulativo (%)', type: 'percentage', required: true, min: 0, max: 100 },
      { key: 'cofins_nao_cumulativo', label: 'COFINS Não Cumulativo (%)', type: 'percentage', required: true, min: 0, max: 100 },
      { key: 'pis_cumulativo', label: 'PIS Cumulativo (%)', type: 'percentage', required: true, min: 0, max: 100 },
      { key: 'cofins_cumulativo', label: 'COFINS Cumulativo (%)', type: 'percentage', required: true, min: 0, max: 100 }
    ]
  },
  {
    key: 'icms',
    label: 'ICMS',
    icon: <Settings className="h-4 w-4" />,
    description: 'Parâmetros do Imposto sobre Circulação de Mercadorias e Serviços',
    campos: [
      { key: 'aliquota_interna', label: 'Alíquota Interna (%)', type: 'percentage', required: true, min: 0, max: 100 },
      { key: 'aliquota_interestadual', label: 'Alíquota Interestadual (%)', type: 'percentage', required: true, min: 0, max: 100 },
      { key: 'reducao_base_calculo', label: 'Redução Base de Cálculo (%)', type: 'percentage', required: false, min: 0, max: 100 },
      { key: 'diferencial_aliquota', label: 'Diferencial de Alíquota (%)', type: 'percentage', required: false, min: 0, max: 100 }
    ]
  }
];

export function ParametrosFiscaisManager() {
  const { toast } = useToast();
  const [parametros, setParametros] = useState<ParametroFiscal[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('irpj');
  const [showForm, setShowForm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [editingParametro, setEditingParametro] = useState<ParametroFiscal | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    loadParametros();
  }, []);

  const loadParametros = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('parametros_fiscais')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setParametros(data || []);
    } catch (error) {
      console.error('Erro ao carregar parâmetros fiscais:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os parâmetros fiscais.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const tipoParametro = tiposParametros.find(t => t.key === activeTab);
      if (!tipoParametro) return;

      // Validar campos obrigatórios
      const camposObrigatorios = tipoParametro.campos.filter(c => c.required);
      for (const campo of camposObrigatorios) {
        if (!formData[campo.key] && formData[campo.key] !== 0) {
          toast({
            title: "Erro de Validação",
            description: `O campo "${campo.label}" é obrigatório.`,
            variant: "destructive"
          });
          return;
        }
      }

      // Primeiro, desativar parâmetros ativos do mesmo tipo
      await supabase
        .from('parametros_fiscais')
        .update({ ativo: false })
        .eq('tipo', activeTab);

      // Criar nova versão
      const novaVersao = `v${Date.now()}`;
      const { error } = await supabase
        .from('parametros_fiscais')
        .insert({
          tipo: activeTab,
          parametros: formData,
          versao: novaVersao,
          ativo: true
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Parâmetros fiscais salvos com sucesso!"
      });

      setShowForm(false);
      setFormData({});
      loadParametros();
    } catch (error) {
      console.error('Erro ao salvar parâmetros:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar os parâmetros.",
        variant: "destructive"
      });
    }
  };

  const openForm = (tipo: string) => {
    setActiveTab(tipo);
    const parametroAtivo = parametros.find(p => p.tipo === tipo && p.ativo);
    if (parametroAtivo) {
      setFormData(parametroAtivo.parametros || {});
      setEditingParametro(parametroAtivo);
    } else {
      setFormData({});
      setEditingParametro(null);
    }
    setShowForm(true);
  };

  const getParametroAtivo = (tipo: string) => {
    return parametros.find(p => p.tipo === tipo && p.ativo);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderCampoForm = (campo: CampoParametro) => {
    const value = formData[campo.key] || '';
    
    switch (campo.type) {
      case 'boolean':
        return (
          <div key={campo.key} className="flex items-center space-x-2">
            <Switch
              id={campo.key}
              checked={!!value}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, [campo.key]: checked }))
              }
            />
            <Label htmlFor={campo.key}>{campo.label}</Label>
          </div>
        );
      
      case 'percentage':
        return (
          <div key={campo.key} className="space-y-2">
            <Label htmlFor={campo.key}>
              {campo.label}
              {campo.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <div className="relative">
              <Input
                id={campo.key}
                type="number"
                min={campo.min}
                max={campo.max}
                step="0.01"
                value={value}
                onChange={(e) => 
                  setFormData(prev => ({ ...prev, [campo.key]: parseFloat(e.target.value) || 0 }))
                }
                className="pr-8"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                %
              </span>
            </div>
            {campo.description && (
              <p className="text-xs text-muted-foreground">{campo.description}</p>
            )}
          </div>
        );
      
      default:
        return (
          <div key={campo.key} className="space-y-2">
            <Label htmlFor={campo.key}>
              {campo.label}
              {campo.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={campo.key}
              type={campo.type}
              min={campo.min}
              max={campo.max}
              value={value}
              onChange={(e) => 
                setFormData(prev => ({ 
                  ...prev, 
                  [campo.key]: campo.type === 'number' 
                    ? parseFloat(e.target.value) || 0 
                    : e.target.value 
                }))
              }
            />
            {campo.description && (
              <p className="text-xs text-muted-foreground">{campo.description}</p>
            )}
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Settings className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Carregando parâmetros fiscais...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Parâmetros Fiscais</h2>
          <p className="text-muted-foreground">
            Configure os parâmetros fiscais para cálculos automáticos
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowHistory(true)}>
            <History className="h-4 w-4 mr-2" />
            Histórico
          </Button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-4">
        {tiposParametros.map((tipo) => {
          const parametroAtivo = getParametroAtivo(tipo.key);
          return (
            <Card key={tipo.key} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${parametroAtivo ? 'bg-green-100' : 'bg-gray-100'}`}>
                      {React.cloneElement(tipo.icon as React.ReactElement, {
                        className: `h-5 w-5 ${parametroAtivo ? 'text-green-600' : 'text-gray-600'}`
                      })}
                    </div>
                    <div>
                      <p className="font-medium">{tipo.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {parametroAtivo ? 'Configurado' : 'Não configurado'}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {parametroAtivo ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openForm(tipo.key)}
                    >
                      {parametroAtivo ? 'Editar' : 'Configurar'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tabela de Parâmetros Ativos */}
      <Card>
        <CardHeader>
          <CardTitle>Parâmetros Ativos</CardTitle>
          <CardDescription>
            Lista dos parâmetros fiscais atualmente em vigor
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Versão</TableHead>
                <TableHead>Última Atualização</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tiposParametros.map((tipo) => {
                const parametroAtivo = getParametroAtivo(tipo.key);
                return (
                  <TableRow key={tipo.key}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {tipo.icon}
                        <div>
                          <p className="font-medium">{tipo.label}</p>
                          <p className="text-xs text-muted-foreground">{tipo.description}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {parametroAtivo ? (
                        <Badge variant="outline">{parametroAtivo.versao}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {parametroAtivo ? (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(parametroAtivo.data_atualizacao || parametroAtivo.created_at)}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {parametroAtivo ? (
                        <Badge variant="default">Ativo</Badge>
                      ) : (
                        <Badge variant="secondary">Não configurado</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openForm(tipo.key)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog do Formulário */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Configurar {tiposParametros.find(t => t.key === activeTab)?.label}
            </DialogTitle>
            <DialogDescription>
              {tiposParametros.find(t => t.key === activeTab)?.description}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[500px] pr-4">
            <div className="space-y-4">
              {tiposParametros
                .find(t => t.key === activeTab)
                ?.campos.map(campo => renderCampoForm(campo))
              }
            </div>
          </ScrollArea>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave}>
              Salvar Parâmetros
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog do Histórico */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Histórico de Parâmetros Fiscais</DialogTitle>
            <DialogDescription>
              Histórico de todas as alterações nos parâmetros fiscais
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Versão</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parametros.map((parametro) => {
                  const tipo = tiposParametros.find(t => t.key === parametro.tipo);
                  return (
                    <TableRow key={parametro.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {tipo?.icon}
                          {tipo?.label || parametro.tipo}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{parametro.versao}</Badge>
                      </TableCell>
                      <TableCell>{formatDate(parametro.created_at)}</TableCell>
                      <TableCell>
                        <Badge variant={parametro.ativo ? 'default' : 'secondary'}>
                          {parametro.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}