import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { 
  Bot, 
  Settings, 
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
  Users,
  Cog
} from 'lucide-react';

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  type: string;
  trigger: string;
  conditions: any;
  actions: any;
  enabled: boolean;
  last_run?: string;
  success_count: number;
  error_count: number;
  created_at: string;
}

interface TaskMetrics {
  totalTasks: number;
  runningTasks: number;
  completedToday: number;
  errorRate: number;
  avgExecutionTime: number;
  successRate: number;
}

const TaskAutomationEngine = () => {
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([]);
  const [metrics, setMetrics] = useState<TaskMetrics>({
    totalTasks: 0,
    runningTasks: 0,
    completedToday: 0,
    errorRate: 0,
    avgExecutionTime: 0,
    successRate: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [newRule, setNewRule] = useState({
    name: '',
    description: '',
    type: 'scheduled',
    trigger: 'time',
    schedule: '0 2 * * *', // Daily at 2 AM
    conditions: {},
    actions: {}
  });
  const { toast } = useToast();

  useEffect(() => {
    loadAutomationData();
    const interval = setInterval(loadAutomationData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const loadAutomationData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([
        loadAutomationRules(),
        loadMetrics()
      ]);
    } catch (error) {
      console.error('Error loading automation data:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar dados de automação",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadAutomationRules = async () => {
    // For now, we'll simulate automation rules since we don't have the table yet
    // In a real implementation, this would query a automation_rules table
    const mockRules: AutomationRule[] = [
      {
        id: '1',
        name: 'Processamento Contábil Diário',
        description: 'Processa automaticamente todos os lançamentos contábeis pendentes',
        type: 'scheduled',
        trigger: 'time',
        conditions: { schedule: '0 2 * * *' },
        actions: { process_type: 'daily_accounting' },
        enabled: true,
        last_run: new Date(Date.now() - 86400000).toISOString(),
        success_count: 45,
        error_count: 2,
        created_at: new Date(Date.now() - 7 * 86400000).toISOString()
      },
      {
        id: '2',
        name: 'Geração de Relatórios Mensais',
        description: 'Gera relatórios financeiros automaticamente no último dia do mês',
        type: 'scheduled',
        trigger: 'time',
        conditions: { schedule: '0 23 L * *' },
        actions: { process_type: 'monthly_reports' },
        enabled: true,
        last_run: new Date(Date.now() - 30 * 86400000).toISOString(),
        success_count: 12,
        error_count: 0,
        created_at: new Date(Date.now() - 30 * 86400000).toISOString()
      },
      {
        id: '3',
        name: 'Backup de Dados',
        description: 'Realiza backup automático dos dados críticos',
        type: 'scheduled',
        trigger: 'time',
        conditions: { schedule: '0 0 * * 0' },
        actions: { process_type: 'data_backup' },
        enabled: true,
        last_run: new Date(Date.now() - 7 * 86400000).toISOString(),
        success_count: 15,
        error_count: 1,
        created_at: new Date(Date.now() - 60 * 86400000).toISOString()
      }
    ];
    setAutomationRules(mockRules);
  };

  const loadMetrics = async () => {
    try {
      // Load queue statistics
      const { data: queueData } = await supabase
        .from('processing_queue')
        .select('status, created_at, started_at, completed_at');

      // Load automation logs
      const { data: logsData } = await supabase
        .from('automation_logs')
        .select('*')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      const today = new Date().toDateString();
      const todayTasks = logsData?.filter(log => 
        new Date(log.created_at).toDateString() === today
      ) || [];

      const completedTasks = logsData?.filter(log => log.status === 'completed') || [];
      const totalTasks = logsData?.length || 0;
      const runningTasks = queueData?.filter(task => task.status === 'processing').length || 0;

      const avgExecutionTime = completedTasks.reduce((sum, log) => 
        sum + (log.duration_seconds || 0), 0
      ) / Math.max(completedTasks.length, 1);

      setMetrics({
        totalTasks,
        runningTasks,
        completedToday: todayTasks.length,
        errorRate: totalTasks > 0 ? ((totalTasks - completedTasks.length) / totalTasks) * 100 : 0,
        avgExecutionTime: Math.round(avgExecutionTime),
        successRate: totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 100
      });
    } catch (error) {
      console.error('Error loading metrics:', error);
    }
  };

  const toggleRule = async (ruleId: string, enabled: boolean) => {
    try {
      // Update rule status
      setAutomationRules(prev => 
        prev.map(rule => 
          rule.id === ruleId ? { ...rule, enabled } : rule
        )
      );

      toast({
        title: enabled ? "Regra Ativada" : "Regra Desativada",
        description: `A regra de automação foi ${enabled ? 'ativada' : 'desativada'} com sucesso.`
      });
    } catch (error) {
      console.error('Error toggling rule:', error);
      toast({
        title: "Erro",
        description: "Falha ao alterar status da regra",
        variant: "destructive"
      });
    }
  };

  const executeRule = async (ruleId: string) => {
    try {
      const rule = automationRules.find(r => r.id === ruleId);
      if (!rule) return;

      // Add task to queue
      const { error } = await supabase.functions.invoke('queue-processor', {
        body: {
          action: 'add_task',
          processType: rule.actions.process_type,
          clientId: 'system', // System-level task
          priority: 1,
          parameters: {
            automated: true,
            rule_id: ruleId,
            rule_name: rule.name
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Regra Executada",
        description: `A regra "${rule.name}" foi adicionada à fila de execução.`
      });

      await loadAutomationData();
    } catch (error) {
      console.error('Error executing rule:', error);
      toast({
        title: "Erro",
        description: "Falha ao executar regra",
        variant: "destructive"
      });
    }
  };

  const createRule = async () => {
    try {
      if (!newRule.name || !newRule.description) {
        toast({
          title: "Erro",
          description: "Preencha todos os campos obrigatórios",
          variant: "destructive"
        });
        return;
      }

      // In a real implementation, this would save to a database
      const rule: AutomationRule = {
        id: Date.now().toString(),
        name: newRule.name,
        description: newRule.description,
        type: newRule.type,
        trigger: newRule.trigger,
        conditions: { schedule: newRule.schedule },
        actions: newRule.actions,
        enabled: true,
        success_count: 0,
        error_count: 0,
        created_at: new Date().toISOString()
      };

      setAutomationRules(prev => [...prev, rule]);
      setNewRule({
        name: '',
        description: '',
        type: 'scheduled',
        trigger: 'time',
        schedule: '0 2 * * *',
        conditions: {},
        actions: {}
      });

      toast({
        title: "Regra Criada",
        description: "Nova regra de automação criada com sucesso."
      });
    } catch (error) {
      console.error('Error creating rule:', error);
      toast({
        title: "Erro",
        description: "Falha ao criar regra",
        variant: "destructive"
      });
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
              <CardTitle className="text-sm font-medium">Tarefas Totais</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalTasks}</div>
              <p className="text-xs text-muted-foreground">Últimas 24h</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Em Execução</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{metrics.runningTasks}</div>
              <p className="text-xs text-muted-foreground">Processando agora</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hoje</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{metrics.completedToday}</div>
              <p className="text-xs text-muted-foreground">Completadas hoje</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{metrics.successRate.toFixed(1)}%</div>
              <Progress value={metrics.successRate} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.avgExecutionTime}s</div>
              <p className="text-xs text-muted-foreground">Por execução</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Erro</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{metrics.errorRate.toFixed(1)}%</div>
              <Progress value={metrics.errorRate} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="rules" className="space-y-4">
          <TabsList>
            <TabsTrigger value="rules">Regras de Automação</TabsTrigger>
            <TabsTrigger value="create">Criar Regra</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoramento</TabsTrigger>
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
                    {automationRules.map((rule) => {
                      const successRate = ((rule.success_count / Math.max(rule.success_count + rule.error_count, 1)) * 100);
                      
                      return (
                        <TableRow key={rule.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium flex items-center gap-2">
                                {getProcessTypeIcon(rule.actions.process_type)}
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
            <Card>
              <CardHeader>
                <CardTitle>Criar Nova Regra</CardTitle>
                <CardDescription>
                  Configure uma nova regra de automação para seus processos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rule-name">Nome da Regra</Label>
                    <Input
                      id="rule-name"
                      value={newRule.name}
                      onChange={(e) => setNewRule(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: Processamento Contábil Diário"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rule-type">Tipo de Trigger</Label>
                    <Select 
                      value={newRule.trigger} 
                      onValueChange={(value) => setNewRule(prev => ({ ...prev, trigger: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="time">Baseado em Tempo</SelectItem>
                        <SelectItem value="event">Baseado em Evento</SelectItem>
                        <SelectItem value="condition">Baseado em Condição</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rule-description">Descrição</Label>
                  <Textarea
                    id="rule-description"
                    value={newRule.description}
                    onChange={(e) => setNewRule(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descreva o que esta regra fará..."
                  />
                </div>

                {newRule.trigger === 'time' && (
                  <div className="space-y-2">
                    <Label htmlFor="schedule">Agendamento (Cron)</Label>
                    <Input
                      id="schedule"
                      value={newRule.schedule}
                      onChange={(e) => setNewRule(prev => ({ ...prev, schedule: e.target.value }))}
                      placeholder="0 2 * * * (Diário às 2:00)"
                    />
                    <p className="text-sm text-muted-foreground">
                      Use formato cron: minuto hora dia mês dia-da-semana
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Tipo de Processo</Label>
                  <Select 
                    onValueChange={(value) => setNewRule(prev => ({ 
                      ...prev, 
                      actions: { process_type: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de processo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily_accounting">Processamento Contábil Diário</SelectItem>
                      <SelectItem value="monthly_reports">Relatórios Mensais</SelectItem>
                      <SelectItem value="data_backup">Backup de Dados</SelectItem>
                      <SelectItem value="send_emails">Envio de Emails</SelectItem>
                      <SelectItem value="data_cleanup">Limpeza de Dados</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={createRule} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Regra
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-4">
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
                    {automationRules.slice(0, 5).map((rule) => {
                      const successRate = ((rule.success_count / Math.max(rule.success_count + rule.error_count, 1)) * 100);
                      
                      return (
                        <div key={rule.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getProcessTypeIcon(rule.actions.process_type)}
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
                    {automationRules
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