import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  AlertTriangle, 
  Shield, 
  TrendingUp, 
  TrendingDown, 
  Brain, 
  Bell, 
  Settings,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  RefreshCw,
  Download,
  Eye,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Anomaly {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  confidence: number;
  current_value?: number;
  expected_value?: number;
  expected_range?: [number, number];
  period?: string;
  client_id: string;
  client_name: string;
  detected_at: string;
  status: 'pending' | 'investigating' | 'resolved' | 'false_positive';
  notes?: string;
}

interface AnomalyConfig {
  enabled: boolean;
  threshold: number;
  auto_alert: boolean;
  email_notifications: boolean;
  analysis_frequency: string;
}

export default function MonitorAnomalias() {
  const { toast } = useToast();
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState<AnomalyConfig>({
    enabled: true,
    threshold: 0.7,
    auto_alert: true,
    email_notifications: true,
    analysis_frequency: 'daily'
  });
  const [clients, setClients] = useState([]);

  useEffect(() => {
    loadClients();
    loadAnomalies();
    loadConfiguration();
  }, []);

  const loadClients = async () => {
    try {
      const { data, error } = await supabase
        .from('accounting_clients')
        .select('id, name')
        .eq('status', 'active');

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  const loadAnomalies = async () => {
    // Simulando dados de anomalias - em produção viria do banco
    const mockAnomalies: Anomaly[] = [
      {
        id: '1',
        type: 'revenue_anomaly',
        severity: 'high',
        description: 'Receita 45% acima da média histórica',
        confidence: 0.89,
        current_value: 150000,
        expected_range: [80000, 120000],
        period: '2024-01',
        client_id: '11111111-1111-1111-1111-111111111111',
        client_name: 'Empresa Teste LTDA',
        detected_at: '2024-01-15T10:30:00Z',
        status: 'pending'
      },
      {
        id: '2',
        type: 'expense_anomaly',
        severity: 'medium',
        description: 'Despesas com padrão atípico detectado',
        confidence: 0.75,
        current_value: 45000,
        expected_value: 35000,
        period: '2024-01',
        client_id: '11111111-1111-1111-1111-111111111111',
        client_name: 'Empresa Teste LTDA',
        detected_at: '2024-01-14T15:45:00Z',
        status: 'investigating'
      },
      {
        id: '3',
        type: 'duplicate_detection',
        severity: 'critical',
        description: 'Possível duplicação de lançamentos detectada',
        confidence: 0.95,
        period: '2024-01',
        client_id: '11111111-1111-1111-1111-111111111111',
        client_name: 'Empresa Teste LTDA',
        detected_at: '2024-01-13T09:15:00Z',
        status: 'pending'
      }
    ];
    setAnomalies(mockAnomalies);
  };

  const loadConfiguration = async () => {
    // Carregar configurações salvas
    const savedConfig = localStorage.getItem('anomaly_monitor_config');
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }
  };

  const saveConfiguration = async () => {
    localStorage.setItem('anomaly_monitor_config', JSON.stringify(config));
    toast({
      title: "Configuração Salva",
      description: "As configurações do monitor de anomalias foram atualizadas."
    });
  };

  const runAnomalyDetection = async () => {
    if (!selectedClient) {
      toast({
        title: "Erro",
        description: "Selecione um cliente para executar a análise",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('advanced-anomaly-detection', {
        body: {
          client_id: selectedClient,
          analysis_type: 'financial',
          period: new Date().toISOString().slice(0, 7) // Current month
        }
      });

      if (error) throw error;

      if (data.success) {
        // Atualizar lista de anomalias com novos resultados
        const newAnomalies = data.anomalies.map((anomaly: any, index: number) => ({
          id: `new_${index}`,
          type: anomaly.type,
          severity: anomaly.severity === 'high_positive' || anomaly.severity === 'high_negative' ? 'high' : anomaly.severity,
          description: anomaly.description,
          confidence: anomaly.confidence,
          current_value: anomaly.current_value,
          expected_range: anomaly.expected_range,
          period: anomaly.period,
          client_id: selectedClient,
          client_name: clients.find(c => c.id === selectedClient)?.name || 'Cliente',
          detected_at: new Date().toISOString(),
          status: 'pending'
        }));

        setAnomalies(prev => [...newAnomalies, ...prev]);
        
        toast({
          title: "Análise Concluída",
          description: `${data.analysis_summary.total_anomalies} anomalias detectadas`
        });
      }
    } catch (error) {
      console.error('Error running anomaly detection:', error);
      toast({
        title: "Erro",
        description: "Erro ao executar análise de anomalias",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateAnomalyStatus = async (anomalyId: string, newStatus: string, notes?: string) => {
    setAnomalies(prev => prev.map(anomaly => 
      anomaly.id === anomalyId 
        ? { ...anomaly, status: newStatus as any, notes }
        : anomaly
    ));

    toast({
      title: "Status Atualizado",
      description: "O status da anomalia foi atualizado com sucesso."
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="h-4 w-4" />;
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <AlertCircle className="h-4 w-4" />;
      case 'low': return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'investigating': return <Eye className="h-4 w-4 text-blue-500" />;
      case 'false_positive': return <XCircle className="h-4 w-4 text-gray-500" />;
      default: return <Clock className="h-4 w-4 text-orange-500" />;
    }
  };

  const filteredAnomalies = anomalies.filter(anomaly => {
    if (selectedClient && anomaly.client_id !== selectedClient) return false;
    if (selectedSeverity !== 'all' && anomaly.severity !== selectedSeverity) return false;
    if (selectedStatus !== 'all' && anomaly.status !== selectedStatus) return false;
    return true;
  });

  const getAnomaliesStats = () => {
    const total = filteredAnomalies.length;
    const pending = filteredAnomalies.filter(a => a.status === 'pending').length;
    const resolved = filteredAnomalies.filter(a => a.status === 'resolved').length;
    const critical = filteredAnomalies.filter(a => a.severity === 'critical').length;
    
    return { total, pending, resolved, critical };
  };

  const stats = getAnomaliesStats();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Monitor de Anomalias Contábeis</h1>
          <p className="text-muted-foreground">
            Detecção inteligente de irregularidades e padrões atípicos nos dados contábeis
          </p>
        </div>

        {/* Cards de Resumo */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Anomalias</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">Aguardando análise</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Críticas</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
              <p className="text-xs text-muted-foreground">Requerem ação imediata</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolvidas</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
              <p className="text-xs text-muted-foreground">Taxa: {stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}%</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="anomalies" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="anomalies">Anomalias Detectadas</TabsTrigger>
            <TabsTrigger value="detection">Executar Detecção</TabsTrigger>
            <TabsTrigger value="config">Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="anomalies" className="space-y-4">
            {/* Filtros */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filtros
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Cliente</Label>
                    <Select value={selectedClient} onValueChange={setSelectedClient}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos os clientes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todos os clientes</SelectItem>
                        {clients.map((client: any) => (
                          <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Severidade</Label>
                    <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        <SelectItem value="critical">Crítica</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="low">Baixa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Status</Label>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="investigating">Investigando</SelectItem>
                        <SelectItem value="resolved">Resolvida</SelectItem>
                        <SelectItem value="false_positive">Falso Positivo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Anomalias */}
            <div className="space-y-4">
              {filteredAnomalies.length === 0 ? (
                <Card>
                  <CardContent className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium">Nenhuma anomalia encontrada</h3>
                      <p className="text-muted-foreground">
                        {selectedClient ? 'Não há anomalias para os filtros selecionados.' : 'Selecione um cliente e execute a detecção.'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                filteredAnomalies.map((anomaly) => (
                  <Card key={anomaly.id} className="border-l-4" style={{ borderLeftColor: `var(--${anomaly.severity})` }}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${getSeverityColor(anomaly.severity)} text-white`}>
                            {getSeverityIcon(anomaly.severity)}
                          </div>
                          <div>
                            <CardTitle className="text-lg">{anomaly.description}</CardTitle>
                            <CardDescription>
                              {anomaly.client_name} • {anomaly.period} • Confiança: {Math.round(anomaly.confidence * 100)}%
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(anomaly.status)}
                          <Badge variant={anomaly.status === 'resolved' ? 'default' : 'secondary'}>
                            {anomaly.status === 'pending' && 'Pendente'}
                            {anomaly.status === 'investigating' && 'Investigando'}
                            {anomaly.status === 'resolved' && 'Resolvida'}
                            {anomaly.status === 'false_positive' && 'Falso Positivo'}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {/* Valores */}
                        {anomaly.current_value && (
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Valor Atual:</span>
                              <div className="font-medium">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(anomaly.current_value)}
                              </div>
                            </div>
                            {anomaly.expected_value && (
                              <div>
                                <span className="text-muted-foreground">Valor Esperado:</span>
                                <div className="font-medium">
                                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(anomaly.expected_value)}
                                </div>
                              </div>
                            )}
                            {anomaly.expected_range && (
                              <div className="col-span-2">
                                <span className="text-muted-foreground">Faixa Esperada:</span>
                                <div className="font-medium">
                                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(anomaly.expected_range[0])} - {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(anomaly.expected_range[1])}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Nível de Confiança */}
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-muted-foreground">Nível de Confiança</span>
                            <span>{Math.round(anomaly.confidence * 100)}%</span>
                          </div>
                          <Progress value={anomaly.confidence * 100} className="h-2" />
                        </div>

                        {/* Ações */}
                        <div className="flex gap-2 pt-2">
                          <Select
                            value={anomaly.status}
                            onValueChange={(value) => updateAnomalyStatus(anomaly.id, value)}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pendente</SelectItem>
                              <SelectItem value="investigating">Investigando</SelectItem>
                              <SelectItem value="resolved">Resolvida</SelectItem>
                              <SelectItem value="false_positive">Falso Positivo</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            Detalhes
                          </Button>
                        </div>

                        {/* Notas */}
                        {anomaly.notes && (
                          <div className="mt-3 p-3 bg-muted rounded-lg">
                            <span className="text-sm font-medium">Notas:</span>
                            <p className="text-sm text-muted-foreground mt-1">{anomaly.notes}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="detection" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Executar Detecção de Anomalias
                </CardTitle>
                <CardDescription>
                  Execute a análise de anomalias em tempo real para detectar irregularidades
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Cliente para Análise</Label>
                  <Select value={selectedClient} onValueChange={setSelectedClient}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client: any) => (
                        <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={runAnomalyDetection} disabled={isLoading || !selectedClient} className="w-full">
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Executando Análise...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      Executar Detecção de Anomalias
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="config" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configurações do Monitor
                </CardTitle>
                <CardDescription>
                  Configure os parâmetros de detecção e alertas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Monitoramento Ativo</Label>
                    <p className="text-sm text-muted-foreground">Ativar detecção automática de anomalias</p>
                  </div>
                  <Switch
                    checked={config.enabled}
                    onCheckedChange={(checked) => setConfig(prev => ({ ...prev, enabled: checked }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Limiar de Confiança ({Math.round(config.threshold * 100)}%)</Label>
                  <input
                    type="range"
                    min="0.5"
                    max="0.95"
                    step="0.05"
                    value={config.threshold}
                    onChange={(e) => setConfig(prev => ({ ...prev, threshold: parseFloat(e.target.value) }))}
                    className="w-full"
                  />
                  <p className="text-sm text-muted-foreground">
                    Apenas anomalias acima deste limiar serão reportadas
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Frequência de Análise</Label>
                  <Select 
                    value={config.analysis_frequency} 
                    onValueChange={(value) => setConfig(prev => ({ ...prev, analysis_frequency: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">A cada hora</SelectItem>
                      <SelectItem value="daily">Diariamente</SelectItem>
                      <SelectItem value="weekly">Semanalmente</SelectItem>
                      <SelectItem value="manual">Manual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Alertas Automáticos</Label>
                    <p className="text-sm text-muted-foreground">Gerar alertas automaticamente quando anomalias são detectadas</p>
                  </div>
                  <Switch
                    checked={config.auto_alert}
                    onCheckedChange={(checked) => setConfig(prev => ({ ...prev, auto_alert: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Notificações por E-mail</Label>
                    <p className="text-sm text-muted-foreground">Enviar notificações por e-mail para anomalias críticas</p>
                  </div>
                  <Switch
                    checked={config.email_notifications}
                    onCheckedChange={(checked) => setConfig(prev => ({ ...prev, email_notifications: checked }))}
                  />
                </div>

                <Button onClick={saveConfiguration} className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Salvar Configurações
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}