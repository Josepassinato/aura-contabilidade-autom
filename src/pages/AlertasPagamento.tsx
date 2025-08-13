import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertTriangle, 
  Calendar, 
  DollarSign, 
  Mail, 
  CheckCircle, 
  Clock,
  Building,
  Users,
  TrendingUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PaymentAlertsManager } from "@/components/admin/payment-alerts/PaymentAlertsManager";
import { supabase } from "@/integrations/supabase/client";

interface PaymentAlert {
  id: string;
  client_id: string;
  client_name: string;
  client_email: string;
  alert_type: string;
  payment_due_date: string;
  days_until_due: number;
  alert_sent_date: string;
  email_sent: boolean;
}

interface PaymentStatistics {
  total_clients: number;
  overdue_payments: number;
  upcoming_payments: number;
  total_revenue_at_risk: number;
}

export default function AlertasPagamento() {
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<PaymentAlert[]>([]);
  const [statistics, setStatistics] = useState<PaymentStatistics>({
    total_clients: 0,
    overdue_payments: 0,
    upcoming_payments: 0,
    total_revenue_at_risk: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'warning_10_days' | 'warning_5_days' | 'final_notice'>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  useEffect(() => {
    loadPaymentAlerts();
    loadStatistics();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(() => {
      loadPaymentAlerts();
      loadStatistics();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const loadPaymentAlerts = async () => {
    try {
      const { data, error } = await supabase.rpc('get_pending_payment_alerts');
      
      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData = (data || []).map((alert: any) => ({
        id: alert.alert_id,
        client_id: alert.client_id,
        client_name: alert.client_name,
        client_email: alert.client_email,
        alert_type: alert.alert_type,
        payment_due_date: alert.payment_due_date,
        days_until_due: alert.days_until_due,
        alert_sent_date: alert.alert_sent_date,
        email_sent: false // Default value since the function returns pending alerts
      }));
      
      setAlerts(transformedData);
    } catch (error) {
      console.error('Error loading payment alerts:', error);
      toast({
        title: "Erro ao carregar alertas",
        description: "Não foi possível carregar os alertas de pagamento.",
        variant: "destructive"
      });
    }
  };

  const loadStatistics = async () => {
    try {
      // Simulação de estatísticas (em produção viria do banco)
      const { data: clients } = await supabase
        .from('accounting_clients')
        .select('*')
        .eq('status', 'active');

      const { data: alertsData } = await supabase
        .from('payment_alerts')
        .select('*')
        .eq('email_sent', false);

      const totalClients = clients?.length || 0;
      const overdueAlerts = alertsData?.filter(alert => 
        new Date(alert.payment_due_date) < new Date()
      ).length || 0;
      
      const upcomingAlerts = alertsData?.filter(alert => 
        new Date(alert.payment_due_date) >= new Date()
      ).length || 0;

      setStatistics({
        total_clients: totalClients,
        overdue_payments: overdueAlerts,
        upcoming_payments: upcomingAlerts,
        total_revenue_at_risk: overdueAlerts * 500 // Estimativa
      });
      
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const triggerPaymentCheck = async () => {
    try {
      const { error } = await supabase.rpc('check_overdue_payments');
      
      if (error) throw error;
      
      toast({
        title: "Verificação executada",
        description: "Verificação de pagamentos em atraso executada com sucesso."
      });
      
      // Recarregar dados
      await loadPaymentAlerts();
      await loadStatistics();
      
    } catch (error) {
      console.error('Error triggering payment check:', error);
      toast({
        title: "Erro na verificação",
        description: "Não foi possível executar a verificação de pagamentos.",
        variant: "destructive"
      });
    }
  };

  const getAlertTypeLabel = (type: string) => {
    const labels = {
      'warning_10_days': 'Aviso 10 dias',
      'warning_5_days': 'Aviso 5 dias', 
      'final_notice': 'Aviso Final',
      'overdue': 'Em Atraso'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getAlertSeverity = (daysUntilDue: number) => {
    if (daysUntilDue < 0) return 'destructive';
    if (daysUntilDue <= 1) return 'destructive';
    if (daysUntilDue <= 5) return 'default';
    return 'secondary';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} dia(s) atrás`;
    } else if (diffHours > 0) {
      return `${diffHours}h atrás`;
    } else {
      return 'Agora';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Carregando alertas de pagamento...</p>
        </div>
      </div>
    );
  }

  const filterFn = (a: PaymentAlert) =>
    a.client_name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (typeFilter === 'all' || a.alert_type === typeFilter);

  const filteredAll = alerts.filter(filterFn);
  const overdueAlerts = filteredAll.filter(alert => alert.days_until_due < 0);
  const upcomingAlerts = filteredAll.filter(alert => alert.days_until_due >= 0);
  const totalPages = Math.max(1, Math.ceil(filteredAll.length / pageSize));
  const start = (page - 1) * pageSize;
  const currentPageAlerts = filteredAll.slice(start, start + pageSize);
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Alertas de Pagamento</h1>
            <p className="text-muted-foreground">Monitoramento automático de vencimentos e inadimplência</p>
          </div>
          <Button onClick={triggerPaymentCheck} className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Executar Verificação
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <input
            className="border rounded px-3 py-2 text-sm"
            placeholder="Buscar por cliente..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
          />
          <select
            className="border rounded px-3 py-2 text-sm"
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value as any); setPage(1); }}
          >
            <option value="all">Todos os tipos</option>
            <option value="warning_10_days">Aviso 10 dias</option>
            <option value="warning_5_days">Aviso 5 dias</option>
            <option value="final_notice">Aviso Final</option>
          </select>
          <select
            className="border rounded px-3 py-2 text-sm"
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
          >
            {[10,20,50].map(n => <option key={n} value={n}>{n}/página</option>)}
          </select>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Clientes Ativos</p>
                <p className="text-2xl font-bold">{statistics.total_clients}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pagamentos Atrasados</p>
                <p className="text-2xl font-bold text-red-600">{statistics.overdue_payments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Próximos Vencimentos</p>
                <p className="text-2xl font-bold text-yellow-600">{statistics.upcoming_payments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Receita em Risco</p>
                <p className="text-2xl font-bold">
                  {new Intl.NumberFormat('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL' 
                  }).format(statistics.total_revenue_at_risk)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas */}
      <Tabs defaultValue="overdue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overdue" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Em Atraso ({overdueAlerts.length})
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="gap-2">
            <Calendar className="h-4 w-4" />
            Próximos Vencimentos ({upcomingAlerts.length})
          </TabsTrigger>
          <TabsTrigger value="all" className="gap-2">
            <Users className="h-4 w-4" />
            Todos ({alerts.length})
          </TabsTrigger>
          <TabsTrigger value="management" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Gerenciamento
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overdue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Pagamentos em Atraso
              </CardTitle>
            </CardHeader>
            <CardContent>
              {overdueAlerts.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Nenhum pagamento em atraso encontrado!
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {overdueAlerts.map((alert) => (
                      <div key={alert.id} className="border border-red-200 rounded-lg p-4 bg-red-50">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{alert.client_name}</h3>
                              <Badge variant="destructive">
                                {Math.abs(alert.days_until_due)} dias em atraso
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Email:</span>
                                <div>{alert.client_email}</div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Vencimento:</span>
                                <div>{formatDate(alert.payment_due_date)}</div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Tipo de Alerta:</span>
                                <div>{getAlertTypeLabel(alert.alert_type)}</div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Enviado:</span>
                                <div>{getTimeAgo(alert.alert_sent_date)}</div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {alert.email_sent ? (
                              <Badge variant="secondary" className="gap-1">
                                <Mail className="h-3 w-3" />
                                Enviado
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="gap-1">
                                <Clock className="h-3 w-3" />
                                Pendente
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-600">
                <Calendar className="h-5 w-5" />
                Próximos Vencimentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingAlerts.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Nenhum vencimento próximo encontrado!
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {upcomingAlerts.map((alert) => (
                      <div key={alert.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{alert.client_name}</h3>
                              <Badge variant={getAlertSeverity(alert.days_until_due)}>
                                {alert.days_until_due === 0 ? 'Vence hoje' : `${alert.days_until_due} dias`}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Email:</span>
                                <div>{alert.client_email}</div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Vencimento:</span>
                                <div>{formatDate(alert.payment_due_date)}</div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Tipo de Alerta:</span>
                                <div>{getAlertTypeLabel(alert.alert_type)}</div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Enviado:</span>
                                <div>{getTimeAgo(alert.alert_sent_date)}</div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {alert.email_sent ? (
                              <Badge variant="secondary" className="gap-1">
                                <Mail className="h-3 w-3" />
                                Enviado
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="gap-1">
                                <Clock className="h-3 w-3" />
                                Pendente
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Todos os Alertas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredAll.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Nenhum alerta de pagamento encontrado!
                  </p>
                </div>
              ) : (
                <>
                  <ScrollArea className="h-96">
                    <div className="space-y-3">
                      {currentPageAlerts.map((alert) => (
                        <div key={alert.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold">{alert.client_name}</h3>
                                <Badge variant={getAlertSeverity(alert.days_until_due)}>
                                  {alert.days_until_due < 0 
                                    ? `${Math.abs(alert.days_until_due)} dias em atraso`
                                    : alert.days_until_due === 0 
                                      ? 'Vence hoje'
                                      : `${alert.days_until_due} dias`
                                  }
                                </Badge>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-muted-foreground">Email:</span>
                                  <div>{alert.client_email}</div>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Vencimento:</span>
                                  <div>{formatDate(alert.payment_due_date)}</div>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Tipo de Alerta:</span>
                                  <div>{getAlertTypeLabel(alert.alert_type)}</div>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Enviado:</span>
                                  <div>{getTimeAgo(alert.alert_sent_date)}</div>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {alert.email_sent ? (
                                <Badge variant="secondary" className="gap-1">
                                  <Mail className="h-3 w-3" />
                                  Enviado
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="gap-1">
                                  <Clock className="h-3 w-3" />
                                  Pendente
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  <div className="flex items-center justify-between mt-3 text-sm">
                    <span className="text-muted-foreground">Página {page} de {totalPages}</span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Anterior</Button>
                      <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Próxima</Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="management" className="space-y-4">
          <PaymentAlertsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}