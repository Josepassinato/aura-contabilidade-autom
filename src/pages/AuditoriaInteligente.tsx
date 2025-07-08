import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  FileSearch,
  Brain,
  Activity,
  Settings,
  PlayCircle,
  PauseCircle,
  RotateCcw,
  Eye,
  Calendar,
  Target,
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AuditoriaDashboard } from "@/components/fiscal/auditoria/AuditoriaDashboard";
import { AuditoriaContinuaConfig } from "@/components/fiscal/auditoria/AuditoriaContinuaConfig";

interface AuditStatus {
  id: string;
  status: 'running' | 'completed' | 'paused' | 'error';
  progress: number;
  started_at: string;
  completed_at?: string;
  client_count: number;
  issues_found: number;
  rules_applied: number;
  confidence_score: number;
  last_updated: string;
}

interface AuditRule {
  id: string;
  name: string;
  description: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  confidence_threshold: number;
  last_executed: string;
  execution_count: number;
  issues_found: number;
}

interface AuditIssue {
  id: string;
  rule_id: string;
  client_id: string;
  client_name: string;
  severity: string;
  description: string;
  recommendation: string;
  confidence: number;
  status: 'open' | 'resolved' | 'investigating' | 'false_positive';
  detected_at: string;
  resolved_at?: string;
  metadata: any;
}

