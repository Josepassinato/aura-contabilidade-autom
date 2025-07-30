import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  AlertTriangle,
  CheckCircle,
  Clock,
  MessageSquare
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DashboardMetrics {
  totalDocuments: number;
  pendingDocuments: number;
  processedDocuments: number;
  nextDeadline: string | null;
  monthlyRevenue: number;
  monthlyExpenses: number;
  unreadMessages: number;
  complianceScore: number;
  overdueTasks: number;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    date: string;
    status: 'success' | 'warning' | 'error';
  }>;
}

interface ClientDashboardProps {
  clientId: string;
}

export const ClientDashboard = ({ clientId }: ClientDashboardProps) => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (clientId) {
      loadDashboardMetrics();
    }
  }, [clientId]);

  const loadDashboardMetrics = async () => {
    try {
      setLoading(true);

      // Buscar documentos do cliente
      const { data: documents, error: docsError } = await supabase
        .from('client_documents')
        .select('*')
        .eq('client_id', clientId);

      if (docsError) throw docsError;

      // Simular mensagens não lidas (temporário até tipos serem atualizados)
      const unreadMessages = Math.floor(Math.random() * 5);

      // Simular obrigações fiscais (temporário até tipos serem atualizados)
      const obligations = [
        {
          id: '1',
          due_date: new Date(Date.now() + 86400000 * 15).toISOString(),
          name: 'DCTF Mensal'
        }
      ];

      // Buscar relatórios financeiros recentes
      const { data: reports, error: reportsError } = await supabase
        .from('generated_reports')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })
        .limit(5);

      // Calcular métricas
      const totalDocuments = documents?.length || 0;
      const pendingDocuments = documents?.filter(doc => doc.status === 'pending').length || 0;
      const processedDocuments = totalDocuments - pendingDocuments;

      // Próximo prazo
      const nextObligation = obligations?.[0];
      const nextDeadline = nextObligation?.due_date || null;

      // Simular dados financeiros (em produção, viria de integração contábil)
      const monthlyRevenue = Math.random() * 100000 + 50000;
      const monthlyExpenses = monthlyRevenue * (0.6 + Math.random() * 0.2);

      // Score de compliance baseado em documentos e prazos
      const complianceScore = Math.min(100, 
        (processedDocuments / Math.max(totalDocuments, 1)) * 70 + 
        (obligations?.filter(o => new Date(o.due_date) > new Date()).length || 0) * 10
      );

      // Atividades recentes
      const recentActivity = [
        ...(documents?.slice(0, 3).map(doc => ({
          id: doc.id,
          type: 'document',
          description: `Documento ${doc.title} ${doc.status === 'approved' ? 'aprovado' : 'enviado'}`,
          date: doc.created_at || '',
          status: doc.status === 'approved' ? 'success' as const : 
                 doc.status === 'pending' ? 'warning' as const : 'error' as const
        })) || []),
        ...(reports?.slice(0, 2).map(report => ({
          id: report.id,
          type: 'report',
          description: `Relatório ${report.title} gerado`,
          date: report.created_at,
          status: 'success' as const
        })) || [])
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

      setMetrics({
        totalDocuments,
        pendingDocuments,
        processedDocuments,
        nextDeadline,
        monthlyRevenue,
        monthlyExpenses,
        unreadMessages,
        complianceScore,
        overdueTasks: pendingDocuments,
        recentActivity
      });

    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
      toast({
        title: "Erro ao carregar dashboard",
        description: "Não foi possível carregar as métricas do cliente",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                <div className="h-4 w-4 bg-muted rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted rounded animate-pulse mb-2" />
                <div className="h-3 w-24 bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6">
      {/* Métricas principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Documentos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalDocuments}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.pendingDocuments} pendentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximo Prazo</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.nextDeadline ? formatDate(metrics.nextDeadline) : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              Obrigação fiscal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.monthlyRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              Despesas: {formatCurrency(metrics.monthlyExpenses)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mensagens</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.unreadMessages}</div>
            <p className="text-xs text-muted-foreground">
              Não lidas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Score de compliance e tarefas */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Score de Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Documentação</span>
                <span className="text-sm font-medium">{Math.round(metrics.complianceScore)}%</span>
              </div>
              <Progress value={metrics.complianceScore} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {metrics.complianceScore >= 80 ? 'Excelente compliance' : 
                 metrics.complianceScore >= 60 ? 'Compliance adequado' : 
                 'Necessita atenção'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tarefas Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Documentos pendentes</span>
                <Badge variant={metrics.pendingDocuments > 0 ? "destructive" : "default"}>
                  {metrics.pendingDocuments}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Tarefas atrasadas</span>
                <Badge variant={metrics.overdueTasks > 0 ? "destructive" : "default"}>
                  {metrics.overdueTasks}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Atividade recente */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Atividade Recente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.recentActivity.length > 0 ? (
              metrics.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  {getStatusIcon(activity.status)}
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(activity.date)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Nenhuma atividade recente</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};