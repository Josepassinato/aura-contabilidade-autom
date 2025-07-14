import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Clock, FileUp, Database, Calendar, Zap } from 'lucide-react';

interface TriggerBuilderProps {
  triggerType: string;
  triggerConditions: any;
  onChange: (triggerType: string, triggerConditions: any) => void;
}

export const TriggerBuilder: React.FC<TriggerBuilderProps> = ({
  triggerType,
  triggerConditions,
  onChange
}) => {
  const triggerTypes = [
    {
      id: 'scheduled',
      name: 'Agendado',
      description: 'Executa em horários específicos',
      icon: Clock
    },
    {
      id: 'document_received',
      name: 'Documento Recebido',
      description: 'Ativa quando documentos são enviados',
      icon: FileUp
    },
    {
      id: 'condition_met',
      name: 'Condição Atendida',
      description: 'Executa quando condições são verdadeiras',
      icon: Database
    },
    {
      id: 'manual',
      name: 'Manual',
      description: 'Execução apenas manual',
      icon: Zap
    }
  ];

  const updateConditions = (updates: any) => {
    onChange(triggerType, { ...triggerConditions, ...updates });
  };

  const renderTriggerConfig = () => {
    switch (triggerType) {
      case 'scheduled':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de Agendamento</Label>
              <Select 
                value={triggerConditions.scheduleType || 'cron'}
                onValueChange={(value) => updateConditions({ scheduleType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cron">Expressão Cron Personalizada</SelectItem>
                  <SelectItem value="daily">Diário</SelectItem>
                  <SelectItem value="weekly">Semanal</SelectItem>
                  <SelectItem value="monthly">Mensal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {triggerConditions.scheduleType === 'cron' && (
              <div className="space-y-2">
                <Label htmlFor="cron-schedule">Expressão Cron</Label>
                <Input
                  id="cron-schedule"
                  value={triggerConditions.schedule || ''}
                  onChange={(e) => updateConditions({ schedule: e.target.value })}
                  placeholder="0 2 * * * (Diário às 2:00)"
                />
                <p className="text-sm text-muted-foreground">
                  Formato: minuto hora dia mês dia-da-semana
                </p>
              </div>
            )}

            {triggerConditions.scheduleType === 'daily' && (
              <div className="space-y-2">
                <Label htmlFor="daily-time">Horário</Label>
                <Input
                  id="daily-time"
                  type="time"
                  value={triggerConditions.time || '02:00'}
                  onChange={(e) => updateConditions({ time: e.target.value })}
                />
              </div>
            )}

            {triggerConditions.scheduleType === 'weekly' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Dia da Semana</Label>
                  <Select 
                    value={triggerConditions.dayOfWeek || '1'}
                    onValueChange={(value) => updateConditions({ dayOfWeek: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Segunda-feira</SelectItem>
                      <SelectItem value="2">Terça-feira</SelectItem>
                      <SelectItem value="3">Quarta-feira</SelectItem>
                      <SelectItem value="4">Quinta-feira</SelectItem>
                      <SelectItem value="5">Sexta-feira</SelectItem>
                      <SelectItem value="6">Sábado</SelectItem>
                      <SelectItem value="0">Domingo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weekly-time">Horário</Label>
                  <Input
                    id="weekly-time"
                    type="time"
                    value={triggerConditions.time || '02:00'}
                    onChange={(e) => updateConditions({ time: e.target.value })}
                  />
                </div>
              </div>
            )}

            {triggerConditions.scheduleType === 'monthly' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="day-of-month">Dia do Mês</Label>
                  <Input
                    id="day-of-month"
                    type="number"
                    min="1"
                    max="31"
                    value={triggerConditions.dayOfMonth || '1'}
                    onChange={(e) => updateConditions({ dayOfMonth: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monthly-time">Horário</Label>
                  <Input
                    id="monthly-time"
                    type="time"
                    value={triggerConditions.time || '02:00'}
                    onChange={(e) => updateConditions({ time: e.target.value })}
                  />
                </div>
              </div>
            )}
          </div>
        );

      case 'document_received':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tipos de Documento</Label>
              <div className="flex flex-wrap gap-2">
                {['NFe', 'NFSe', 'Extrato', 'Boleto', 'Contrato'].map((docType) => (
                  <Badge
                    key={docType}
                    variant={
                      triggerConditions.documentTypes?.includes(docType) 
                        ? 'default' 
                        : 'outline'
                    }
                    className="cursor-pointer"
                    onClick={() => {
                      const current = triggerConditions.documentTypes || [];
                      const updated = current.includes(docType)
                        ? current.filter((t: string) => t !== docType)
                        : [...current, docType];
                      updateConditions({ documentTypes: updated });
                    }}
                  >
                    {docType}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="file-patterns">Padrões de Arquivo (opcional)</Label>
              <Input
                id="file-patterns"
                value={triggerConditions.filePatterns || ''}
                onChange={(e) => updateConditions({ filePatterns: e.target.value })}
                placeholder="*.xml, *.pdf"
              />
              <p className="text-sm text-muted-foreground">
                Use vírgulas para separar múltiplos padrões
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="min-file-size">Tamanho Mínimo (KB)</Label>
              <Input
                id="min-file-size"
                type="number"
                value={triggerConditions.minFileSize || ''}
                onChange={(e) => updateConditions({ minFileSize: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>
          </div>
        );

      case 'condition_met':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de Condição</Label>
              <Select 
                value={triggerConditions.conditionType || 'data_threshold'}
                onValueChange={(value) => updateConditions({ conditionType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="data_threshold">Limite de Dados</SelectItem>
                  <SelectItem value="time_period">Período de Tempo</SelectItem>
                  <SelectItem value="custom_query">Consulta Personalizada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {triggerConditions.conditionType === 'data_threshold' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="table-name">Tabela</Label>
                  <Select 
                    value={triggerConditions.tableName || ''}
                    onValueChange={(value) => updateConditions({ tableName: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma tabela" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="client_documents">Documentos de Clientes</SelectItem>
                      <SelectItem value="lancamentos_contabeis">Lançamentos Contábeis</SelectItem>
                      <SelectItem value="balancetes">Balancetes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="threshold-value">Valor Limite</Label>
                  <Input
                    id="threshold-value"
                    type="number"
                    value={triggerConditions.thresholdValue || ''}
                    onChange={(e) => updateConditions({ thresholdValue: parseInt(e.target.value) || 0 })}
                    placeholder="100"
                  />
                </div>
              </div>
            )}

            {triggerConditions.conditionType === 'custom_query' && (
              <div className="space-y-2">
                <Label htmlFor="custom-condition">Condição SQL</Label>
                <Textarea
                  id="custom-condition"
                  value={triggerConditions.customCondition || ''}
                  onChange={(e) => updateConditions({ customCondition: e.target.value })}
                  placeholder="SELECT COUNT(*) FROM table WHERE condition > value"
                  rows={4}
                />
                <p className="text-sm text-muted-foreground">
                  A consulta deve retornar um valor numérico maior que 0 para ativar
                </p>
              </div>
            )}
          </div>
        );

      case 'manual':
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Esta regra será executada apenas manualmente através da interface ou API.
            </p>
            <div className="space-y-2">
              <Label htmlFor="manual-description">Instruções para Execução</Label>
              <Textarea
                id="manual-description"
                value={triggerConditions.instructions || ''}
                onChange={(e) => updateConditions({ instructions: e.target.value })}
                placeholder="Descreva quando e como esta regra deve ser executada..."
                rows={3}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Trigger Type Selection */}
      <div>
        <Label className="text-base font-medium mb-4 block">Tipo de Trigger</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {triggerTypes.map((type) => {
            const Icon = type.icon;
            return (
              <Card
                key={type.id}
                className={`cursor-pointer transition-colors ${
                  triggerType === type.id 
                    ? 'border-primary bg-primary/5' 
                    : 'hover:border-primary/50'
                }`}
                onClick={() => onChange(type.id, {})}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Icon className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium">{type.name}</h4>
                      <p className="text-sm text-muted-foreground">{type.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Trigger Configuration */}
      {triggerType && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Configuração do Trigger
            </CardTitle>
            <CardDescription>
              Configure os parâmetros específicos para o tipo de trigger selecionado
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderTriggerConfig()}
          </CardContent>
        </Card>
      )}
    </div>
  );
};