import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, 
  FileUp, 
  Database, 
  Zap, 
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { RuleData } from './AutomationRuleBuilder';

interface RulePreviewProps {
  rule: RuleData;
}

export const RulePreview: React.FC<RulePreviewProps> = ({ rule }) => {
  const getTriggerIcon = (triggerType: string) => {
    switch (triggerType) {
      case 'scheduled': return Clock;
      case 'document_received': return FileUp;
      case 'condition_met': return Database;
      case 'manual': return Zap;
      default: return Info;
    }
  };

  const formatTriggerDescription = () => {
    switch (rule.trigger_type) {
      case 'scheduled':
        if (rule.trigger_conditions.scheduleType === 'daily') {
          return `Executa diariamente às ${rule.trigger_conditions.time || '02:00'}`;
        } else if (rule.trigger_conditions.scheduleType === 'weekly') {
          const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
          const dayName = days[parseInt(rule.trigger_conditions.dayOfWeek || '1')];
          return `Executa toda ${dayName} às ${rule.trigger_conditions.time || '02:00'}`;
        } else if (rule.trigger_conditions.scheduleType === 'monthly') {
          return `Executa todo dia ${rule.trigger_conditions.dayOfMonth || '1'} às ${rule.trigger_conditions.time || '02:00'}`;
        } else {
          return `Cron: ${rule.trigger_conditions.schedule || 'Não configurado'}`;
        }
      
      case 'document_received':
        const docTypes = rule.trigger_conditions.documentTypes || [];
        return `Ativa quando documentos ${docTypes.length > 0 ? `(${docTypes.join(', ')})` : ''} são recebidos`;
      
      case 'condition_met':
        if (rule.trigger_conditions.conditionType === 'data_threshold') {
          return `Ativa quando ${rule.trigger_conditions.tableName || 'tabela'} atinge ${rule.trigger_conditions.thresholdValue || 0} registros`;
        }
        return 'Ativa quando condição personalizada é atendida';
      
      case 'manual':
        return 'Execução apenas manual';
      
      default:
        return 'Trigger não configurado';
    }
  };

  const getActionDescription = (action: any) => {
    switch (action.type) {
      case 'extract_data':
        return `Extrai dados de ${action.config.source || 'fonte não especificada'}`;
      case 'create_accounting_entry':
        return `Cria lançamento: ${action.config.debitAccount || 'conta'} → ${action.config.creditAccount || 'conta'}`;
      case 'send_email':
        return `Envia email para ${action.config.recipients || 'destinatários não especificados'}`;
      case 'generate_report':
        return `Gera relatório ${action.config.reportType || 'tipo não especificado'} em formato ${action.config.outputFormat || 'PDF'}`;
      case 'send_notification':
        return `Notificação: ${action.config.title || 'título não especificado'}`;
      default:
        return action.name || 'Ação sem nome';
    }
  };

  const getValidationStatus = () => {
    const issues = [];
    
    if (!rule.name) issues.push('Nome da regra é obrigatório');
    if (!rule.description) issues.push('Descrição é obrigatória');
    if (!rule.trigger_type) issues.push('Tipo de trigger não selecionado');
    if (rule.actions.length === 0) issues.push('Nenhuma ação configurada');
    
    // Trigger-specific validations
    if (rule.trigger_type === 'scheduled' && !rule.trigger_conditions.schedule && !rule.trigger_conditions.time) {
      issues.push('Agendamento não configurado');
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  };

  const TriggerIcon = getTriggerIcon(rule.trigger_type);
  const validation = getValidationStatus();

  return (
    <div className="space-y-6">
      {/* Validation Status */}
      <Card className={validation.isValid ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}>
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            {validation.isValid ? (
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            )}
            <div>
              <h4 className="font-medium">
                {validation.isValid ? 'Regra Válida' : 'Atenção Necessária'}
              </h4>
              {!validation.isValid && (
                <ul className="mt-1 text-sm text-muted-foreground list-disc list-inside">
                  {validation.issues.map((issue, index) => (
                    <li key={index}>{issue}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rule Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary"></div>
            {rule.name || 'Nome da Regra'}
          </CardTitle>
          <CardDescription>
            {rule.description || 'Descrição da regra não informada'}
          </CardDescription>
          <div className="flex gap-2 pt-2">
            <Badge variant="outline">{rule.type}</Badge>
            <Badge variant={rule.enabled ? 'default' : 'secondary'}>
              {rule.enabled ? 'Ativo' : 'Inativo'}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Trigger Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TriggerIcon className="h-5 w-5" />
            Configuração do Trigger
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <TriggerIcon className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="font-medium capitalize">
                {rule.trigger_type.replace('_', ' ')}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatTriggerDescription()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions Flow */}
      <Card>
        <CardHeader>
          <CardTitle>Fluxo de Ações</CardTitle>
          <CardDescription>
            Sequência de ações que serão executadas quando o trigger for ativado
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rule.actions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Zap className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Nenhuma ação configurada</p>
            </div>
          ) : (
            <div className="space-y-4">
              {rule.actions.map((action, index) => (
                <div key={action.id || index}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {action.name || `Ação ${index + 1}`}
                        </p>
                        {!action.enabled && (
                          <Badge variant="secondary" className="text-xs">
                            Desabilitada
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {getActionDescription(action)}
                      </p>
                    </div>
                  </div>
                  {index < rule.actions.length - 1 && (
                    <div className="flex justify-center my-2">
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Execution Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo da Execução</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Trigger:</span>
              <p className="text-muted-foreground">{formatTriggerDescription()}</p>
            </div>
            <div>
              <span className="font-medium">Ações:</span>
              <p className="text-muted-foreground">
                {rule.actions.filter(a => a.enabled !== false).length} de {rule.actions.length} ativas
              </p>
            </div>
            <div>
              <span className="font-medium">Status:</span>
              <p className="text-muted-foreground">
                {rule.enabled ? 'Regra ativa' : 'Regra inativa'}
              </p>
            </div>
            <div>
              <span className="font-medium">Tipo:</span>
              <p className="text-muted-foreground">{rule.type}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};