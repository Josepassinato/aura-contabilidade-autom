import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Wand2, 
  Lightbulb, 
  MessageSquare, 
  Brain, 
  Zap,
  ArrowRight,
  CheckCircle,
  Copy,
  Settings,
  Play,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AIAssistantProps {
  onWorkflowGenerated?: (workflow: any) => void;
}

const workflowTemplates = [
  {
    id: 'smart_invoice',
    name: 'Processamento Inteligente de NF',
    prompt: 'Criar workflow que recebe nota fiscal, valida dados, classifica automaticamente e registra no sistema contábil',
    complexity: 'Alto',
    estimatedSteps: 6
  },
  {
    id: 'payment_flow',
    name: 'Fluxo de Cobrança',
    prompt: 'Workflow para enviar lembretes de pagamento 10 dias antes, 5 dias antes e no vencimento, com escalation para cobrador',
    complexity: 'Médio',
    estimatedSteps: 4
  },
  {
    id: 'document_approval',
    name: 'Aprovação de Documentos',
    prompt: 'Processo de aprovação onde documentos acima de R$ 5.000 precisam de aprovação do contador antes de serem registrados',
    complexity: 'Baixo',
    estimatedSteps: 3
  },
  {
    id: 'monthly_tasks',
    name: 'Tarefas Mensais',
    prompt: 'Automação do fechamento mensal com validações, geração de relatórios e envio para clientes',
    complexity: 'Alto',
    estimatedSteps: 8
  }
];

