import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bot, MessageCircle, Zap, TrendingUp, Clock, CheckCircle, Play } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useToast } from '@/hooks/use-toast';

interface Agent {
  id: string;
  name: string;
  description: string;
  type: 'interactive' | 'background';
  status: 'active' | 'inactive';
  icon: React.ComponentType<{ className?: string }>;
  lastActivity?: string;
  conversationsToday?: number;
  successRate?: number;
}

const AIAgentHub: React.FC = () => {
  const { toast } = useToast();
  const [agents] = useState<Agent[]>([
    {
      id: '1',
      name: 'Immigration Assistant',
      description: 'Assistente especializado em questões de imigração, documentação e processos legais.',
      type: 'interactive',
      status: 'active',
      icon: Bot,
      conversationsToday: 15,
      successRate: 94,
      lastActivity: '2 minutos atrás'
    },
    {
      id: '2',
      name: 'Document Analyzer',
      description: 'Análise automática de documentos legais e identificação de informações importantes.',
      type: 'interactive',
      status: 'active',
      icon: MessageCircle,
      conversationsToday: 8,
      successRate: 87,
      lastActivity: '10 minutos atrás'
    },
    {
      id: '3',
      name: 'Smart Case Analyzer',
      description: 'Análise inteligente de casos para identificar padrões e sugerir estratégias.',
      type: 'background',
      status: 'active',
      icon: Zap,
      lastActivity: '1 hora atrás'
    },
    {
      id: '4',
      name: 'Visa Recommendation Engine',
      description: 'Sistema de recomendação automática de tipos de visto baseado no perfil do cliente.',
      type: 'background',
      status: 'active',
      icon: TrendingUp,
      lastActivity: '30 minutos atrás'
    }
  ]);

  const [metrics] = useState({
    activeAgents: agents.filter(a => a.status === 'active').length,
    totalConversations: agents.reduce((sum, agent) => sum + (agent.conversationsToday || 0), 0),
    averageSuccessRate: Math.round(
      agents.filter(a => a.successRate).reduce((sum, agent) => sum + (agent.successRate || 0), 0) / 
      agents.filter(a => a.successRate).length
    ),
    averageResponseTime: '1.2s'
  });

  const handleStartConversation = (agentId: string, agentName: string) => {
    // Esta funcionalidade seria implementada com o sistema de chat real
    toast({
      title: "Iniciando conversa",
      description: `Conectando você com ${agentName}...`,
    });
    
    // Simulação de inicialização do chat
    setTimeout(() => {
      toast({
        title: "Chat iniciado",
        description: `Você está agora conversando com ${agentName}`,
      });
    }, 1500);
  };

  const handleExecuteTask = (agentId: string, agentName: string) => {
    toast({
      title: "Executando tarefa",
      description: `${agentName} está processando sua solicitação...`,
    });
    
    // Simulação de execução da tarefa
    setTimeout(() => {
      toast({
        title: "Tarefa concluída",
        description: `${agentName} finalizou o processamento`,
      });
    }, 3000);
  };

  const interactiveAgents = agents.filter(agent => agent.type === 'interactive');
  const backgroundAgents = agents.filter(agent => agent.type === 'background');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">AI Agent Hub</h1>
            <p className="text-muted-foreground">
              Gerencie e interaja com assistentes de IA especializados em imigração
            </p>
          </div>
        </div>

        {/* Métricas dos Agentes */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Agentes Ativos</CardTitle>
              <Bot className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.activeAgents}</div>
              <p className="text-xs text-muted-foreground">
                {agents.length} agentes no total
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversas Hoje</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalConversations}</div>
              <p className="text-xs text-muted-foreground">
                +12% desde ontem
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.averageSuccessRate}%</div>
              <p className="text-xs text-muted-foreground">
                Média dos agentes ativos
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tempo de Resposta</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.averageResponseTime}</div>
              <p className="text-xs text-muted-foreground">
                Tempo médio de resposta
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Abas dos Agentes */}
        <Tabs defaultValue="interactive" className="space-y-4">
          <TabsList>
            <TabsTrigger value="interactive">Agentes Interativos</TabsTrigger>
            <TabsTrigger value="background">Agentes de Fundo</TabsTrigger>
          </TabsList>
          
          <TabsContent value="interactive" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {interactiveAgents.map((agent) => {
                const IconComponent = agent.icon;
                return (
                  <Card key={agent.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <IconComponent className="h-6 w-6 text-primary" />
                          <CardTitle className="text-lg">{agent.name}</CardTitle>
                        </div>
                        <Badge variant={agent.status === 'active' ? 'default' : 'secondary'}>
                          {agent.status}
                        </Badge>
                      </div>
                      <CardDescription>{agent.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Conversas hoje</p>
                            <p className="font-medium">{agent.conversationsToday}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Taxa de sucesso</p>
                            <p className="font-medium">{agent.successRate}%</p>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Última atividade: {agent.lastActivity}
                        </div>
                        <Button 
                          onClick={() => handleStartConversation(agent.id, agent.name)}
                          className="w-full"
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Start Conversation
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
          
          <TabsContent value="background" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {backgroundAgents.map((agent) => {
                const IconComponent = agent.icon;
                return (
                  <Card key={agent.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <IconComponent className="h-6 w-6 text-primary" />
                          <CardTitle className="text-lg">{agent.name}</CardTitle>
                        </div>
                        <Badge variant={agent.status === 'active' ? 'default' : 'secondary'}>
                          {agent.status}
                        </Badge>
                      </div>
                      <CardDescription>{agent.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="text-sm text-muted-foreground">
                          Última execução: {agent.lastActivity}
                        </div>
                        <Button 
                          onClick={() => handleExecuteTask(agent.id, agent.name)}
                          variant="outline"
                          className="w-full"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Execute Task
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AIAgentHub;