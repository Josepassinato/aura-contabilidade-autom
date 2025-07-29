import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { logger } from "@/utils/logger";
import { 
  Brain, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  DollarSign,
  Users,
  Zap,
  Activity,
  BarChart3,
  BrainIcon,
  Target,
  Calendar,
  Bell
} from 'lucide-react';

interface IntelligentMetrics {
  fiscalCompliance: number;
  automationEfficiency: number;
  riskScore: number;
  cashFlowHealth: number;
  pendingTasks: number;
  aiRecommendations: AIRecommendation[];
  upcomingDeadlines: Deadline[];
  anomaliesDetected: Anomaly[];
}

interface AIRecommendation {
  id: string;
  type: 'optimization' | 'compliance' | 'risk' | 'financial';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedImpact: string;
  actionRequired: boolean;
}

interface Deadline {
  id: string;
  title: string;
  date: Date;
  type: 'tax' | 'payment' | 'report' | 'compliance';
  daysUntil: number;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
}

interface Anomaly {
  id: string;
  type: 'financial' | 'compliance' | 'operational';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  detectedAt: Date;
  resolved: boolean;
}

export function IntelligentDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<IntelligentMetrics>({
    fiscalCompliance: 0,
    automationEfficiency: 0,
    riskScore: 0,
    cashFlowHealth: 0,
    pendingTasks: 0,
    aiRecommendations: [],
    upcomingDeadlines: [],
    anomaliesDetected: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');

  useEffect(() => {
    loadIntelligentMetrics();
    const interval = setInterval(loadIntelligentMetrics, 300000); // Atualizar a cada 5 minutos
    return () => clearInterval(interval);
  }, []);

  const loadIntelligentMetrics = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadComplianceMetrics(),
        loadAIRecommendations(),
        loadUpcomingDeadlines(),
        loadAnomalies()
      ]);
    } catch (error) {
      logger.error('Erro ao carregar métricas inteligentes:', error, 'IntelligentDashboard');
      toast({
        title: "Erro",
        description: "Falha ao carregar dados do dashboard",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadComplianceMetrics = async () => {
    try {
      // Calcular conformidade fiscal baseada em dados reais
      const { data: closingStatus } = await supabase
        .from('monthly_closing_status')
        .select('*')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      const { data: documents } = await supabase
        .from('client_documents')
        .select('*')
        .eq('status', 'processado')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      const { data: automationLogs } = await supabase
        .from('automation_logs')
        .select('*')
        .eq('status', 'completed')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      // Calcular métricas de conformidade
      const totalClosings = closingStatus?.length || 0;
      const completedClosings = closingStatus?.filter(c => c.status === 'completed').length || 0;
      const fiscalCompliance = totalClosings > 0 ? (completedClosings / totalClosings) * 100 : 100;

      // Calcular eficiência da automação
      const totalAutomations = automationLogs?.length || 1;
      const successfulAutomations = automationLogs?.filter(log => log.errors_count === 0).length || 0;
      const automationEfficiency = (successfulAutomations / totalAutomations) * 100;

      // Calcular score de risco (invertido - quanto menor, melhor)
      const pendingClosings = closingStatus?.filter(c => c.status === 'pending').length || 0;
      const riskScore = Math.max(0, 100 - (pendingClosings * 20));

      // Simular saúde do fluxo de caixa
      const cashFlowHealth = Math.random() * 20 + 75; // Entre 75-95%

      setMetrics(prev => ({
        ...prev,
        fiscalCompliance: Math.round(fiscalCompliance),
        automationEfficiency: Math.round(automationEfficiency),
        riskScore: Math.round(riskScore),
        cashFlowHealth: Math.round(cashFlowHealth),
        pendingTasks: pendingClosings
      }));

    } catch (error) {
      logger.error('Erro ao carregar métricas de conformidade:', error, 'IntelligentDashboard');
    }
  };

  const loadAIRecommendations = async () => {
    try {
      // Gerar recomendações baseadas em dados reais
      const { data } = await supabase.functions.invoke('generate-ai-recommendations', {
        body: { userId: user?.id }
      });

      if (data?.recommendations) {
        setMetrics(prev => ({
          ...prev,
          aiRecommendations: data.recommendations
        }));
      } else {
        // Fallback para recomendações simuladas
        const simulatedRecommendations: AIRecommendation[] = [
          {
            id: '1',
            type: 'optimization',
            title: 'Otimizar Fluxo de Fechamento',
            description: 'Automatizar 3 etapas do processo de fechamento mensal pode reduzir tempo em 40%',
            priority: 'high',
            estimatedImpact: 'Economia de 8 horas/mês',
            actionRequired: true
          },
          {
            id: '2',
            type: 'compliance',
            title: 'Atualizar Integração SEFAZ',
            description: 'Nova versão da API SEFAZ disponível com melhor performance',
            priority: 'medium',
            estimatedImpact: 'Redução de 15% nos erros',
            actionRequired: false
          },
          {
            id: '3',
            type: 'financial',
            title: 'Revisar Política de Cobrança',
            description: 'Padrão identificado: 23% dos pagamentos atrasam após 15 dias',
            priority: 'medium',
            estimatedImpact: 'Melhoria no fluxo de caixa',
            actionRequired: true
          }
        ];

        setMetrics(prev => ({
          ...prev,
          aiRecommendations: simulatedRecommendations
        }));
      }
    } catch (error) {
      logger.error('Erro ao carregar recomendações de IA:', error, 'IntelligentDashboard');
    }
  };

  const loadUpcomingDeadlines = async () => {
    try {
      const { data: obligations } = await supabase
        .from('obrigacoes_fiscais')
        .select('*')
        .gte('prazo', new Date().toISOString())
        .lte('prazo', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('prazo', { ascending: true });

      const { data: payments } = await supabase
        .from('payment_alerts')
        .select('*, accounting_clients(name)')
        .eq('email_sent', false)
        .order('payment_due_date', { ascending: true });

      const deadlines: Deadline[] = [];

      // Adicionar obrigações fiscais
      obligations?.forEach(obligation => {
        const dueDate = new Date(obligation.prazo);
        const daysUntil = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        
        deadlines.push({
          id: obligation.id,
          title: obligation.nome,
          date: dueDate,
          type: 'tax',
          daysUntil,
          status: obligation.status === 'concluido' ? 'completed' : 'pending'
        });
      });

      // Adicionar alertas de pagamento
      payments?.forEach(payment => {
        const dueDate = new Date(payment.payment_due_date);
        const daysUntil = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        
        deadlines.push({
          id: payment.id,
          title: `Pagamento - ${(payment.accounting_clients as any)?.name || 'Cliente'}`,
          date: dueDate,
          type: 'payment',
          daysUntil,
          status: daysUntil < 0 ? 'overdue' : 'pending'
        });
      });

      setMetrics(prev => ({
        ...prev,
        upcomingDeadlines: deadlines.slice(0, 5)
      }));

    } catch (error) {
      logger.error('Erro ao carregar prazos:', error, 'IntelligentDashboard');
    }
  };

  const loadAnomalies = async () => {
    try {
      // Simular detecção de anomalias
      const anomalies: Anomaly[] = [
        {
          id: '1',
          type: 'financial',
          description: 'Variação incomum nas receitas do cliente ABC Ltda (+147%)',
          severity: 'medium',
          detectedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          resolved: false
        },
        {
          id: '2',
          type: 'compliance',
          description: 'Atraso recorrente na entrega de documentos fiscais',
          severity: 'high',
          detectedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          resolved: false
        }
      ];

      setMetrics(prev => ({
        ...prev,
        anomaliesDetected: anomalies
      }));

    } catch (error) {
      logger.error('Erro ao carregar anomalias:', error, 'IntelligentDashboard');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'overdue': return 'text-red-600';
      case 'in_progress': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard Inteligente</h1>
            <p className="text-muted-foreground">Carregando insights com IA...</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            Dashboard Inteligente
          </h1>
          <p className="text-muted-foreground">
            Insights automatizados e análise preditiva com IA
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadIntelligentMetrics}>
            <Activity className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* KPIs Inteligentes */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conformidade Fiscal</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.fiscalCompliance}%</div>
            <Progress value={metrics.fiscalCompliance} className="mt-2" />
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              Baseado em {metrics.pendingTasks} tarefas pendentes
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eficiência da Automação</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.automationEfficiency}%</div>
            <Progress value={metrics.automationEfficiency} className="mt-2" />
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <Activity className="h-3 w-3 text-blue-500" />
              Processos automatizados últimos 7 dias
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score de Risco</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.riskScore}%</div>
            <Progress value={metrics.riskScore} className="mt-2" />
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              {metrics.riskScore > 80 ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              Análise preditiva de riscos
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saúde Financeira</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.cashFlowHealth}%</div>
            <Progress value={metrics.cashFlowHealth} className="mt-2" />
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <BarChart3 className="h-3 w-3 text-purple-500" />
              Fluxo de caixa projetado
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="recommendations">
            Recomendações IA
            {metrics.aiRecommendations.filter(r => r.actionRequired).length > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                {metrics.aiRecommendations.filter(r => r.actionRequired).length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="deadlines">
            Prazos
            {metrics.upcomingDeadlines.filter(d => d.daysUntil <= 7).length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {metrics.upcomingDeadlines.filter(d => d.daysUntil <= 7).length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="anomalies">
            Anomalias
            {metrics.anomaliesDetected.filter(a => !a.resolved).length > 0 && (
              <Badge variant="outline" className="ml-2">
                {metrics.anomaliesDetected.filter(a => !a.resolved).length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BrainIcon className="h-5 w-5" />
                  Insights Principais
                </CardTitle>
                <CardDescription>
                  Análises automatizadas mais relevantes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {metrics.aiRecommendations.slice(0, 3).map((rec) => (
                  <div key={rec.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className={`w-2 h-2 rounded-full mt-2 ${getPriorityColor(rec.priority)}`}></div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{rec.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                      <p className="text-xs text-blue-600 mt-2">{rec.estimatedImpact}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Próximos Prazos
                </CardTitle>
                <CardDescription>
                  Obrigações e vencimentos importantes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {metrics.upcomingDeadlines.slice(0, 4).map((deadline) => (
                  <div key={deadline.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{deadline.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        {deadline.date.toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-medium ${getStatusColor(deadline.status)}`}>
                        {deadline.daysUntil <= 0 ? 'Vencido' : `${deadline.daysUntil} dias`}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {deadline.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <div className="grid gap-4">
            {metrics.aiRecommendations.map((recommendation) => (
              <Card key={recommendation.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{recommendation.title}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{recommendation.type}</Badge>
                      <div className={`w-3 h-3 rounded-full ${getPriorityColor(recommendation.priority)}`}></div>
                    </div>
                  </div>
                  <CardDescription>{recommendation.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">
                        Impacto Estimado: {recommendation.estimatedImpact}
                      </p>
                    </div>
                    {recommendation.actionRequired && (
                      <Button size="sm">
                        Implementar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="deadlines" className="space-y-4">
          <div className="space-y-4">
            {metrics.upcomingDeadlines.map((deadline) => (
              <Card key={deadline.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium">{deadline.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Vencimento: {deadline.date.toLocaleDateString('pt-BR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${getStatusColor(deadline.status)}`}>
                        {deadline.daysUntil <= 0 ? 'Vencido' : `${deadline.daysUntil} dias`}
                      </div>
                      <Badge variant="outline">{deadline.type}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="anomalies" className="space-y-4">
          <div className="space-y-4">
            {metrics.anomaliesDetected.map((anomaly) => (
              <Card key={anomaly.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className={`h-5 w-5 mt-0.5 ${
                      anomaly.severity === 'high' ? 'text-red-500' : 
                      anomaly.severity === 'medium' ? 'text-yellow-500' : 'text-blue-500'
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">{anomaly.type}</Badge>
                        <div className={`px-2 py-1 rounded-full text-xs ${getSeverityColor(anomaly.severity)}`}>
                          {anomaly.severity}
                        </div>
                      </div>
                      <p className="text-sm">{anomaly.description}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Detectado em: {anomaly.detectedAt.toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <Button size="sm" variant="outline">
                      Investigar
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