import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AIRecommendation {
  id: string;
  type: 'optimization' | 'compliance' | 'risk' | 'financial';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedImpact: string;
  actionRequired: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { userId } = await req.json();
    console.log('Gerando recomendações de IA para usuário:', userId);

    // Buscar dados do usuário e contexto
    const { data: userProfile } = await supabaseClient
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    const { data: automationLogs } = await supabaseClient
      .from('automation_logs')
      .select('*')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(50);

    const { data: closingStatus } = await supabaseClient
      .from('monthly_closing_status')
      .select('*')
      .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });

    const { data: paymentAlerts } = await supabaseClient
      .from('payment_alerts')
      .select('*')
      .eq('email_sent', false);

    const { data: performanceMetrics } = await supabaseClient
      .from('performance_metrics')
      .select('*')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    console.log('Dados coletados para análise:', {
      automationLogs: automationLogs?.length || 0,
      closingStatus: closingStatus?.length || 0,
      paymentAlerts: paymentAlerts?.length || 0,
      performanceMetrics: performanceMetrics?.length || 0
    });

    // Gerar recomendações baseadas nos dados
    const recommendations: AIRecommendation[] = [];

    // Análise de automação
    if (automationLogs && automationLogs.length > 0) {
      const failureRate = automationLogs.filter(log => log.status === 'failed').length / automationLogs.length;
      const avgDuration = automationLogs.reduce((sum, log) => sum + (log.duration_seconds || 0), 0) / automationLogs.length;
      
      if (failureRate > 0.1) { // Mais de 10% de falhas
        recommendations.push({
          id: `automation-failure-${Date.now()}`,
          type: 'optimization',
          title: 'Otimizar Processos de Automação',
          description: `Taxa de falha de ${(failureRate * 100).toFixed(1)}% detectada. Revisar configurações e melhorar robustez dos processos.`,
          priority: failureRate > 0.2 ? 'high' : 'medium',
          estimatedImpact: `Redução de ${Math.round(failureRate * 100)}% nas falhas`,
          actionRequired: true
        });
      }

      if (avgDuration > 300) { // Mais de 5 minutos
        recommendations.push({
          id: `automation-performance-${Date.now()}`,
          type: 'optimization',
          title: 'Acelerar Automações',
          description: `Tempo médio de execução de ${Math.round(avgDuration / 60)} minutos. Possível otimização de performance.`,
          priority: 'medium',
          estimatedImpact: 'Redução de 40% no tempo de processamento',
          actionRequired: false
        });
      }
    }

    // Análise de fechamento mensal
    if (closingStatus && closingStatus.length > 0) {
      const pendingClosings = closingStatus.filter(c => c.status === 'pending').length;
      const avgConfidenceScore = closingStatus.reduce((sum, c) => sum + (c.confidence_score || 0.95), 0) / closingStatus.length;

      if (pendingClosings > 3) {
        recommendations.push({
          id: `closing-backlog-${Date.now()}`,
          type: 'compliance',
          title: 'Reduzir Backlog de Fechamentos',
          description: `${pendingClosings} fechamentos mensais pendentes. Priorizar para manter compliance fiscal.`,
          priority: 'high',
          estimatedImpact: 'Melhoria na conformidade fiscal',
          actionRequired: true
        });
      }

      if (avgConfidenceScore < 0.8) {
        recommendations.push({
          id: `closing-confidence-${Date.now()}`,
          type: 'risk',
          title: 'Melhorar Qualidade dos Fechamentos',
          description: `Score de confiança médio de ${(avgConfidenceScore * 100).toFixed(1)}%. Revisar processos de validação.`,
          priority: 'medium',
          estimatedImpact: 'Aumento da confiabilidade em 25%',
          actionRequired: true
        });
      }
    }

    // Análise de pagamentos
    if (paymentAlerts && paymentAlerts.length > 0) {
      recommendations.push({
        id: `payment-alerts-${Date.now()}`,
        type: 'financial',
        title: 'Resolver Alertas de Pagamento',
        description: `${paymentAlerts.length} alertas de pagamento pendentes. Contatar clientes para regularização.`,
        priority: paymentAlerts.length > 5 ? 'high' : 'medium',
        estimatedImpact: 'Melhoria no fluxo de caixa',
        actionRequired: true
      });
    }

    // Análise de performance
    if (performanceMetrics && performanceMetrics.length > 0) {
      const avgResponseTime = performanceMetrics.reduce((sum, m) => sum + m.execution_time_ms, 0) / performanceMetrics.length;
      const errorRate = performanceMetrics.reduce((sum, m) => sum + m.error_rate, 0) / performanceMetrics.length;

      if (avgResponseTime > 2000) { // Mais de 2 segundos
        recommendations.push({
          id: `performance-optimization-${Date.now()}`,
          type: 'optimization',
          title: 'Otimizar Performance do Sistema',
          description: `Tempo médio de resposta de ${Math.round(avgResponseTime)}ms. Implementar cache e otimizações.`,
          priority: 'medium',
          estimatedImpact: 'Redução de 50% no tempo de resposta',
          actionRequired: false
        });
      }

      if (errorRate > 0.05) { // Mais de 5% de erro
        recommendations.push({
          id: `error-reduction-${Date.now()}`,
          type: 'risk',
          title: 'Reduzir Taxa de Erros',
          description: `Taxa de erro de ${(errorRate * 100).toFixed(1)}%. Implementar melhor tratamento de exceções.`,
          priority: 'high',
          estimatedImpact: 'Melhoria na estabilidade do sistema',
          actionRequired: true
        });
      }
    }

    // Recomendações gerais baseadas no perfil do usuário
    if (userProfile?.role === 'accountant') {
      recommendations.push({
        id: `ai-assistant-expansion-${Date.now()}`,
        type: 'optimization',
        title: 'Expandir Uso do Assistente IA',
        description: 'Utilizar mais recursos de IA para análise fiscal e geração automática de relatórios.',
        priority: 'low',
        estimatedImpact: 'Aumento de 30% na produtividade',
        actionRequired: false
      });
    }

    // Ordenar por prioridade
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    recommendations.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);

    console.log(`Geradas ${recommendations.length} recomendações para o usuário`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        recommendations: recommendations.slice(0, 8) // Limitar a 8 recomendações
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Erro ao gerar recomendações de IA:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        recommendations: []
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});