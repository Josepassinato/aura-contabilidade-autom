import React, { useState, useEffect } from 'react';
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

  // Mock data para demonstração
  useEffect(() => {
    setMetrics({
      totalFirms: 47,
      totalClients: 312,
      mrr: 24500,
      growth: 12.5,
      churn: 2.1,
      activeUsers: 89,
      systemUptime: 99.8,
      apiResponseTime: 245,
      pendingPayments: 3,
      openTickets: 7
    });

    setAlerts([
      {
        id: '1',
        type: 'warning',
        title: 'Alto uso de API OpenAI',
        description: 'Uso da API está em 85% do limite mensal',
        timestamp: '5 min atrás'
      },
      {
        id: '2',
        type: 'critical',
        title: 'Pagamento pendente',
        description: '3 escritórios com pagamento em atraso',
        timestamp: '1 hora atrás'
      },
      {
        id: '3',
        type: 'info',
        title: 'Backup completo',
        description: 'Backup automático executado com sucesso',
        timestamp: '2 horas atrás'
      }
    ]);
  }, []);

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