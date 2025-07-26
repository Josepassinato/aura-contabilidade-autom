import React, { useCallback, useState, useEffect } from 'react';
import {
  ReactFlow,
  addEdge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  Connection,
  MarkerType,
  Position
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Play, 
  Save, 
  Download, 
  Upload,
  Zap, 
  GitBranch, 
  Clock, 
  Settings, 
  Mail,
  Database,
  FileText,
  Plus,
  Trash2,
  Wand2,
  Lightbulb,
  BookOpen,
  Copy
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Custom Node Types
const TriggerNode = ({ data, id }: any) => (
  <div className="px-4 py-2 shadow-md rounded-md bg-gradient-to-r from-yellow-400 to-orange-500 text-white border border-yellow-600">
    <div className="flex items-center gap-2">
      <Zap className="h-4 w-4" />
      <div>
        <div className="text-sm font-bold">{data.label}</div>
        <div className="text-xs opacity-80">{data.description}</div>
      </div>
    </div>
  </div>
);

const ActionNode = ({ data, id }: any) => (
  <div className="px-4 py-2 shadow-md rounded-md bg-gradient-to-r from-blue-500 to-cyan-500 text-white border border-blue-600">
    <div className="flex items-center gap-2">
      <Settings className="h-4 w-4" />
      <div>
        <div className="text-sm font-bold">{data.label}</div>
        <div className="text-xs opacity-80">{data.description}</div>
      </div>
    </div>
  </div>
);

const ConditionNode = ({ data, id }: any) => (
  <div className="px-4 py-2 shadow-md rounded-md bg-gradient-to-r from-purple-500 to-pink-500 text-white border border-purple-600">
    <div className="flex items-center gap-2">
      <GitBranch className="h-4 w-4" />
      <div>
        <div className="text-sm font-bold">{data.label}</div>
        <div className="text-xs opacity-80">{data.description}</div>
      </div>
    </div>
  </div>
);

const DelayNode = ({ data, id }: any) => (
  <div className="px-4 py-2 shadow-md rounded-md bg-gradient-to-r from-green-500 to-emerald-500 text-white border border-green-600">
    <div className="flex items-center gap-2">
      <Clock className="h-4 w-4" />
      <div>
        <div className="text-sm font-bold">{data.label}</div>
        <div className="text-xs opacity-80">{data.description}</div>
      </div>
    </div>
  </div>
);

const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  condition: ConditionNode,
  delay: DelayNode,
};

// Templates pré-configurados
const workflowTemplates = [
  {
    id: 'invoice_processing',
    name: 'Processamento de Notas Fiscais',
    description: 'Workflow completo para processar notas fiscais automaticamente',
    category: 'fiscal',
    nodes: [
      {
        id: '1',
        type: 'trigger',
        position: { x: 100, y: 100 },
        data: { label: 'Upload de Documento', description: 'Nota fiscal carregada' }
      },
      {
        id: '2',
        type: 'condition',
        position: { x: 100, y: 200 },
        data: { label: 'Validar Formato', description: 'Verificar se é PDF/XML válido' }
      },
      {
        id: '3',
        type: 'action',
        position: { x: 100, y: 300 },
        data: { label: 'Extrair Dados', description: 'OCR e extração de informações' }
      },
      {
        id: '4',
        type: 'action',
        position: { x: 100, y: 400 },
        data: { label: 'Classificar Documento', description: 'IA classifica automaticamente' }
      },
      {
        id: '5',
        type: 'action',
        position: { x: 100, y: 500 },
        data: { label: 'Registrar Sistema', description: 'Salvar no banco de dados' }
      }
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', type: 'smoothstep' },
      { id: 'e2-3', source: '2', target: '3', type: 'smoothstep' },
      { id: 'e3-4', source: '3', target: '4', type: 'smoothstep' },
      { id: 'e4-5', source: '4', target: '5', type: 'smoothstep' }
    ]
  },
  {
    id: 'payment_reminder',
    name: 'Lembrete de Pagamento',
    description: 'Envio automático de lembretes de pagamento para clientes',
    category: 'financeiro',
    nodes: [
      {
        id: '1',
        type: 'trigger',
        position: { x: 100, y: 100 },
        data: { label: 'Agendamento Diário', description: 'Todo dia às 9h' }
      },
      {
        id: '2',
        type: 'condition',
        position: { x: 100, y: 200 },
        data: { label: 'Verificar Vencimentos', description: 'Pagamentos em 5 dias' }
      },
      {
        id: '3',
        type: 'action',
        position: { x: 100, y: 300 },
        data: { label: 'Enviar Email', description: 'Lembrete personalizado' }
      },
      {
        id: '4',
        type: 'action',
        position: { x: 300, y: 300 },
        data: { label: 'Registrar Log', description: 'Histórico de envios' }
      }
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', type: 'smoothstep' },
      { id: 'e2-3', source: '2', target: '3', type: 'smoothstep' },
      { id: 'e2-4', source: '2', target: '4', type: 'smoothstep' }
    ]
  },
  {
    id: 'monthly_closing',
    name: 'Fechamento Mensal',
    description: 'Automação completa do processo de fechamento mensal',
    category: 'contabil',
    nodes: [
      {
        id: '1',
        type: 'trigger',
        position: { x: 100, y: 100 },
        data: { label: 'Último Dia do Mês', description: 'Trigger agendado' }
      },
      {
        id: '2',
        type: 'action',
        position: { x: 100, y: 200 },
        data: { label: 'Validar Lançamentos', description: 'Verificar inconsistências' }
      },
      {
        id: '3',
        type: 'condition',
        position: { x: 100, y: 300 },
        data: { label: 'Tem Pendências?', description: 'Verificar erros' }
      },
      {
        id: '4',
        type: 'action',
        position: { x: 300, y: 350 },
        data: { label: 'Notificar Contador', description: 'Alertar pendências' }
      },
      {
        id: '5',
        type: 'action',
        position: { x: 100, y: 400 },
        data: { label: 'Gerar Relatórios', description: 'Balancete e DRE' }
      },
      {
        id: '6',
        type: 'action',
        position: { x: 100, y: 500 },
        data: { label: 'Enviar Relatórios', description: 'Email para cliente' }
      }
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', type: 'smoothstep' },
      { id: 'e2-3', source: '2', target: '3', type: 'smoothstep' },
      { id: 'e3-4', source: '3', target: '4', type: 'smoothstep', label: 'Sim' },
      { id: 'e3-5', source: '3', target: '5', type: 'smoothstep', label: 'Não' },
      { id: 'e5-6', source: '5', target: '6', type: 'smoothstep' }
    ]
  }
];

