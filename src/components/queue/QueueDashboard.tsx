import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useLoadingState } from '@/hooks/useLoadingState';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Activity, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Server,
  Plus
} from 'lucide-react';

interface QueueStats {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  totalWorkers: number;
  activeWorkers: number;
}

interface QueueTask {
  id: string;
  process_type: string;
  status: string;
  priority: number;
  created_at: string;
  scheduled_at: string;
  started_at?: string;
  completed_at?: string;
  retry_count: number;
  max_retries: number;
  worker_id?: string;
  client_id: string;
  parameters: any;
  error_details?: any;
}

interface Worker {
  id: string;
  worker_id: string;
  status: string;
  current_task_count: number;
  max_concurrent_tasks: number;
  last_heartbeat: string;
  metadata: any;
}

export function QueueDashboard() {
  const [stats, setStats] = useState<QueueStats>({
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
    totalWorkers: 0,
    activeWorkers: 0
  });
  const [tasks, setTasks] = useState<QueueTask[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [newTaskType, setNewTaskType] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('5');
  const [newTaskClientId, setNewTaskClientId] = useState('');
  
  const { setLoading, isLoading } = useLoadingState();
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Atualizar a cada 30s
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    setLoading('dashboard', true);
    try {
      await Promise.all([
        loadQueueStats(),
        loadTasks(),
        loadWorkers()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar dados do dashboard",
        variant: "destructive"
      });
    } finally {
      setLoading('dashboard', false);
    }
  };

  const loadQueueStats = async () => {
    const { data: queueData } = await supabase
      .from('processing_queue')
      .select('status');

    const { data: workerData } = await supabase
      .from('worker_instances')
      .select('status');

    const queueCounts = queueData?.reduce((acc: any, item: any) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {}) || {};

    const workerCounts = workerData?.reduce((acc: any, worker: any) => {
      acc.total++;
      if (worker.status === 'busy' || worker.status === 'idle') {
        acc.active++;
      }
      return acc;
    }, { total: 0, active: 0 }) || { total: 0, active: 0 };

    setStats({
      pending: queueCounts.pending || 0,
      processing: queueCounts.processing || 0,
      completed: queueCounts.completed || 0,
      failed: queueCounts.failed || 0,
      totalWorkers: workerCounts.total,
      activeWorkers: workerCounts.active
    });
  };

  const loadTasks = async () => {
    const { data } = await supabase
      .from('processing_queue')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    setTasks(data || []);
  };

  const loadWorkers = async () => {
    const { data } = await supabase
      .from('worker_instances')
      .select('*')
      .order('last_heartbeat', { ascending: false });

    setWorkers(data || []);
  };

  const addTask = async () => {
    if (!newTaskType || !newTaskClientId) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    setLoading('addTask', true);
    try {
      const { data, error } = await supabase.functions.invoke('queue-processor', {
        body: {
          action: 'add_task',
          processType: newTaskType,
          clientId: newTaskClientId,
          priority: parseInt(newTaskPriority),
          parameters: {
            manual: true,
            created_by: 'dashboard'
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Tarefa adicionada à fila com sucesso"
      });

      setNewTaskType('');
      setNewTaskClientId('');
      setNewTaskPriority('5');
      
      await loadDashboardData();
    } catch (error) {
      console.error('Erro ao adicionar tarefa:', error);
      toast({
        title: "Erro",
        description: "Falha ao adicionar tarefa",
        variant: "destructive"
      });
    } finally {
      setLoading('addTask', false);
    }
  };

  const retryTask = async (taskId: string) => {
    setLoading(`retry-${taskId}`, true);
    try {
      const { error } = await supabase
        .from('processing_queue')
        .update({
          status: 'pending',
          retry_count: 0,
          started_at: null,
          completed_at: null,
          error_details: null,
          worker_id: null,
          scheduled_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Tarefa reagendada com sucesso"
      });

      await loadDashboardData();
    } catch (error) {
      console.error('Erro ao reagendar tarefa:', error);
      toast({
        title: "Erro",
        description: "Falha ao reagendar tarefa",
        variant: "destructive"
      });
    } finally {
      setLoading(`retry-${taskId}`, false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'outline',
      processing: 'default',
      completed: 'secondary',
      failed: 'destructive'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status}
      </Badge>
    );
  };

  const getWorkerStatusBadge = (status: string) => {
    const variants = {
      idle: 'outline',
      busy: 'default',
      offline: 'destructive'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status}
      </Badge>
    );
  };

  if (isLoading('dashboard')) {
    return <LoadingSpinner size="lg" text="Carregando dashboard..." />;
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tarefas Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Na fila de processamento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Processamento</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.processing}</div>
            <p className="text-xs text-muted-foreground">Sendo executadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">Com sucesso</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Workers Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeWorkers}</div>
            <p className="text-xs text-muted-foreground">de {stats.totalWorkers} total</p>
            <Progress 
              value={stats.totalWorkers > 0 ? (stats.activeWorkers / stats.totalWorkers) * 100 : 0} 
              className="mt-2"
            />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tasks">Tarefas</TabsTrigger>
          <TabsTrigger value="workers">Workers</TabsTrigger>
          <TabsTrigger value="add-task">Adicionar Tarefa</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fila de Processamento</CardTitle>
              <CardDescription>
                Lista de todas as tarefas na fila de processamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Prioridade</TableHead>
                    <TableHead>Criada em</TableHead>
                    <TableHead>Worker</TableHead>
                    <TableHead>Tentativas</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">{task.process_type}</TableCell>
                      <TableCell>{getStatusBadge(task.status)}</TableCell>
                      <TableCell>{task.priority}</TableCell>
                      <TableCell>
                        {new Date(task.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>{task.worker_id || '-'}</TableCell>
                      <TableCell>{task.retry_count}/{task.max_retries}</TableCell>
                      <TableCell>
                        {task.status === 'failed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => retryTask(task.id)}
                            disabled={isLoading(`retry-${task.id}`)}
                          >
                            <RotateCcw className="h-3 w-3 mr-1" />
                            Retry
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workers Registrados</CardTitle>
              <CardDescription>
                Lista de todos os workers disponíveis no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Worker ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tarefas Atuais</TableHead>
                    <TableHead>Capacidade</TableHead>
                    <TableHead>Último Heartbeat</TableHead>
                    <TableHead>Utilização</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workers.map((worker) => (
                    <TableRow key={worker.id}>
                      <TableCell className="font-medium">{worker.worker_id}</TableCell>
                      <TableCell>{getWorkerStatusBadge(worker.status)}</TableCell>
                      <TableCell>{worker.current_task_count}</TableCell>
                      <TableCell>{worker.max_concurrent_tasks}</TableCell>
                      <TableCell>
                        {new Date(worker.last_heartbeat).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Progress 
                            value={(worker.current_task_count / worker.max_concurrent_tasks) * 100} 
                            className="w-16"
                          />
                          <span className="text-sm">
                            {Math.round((worker.current_task_count / worker.max_concurrent_tasks) * 100)}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add-task" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Adicionar Nova Tarefa</CardTitle>
              <CardDescription>
                Adicione uma nova tarefa à fila de processamento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tipo de Processo</label>
                  <Select value={newTaskType} onValueChange={setNewTaskType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="generate_report">Gerar Relatório</SelectItem>
                      <SelectItem value="send_scheduled_emails">Enviar Emails</SelectItem>
                      <SelectItem value="data_analysis">Análise de Dados</SelectItem>
                      <SelectItem value="cleanup_old_data">Limpeza de Dados</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Prioridade</label>
                  <Select value={newTaskPriority} onValueChange={setNewTaskPriority}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - Muito Alta</SelectItem>
                      <SelectItem value="3">3 - Alta</SelectItem>
                      <SelectItem value="5">5 - Normal</SelectItem>
                      <SelectItem value="7">7 - Baixa</SelectItem>
                      <SelectItem value="9">9 - Muito Baixa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Client ID</label>
                <Input
                  value={newTaskClientId}
                  onChange={(e) => setNewTaskClientId(e.target.value)}
                  placeholder="ID do cliente (UUID)"
                />
              </div>

              <Button 
                onClick={addTask}
                disabled={isLoading('addTask')}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Tarefa
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}