import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { useTaskAutomation } from '@/hooks/useTaskAutomation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { AutomationRuleBuilder } from '@/components/automation/AutomationRuleBuilder';
import AutomationMonitoringDashboard from '@/components/automation/AutomationMonitoringDashboard';
import AutomationScheduler from '@/components/automation/AutomationScheduler';
import RealTimeMonitoringDashboard from '@/components/monitoring/RealTimeMonitoringDashboard';
import { 
  Bot, 
  Play, 
  Pause, 
  Activity, 
  Clock, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  RotateCcw,
  Plus,
  Zap,
  Calendar,
  Database,
  Mail,
  FileText,
  BarChart3,
  Cog
} from 'lucide-react';

const TaskAutomationEngine = () => {
  const { 
    rules, 
    metrics, 
    isLoading, 
    executeRule, 
    toggleRule, 
    createRule, 
    deleteRule,
    loadAutomationData 
  } = useTaskAutomation();

  const [newRule, setNewRule] = useState({
    name: '',
    description: '',
    type: 'scheduled',
    trigger_type: 'time',
    trigger_conditions: { schedule: '0 2 * * *' },
    actions: [{ type: 'daily_accounting', config: {} }],
    enabled: true
  });

  const handleCreateRule = async () => {
    try {
      if (!newRule.name || !newRule.description) {
        return;
      }

      await createRule(newRule);
      
      // Reset form
      setNewRule({
        name: '',
        description: '',
        type: 'scheduled',
        trigger_type: 'time',
        trigger_conditions: { schedule: '0 2 * * *' },
        actions: [{ type: 'daily_accounting', config: {} }],
        enabled: true
      });
    } catch (error) {
      console.error('Error creating rule:', error);
    }
  };

  const getStatusBadge = (enabled: boolean, successCount: number, errorCount: number) => {
    if (!enabled) {
      return <Badge variant="outline">Inativo</Badge>;
    }
    
    const errorRate = (errorCount / Math.max(successCount + errorCount, 1)) * 100;
    
    if (errorRate > 20) {
      return <Badge variant="destructive">Com Problemas</Badge>;
    } else if (errorRate > 10) {
      return <Badge variant="secondary">Atenção</Badge>;
    } else {
      return <Badge variant="default">Ativo</Badge>;
    }
  };

  const getProcessTypeIcon = (type: string) => {
    switch (type) {
      case 'daily_accounting': return <BarChart3 className="h-4 w-4" />;
      case 'monthly_reports': return <FileText className="h-4 w-4" />;
      case 'data_backup': return <Database className="h-4 w-4" />;
      case 'send_emails': return <Mail className="h-4 w-4" />;
      default: return <Cog className="h-4 w-4" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Bot className="h-8 w-8 text-primary" />
              Task Automation Engine
            </h1>
            <p className="text-muted-foreground">
              Configure e monitore tarefas automatizadas para otimizar seus processos
            </p>
          </div>
          <Button onClick={loadAutomationData} disabled={isLoading}>
            <RotateCcw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>

        {/* Metrics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Execuções Totais</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalExecutions}</div>
              <p className="text-xs text-muted-foreground">Últimas 7 dias</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sucessos</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{metrics.successfulExecutions}</div>
              <p className="text-xs text-muted-foreground">Bem-sucedidas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Falhas</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{metrics.failedExecutions}</div>
              <p className="text-xs text-muted-foreground">Com erro</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Regras Ativas</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{metrics.activeRules}</div>
              <p className="text-xs text-muted-foreground">Em funcionamento</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.averageExecutionTime}s</div>
              <p className="text-xs text-muted-foreground">Por execução</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Com Problemas</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{metrics.rulesWithErrors}</div>
              <p className="text-xs text-muted-foreground">Precisam atenção</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="rules" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="rules">Regras</TabsTrigger>
            <TabsTrigger value="create">Criar Regra</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoramento</TabsTrigger>
            <TabsTrigger value="realtime">Tempo Real</TabsTrigger>
            <TabsTrigger value="scheduler">Agendador</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="rules" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Regras Configuradas</CardTitle>
                <CardDescription>
                  Gerencie suas regras de automação e monitore sua performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Última Execução</TableHead>
                      <TableHead>Sucessos/Erros</TableHead>
                      <TableHead>Taxa de Sucesso</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rules.map((rule) => {
                      const successRate = ((rule.success_count / Math.max(rule.success_count + rule.error_count, 1)) * 100);
                      const firstAction = rule.actions?.[0];
                      const actionType = firstAction?.type || 'unknown';
                      
                      return (
                        <TableRow key={rule.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium flex items-center gap-2">
                                {getProcessTypeIcon(actionType)}
                                {rule.name}
                              </div>
                              <div className="text-sm text-muted-foreground">{rule.description}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{rule.type}</Badge>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(rule.enabled, rule.success_count, rule.error_count)}
                          </TableCell>
                          <TableCell>
                            {rule.last_run 
                              ? new Date(rule.last_run).toLocaleString('pt-BR')
                              : 'Nunca executada'
                            }
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <span className="text-green-600">{rule.success_count}</span>
                              {' / '}
                              <span className="text-red-600">{rule.error_count}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={successRate} className="w-16" />
                              <span className="text-sm">{successRate.toFixed(0)}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={rule.enabled}
                                onCheckedChange={(enabled) => toggleRule(rule.id, enabled)}
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => executeRule(rule.id)}
                                disabled={!rule.enabled}
                              >
                                <Play className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="create" className="space-y-4">
            <AutomationRuleBuilder
              onRuleCreate={async (ruleData) => {
                try {
                  await createRule(ruleData);
                  // Reset to rules tab after successful creation
                  const tabsTrigger = document.querySelector('[value="rules"]') as HTMLElement;
                  if (tabsTrigger) tabsTrigger.click();
                } catch (error) {
                  console.error('Error creating rule:', error);
                }
              }}
            />
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-4">
            <AutomationMonitoringDashboard />
          </TabsContent>

          <TabsContent value="realtime" className="space-y-4">
            <RealTimeMonitoringDashboard />
          </TabsContent>

          <TabsContent value="scheduler" className="space-y-4">
            <AutomationScheduler />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Performance das Regras</CardTitle>
                  <CardDescription>
                    Acompanhe a performance de cada regra ao longo do tempo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {rules.slice(0, 5).map((rule) => {
                      const successRate = ((rule.success_count / Math.max(rule.success_count + rule.error_count, 1)) * 100);
                      const firstAction = rule.actions?.[0];
                      const actionType = firstAction?.type || 'unknown';
                      
                      return (
                        <div key={rule.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getProcessTypeIcon(actionType)}
                            <span className="font-medium">{rule.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress value={successRate} className="w-16" />
                            <span className="text-sm text-muted-foreground">
                              {successRate.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Atividade Recente</CardTitle>
                  <CardDescription>
                    Últimas execuções de regras automatizadas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {rules
                      .filter(rule => rule.last_run)
                      .sort((a, b) => new Date(b.last_run!).getTime() - new Date(a.last_run!).getTime())
                      .slice(0, 5)
                      .map((rule) => (
                        <div key={rule.id} className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{rule.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(rule.last_run!).toLocaleString('pt-BR')}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {rule.enabled ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <Pause className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default TaskAutomationEngine;