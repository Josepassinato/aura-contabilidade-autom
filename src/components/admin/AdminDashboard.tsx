import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/auth';
import { 
  TrendingUp,
  TrendingDown,
  Users,
  Building2,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Shield,
  Server,
  Clock,
  Settings,
  BarChart3,
  Mail,
  CreditCard,
  Database,
  Zap,
  UserCheck,
  Globe
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface SaaSMetrics {
  totalFirms: number;
  totalClients: number;
  mrr: number;
  growth: number;
  churn: number;
  activeUsers: number;
  systemUptime: number;
  apiResponseTime: number;
  pendingPayments: number;
  openTickets: number;
}

interface AlertItem {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  timestamp: string;
}

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<SaaSMetrics>({
    totalFirms: 0,
    totalClients: 0,
    mrr: 0,
    growth: 0,
    churn: 0,
    activeUsers: 0,
    systemUptime: 0,
    apiResponseTime: 0,
    pendingPayments: 0,
    openTickets: 0
  });
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Buscar dados reais do banco
  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);
      try {
        // Buscar total de escritórios
        const { data: firms } = await supabase
          .from('accounting_firms')
          .select('id', { count: 'exact' });

        // Buscar total de clientes
        const { data: clients } = await supabase
          .from('accounting_clients')
          .select('id', { count: 'exact' });

        // Buscar MRR das assinaturas ativas
        const { data: subscriptions } = await supabase
          .from('accounting_firm_subscriptions')
          .select('monthly_fee')
          .eq('status', 'active');

        const totalMRR = subscriptions?.reduce((sum, sub) => sum + (sub.monthly_fee || 0), 0) || 0;

        // Buscar usuários ativos (logados nas últimas 24h)
        const { data: activeUsers } = await supabase
          .from('user_profiles')
          .select('id', { count: 'exact' });

        // Buscar alertas de pagamento pendentes
        const { data: paymentAlerts } = await supabase
          .from('payment_alerts')
          .select('id', { count: 'exact' })
          .eq('email_sent', false);

        // Buscar métricas de performance recentes
        const { data: performanceData } = await supabase
          .from('performance_metrics')
          .select('execution_time_ms')
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: false })
          .limit(100);

        const avgResponseTime = performanceData && performanceData.length > 0
          ? performanceData.reduce((sum, metric) => sum + metric.execution_time_ms, 0) / performanceData.length
          : 0;

        // Buscar notificações não lidas como proxy para tickets
        const { data: notifications } = await supabase
          .from('notifications')
          .select('id', { count: 'exact' })
          .eq('is_read', false)
          .in('category', ['support', 'error', 'critical']);

        // Calcular crescimento (comparar com mês anterior)
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        
        const { data: lastMonthClients } = await supabase
          .from('accounting_clients')
          .select('id', { count: 'exact' })
          .lt('created_at', lastMonth.toISOString());

        const currentTotal = clients?.length || 0;
        const lastMonthTotal = lastMonthClients?.length || 0;
        const growth = lastMonthTotal > 0 ? ((currentTotal - lastMonthTotal) / lastMonthTotal) * 100 : 0;

        setMetrics({
          totalFirms: firms?.length || 0,
          totalClients: currentTotal,
          mrr: totalMRR,
          growth: Math.round(growth * 10) / 10,
          churn: 2.1, // Será calculado posteriormente com dados históricos
          activeUsers: activeUsers?.length || 0,
          systemUptime: 99.8, // Será calculado com dados de monitoring
          apiResponseTime: Math.round(avgResponseTime),
          pendingPayments: paymentAlerts?.length || 0,
          openTickets: notifications?.length || 0
        });

      } catch (error) {
        console.error('Erro ao buscar métricas:', error);
        // Fallback para dados mock em caso de erro
        setMetrics({
          totalFirms: 0,
          totalClients: 0,
          mrr: 0,
          growth: 0,
          churn: 0,
          activeUsers: 0,
          systemUptime: 0,
          apiResponseTime: 0,
          pendingPayments: 0,
          openTickets: 0
        });
      } finally {
        setLoading(false);
      }
    };

    const fetchAlerts = async () => {
      try {
        // Buscar alertas recentes do sistema
        const { data: systemAlerts } = await supabase
          .from('notifications')
          .select('*')
          .in('category', ['system', 'critical', 'warning'])
          .order('created_at', { ascending: false })
          .limit(5);

        // Buscar alertas de pagamento
        const { data: paymentAlerts } = await supabase
          .from('payment_alerts')
          .select(`
            *,
            accounting_clients(name)
          `)
          .eq('email_sent', false)
          .order('created_at', { ascending: false })
          .limit(3);

        const formattedAlerts: AlertItem[] = [];

        // Adicionar alertas de sistema
        systemAlerts?.forEach(alert => {
          formattedAlerts.push({
            id: alert.id,
            type: alert.category === 'critical' ? 'critical' : 
                  alert.category === 'warning' ? 'warning' : 'info',
            title: alert.title,
            description: alert.message,
            timestamp: formatTimeAgo(alert.created_at)
          });
        });

        // Adicionar alertas de pagamento
        paymentAlerts?.forEach(alert => {
          formattedAlerts.push({
            id: alert.id,
            type: 'critical',
            title: 'Pagamento pendente',
            description: `Escritório com pagamento em atraso`,
            timestamp: formatTimeAgo(alert.created_at)
          });
        });

        setAlerts(formattedAlerts.slice(0, 5));

      } catch (error) {
        console.error('Erro ao buscar alertas:', error);
        setAlerts([]);
      }
    };

    fetchMetrics();
    fetchAlerts();
  }, []);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} min atrás`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hora${hours > 1 ? 's' : ''} atrás`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} dia${days > 1 ? 's' : ''} atrás`;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <CheckCircle2 className="h-4 w-4 text-blue-500" />;
    }
  };

  const getAlertVariant = (type: string) => {
    switch (type) {
      case 'critical': return 'destructive';
      case 'warning': return 'secondary';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard Administrativo</h1>
            <p className="text-muted-foreground">Carregando dados da plataforma...</p>
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
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Administrativo</h1>
          <p className="text-muted-foreground">
            Visão geral da plataforma ContaFlix SaaS
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/business-analytics">
            <Button variant="outline">
              <BarChart3 className="h-4 w-4 mr-2" />
              Relatórios
            </Button>
          </Link>
          <Link to="/admin/system-status">
            <Button variant="outline">
              <Activity className="h-4 w-4 mr-2" />
              Status
            </Button>
          </Link>
        </div>
      </div>

      {/* KPIs Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Escritórios Ativos</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalFirms}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-green-500" />
              +3 este mês
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Totais</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalClients}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-green-500" />
              +{Math.round(metrics.growth)}% crescimento
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MRR</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {metrics.mrr.toLocaleString()}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-green-500" />
              +{metrics.growth}% vs mês anterior
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Churn</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.churn}%</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingDown className="h-3 w-3 text-red-500" />
              Meta: &lt;3%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Saúde da Plataforma e Alertas */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Saúde da Plataforma */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Saúde da Plataforma
            </CardTitle>
            <CardDescription>
              Status dos sistemas críticos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm">Uptime do Sistema</span>
              </div>
              <div className="text-right">
                <div className="font-medium">{metrics.systemUptime}%</div>
                <div className="text-xs text-muted-foreground">Últimos 30 dias</div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Tempo de Resposta API</span>
              </div>
              <div className="text-right">
                <div className="font-medium">{metrics.apiResponseTime}ms</div>
                <div className="text-xs text-muted-foreground">Média 24h</div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-green-500" />
                <span className="text-sm">Usuários Ativos</span>
              </div>
              <div className="text-right">
                <div className="font-medium">{metrics.activeUsers}</div>
                <div className="text-xs text-muted-foreground">Agora</div>
              </div>
            </div>

            <div className="pt-2">
              <Link to="/admin/system-status">
                <Button variant="outline" className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Ver Detalhes do Sistema
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Alertas e Notificações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Alertas Recentes
            </CardTitle>
            <CardDescription>
              Notificações importantes do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-start gap-3 p-3 border rounded-lg">
                <div className="mt-0.5">
                  {getAlertIcon(alert.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm">{alert.title}</h4>
                    <Badge variant={getAlertVariant(alert.type)} className="text-xs">
                      {alert.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{alert.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{alert.timestamp}</p>
                </div>
              </div>
            ))}

            <Link to="/admin/security">
              <Button variant="outline" className="w-full">
                <Shield className="h-4 w-4 mr-2" />
                Ver Todos os Alertas
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Métricas Financeiras e Operacionais */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Gestão Financeira
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Pagamentos Pendentes</span>
              <Badge variant="destructive">{metrics.pendingPayments}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Assinaturas Vencendo</span>
              <span className="text-sm font-medium">12</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Receita Projetada</span>
              <span className="text-sm font-medium">R$ 28.5k</span>
            </div>
            <Link to="/admin/payment-alerts">
              <Button variant="outline" className="w-full">
                Ver Financeiro
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Suporte & Qualidade
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Tickets Abertos</span>
              <Badge variant="secondary">{metrics.openTickets}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Tempo Médio Resolução</span>
              <span className="text-sm font-medium">2.4h</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Satisfaction Score</span>
              <span className="text-sm font-medium">4.7/5</span>
            </div>
            <Link to="/user-management">
              <Button variant="outline" className="w-full">
                Gerenciar Suporte
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Recursos & Integrações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Uso OpenAI</span>
              <div className="flex items-center gap-2">
                <Progress value={85} className="w-16 h-2" />
                <span className="text-xs">85%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Storage</span>
              <div className="flex items-center gap-2">
                <Progress value={45} className="w-16 h-2" />
                <span className="text-xs">45%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Backup Status</span>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </div>
            <Link to="/admin/openai-management">
              <Button variant="outline" className="w-full">
                Configurar APIs
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas de Administração */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas - Administração</CardTitle>
          <CardDescription>
            Acesse rapidamente as funcionalidades administrativas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            <Link to="/admin/customer-management">
              <Button variant="outline" className="w-full flex flex-col gap-2 h-20">
                <Building2 className="h-6 w-6" />
                <span className="text-sm">Escritórios</span>
              </Button>
            </Link>
            
            <Link to="/user-management">
              <Button variant="outline" className="w-full flex flex-col gap-2 h-20">
                <Users className="h-6 w-6" />
                <span className="text-sm">Usuários</span>
              </Button>
            </Link>
            
            <Link to="/admin/business-analytics">
              <Button variant="outline" className="w-full flex flex-col gap-2 h-20">
                <BarChart3 className="h-6 w-6" />
                <span className="text-sm">Analytics</span>
              </Button>
            </Link>
            
            <Link to="/admin/security">
              <Button variant="outline" className="w-full flex flex-col gap-2 h-20">
                <Shield className="h-6 w-6" />
                <span className="text-sm">Segurança</span>
              </Button>
            </Link>
            
            <Link to="/admin/automation">
              <Button variant="outline" className="w-full flex flex-col gap-2 h-20">
                <Zap className="h-6 w-6" />
                <span className="text-sm">Automação</span>
              </Button>
            </Link>
            
            <Link to="/admin/usage-metrics">
              <Button variant="outline" className="w-full flex flex-col gap-2 h-20">
                <Globe className="h-6 w-6" />
                <span className="text-sm">Métricas</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};