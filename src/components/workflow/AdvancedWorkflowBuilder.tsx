import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  Plus, 
  Trash2, 
  Play, 
  Pause, 
  Save, 
  Eye, 
  ArrowRight, 
  ArrowDown,
  Clock,
  FileText,
  Database,
  Mail,
  AlertTriangle,
  CheckCircle,
  Settings,
  GitBranch,
  Timer,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'trigger' | 'condition' | 'action' | 'delay' | 'branch';
  description: string;
  config: any;
  position: { x: number; y: number };
  connections: string[]; // IDs dos próximos steps
  enabled: boolean;
  timeout?: number; // em segundos
  retry_count?: number;
  on_error?: 'stop' | 'continue' | 'retry' | 'goto_step';
  error_step_id?: string;
}

export interface WorkflowData {
  id?: string;
  name: string;
  description: string;
  category: string;
  steps: WorkflowStep[];
  variables: Record<string, any>;
  enabled: boolean;
  schedule?: {
    type: 'manual' | 'scheduled' | 'event_based';
    cron?: string;
    events?: string[];
  };
  metadata: {
    created_at?: string;
    updated_at?: string;
    version: number;
    tags: string[];
  };
}

interface AdvancedWorkflowBuilderProps {
  onWorkflowSave?: (workflow: WorkflowData) => void;
  onCancel?: () => void;
  initialWorkflow?: WorkflowData;
}

