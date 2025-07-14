import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  Trash2, 
  Database, 
  Mail, 
  FileText, 
  BarChart3, 
  Download,
  Upload,
  Bell,
  Zap,
  Cog
} from 'lucide-react';

interface ActionBuilderProps {
  actions: any[];
  onChange: (actions: any[]) => void;
}

export const ActionBuilder: React.FC<ActionBuilderProps> = ({
  actions,
  onChange
}) => {
  const actionTypes = [
    {
      id: 'extract_data',
      name: 'Extração de Dados',
      description: 'Extrai dados de documentos ou fontes externas',
      icon: Download,
      category: 'data'
    },
    {
      id: 'validate_data',
      name: 'Validação de Dados',
      description: 'Valida dados conforme regras definidas',
      icon: Cog,
      category: 'data'
    },
    {
      id: 'create_accounting_entry',
      name: 'Criar Lançamento Contábil',
      description: 'Cria lançamentos contábeis automaticamente',
      icon: BarChart3,
      category: 'accounting'
    },
    {
      id: 'fetch_bank_statements',
      name: 'Buscar Extratos Bancários',
      description: 'Conecta com bancos para buscar extratos',
      icon: Database,
      category: 'integration'
    },
    {
      id: 'match_transactions',
      name: 'Conciliar Transações',
      description: 'Concilia transações bancárias com lançamentos',
      icon: Zap,
      category: 'accounting'
    },
    {
      id: 'generate_report',
      name: 'Gerar Relatório',
      description: 'Gera relatórios financeiros ou contábeis',
      icon: FileText,
      category: 'reporting'
    },
    {
      id: 'send_notification',
      name: 'Enviar Notificação',
      description: 'Envia notificações por email ou sistema',
      icon: Bell,
      category: 'communication'
    },
    {
      id: 'send_email',
      name: 'Enviar Email',
      description: 'Envia emails personalizados',
      icon: Mail,
      category: 'communication'
    },
    {
      id: 'backup_data',
      name: 'Backup de Dados',
      description: 'Faz backup de dados importantes',
      icon: Upload,
      category: 'maintenance'
    }
  ];

  const addAction = () => {
    const newAction = {
      id: Date.now().toString(),
      type: '',
      name: '',
      config: {},
      enabled: true,
      order: actions.length
    };
    onChange([...actions, newAction]);
  };

  const removeAction = (index: number) => {
    const updated = actions.filter((_, i) => i !== index);
    onChange(updated);
  };

  const updateAction = (index: number, updates: any) => {
    const updated = actions.map((action, i) => 
      i === index ? { ...action, ...updates } : action
    );
    onChange(updated);
  };

  const moveAction = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === actions.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...actions];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    
    // Update order property
    updated.forEach((action, i) => {
      action.order = i;
    });
    
    onChange(updated);
  };

  const renderActionConfig = (action: any, index: number) => {
    const actionType = actionTypes.find(t => t.id === action.type);
    
    switch (action.type) {
      case 'extract_data':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Fonte de Dados</Label>
              <Select 
                value={action.config.source || ''}
                onValueChange={(value) => updateAction(index, {
                  config: { ...action.config, source: value }
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a fonte" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="uploaded_documents">Documentos Enviados</SelectItem>
                  <SelectItem value="email_attachments">Anexos de Email</SelectItem>
                  <SelectItem value="ftp_folder">Pasta FTP</SelectItem>
                  <SelectItem value="api_endpoint">API Externa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Tipos de Arquivo</Label>
              <Input
                value={action.config.fileTypes || ''}
                onChange={(e) => updateAction(index, {
                  config: { ...action.config, fileTypes: e.target.value }
                })}
                placeholder="pdf,xml,csv"
              />
            </div>
          </div>
        );

      case 'create_accounting_entry':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Conta Débito</Label>
              <Input
                value={action.config.debitAccount || ''}
                onChange={(e) => updateAction(index, {
                  config: { ...action.config, debitAccount: e.target.value }
                })}
                placeholder="1.1.001"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Conta Crédito</Label>
              <Input
                value={action.config.creditAccount || ''}
                onChange={(e) => updateAction(index, {
                  config: { ...action.config, creditAccount: e.target.value }
                })}
                placeholder="2.1.001"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Histórico Padrão</Label>
              <Textarea
                value={action.config.defaultHistory || ''}
                onChange={(e) => updateAction(index, {
                  config: { ...action.config, defaultHistory: e.target.value }
                })}
                placeholder="Lançamento automático - {{source}}"
                rows={2}
              />
            </div>
          </div>
        );

      case 'send_email':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Para (emails)</Label>
              <Input
                value={action.config.recipients || ''}
                onChange={(e) => updateAction(index, {
                  config: { ...action.config, recipients: e.target.value }
                })}
                placeholder="email1@example.com,email2@example.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Assunto</Label>
              <Input
                value={action.config.subject || ''}
                onChange={(e) => updateAction(index, {
                  config: { ...action.config, subject: e.target.value }
                })}
                placeholder="Relatório Automático - {{date}}"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Template do Email</Label>
              <Textarea
                value={action.config.template || ''}
                onChange={(e) => updateAction(index, {
                  config: { ...action.config, template: e.target.value }
                })}
                placeholder="Olá, segue em anexo o relatório..."
                rows={4}
              />
            </div>
          </div>
        );

      case 'generate_report':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de Relatório</Label>
              <Select 
                value={action.config.reportType || ''}
                onValueChange={(value) => updateAction(index, {
                  config: { ...action.config, reportType: value }
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="balancete">Balancete</SelectItem>
                  <SelectItem value="dre">DRE</SelectItem>
                  <SelectItem value="balanco">Balanço</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Formato de Saída</Label>
              <Select 
                value={action.config.outputFormat || 'pdf'}
                onValueChange={(value) => updateAction(index, {
                  config: { ...action.config, outputFormat: value }
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'send_notification':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Título da Notificação</Label>
              <Input
                value={action.config.title || ''}
                onChange={(e) => updateAction(index, {
                  config: { ...action.config, title: e.target.value }
                })}
                placeholder="Processo Completado"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Mensagem</Label>
              <Textarea
                value={action.config.message || ''}
                onChange={(e) => updateAction(index, {
                  config: { ...action.config, message: e.target.value }
                })}
                placeholder="O processo foi executado com sucesso..."
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Prioridade</Label>
              <Select 
                value={action.config.priority || 'medium'}
                onValueChange={(value) => updateAction(index, {
                  config: { ...action.config, priority: value }
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="critical">Crítica</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Configuração Personalizada</Label>
              <Textarea
                value={action.config.customConfig || ''}
                onChange={(e) => updateAction(index, {
                  config: { ...action.config, customConfig: e.target.value }
                })}
                placeholder="Configuração em JSON..."
                rows={4}
              />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Actions List */}
      <div className="space-y-4">
        {actions.map((action, index) => {
          const actionType = actionTypes.find(t => t.id === action.type);
          const Icon = actionType?.icon || Cog;
          
          return (
            <Card key={action.id || index} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                      <span className="text-sm font-medium text-primary">{index + 1}</span>
                    </div>
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {actionType?.name || 'Ação Não Configurada'}
                      </CardTitle>
                      <CardDescription>
                        {actionType?.description || 'Selecione um tipo de ação'}
                      </CardDescription>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => moveAction(index, 'up')}
                        disabled={index === 0}
                      >
                        ↑
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => moveAction(index, 'down')}
                        disabled={index === actions.length - 1}
                      >
                        ↓
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`action-enabled-${index}`}>Ativo</Label>
                      <Switch
                        id={`action-enabled-${index}`}
                        checked={action.enabled !== false}
                        onCheckedChange={(enabled) => updateAction(index, { enabled })}
                      />
                    </div>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeAction(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Action Type Selection */}
                <div className="space-y-2">
                  <Label>Tipo de Ação</Label>
                  <Select 
                    value={action.type || ''}
                    onValueChange={(value) => updateAction(index, { type: value, config: {} })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de ação" />
                    </SelectTrigger>
                    <SelectContent>
                      {actionTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          <div className="flex items-center gap-2">
                            <type.icon className="h-4 w-4" />
                            {type.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Action Name */}
                <div className="space-y-2">
                  <Label>Nome da Ação</Label>
                  <Input
                    value={action.name || ''}
                    onChange={(e) => updateAction(index, { name: e.target.value })}
                    placeholder="Digite um nome para esta ação..."
                  />
                </div>

                {/* Action-specific Configuration */}
                {action.type && renderActionConfig(action, index)}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add Action Button */}
      <Button
        onClick={addAction}
        variant="outline"
        className="w-full h-12 border-dashed"
      >
        <Plus className="h-4 w-4 mr-2" />
        Adicionar Ação
      </Button>

      {actions.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <Zap className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Nenhuma ação configurada. Clique em "Adicionar Ação" para começar.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};