export default function AuditoriaInteligente() {
  const { toast } = useToast();
  const [auditStatus, setAuditStatus] = useState<AuditStatus | null>(null);
  const [auditRules, setAuditRules] = useState<AuditRule[]>([]);
  const [auditIssues, setAuditIssues] = useState<AuditIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRunningAudit, setIsRunningAudit] = useState(false);

  useEffect(() => {
    loadAuditData();
    
    // Auto-refresh every 30 seconds when audit is running
    const interval = setInterval(() => {
      if (auditStatus?.status === 'running' || isRunningAudit) {
        loadAuditStatus();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [auditStatus?.status, isRunningAudit]);

  const loadAuditData = async () => {
    try {
      await Promise.all([
        loadAuditStatus(),
        loadAuditRules(),
        loadAuditIssues()
      ]);
    } catch (error) {
      console.error('Error loading audit data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAuditStatus = async () => {
    try {
      // Simular dados de status da auditoria
      const mockStatus: AuditStatus = {
        id: 'audit-' + Date.now(),
        status: 'completed',
        progress: 100,
        started_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        completed_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        client_count: 25,
        issues_found: 8,
        rules_applied: 15,
        confidence_score: 0.92,
        last_updated: new Date().toISOString()
      };
      
      setAuditStatus(mockStatus);
    } catch (error) {
      console.error('Error loading audit status:', error);
    }
  };

  const loadAuditRules = async () => {
    try {
      // Simular regras de auditoria
      const mockRules: AuditRule[] = [
        {
          id: 'rule-1',
          name: 'Verificação de Duplicatas',
          description: 'Detecta lançamentos duplicados ou suspeitos',
          category: 'Integridade',
          severity: 'high',
          enabled: true,
          confidence_threshold: 0.85,
          last_executed: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          execution_count: 147,
          issues_found: 3
        },
        {
          id: 'rule-2',
          name: 'Análise de Padrões Incomuns',
          description: 'Identifica transações fora do padrão histórico',
          category: 'Comportamental',
          severity: 'medium',
          enabled: true,
          confidence_threshold: 0.75,
          last_executed: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          execution_count: 147,
          issues_found: 2
        },
        {
          id: 'rule-3',
          name: 'Validação de Balanceamento',
          description: 'Verifica se débitos e créditos estão balanceados',
          category: 'Conformidade',
          severity: 'critical',
          enabled: true,
          confidence_threshold: 0.95,
          last_executed: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          execution_count: 147,
          issues_found: 1
        },
        {
          id: 'rule-4',
          name: 'Detecção de Valores Atípicos',
          description: 'Identifica valores muito acima ou abaixo da média',
          category: 'Estatística',
          severity: 'medium',
          enabled: true,
          confidence_threshold: 0.70,
          last_executed: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          execution_count: 147,
          issues_found: 2
        },
        {
          id: 'rule-5',
          name: 'Verificação de Integridade Temporal',
          description: 'Detecta lançamentos com datas inconsistentes',
          category: 'Temporal',
          severity: 'high',
          enabled: false,
          confidence_threshold: 0.80,
          last_executed: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          execution_count: 98,
          issues_found: 0
        }
      ];
      
      setAuditRules(mockRules);
    } catch (error) {
      console.error('Error loading audit rules:', error);
    }
  };

  const loadAuditIssues = async () => {
    try {
      // Simular problemas encontrados
      const mockIssues: AuditIssue[] = [
        {
          id: 'issue-1',
          rule_id: 'rule-1',
          client_id: 'client-1',
          client_name: 'Empresa Teste LTDA',
          severity: 'high',
          description: 'Lançamentos duplicados detectados no período de Janeiro/2024',
          recommendation: 'Revisar e corrigir os lançamentos duplicados identificados',
          confidence: 0.94,
          status: 'open',
          detected_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          metadata: {
            duplicate_count: 3,
            total_value: 15600.50,
            affected_accounts: ['1.1.1.01', '4.1.1.01']
          }
        },
        {
          id: 'issue-2',
          rule_id: 'rule-2',
          client_id: 'client-2',
          client_name: 'Outro Cliente LTDA',
          severity: 'medium',
          description: 'Padrão de gastos atípico detectado em despesas administrativas',
          recommendation: 'Verificar justificativa para aumento de 45% nas despesas',
          confidence: 0.78,
          status: 'investigating',
          detected_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          metadata: {
            variance_percentage: 45,
            period: 'Janeiro/2024',
            category: 'Despesas Administrativas'
          }
        },
        {
          id: 'issue-3',
          rule_id: 'rule-3',
          client_id: 'client-1',
          client_name: 'Empresa Teste LTDA',
          severity: 'critical',
          description: 'Desbalanceamento contábil detectado no balancete de Janeiro',
          recommendation: 'Urgente: Revisar e corrigir o balanceamento do período',
          confidence: 0.96,
          status: 'open',
          detected_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          metadata: {
            difference_amount: 2500.00,
            period: 'Janeiro/2024',
            affected_accounts: ['1.1.1.01', '2.1.1.01']
          }
        }
      ];
      
      setAuditIssues(mockIssues);
    } catch (error) {
      console.error('Error loading audit issues:', error);
    }
  };

  const startAudit = async () => {
    try {
      setIsRunningAudit(true);
      
      // Simular início da auditoria
      setAuditStatus(prev => prev ? {
        ...prev,
        status: 'running',
        progress: 0,
        started_at: new Date().toISOString(),
        completed_at: undefined
      } : null);

      toast({
        title: "Auditoria iniciada",
        description: "A auditoria contínua foi iniciada e está processando todos os clientes."
      });

      // Simular progresso
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress >= 100) {
          progress = 100;
          clearInterval(progressInterval);
          setAuditStatus(prev => prev ? {
            ...prev,
            status: 'completed',
            progress: 100,
            completed_at: new Date().toISOString()
          } : null);
          setIsRunningAudit(false);
          toast({
            title: "Auditoria concluída",
            description: "A auditoria foi concluída com sucesso. Verifique os resultados."
          });
        } else {
          setAuditStatus(prev => prev ? {
            ...prev,
            progress: Math.round(progress)
          } : null);
        }
      }, 2000);
      
    } catch (error) {
      console.error('Error starting audit:', error);
      setIsRunningAudit(false);
      toast({
        title: "Erro ao iniciar auditoria",
        description: "Não foi possível iniciar a auditoria contínua.",
        variant: "destructive"
      });
    }
  };

  const pauseAudit = async () => {
    try {
      setAuditStatus(prev => prev ? {
        ...prev,
        status: 'paused'
      } : null);
      setIsRunningAudit(false);
      
      toast({
        title: "Auditoria pausada",
        description: "A auditoria foi pausada. Você pode retomá-la a qualquer momento."
      });
    } catch (error) {
      console.error('Error pausing audit:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getSeverityLabel = (severity: string) => {
    const labels = {
      'critical': 'Crítica',
      'high': 'Alta',
      'medium': 'Média',
      'low': 'Baixa'
    };
    return labels[severity as keyof typeof labels] || severity;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'default';
      case 'completed': return 'secondary';
      case 'paused': return 'outline';
      case 'error': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      'running': 'Executando',
      'completed': 'Concluída',
      'paused': 'Pausada',
      'error': 'Erro'
    };
    return labels[status as keyof typeof labels] || status;
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
          <Activity className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Carregando sistema de auditoria...</p>
        </div>
      </div>
    );
  }

  const enabledRules = auditRules.filter(rule => rule.enabled);
  const criticalIssues = auditIssues.filter(issue => issue.severity === 'critical');
  const openIssues = auditIssues.filter(issue => issue.status === 'open');

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Auditoria Inteligente
          </h1>
          <p className="text-muted-foreground">
            Sistema de auditoria contínua com inteligência artificial
          </p>
        </div>
        <div className="flex gap-2">
          {auditStatus?.status === 'running' ? (
            <Button onClick={pauseAudit} variant="outline" className="gap-2">
              <PauseCircle className="h-4 w-4" />
              Pausar Auditoria
            </Button>
          ) : (
            <Button onClick={startAudit} className="gap-2">
              <PlayCircle className="h-4 w-4" />
              Iniciar Auditoria
            </Button>
          )}
        </div>
      </div>

      {/* Status da Auditoria */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Status da Auditoria
            {auditStatus && (
              <Badge variant={getStatusColor(auditStatus.status)}>
                {getStatusLabel(auditStatus.status)}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {auditStatus && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{auditStatus.client_count}</div>
                  <div className="text-sm text-muted-foreground">Clientes Auditados</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{auditStatus.issues_found}</div>
                  <div className="text-sm text-muted-foreground">Problemas Encontrados</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{auditStatus.rules_applied}</div>
                  <div className="text-sm text-muted-foreground">Regras Aplicadas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round(auditStatus.confidence_score * 100)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Confiança Média</div>
                </div>
              </div>
              
              {auditStatus.status === 'running' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progresso da auditoria</span>
                    <span>{auditStatus.progress}%</span>
                  </div>
                  <Progress value={auditStatus.progress} className="w-full" />
                </div>
              )}
              
              <div className="text-sm text-muted-foreground">
                {auditStatus.status === 'completed' && auditStatus.completed_at && (
                  <span>
                    Última auditoria concluída: {formatDate(auditStatus.completed_at)}
                  </span>
                )}
                {auditStatus.status === 'running' && (
                  <span>
                    Auditoria iniciada: {formatDate(auditStatus.started_at)}
                  </span>
                )}
                {auditStatus.status === 'paused' && (
                  <span>
                    Auditoria pausada: {getTimeAgo(auditStatus.last_updated)}
                  </span>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumo Rápido */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Regras Ativas</p>
                <p className="text-2xl font-bold">{enabledRules.length}</p>
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
                <p className="text-sm text-muted-foreground">Problemas Críticos</p>
                <p className="text-2xl font-bold text-red-600">{criticalIssues.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Eye className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Aguardando Revisão</p>
                <p className="text-2xl font-bold text-yellow-600">{openIssues.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs principais */}
      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="issues" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Problemas ({auditIssues.length})
          </TabsTrigger>
          <TabsTrigger value="rules" className="gap-2">
            <Brain className="h-4 w-4" />
            Regras ({auditRules.length})
          </TabsTrigger>
          <TabsTrigger value="config" className="gap-2">
            <Settings className="h-4 w-4" />
            Configurações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <AuditoriaDashboard />
        </TabsContent>

        <TabsContent value="issues" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Problemas Detectados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auditIssues.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Nenhum problema detectado nas últimas auditorias!
                    </p>
                  </div>
                ) : (
                  auditIssues.map((issue) => (
                    <div key={issue.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant={getSeverityColor(issue.severity)}>
                            {getSeverityLabel(issue.severity)}
                          </Badge>
                          <Badge variant="outline">
                            Confiança: {Math.round(issue.confidence * 100)}%
                          </Badge>
                          <Badge variant="secondary">
                            {issue.status === 'open' && 'Aberto'}
                            {issue.status === 'investigating' && 'Investigando'}
                            {issue.status === 'resolved' && 'Resolvido'}
                            {issue.status === 'false_positive' && 'Falso Positivo'}
                          </Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {getTimeAgo(issue.detected_at)}
                        </span>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold">{issue.client_name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {issue.description}
                        </p>
                        <p className="text-sm">
                          <strong>Recomendação:</strong> {issue.recommendation}
                        </p>
                      </div>

                      {issue.metadata && (
                        <div className="bg-muted/50 p-3 rounded text-xs">
                          <strong>Detalhes:</strong>
                          <pre className="mt-1 whitespace-pre-wrap">
                            {JSON.stringify(issue.metadata, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Regras de Auditoria</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auditRules.map((rule) => (
                  <div key={rule.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{rule.name}</h3>
                        <Badge variant={getSeverityColor(rule.severity)}>
                          {getSeverityLabel(rule.severity)}
                        </Badge>
                        <Badge variant="outline">{rule.category}</Badge>
                        {rule.enabled ? (
                          <Badge variant="secondary" className="gap-1">
                            <Zap className="h-3 w-3" />
                            Ativa
                          </Badge>
                        ) : (
                          <Badge variant="outline">Inativa</Badge>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">
                      {rule.description}
                    </p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Confiança mínima:</span>
                        <div className="font-medium">
                          {Math.round(rule.confidence_threshold * 100)}%
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Execuções:</span>
                        <div className="font-medium">{rule.execution_count}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Problemas encontrados:</span>
                        <div className="font-medium">{rule.issues_found}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Última execução:</span>
                        <div className="font-medium">{getTimeAgo(rule.last_executed)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <AuditoriaContinuaConfig />
        </TabsContent>
      </Tabs>
    </div>
  );
}