export function AdvancedWorkflowBuilder({ 
  onWorkflowSave, 
  onCancel, 
  initialWorkflow 
}: AdvancedWorkflowBuilderProps) {
  const { toast } = useToast();
  const [workflow, setWorkflow] = useState<WorkflowData>(
    initialWorkflow || {
      name: '',
      description: '',
      category: 'contabil',
      steps: [],
      variables: {},
      enabled: true,
      schedule: { type: 'manual' },
      metadata: {
        version: 1,
        tags: []
      }
    }
  );

  const [selectedStep, setSelectedStep] = useState<WorkflowStep | null>(null);
  const [currentView, setCurrentView] = useState<'builder' | 'config' | 'preview'>('builder');
  const [isSimulating, setIsSimulating] = useState(false);

  // Adicionar novo step
  const addStep = useCallback((type: WorkflowStep['type']) => {
    const newStep: WorkflowStep = {
      id: `step_${Date.now()}`,
      name: `${getStepTypeName(type)} ${workflow.steps.length + 1}`,
      type,
      description: '',
      config: getDefaultStepConfig(type),
      position: { x: 100, y: workflow.steps.length * 120 + 100 },
      connections: [],
      enabled: true,
      timeout: 300, // 5 minutos por padrão
      retry_count: 3,
      on_error: 'stop'
    };

    setWorkflow(prev => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }));

    setSelectedStep(newStep);
  }, [workflow.steps.length]);

  // Conectar steps
  const connectSteps = useCallback((fromStepId: string, toStepId: string) => {
    setWorkflow(prev => ({
      ...prev,
      steps: prev.steps.map(step => 
        step.id === fromStepId 
          ? { ...step, connections: [...step.connections, toStepId] }
          : step
      )
    }));
  }, []);

  // Remover step
  const removeStep = useCallback((stepId: string) => {
    setWorkflow(prev => ({
      ...prev,
      steps: prev.steps
        .filter(step => step.id !== stepId)
        .map(step => ({
          ...step,
          connections: step.connections.filter(conn => conn !== stepId)
        }))
    }));
    
    if (selectedStep?.id === stepId) {
      setSelectedStep(null);
    }
  }, [selectedStep]);

  // Atualizar step selecionado
  const updateSelectedStep = useCallback((updates: Partial<WorkflowStep>) => {
    if (!selectedStep) return;

    const updatedStep = { ...selectedStep, ...updates };
    setSelectedStep(updatedStep);

    setWorkflow(prev => ({
      ...prev,
      steps: prev.steps.map(step => 
        step.id === selectedStep.id ? updatedStep : step
      )
    }));
  }, [selectedStep]);

  // Simular execução do workflow
  const simulateWorkflow = async () => {
    setIsSimulating(true);
    
    try {
      // Simular execução dos steps em sequência
      const triggerSteps = workflow.steps.filter(step => step.type === 'trigger');
      
      if (triggerSteps.length === 0) {
        toast({
          title: "Erro na simulação",
          description: "Workflow deve ter pelo menos um trigger.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Simulação iniciada",
        description: `Executando workflow com ${workflow.steps.length} steps...`
      });

      // Simular delay para demonstração
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: "Simulação concluída",
        description: "Workflow executado com sucesso na simulação."
      });
    } catch (error) {
      toast({
        title: "Erro na simulação",
        description: "Falha ao simular o workflow.",
        variant: "destructive"
      });
    } finally {
      setIsSimulating(false);
    }
  };

  // Salvar workflow
  const saveWorkflow = () => {
    if (!workflow.name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Informe um nome para o workflow.",
        variant: "destructive"
      });
      return;
    }

    if (workflow.steps.length === 0) {
      toast({
        title: "Steps obrigatórios",
        description: "Adicione pelo menos um step ao workflow.",
        variant: "destructive"
      });
      return;
    }

    const workflowToSave = {
      ...workflow,
      metadata: {
        ...workflow.metadata,
        updated_at: new Date().toISOString()
      }
    };

    onWorkflowSave?.(workflowToSave);
    
    toast({
      title: "Workflow salvo",
      description: "Workflow foi salvo com sucesso."
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                Construtor de Workflow Avançado
              </CardTitle>
              <CardDescription>
                Crie automações complexas de múltiplas etapas com lógica condicional
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentView(currentView === 'builder' ? 'config' : 'builder')}
              >
                <Settings className="h-4 w-4 mr-1" />
                {currentView === 'builder' ? 'Configurar' : 'Construtor'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentView('preview')}
                disabled={workflow.steps.length === 0}
              >
                <Eye className="h-4 w-4 mr-1" />
                Preview
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={simulateWorkflow}
                disabled={isSimulating || workflow.steps.length === 0}
              >
                {isSimulating ? (
                  <Timer className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 mr-1" />
                )}
                Simular
              </Button>
              <Button onClick={saveWorkflow}>
                <Save className="h-4 w-4 mr-1" />
                Salvar
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Paleta de Steps */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Paleta de Steps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => addStep('trigger')}
              >
                <Zap className="h-4 w-4 mr-2" />
                Trigger
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => addStep('condition')}
              >
                <GitBranch className="h-4 w-4 mr-2" />
                Condição
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => addStep('action')}
              >
                <Settings className="h-4 w-4 mr-2" />
                Ação
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => addStep('delay')}
              >
                <Clock className="h-4 w-4 mr-2" />
                Delay
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => addStep('branch')}
              >
                <GitBranch className="h-4 w-4 mr-2" />
                Ramificação
              </Button>
            </CardContent>
          </Card>

          {/* Configuração do Step Selecionado */}
          {selectedStep && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm">Configurar Step</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Nome</Label>
                  <Input
                    value={selectedStep.name}
                    onChange={(e) => updateSelectedStep({ name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Descrição</Label>
                  <Textarea
                    value={selectedStep.description}
                    onChange={(e) => updateSelectedStep({ description: e.target.value })}
                    rows={2}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Habilitado</Label>
                  <Switch
                    checked={selectedStep.enabled}
                    onCheckedChange={(enabled) => updateSelectedStep({ enabled })}
                  />
                </div>
                <div>
                  <Label>Timeout (segundos)</Label>
                  <Input
                    type="number"
                    value={selectedStep.timeout}
                    onChange={(e) => updateSelectedStep({ timeout: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Tratamento de Erro</Label>
                  <Select
                    value={selectedStep.on_error}
                    onValueChange={(value) => updateSelectedStep({ on_error: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stop">Parar Workflow</SelectItem>
                      <SelectItem value="continue">Continuar</SelectItem>
                      <SelectItem value="retry">Tentar Novamente</SelectItem>
                      <SelectItem value="goto_step">Ir para Step</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Área Principal */}
        <div className="lg:col-span-3">
          {currentView === 'config' && (
            <Card>
              <CardHeader>
                <CardTitle>Configurações do Workflow</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Nome do Workflow</Label>
                    <Input
                      value={workflow.name}
                      onChange={(e) => setWorkflow(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: Processamento de Notas Fiscais"
                    />
                  </div>
                  <div>
                    <Label>Categoria</Label>
                    <Select
                      value={workflow.category}
                      onValueChange={(value) => setWorkflow(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="contabil">Contábil</SelectItem>
                        <SelectItem value="fiscal">Fiscal</SelectItem>
                        <SelectItem value="financeiro">Financeiro</SelectItem>
                        <SelectItem value="rh">Recursos Humanos</SelectItem>
                        <SelectItem value="geral">Geral</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Descrição</Label>
                  <Textarea
                    value={workflow.description}
                    onChange={(e) => setWorkflow(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descreva o que este workflow faz..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Tipo de Execução</Label>
                  <Select
                    value={workflow.schedule?.type}
                    onValueChange={(value) => setWorkflow(prev => ({
                      ...prev,
                      schedule: { ...prev.schedule, type: value as any }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="scheduled">Agendado</SelectItem>
                      <SelectItem value="event_based">Baseado em Eventos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          {currentView === 'builder' && (
            <Card>
              <CardHeader>
                <CardTitle>Canvas do Workflow</CardTitle>
                <CardDescription>
                  Arraste e conecte os steps para criar seu workflow
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="min-h-[500px] border-2 border-dashed border-gray-200 rounded-lg p-4 relative overflow-auto">
                  {workflow.steps.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-center">
                      <div>
                        <GitBranch className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-500">
                          Clique nos botões da paleta para adicionar steps ao workflow
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {workflow.steps.map((step, index) => (
                        <div key={step.id} className="relative">
                          <Card 
                            className={`cursor-pointer transition-colors ${
                              selectedStep?.id === step.id ? 'ring-2 ring-blue-500' : ''
                            } ${!step.enabled ? 'opacity-50' : ''}`}
                            onClick={() => setSelectedStep(step)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  {getStepIcon(step.type)}
                                  <div>
                                    <h4 className="font-medium">{step.name}</h4>
                                    <p className="text-sm text-gray-500">{step.description || 'Sem descrição'}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant={step.enabled ? 'default' : 'secondary'}>
                                    {getStepTypeName(step.type)}
                                  </Badge>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeStep(step.id);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              
                              {step.connections.length > 0 && (
                                <div className="mt-2 pt-2 border-t">
                                  <p className="text-xs text-gray-500">
                                    Conectado a: {step.connections.length} step(s)
                                  </p>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                          
                          {index < workflow.steps.length - 1 && (
                            <div className="flex justify-center py-2">
                              <ArrowDown className="h-5 w-5 text-gray-400" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {currentView === 'preview' && (
            <Card>
              <CardHeader>
                <CardTitle>Preview do Workflow</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium mb-2">{workflow.name}</h3>
                    <p className="text-sm text-gray-600 mb-4">{workflow.description}</p>
                    <div className="flex gap-2">
                      <Badge>{workflow.category}</Badge>
                      <Badge variant="outline">{workflow.steps.length} steps</Badge>
                      <Badge variant={workflow.enabled ? 'default' : 'secondary'}>
                        {workflow.enabled ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Fluxo de Execução:</h4>
                    {workflow.steps.map((step, index) => (
                      <div key={step.id} className="flex items-center gap-3 p-3 border rounded">
                        <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </span>
                        {getStepIcon(step.type)}
                        <div className="flex-1">
                          <p className="font-medium">{step.name}</p>
                          <p className="text-sm text-gray-500">{step.description}</p>
                        </div>
                        <Badge variant="outline">{getStepTypeName(step.type)}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// Funções auxiliares
function getStepTypeName(type: WorkflowStep['type']): string {
  const names = {
    trigger: 'Trigger',
    condition: 'Condição',
    action: 'Ação',
    delay: 'Delay',
    branch: 'Ramificação'
  };
  return names[type];
}

function getStepIcon(type: WorkflowStep['type']) {
  const icons = {
    trigger: <Zap className="h-5 w-5 text-yellow-500" />,
    condition: <GitBranch className="h-5 w-5 text-blue-500" />,
    action: <Settings className="h-5 w-5 text-green-500" />,
    delay: <Clock className="h-5 w-5 text-purple-500" />,
    branch: <GitBranch className="h-5 w-5 text-orange-500" />
  };
  return icons[type];
}

function getDefaultStepConfig(type: WorkflowStep['type']): any {
  const configs = {
    trigger: {
      trigger_type: 'document_upload',
      conditions: {}
    },
    condition: {
      condition_type: 'field_comparison',
      field: '',
      operator: 'equals',
      value: ''
    },
    action: {
      action_type: 'send_notification',
      parameters: {}
    },
    delay: {
      duration: 60,
      unit: 'seconds'
    },
    branch: {
      branches: [
        { condition: '', target_step: '' }
      ]
    }
  };
  return configs[type];
}