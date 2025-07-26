import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  Eye, 
  Settings, 
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BarChart3,
  GitBranch,
  Timer,
  Users,
  Calendar
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AdvancedWorkflowBuilder, WorkflowData } from './AdvancedWorkflowBuilder';

interface WorkflowExecution {
  id: string;
  workflow_id: string;
  status: 'running' | 'completed' | 'failed' | 'paused';
  started_at: string;
  completed_at?: string;
  current_step: string;
  total_steps: number;
  completed_steps: number;
  duration?: number;
  error_message?: string;
  variables: Record<string, any>;
  logs: ExecutionLog[];
}

interface ExecutionLog {
  id: string;
  step_id: string;
  step_name: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  started_at: string;
  completed_at?: string;
  duration?: number;
  input_data?: any;
  output_data?: any;
  error_message?: string;
}

export function WorkflowDashboard() {
  const { toast } = useToast();
  const [workflows, setWorkflows] = useState<WorkflowData[]>([]);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowData | null>(null);
  const [selectedExecution, setSelectedExecution] = useState<WorkflowExecution | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [currentView, setCurrentView] = useState<'list' | 'builder' | 'monitor'>('list');

  useEffect(() => {
    loadWorkflows();
    loadExecutions();
  }, []);

  const loadWorkflows = () => {
    // Carregar workflows salvos (simulação)
    const savedWorkflows = localStorage.getItem('advanced_workflows');
    if (savedWorkflows) {
      setWorkflows(JSON.parse(savedWorkflows));
    } else {
      // Workflows de exemplo
      const exampleWorkflows: WorkflowData[] = [
        {
          id: 'wf_1',
          name: 'Processamento de Notas Fiscais',
          description: 'Workflow completo para processar notas fiscais automaticamente',
          category: 'fiscal',
          steps: [
            {
              id: 'step_1',
              name: 'Receber Documento',
              type: 'trigger',
              description: 'Triggered quando documento é carregado',
              config: { trigger_type: 'document_upload' },
              position: { x: 100, y: 100 },
              connections: ['step_2'],
              enabled: true
            },
            {
              id: 'step_2',
              name: 'Validar Documento',
              type: 'condition',
              description: 'Verificar se é nota fiscal válida',
              config: { condition_type: 'document_validation' },
              position: { x: 100, y: 200 },
              connections: ['step_3'],
              enabled: true
            },
            {
              id: 'step_3',
              name: 'Classificar e Registrar',
              type: 'action',
              description: 'Classificar e registrar no sistema',
              config: { action_type: 'classify_and_register' },
              position: { x: 100, y: 300 },
              connections: [],
              enabled: true
            }
          ],
          variables: {},
          enabled: true,
          schedule: { type: 'event_based', events: ['document_upload'] },
          metadata: {
            version: 1,
            tags: ['fiscal', 'automatico'],
            created_at: new Date().toISOString()
          }
        }
      ];
      setWorkflows(exampleWorkflows);
    }
  };

  const loadExecutions = () => {
    // Carregar execuções (simulação)
    const mockExecutions: WorkflowExecution[] = [
      {
        id: 'exec_1',
        workflow_id: 'wf_1',
        status: 'running',
        started_at: new Date(Date.now() - 300000).toISOString(), // 5 min ago
        current_step: 'step_2',
        total_steps: 3,
        completed_steps: 1,
        variables: { document_id: 'doc_123' },
        logs: [
          {
            id: 'log_1',
            step_id: 'step_1',
            step_name: 'Receber Documento',
            status: 'completed',
            started_at: new Date(Date.now() - 280000).toISOString(),
            completed_at: new Date(Date.now() - 260000).toISOString(),
            duration: 20
          },
          {
            id: 'log_2',
            step_id: 'step_2',
            step_name: 'Validar Documento',
            status: 'running',
            started_at: new Date(Date.now() - 260000).toISOString()
          }
        ]
      }
    ];
    setExecutions(mockExecutions);
  };

  const saveWorkflow = (workflow: WorkflowData) => {
    const newWorkflow = {
      ...workflow,
      id: workflow.id || `wf_${Date.now()}`,
      metadata: {
        ...workflow.metadata,
        created_at: workflow.metadata.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };

    const updatedWorkflows = workflow.id 
      ? workflows.map(w => w.id === workflow.id ? newWorkflow : w)
      : [...workflows, newWorkflow];

    setWorkflows(updatedWorkflows);
    localStorage.setItem('advanced_workflows', JSON.stringify(updatedWorkflows));
    
    setShowBuilder(false);
    setCurrentView('list');
    
    toast({
      title: "Workflow salvo",
      description: "Workflow foi salvo com sucesso!"
    });
  };

  const executeWorkflow = async (workflowId: string) => {
    const workflow = workflows.find(w => w.id === workflowId);
    if (!workflow) return;

    const newExecution: WorkflowExecution = {
      id: `exec_${Date.now()}`,
      workflow_id: workflowId,
      status: 'running',
      started_at: new Date().toISOString(),
      current_step: workflow.steps[0]?.id || '',
      total_steps: workflow.steps.length,
      completed_steps: 0,
      variables: {},
      logs: []
    };

    setExecutions(prev => [newExecution, ...prev]);
    
    toast({
      title: "Workflow iniciado",
      description: `Executando "${workflow.name}"...`
    });

    // Simular execução
    setTimeout(() => {
      setExecutions(prev => prev.map(exec => 
        exec.id === newExecution.id 
          ? { 
              ...exec, 
              status: 'completed',
              completed_at: new Date().toISOString(),
              completed_steps: exec.total_steps,
              duration: 120
            }
          : exec
      ));
      
      toast({
        title: "Workflow concluído",
        description: `"${workflow.name}" executado com sucesso!`
      });
    }, 3000);
  };

  const pauseExecution = (executionId: string) => {
    setExecutions(prev => prev.map(exec => 
      exec.id === executionId ? { ...exec, status: 'paused' as const } : exec
    ));
    
    toast({
      title: "Execução pausada",
      description: "Workflow foi pausado."
    });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      running: 'bg-blue-500',
      completed: 'bg-green-500',
      failed: 'bg-red-500',
      paused: 'bg-yellow-500'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500';
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      running: <Activity className="h-4 w-4" />,
      completed: <CheckCircle className="h-4 w-4" />,
      failed: <XCircle className="h-4 w-4" />,
      paused: <Pause className="h-4 w-4" />
    };
    return icons[status as keyof typeof icons] || <Clock className="h-4 w-4" />;
  };

  if (showBuilder) {
    return (
      <AdvancedWorkflowBuilder
        initialWorkflow={selectedWorkflow || undefined}
        onWorkflowSave={saveWorkflow}
        onCancel={() => {
          setShowBuilder(false);
          setSelectedWorkflow(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-6 w-6" />
                Dashboard de Workflows Avançados
              </CardTitle>
              <CardDescription>
                Gerencie e monitore automações complexas de múltiplas etapas
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentView('monitor')}
              >
                <Activity className="h-4 w-4 mr-1" />
                Monitor
              </Button>
              <Button onClick={() => setShowBuilder(true)}>
                <GitBranch className="h-4 w-4 mr-1" />
                Novo Workflow
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={currentView} onValueChange={setCurrentView as any}>
        <TabsList>
          <TabsTrigger value="list">Workflows</TabsTrigger>
          <TabsTrigger value="monitor">Execuções</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {/* Lista de Workflows */}
          <div className="grid gap-4">
            {workflows.map((workflow) => (
              <Card key={workflow.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{workflow.name}</h3>
                        <Badge variant={workflow.enabled ? 'default' : 'secondary'}>
                          {workflow.enabled ? 'Ativo' : 'Inativo'}
                        </Badge>
                        <Badge variant="outline">{workflow.category}</Badge>
                        <Badge variant="outline">{workflow.steps.length} steps</Badge>
                      </div>
                      <p className="text-sm text-gray-600">{workflow.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(workflow.metadata.created_at!).toLocaleDateString()}
                        </span>
                        <span>v{workflow.metadata.version}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedWorkflow(workflow);
                          setShowBuilder(true);
                        }}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => executeWorkflow(workflow.id!)}
                        disabled={!workflow.enabled}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="monitor" className="space-y-4">
          {/* Monitor de Execuções */}
          <div className="grid gap-4">
            {executions.map((execution) => {
              const workflow = workflows.find(w => w.id === execution.workflow_id);
              return (
                <Card key={execution.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(execution.status)}`} />
                          <h4 className="font-medium">{workflow?.name}</h4>
                          <Badge variant="outline">{execution.status}</Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p>Progresso: {execution.completed_steps}/{execution.total_steps} steps</p>
                          <p>Iniciado: {new Date(execution.started_at).toLocaleString()}</p>
                          {execution.duration && (
                            <p>Duração: {execution.duration}s</p>
                          )}
                        </div>
                        
                        {/* Barra de Progresso */}
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div 
                            className={`h-2 rounded-full ${getStatusColor(execution.status)}`}
                            style={{ 
                              width: `${(execution.completed_steps / execution.total_steps) * 100}%` 
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {execution.status === 'running' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => pauseExecution(execution.id)}
                          >
                            <Pause className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedExecution(execution)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Logs da Execução */}
                    {execution.logs.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <h5 className="font-medium mb-2">Logs de Execução</h5>
                        <div className="space-y-1">
                          {execution.logs.slice(-3).map((log) => (
                            <div key={log.id} className="flex items-center gap-2 text-sm">
                              {getStatusIcon(log.status)}
                              <span>{log.step_name}</span>
                              <Badge variant="outline" className="text-xs">
                                {log.status}
                              </Badge>
                              {log.duration && (
                                <span className="text-gray-500">{log.duration}s</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {executions.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Activity className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">Nenhuma execução encontrada</p>
                <p className="text-sm text-gray-400">
                  Execute um workflow para ver o monitoramento em tempo real
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}