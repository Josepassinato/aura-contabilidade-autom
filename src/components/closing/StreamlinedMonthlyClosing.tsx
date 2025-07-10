import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  FileText, 
  Calculator, 
  Download,
  Play,
  Pause,
  RotateCcw,
  Calendar,
  Users,
  TrendingUp
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ClosingTask {
  id: string;
  name: string;
  description: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked';
  estimated_minutes: number;
  actual_minutes?: number;
  priority: 'high' | 'medium' | 'low';
  category: 'documents' | 'reconciliation' | 'calculation' | 'reports' | 'compliance';
  dependencies?: string[];
  automated?: boolean;
}

interface ClientClosing {
  id: string;
  client_name: string;
  regime: string;
  period: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked';
  progress: number;
  tasks: ClosingTask[];
  deadline: string;
  priority: 'high' | 'medium' | 'low';
}

export const StreamlinedMonthlyClosing = () => {
  const [selectedPeriod, setSelectedPeriod] = useState(new Date().toISOString().substring(0, 7));
  const [selectedClient, setSelectedClient] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('overview');
  const [closings, setClosings] = useState<ClientClosing[]>([]);

  // Mock data
  useEffect(() => {
    const mockClosings: ClientClosing[] = [
      {
        id: '1',
        client_name: 'Empresa ABC Ltda',
        regime: 'Lucro Presumido',
        period: selectedPeriod,
        status: 'in_progress',
        progress: 65,
        deadline: '2024-01-15',
        priority: 'high',
        tasks: [
          {
            id: '1-1',
            name: 'Coleta de Documentos',
            description: 'Recebimento e validação de NFes, extratos bancários',
            status: 'completed',
            estimated_minutes: 30,
            actual_minutes: 25,
            priority: 'high',
            category: 'documents'
          },
          {
            id: '1-2',
            name: 'Conciliação Bancária',
            description: 'Conciliação automática de extratos bancários',
            status: 'in_progress',
            estimated_minutes: 45,
            priority: 'high',
            category: 'reconciliation',
            automated: true
          },
          {
            id: '1-3',
            name: 'Cálculo de Impostos',
            description: 'Apuração de impostos federais, estaduais e municipais',
            status: 'not_started',
            estimated_minutes: 60,
            priority: 'high',
            category: 'calculation',
            dependencies: ['1-2']
          },
          {
            id: '1-4',
            name: 'Geração de Relatórios',
            description: 'DRE, Balanço e relatórios gerenciais',
            status: 'not_started',
            estimated_minutes: 30,
            priority: 'medium',
            category: 'reports',
            dependencies: ['1-3']
          }
        ]
      },
      {
        id: '2',
        client_name: 'Loja XYZ ME',
        regime: 'Simples Nacional',
        period: selectedPeriod,
        status: 'completed',
        progress: 100,
        deadline: '2024-01-20',
        priority: 'medium',
        tasks: [
          {
            id: '2-1',
            name: 'Coleta de Documentos',
            description: 'Documentos do Simples Nacional',
            status: 'completed',
            estimated_minutes: 20,
            actual_minutes: 18,
            priority: 'medium',
            category: 'documents'
          },
          {
            id: '2-2',
            name: 'Apuração DAS',
            description: 'Cálculo e geração do DAS',
            status: 'completed',
            estimated_minutes: 15,
            actual_minutes: 12,
            priority: 'high',
            category: 'calculation',
            automated: true
          }
        ]
      }
    ];
    setClosings(mockClosings);
  }, [selectedPeriod]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'blocked': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'blocked': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'documents': return <FileText className="h-4 w-4" />;
      case 'reconciliation': return <Calculator className="h-4 w-4" />;
      case 'calculation': return <Calculator className="h-4 w-4" />;
      case 'reports': return <TrendingUp className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const totalClosings = closings.length;
  const completedClosings = closings.filter(c => c.status === 'completed').length;
  const inProgressClosings = closings.filter(c => c.status === 'in_progress').length;
  const blockedClosings = closings.filter(c => c.status === 'blocked').length;
  const overallProgress = totalClosings > 0 ? (completedClosings / totalClosings) * 100 : 0;

  const allTasks = closings.flatMap(c => c.tasks);
  const completedTasks = allTasks.filter(t => t.status === 'completed').length;
  const totalTasks = allTasks.length;
  const tasksProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const handleTaskAction = (closingId: string, taskId: string, action: 'start' | 'pause' | 'complete' | 'restart') => {
    setClosings(prev => prev.map(closing => {
      if (closing.id === closingId) {
        const updatedTasks = closing.tasks.map(task => {
          if (task.id === taskId) {
            switch (action) {
              case 'start':
                return { ...task, status: 'in_progress' as const };
              case 'pause':
                return { ...task, status: 'not_started' as const };
              case 'complete':
                return { ...task, status: 'completed' as const, actual_minutes: task.estimated_minutes };
              case 'restart':
                return { ...task, status: 'not_started' as const, actual_minutes: undefined };
              default:
                return task;
            }
          }
          return task;
        });
        
        // Recalcular progresso do fechamento
        const completedTasksCount = updatedTasks.filter(t => t.status === 'completed').length;
        const newProgress = (completedTasksCount / updatedTasks.length) * 100;
        const newStatus = newProgress === 100 ? 'completed' : newProgress > 0 ? 'in_progress' : 'not_started';
        
        return {
          ...closing,
          tasks: updatedTasks,
          progress: newProgress,
          status: newStatus as any
        };
      }
      return closing;
    }));
  };

  const filteredClosings = selectedClient === 'all' 
    ? closings 
    : closings.filter(c => c.id === selectedClient);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fechamento Mensal</h1>
          <p className="text-muted-foreground">
            Gestão simplificada e automatizada do fechamento contábil
          </p>
        </div>
        
        <div className="flex gap-2">
          <input 
            type="month" 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border rounded-md"
          />
          <Select value={selectedClient} onValueChange={setSelectedClient}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Selecionar cliente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os clientes</SelectItem>
              {closings.map(closing => (
                <SelectItem key={closing.id} value={closing.id}>
                  {closing.client_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Fechamentos</p>
                <p className="text-2xl font-bold">{totalClosings}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <Progress value={overallProgress} className="mt-2 h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round(overallProgress)}% concluído
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Em Progresso</p>
                <p className="text-2xl font-bold text-blue-600">{inProgressClosings}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Concluídos</p>
                <p className="text-2xl font-bold text-green-600">{completedClosings}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tarefas</p>
                <p className="text-2xl font-bold">{completedTasks}/{totalTasks}</p>
              </div>
              <Calculator className="h-8 w-8 text-muted-foreground" />
            </div>
            <Progress value={tasksProgress} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Conteúdo Principal */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="detailed">Tarefas Detalhadas</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4">
            {filteredClosings.map((closing) => (
              <Card key={closing.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(closing.status)}`} />
                      <div>
                        <CardTitle className="text-lg">{closing.client_name}</CardTitle>
                        <CardDescription>
                          {closing.regime} • Vence em {closing.deadline}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getPriorityColor(closing.priority)}>
                        {closing.priority}
                      </Badge>
                      <Badge variant="outline">
                        {Math.round(closing.progress)}%
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Progress value={closing.progress} className="h-2" />
                    
                    <div className="grid gap-2">
                      {closing.tasks.map((task) => (
                        <div key={task.id} className="flex items-center justify-between p-2 border rounded-lg">
                          <div className="flex items-center gap-3">
                            {getCategoryIcon(task.category)}
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">{task.name}</span>
                                {task.automated && (
                                  <Badge variant="secondary" className="text-xs">Auto</Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">{task.description}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {getStatusIcon(task.status)}
                            {task.status !== 'completed' && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleTaskAction(closing.id, task.id, 
                                  task.status === 'not_started' ? 'start' : 'complete')}
                              >
                                {task.status === 'not_started' ? (
                                  <>
                                    <Play className="h-3 w-3 mr-1" />
                                    Iniciar
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Concluir
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {closing.status === 'completed' && (
                      <div className="flex gap-2 pt-2 border-t">
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Relatórios
                        </Button>
                        <Button variant="outline" size="sm">
                          <FileText className="h-4 w-4 mr-2" />
                          Documentos
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Detailed Tab */}
        <TabsContent value="detailed">
          <Card>
            <CardHeader>
              <CardTitle>Todas as Tarefas</CardTitle>
              <CardDescription>
                Visão detalhada de todas as tarefas de fechamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredClosings.flatMap(closing => 
                  closing.tasks.map(task => (
                    <div key={`${closing.id}-${task.id}`} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4 flex-1">
                        {getCategoryIcon(task.category)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{task.name}</h4>
                            <Badge variant="outline" className="text-xs">
                              {closing.client_name}
                            </Badge>
                            {task.automated && (
                              <Badge variant="secondary" className="text-xs">Automatizada</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{task.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span>Estimado: {task.estimated_minutes}min</span>
                            {task.actual_minutes && (
                              <span>Real: {task.actual_minutes}min</span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {getStatusIcon(task.status)}
                        <div className="flex gap-1">
                          {task.status === 'not_started' && (
                            <Button 
                              size="sm" 
                              onClick={() => handleTaskAction(closing.id, task.id, 'start')}
                            >
                              <Play className="h-3 w-3 mr-1" />
                              Iniciar
                            </Button>
                          )}
                          {task.status === 'in_progress' && (
                            <>
                              <Button 
                                size="sm" 
                                onClick={() => handleTaskAction(closing.id, task.id, 'complete')}
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Concluir
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleTaskAction(closing.id, task.id, 'pause')}
                              >
                                <Pause className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                          {task.status === 'completed' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleTaskAction(closing.id, task.id, 'restart')}
                            >
                              <RotateCcw className="h-3 w-3 mr-1" />
                              Refazer
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};