export function AIWorkflowAssistant({ onWorkflowGenerated }: AIAssistantProps) {
  const { toast } = useToast();
  const [userPrompt, setUserPrompt] = useState('');
  const [generatedWorkflow, setGeneratedWorkflow] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{
    type: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>>([
    {
      type: 'assistant',
      content: 'Olá! Sou seu assistente de IA para criação de workflows. Como posso ajudar você a automatizar seus processos contábeis hoje?',
      timestamp: new Date()
    }
  ]);
  const [currentInput, setCurrentInput] = useState('');

  const generateWorkflowFromPrompt = async (prompt: string) => {
    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-automation-rule', {
        body: {
          naturalLanguageInput: prompt,
          context: 'visual_workflow_builder',
          generateVisualNodes: true
        }
      });

      if (error) throw error;

      const workflow = {
        name: data.rule.name,
        description: data.rule.description,
        nodes: generateVisualNodes(data.rule),
        edges: generateVisualEdges(data.rule),
        aiGenerated: true,
        confidence: data.rule.confidence,
        prompt: prompt
      };

      setGeneratedWorkflow(workflow);
      
      toast({
        title: "Workflow gerado com sucesso!",
        description: `"${workflow.name}" criado com ${(workflow.confidence * 100).toFixed(0)}% de confiança.`
      });

    } catch (error) {
      console.error('Erro ao gerar workflow:', error);
      
      // Fallback: gerar workflow básico
      const fallbackWorkflow = generateFallbackWorkflow(prompt);
      setGeneratedWorkflow(fallbackWorkflow);
      
      toast({
        title: "Workflow gerado (modo offline)",
        description: "Workflow básico criado localmente."
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateVisualNodes = (rule: any) => {
    const nodes = [];
    let yPosition = 100;

    // Trigger node
    nodes.push({
      id: 'trigger_1',
      type: 'trigger',
      position: { x: 100, y: yPosition },
      data: {
        label: 'Início do Processo',
        description: 'Trigger principal'
      }
    });
    yPosition += 120;

    // Condition nodes
    if (rule.conditions && rule.conditions.length > 0) {
      rule.conditions.forEach((condition: any, index: number) => {
        nodes.push({
          id: `condition_${index + 1}`,
          type: 'condition',
          position: { x: 100, y: yPosition },
          data: {
            label: condition.description || `Condição ${index + 1}`,
            description: `${condition.field} ${condition.operator} ${condition.value}`
          }
        });
        yPosition += 120;
      });
    }

    // Action nodes
    if (rule.actions && rule.actions.length > 0) {
      rule.actions.forEach((action: any, index: number) => {
        nodes.push({
          id: `action_${index + 1}`,
          type: 'action',
          position: { x: 100, y: yPosition },
          data: {
            label: action.description || `Ação ${index + 1}`,
            description: action.type
          }
        });
        yPosition += 120;
      });
    }

    return nodes;
  };

  const generateVisualEdges = (rule: any) => {
    const edges = [];
    const nodeCount = 1 + (rule.conditions?.length || 0) + (rule.actions?.length || 0);
    
    for (let i = 1; i < nodeCount; i++) {
      const sourceId = i === 1 ? 'trigger_1' : 
                     i <= (rule.conditions?.length || 0) + 1 ? `condition_${i - 1}` : 
                     `action_${i - (rule.conditions?.length || 0) - 1}`;
      
      const targetId = i + 1 <= (rule.conditions?.length || 0) + 1 ? `condition_${i}` : 
                      `action_${i - (rule.conditions?.length || 0)}`;

      edges.push({
        id: `e${i}-${i + 1}`,
        source: sourceId,
        target: targetId,
        type: 'smoothstep'
      });
    }

    return edges;
  };

  const generateFallbackWorkflow = (prompt: string) => {
    const promptLower = prompt.toLowerCase();
    
    let nodes = [
      {
        id: 'trigger_1',
        type: 'trigger',
        position: { x: 100, y: 100 },
        data: { label: 'Início', description: 'Trigger do processo' }
      }
    ];

    let edges = [];
    let yPos = 220;

    // Adicionar nós baseado no conteúdo do prompt
    if (promptLower.includes('nota fiscal') || promptLower.includes('documento')) {
      nodes.push({
        id: 'action_1',
        type: 'action',
        position: { x: 100, y: yPos },
        data: { label: 'Processar Documento', description: 'Validar e extrair dados' }
      });
      edges.push({ id: 'e1-2', source: 'trigger_1', target: 'action_1', type: 'smoothstep' });
      yPos += 120;
    }

    if (promptLower.includes('email') || promptLower.includes('notific')) {
      nodes.push({
        id: 'action_2',
        type: 'action',
        position: { x: 100, y: yPos },
        data: { label: 'Enviar Notificação', description: 'Email ou notificação' }
      });
      edges.push({ 
        id: `e${nodes.length - 1}-${nodes.length}`, 
        source: nodes[nodes.length - 2].id, 
        target: 'action_2', 
        type: 'smoothstep' 
      });
      yPos += 120;
    }

    if (promptLower.includes('aprovação') || promptLower.includes('valor')) {
      nodes.push({
        id: 'condition_1',
        type: 'condition',
        position: { x: 100, y: yPos },
        data: { label: 'Validar Critérios', description: 'Verificar condições' }
      });
      edges.push({ 
        id: `e${nodes.length - 1}-${nodes.length}`, 
        source: nodes[nodes.length - 2].id, 
        target: 'condition_1', 
        type: 'smoothstep' 
      });
    }

    return {
      name: 'Workflow Personalizado',
      description: 'Workflow gerado baseado na sua descrição',
      nodes,
      edges,
      aiGenerated: true,
      confidence: 0.75,
      prompt
    };
  };

  const sendMessage = async () => {
    if (!currentInput.trim()) return;

    const userMessage = {
      type: 'user' as const,
      content: currentInput,
      timestamp: new Date()
    };

    setChatHistory(prev => [...prev, userMessage]);
    
    // Simular resposta da IA
    setTimeout(() => {
      let aiResponse = '';
      const input = currentInput.toLowerCase();
      
      if (input.includes('workflow') || input.includes('automação')) {
        aiResponse = 'Entendi que você quer criar um workflow! Vou analisar sua necessidade e gerar uma automação personalizada. Você pode me dar mais detalhes sobre o processo que quer automatizar?';
      } else if (input.includes('nota fiscal')) {
        aiResponse = 'Perfeito! Para processar notas fiscais, posso criar um workflow que inclui: validação de formato, extração de dados, classificação automática e registro no sistema. Quer que eu gere esse workflow agora?';
      } else if (input.includes('pagamento') || input.includes('cobrança')) {
        aiResponse = 'Para fluxos de pagamento, sugiro um workflow com lembretes escalonados e notificações automáticas. Posso incluir diferentes tipos de cobrança baseados no valor ou cliente. Vamos criar?';
      } else {
        aiResponse = 'Interessante! Baseado no que você descreveu, posso criar um workflow personalizado. Me conte mais sobre as etapas do processo ou use um dos templates sugeridos como ponto de partida.';
      }

      setChatHistory(prev => [...prev, {
        type: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      }]);
    }, 1000);

    setCurrentInput('');
  };

  const useTemplate = (template: typeof workflowTemplates[0]) => {
    setUserPrompt(template.prompt);
    generateWorkflowFromPrompt(template.prompt);
  };

  const confirmWorkflow = () => {
    if (generatedWorkflow) {
      onWorkflowGenerated?.(generatedWorkflow);
      toast({
        title: "Workflow confirmado!",
        description: "Workflow foi adicionado ao construtor visual."
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6" />
            Assistente IA para Workflows
          </CardTitle>
          <CardDescription>
            Crie workflows complexos usando linguagem natural e templates inteligentes
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="assistant" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="assistant">Chat IA</TabsTrigger>
          <TabsTrigger value="prompt">Prompt Direto</TabsTrigger>
          <TabsTrigger value="templates">Templates IA</TabsTrigger>
        </TabsList>

        <TabsContent value="assistant" className="space-y-4">
          {/* Chat Interface */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Conversa com IA</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Chat History */}
                <div className="h-64 overflow-y-auto border rounded-lg p-4 space-y-3 bg-gray-50">
                  {chatHistory.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.type === 'user'
                            ? 'bg-blue-500 text-white'
                            : 'bg-white border shadow-sm'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input */}
                <div className="flex gap-2">
                  <Input
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    placeholder="Descreva o processo que quer automatizar..."
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  />
                  <Button onClick={sendMessage}>
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prompt" className="space-y-4">
          {/* Prompt Direto */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Geração por Prompt</CardTitle>
              <CardDescription>
                Descreva seu processo em linguagem natural e a IA criará o workflow
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Descreva o processo que quer automatizar</Label>
                <Textarea
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  placeholder="Ex: Quando receber uma nota fiscal, validar os dados, classificar automaticamente por tipo e registrar no sistema contábil..."
                  rows={4}
                />
              </div>
              <Button 
                onClick={() => generateWorkflowFromPrompt(userPrompt)}
                disabled={isGenerating || !userPrompt.trim()}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Gerando Workflow...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Gerar Workflow com IA
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Workflow Gerado */}
          {generatedWorkflow && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Workflow Gerado
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold">{generatedWorkflow.name}</h3>
                  <p className="text-sm text-gray-600">{generatedWorkflow.description}</p>
                </div>
                
                <div className="flex items-center gap-4 text-sm">
                  <Badge variant="outline">
                    {generatedWorkflow.nodes.length} steps
                  </Badge>
                  <Badge variant="outline">
                    Confiança: {(generatedWorkflow.confidence * 100).toFixed(0)}%
                  </Badge>
                </div>

                <div className="flex gap-2">
                  <Button onClick={confirmWorkflow} className="flex-1">
                    <Copy className="h-4 w-4 mr-2" />
                    Usar no Construtor
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => generateWorkflowFromPrompt(userPrompt)}
                  >
                    <Wand2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          {/* Templates Inteligentes */}
          <div className="grid gap-4">
            {workflowTemplates.map((template) => (
              <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{template.name}</h4>
                        <Badge variant={
                          template.complexity === 'Alto' ? 'destructive' :
                          template.complexity === 'Médio' ? 'default' : 'secondary'
                        }>
                          {template.complexity}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{template.prompt}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>~{template.estimatedSteps} steps</span>
                        <span>•</span>
                        <span>Gerado por IA</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => useTemplate(template)}
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-1" />
                          Gerar
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}