interface AdvancedWorkflowBuilderProps {
  onSave?: (workflow: any) => void;
  onCancel?: () => void;
}

export function AdvancedWorkflowBuilder({ onSave, onCancel }: AdvancedWorkflowBuilderProps) {
  const { toast } = useToast();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [currentView, setCurrentView] = useState<'builder' | 'templates' | 'assistant'>('builder');
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [aiPrompt, setAiPrompt] = useState('');

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({
      ...params,
      type: 'smoothstep',
      markerEnd: { type: MarkerType.ArrowClosed }
    }, eds)),
    [setEdges]
  );

  // Adicionar novo nó
  const addNode = useCallback((type: string) => {
    const newNode: Node = {
      id: `${type}_${Date.now()}`,
      type,
      position: { 
        x: Math.random() * 400 + 100, 
        y: Math.random() * 400 + 100 
      },
      data: { 
        label: `Novo ${type}`, 
        description: 'Configurar este step...' 
      }
    };
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes]);

  // Carregar template
  const loadTemplate = useCallback((template: typeof workflowTemplates[0]) => {
    setNodes(template.nodes as Node[]);
    setEdges(template.edges as Edge[]);
    setWorkflowName(template.name);
    setWorkflowDescription(template.description);
    setCurrentView('builder');
    
    toast({
      title: "Template carregado",
      description: `${template.name} foi carregado com sucesso.`
    });
  }, [setNodes, setEdges, toast]);

  // Assistente IA para sugestões
  const generateAISuggestions = async () => {
    if (!aiPrompt.trim()) return;

    const suggestions = [
      `Adicionar validação de documento antes de ${aiPrompt}`,
      `Implementar notificação automática para ${aiPrompt}`,
      `Criar backup dos dados em ${aiPrompt}`,
      `Adicionar log de auditoria para ${aiPrompt}`,
      `Configurar timeout personalizado em ${aiPrompt}`
    ];

    setAiSuggestions(suggestions);
    
    toast({
      title: "Sugestões geradas",
      description: "IA analisou seu workflow e gerou sugestões."
    });
  };

  // Aplicar sugestão da IA
  const applySuggestion = (suggestion: string) => {
    const suggestionTypes = {
      'validação': 'condition',
      'notificação': 'action',
      'backup': 'action',
      'log': 'action',
      'timeout': 'delay'
    };

    const type = Object.keys(suggestionTypes).find(key => 
      suggestion.toLowerCase().includes(key)
    );

    if (type) {
      const nodeType = suggestionTypes[type as keyof typeof suggestionTypes];
      addNode(nodeType);
      
      toast({
        title: "Sugestão aplicada",
        description: `Adicionado novo step: ${suggestion}`
      });
    }
  };

  // Salvar workflow
  const saveWorkflow = () => {
    if (!workflowName.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Informe um nome para o workflow.",
        variant: "destructive"
      });
      return;
    }

    const workflow = {
      name: workflowName,
      description: workflowDescription,
      nodes: nodes,
      edges: edges,
      created_at: new Date().toISOString()
    };

    onSave?.(workflow);
    
    toast({
      title: "Workflow salvo",
      description: "Workflow foi salvo com sucesso!"
    });
  };

  // Selecionar nó
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  // Atualizar nó selecionado
  const updateSelectedNode = (updates: Partial<Node['data']>) => {
    if (!selectedNode) return;

    setNodes((nds) => nds.map((node) => 
      node.id === selectedNode.id 
        ? { ...node, data: { ...node.data, ...updates } }
        : node
    ));

    setSelectedNode({ ...selectedNode, data: { ...selectedNode.data, ...updates } });
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <Card className="rounded-none border-x-0 border-t-0">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-6 w-6" />
                Construtor Visual Avançado
              </CardTitle>
              <CardDescription>
                Interface drag-and-drop com templates e assistente IA
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentView('templates')}
              >
                <BookOpen className="h-4 w-4 mr-1" />
                Templates
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentView('assistant')}
              >
                <Lightbulb className="h-4 w-4 mr-1" />
                Assistente IA
              </Button>
              <Button size="sm" onClick={saveWorkflow}>
                <Save className="h-4 w-4 mr-1" />
                Salvar
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-80 border-r bg-gray-50 flex flex-col">
          <Tabs value={currentView} onValueChange={setCurrentView as any} className="flex-1">
            <TabsList className="grid w-full grid-cols-3 m-2">
              <TabsTrigger value="builder">Builder</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="assistant">IA</TabsTrigger>
            </TabsList>

            <TabsContent value="builder" className="flex-1 p-4 space-y-4">
              {/* Configurações do Workflow */}
              <div className="space-y-3">
                <div>
                  <Label>Nome do Workflow</Label>
                  <Input
                    value={workflowName}
                    onChange={(e) => setWorkflowName(e.target.value)}
                    placeholder="Nome do workflow..."
                  />
                </div>
                <div>
                  <Label>Descrição</Label>
                  <Textarea
                    value={workflowDescription}
                    onChange={(e) => setWorkflowDescription(e.target.value)}
                    placeholder="Descrição..."
                    rows={2}
                  />
                </div>
              </div>

              {/* Paleta de Componentes */}
              <div>
                <h3 className="font-medium mb-3">Componentes</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addNode('trigger')}
                    className="justify-start"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Trigger
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addNode('action')}
                    className="justify-start"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Ação
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addNode('condition')}
                    className="justify-start"
                  >
                    <GitBranch className="h-4 w-4 mr-2" />
                    Condição
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addNode('delay')}
                    className="justify-start"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Delay
                  </Button>
                </div>
              </div>

              {/* Propriedades do Nó Selecionado */}
              {selectedNode && (
                <div className="border-t pt-4">
                  <h3 className="font-medium mb-3">Propriedades</h3>
                  <div className="space-y-3">
                    <div>
                      <Label>Nome</Label>
                      <Input
                        value={String(selectedNode.data.label || '')}
                        onChange={(e) => updateSelectedNode({ label: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Descrição</Label>
                      <Textarea
                        value={String(selectedNode.data.description || '')}
                        onChange={(e) => updateSelectedNode({ description: e.target.value })}
                        rows={2}
                      />
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
                        setEdges((eds) => eds.filter((edge) => 
                          edge.source !== selectedNode.id && edge.target !== selectedNode.id
                        ));
                        setSelectedNode(null);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Remover
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="templates" className="flex-1 p-4">
              <div className="space-y-4">
                <h3 className="font-medium">Templates Pré-configurados</h3>
                {workflowTemplates.map((template) => (
                  <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{template.name}</h4>
                            <Badge variant="outline">{template.category}</Badge>
                          </div>
                          <p className="text-sm text-gray-600">{template.description}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{template.nodes.length} steps</span>
                            <span>•</span>
                            <span>{template.edges.length} conexões</span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => loadTemplate(template)}
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          Usar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="assistant" className="flex-1 p-4">
              <div className="space-y-4">
                <h3 className="font-medium">Assistente IA</h3>
                
                <div className="space-y-3">
                  <div>
                    <Label>Descreva seu processo</Label>
                    <Textarea
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="Ex: processar documentos fiscais automaticamente..."
                      rows={3}
                    />
                  </div>
                  <Button onClick={generateAISuggestions} className="w-full">
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Gerar Sugestões
                  </Button>
                </div>

                {aiSuggestions.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Sugestões da IA:</h4>
                    {aiSuggestions.map((suggestion, index) => (
                      <Card key={index} className="cursor-pointer hover:shadow-sm">
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between">
                            <p className="text-sm">{suggestion}</p>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => applySuggestion(suggestion)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Canvas Principal */}
        <div className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            style={{ backgroundColor: '#f8fafc' }}
          >
            <Background />
            <Controls />
            <MiniMap 
              nodeStrokeColor="#374151"
              nodeColor="#9ca3af"
              nodeBorderRadius={8}
            />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}