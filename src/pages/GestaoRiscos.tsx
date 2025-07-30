import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp, 
  DollarSign,
  BarChart3,
  Target,
  Users,
  Calendar,
  Settings,
  RefreshCw,
  FileBarChart,
  Gauge,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface RiskProfile {
  id: string;
  client_id: string;
  client_name: string;
  overall_score: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  factors: {
    liquidity_risk: number;
    credit_risk: number;
    operational_risk: number;
    market_risk: number;
    compliance_risk: number;
  };
  trends: {
    monthly_change: number;
    quarterly_change: number;
  };
  last_updated: string;
  recommendations: string[];
}

interface RiskAlert {
  id: string;
  client_id: string;
  client_name: string;
  risk_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  current_value: number;
  threshold_value: number;
  trend: 'improving' | 'stable' | 'deteriorating';
  detected_at: string;
  status: 'active' | 'acknowledged' | 'resolved';
}

interface RiskMetrics {
  total_clients: number;
  high_risk_clients: number;
  active_alerts: number;
  avg_risk_score: number;
  portfolio_health: number;
}

export default function GestaoRiscos() {
  const { toast } = useToast();
  const [riskProfiles, setRiskProfiles] = useState<RiskProfile[]>([]);
  const [riskAlerts, setRiskAlerts] = useState<RiskAlert[]>([]);
  const [metrics, setMetrics] = useState<RiskMetrics>({
    total_clients: 0,
    high_risk_clients: 0,
    active_alerts: 0,
    avg_risk_score: 0,
    portfolio_health: 0
  });
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    loadRiskData();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(loadRiskData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadRiskData = async () => {
    try {
      await Promise.all([
        loadRiskProfiles(),
        loadRiskAlerts(),
        loadMetrics()
      ]);
    } catch (error) {
      console.error('Error loading risk data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRiskProfiles = async () => {
    try {
      // Em produção, buscar perfis de risco reais do Supabase
      setRiskProfiles([]);
    } catch (error) {
      console.error('Error loading risk profiles:', error);
    }
  };

  const loadRiskAlerts = async () => {
    try {
      // Em produção, buscar alertas de risco reais do Supabase
      setRiskAlerts([]);
    } catch (error) {
      console.error('Error loading risk alerts:', error);
    }
  };

  const loadMetrics = async () => {
    try {
      // Em produção, calcular métricas baseadas nos dados reais
      setMetrics({
        total_clients: 0,
        high_risk_clients: 0,
        active_alerts: 0,
        avg_risk_score: 0,
        portfolio_health: 0
      });
    } catch (error) {
      console.error('Error loading metrics:', error);
    }
  };

  const runRiskAnalysis = async () => {
    try {
      setAnalyzing(true);
      
      toast({
        title: "Análise iniciada",
        description: "Executando análise completa de riscos para todos os clientes..."
      });

      // Simular análise de risco
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      await loadRiskData();
      
      toast({
        title: "Análise concluída",
        description: "Análise de riscos atualizada com sucesso."
      });
      
    } catch (error) {
      console.error('Error running risk analysis:', error);
      toast({
        title: "Erro na análise",
        description: "Não foi possível executar a análise de riscos.",
        variant: "destructive"
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive'; 
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getRiskLevelLabel = (level: string) => {
    const labels = {
      'critical': 'Crítico',
      'high': 'Alto',
      'medium': 'Médio',
      'low': 'Baixo'
    };
    return labels[level as keyof typeof labels] || level;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'deteriorating': return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'stable': return <div className="h-4 w-4 bg-gray-400 rounded-full" />;
      default: return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffHours > 24) {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} dia(s) atrás`;
    } else if (diffHours > 0) {
      return `${diffHours}h atrás`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes}m atrás`;
    } else {
      return 'Agora';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Shield className="h-8 w-8 animate-pulse mx-auto mb-4" />
          <p>Carregando gestão de riscos...</p>
        </div>
      </div>
    );
  }

  const criticalAlerts = riskAlerts.filter(alert => alert.severity === 'critical');
  const activeAlerts = riskAlerts.filter(alert => alert.status === 'active');
  const highRiskClients = riskProfiles.filter(profile => profile.risk_level === 'high' || profile.risk_level === 'critical');

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Gestão de Riscos
          </h1>
          <p className="text-muted-foreground">
            Monitoramento e análise de riscos financeiros em tempo real
          </p>
        </div>
        <Button 
          onClick={runRiskAnalysis} 
          disabled={analyzing}
          className="gap-2"
        >
          {analyzing ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <BarChart3 className="h-4 w-4" />
          )}
          {analyzing ? 'Analisando...' : 'Executar Análise'}
        </Button>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Clientes</p>
                <p className="text-2xl font-bold">{metrics.total_clients}</p>
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
                <p className="text-sm text-muted-foreground">Alto Risco</p>
                <p className="text-2xl font-bold text-red-600">{metrics.high_risk_clients}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Alertas Ativos</p>
                <p className="text-2xl font-bold text-yellow-600">{metrics.active_alerts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Gauge className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Score Médio</p>
                <p className="text-2xl font-bold">{metrics.avg_risk_score}/100</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Saúde do Portfólio</p>
                <p className="text-2xl font-bold text-green-600">{metrics.portfolio_health}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas Críticos */}
      {criticalAlerts.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              Alertas Críticos Ativos ({criticalAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {criticalAlerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 bg-white rounded border border-red-200">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-red-700">{alert.client_name}</span>
                      <Badge variant="destructive">{alert.risk_type}</Badge>
                      {getTrendIcon(alert.trend)}
                    </div>
                    <p className="text-sm text-gray-600">{alert.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {alert.current_value.toFixed(1)} / {alert.threshold_value.toFixed(1)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {getTimeAgo(alert.detected_at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs principais */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="profiles" className="gap-2">
            <Users className="h-4 w-4" />
            Perfis de Risco ({riskProfiles.length})
          </TabsTrigger>
          <TabsTrigger value="alerts" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Alertas ({riskAlerts.length})
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <FileBarChart className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="config" className="gap-2">
            <Settings className="h-4 w-4" />
            Configurações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Distribuição por Nível de Risco */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Nível de Risco</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['critical', 'high', 'medium', 'low'].map((level) => {
                    const count = riskProfiles.filter(p => p.risk_level === level).length;
                    const percentage = riskProfiles.length > 0 ? (count / riskProfiles.length) * 100 : 0;
                    
                    return (
                      <div key={level} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="flex items-center gap-2">
                            <Badge variant={getRiskLevelColor(level)}>
                              {getRiskLevelLabel(level)}
                            </Badge>
                          </span>
                          <span className="text-sm font-medium">{count} clientes</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Top Clientes de Alto Risco */}
            <Card>
              <CardHeader>
                <CardTitle>Clientes de Alto Risco</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {highRiskClients.slice(0, 5).map((profile) => (
                    <div key={profile.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-semibold">{profile.client_name}</div>
                        <div className="text-sm text-muted-foreground">
                          Score: {profile.overall_score}/100
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={getRiskLevelColor(profile.risk_level)}>
                          {getRiskLevelLabel(profile.risk_level)}
                        </Badge>
                        <div className="text-xs text-muted-foreground mt-1">
                          {profile.trends.monthly_change > 0 ? '+' : ''}{profile.trends.monthly_change}% mês
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="profiles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Perfis de Risco dos Clientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {riskProfiles.map((profile) => (
                  <div key={profile.id} className="border rounded-lg p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-semibold">{profile.client_name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={getRiskLevelColor(profile.risk_level)}>
                            {getRiskLevelLabel(profile.risk_level)}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Score: {profile.overall_score}/100
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm">
                          Tendência mensal: 
                          <span className={`ml-1 font-medium ${profile.trends.monthly_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {profile.trends.monthly_change > 0 ? '+' : ''}{profile.trends.monthly_change}%
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Atualizado: {getTimeAgo(profile.last_updated)}
                        </div>
                      </div>
                    </div>

                    {/* Fatores de Risco */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      {Object.entries(profile.factors).map(([factor, score]) => (
                        <div key={factor} className="text-center">
                          <div className="text-sm text-muted-foreground mb-1">
                            {factor.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </div>
                          <div className="relative">
                            <Progress value={score} className="h-2 mb-1" />
                            <span className="text-xs font-medium">{score}/100</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Recomendações */}
                    <div>
                      <h4 className="font-medium mb-2">Recomendações:</h4>
                      <ul className="text-sm space-y-1">
                        {profile.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <CheckCircle2 className="h-3 w-3 text-blue-600 flex-shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alertas de Risco</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {riskAlerts.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Nenhum alerta de risco ativo encontrado!
                    </p>
                  </div>
                ) : (
                  riskAlerts.map((alert) => (
                    <div key={alert.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Badge variant={getRiskLevelColor(alert.severity)}>
                            {getRiskLevelLabel(alert.severity)}
                          </Badge>
                          <Badge variant="outline">{alert.risk_type}</Badge>
                          {getTrendIcon(alert.trend)}
                          <Badge variant={alert.status === 'active' ? 'destructive' : 'secondary'}>
                            {alert.status === 'active' && 'Ativo'}
                            {alert.status === 'acknowledged' && 'Reconhecido'}
                            {alert.status === 'resolved' && 'Resolvido'}
                          </Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {getTimeAgo(alert.detected_at)}
                        </span>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold mb-1">{alert.client_name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {alert.description}
                        </p>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Valor atual:</span>
                          <span className="ml-1 font-medium">{alert.current_value.toFixed(2)}</span>
                          <span className="text-muted-foreground ml-4">Limite:</span>
                          <span className="ml-1 font-medium">{alert.threshold_value.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="text-center py-8">
            <FileBarChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Analytics Avançados</h3>
            <p className="text-muted-foreground">
              Relatórios detalhados e análises preditivas de risco em desenvolvimento
            </p>
          </div>
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <div className="text-center py-8">
            <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Configurações de Risco</h3>
            <p className="text-muted-foreground">
              Configuração de limites, alertas e parâmetros de risco em desenvolvimento
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}