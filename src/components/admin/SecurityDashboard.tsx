import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Shield, AlertTriangle, CheckCircle, Activity, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSafeInterval } from '@/hooks/useTimerManager';
import { supabase } from '@/lib/supabase/client';

interface SecurityMetric {
  metric_name: string;
  metric_value: number;
  labels: any;
  timestamp: string;
}

interface ValidationResult {
  validation_id: string;
  type: string;
  status: 'passed' | 'failed' | 'warning';
  score: number;
  details: Record<string, any>;
  recommendations: string[];
}

export function SecurityDashboard() {
  const [metrics, setMetrics] = useState<SecurityMetric[]>([]);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const { toast } = useToast();

  // Use safe interval hook to prevent memory leaks
  useSafeInterval(() => {
    loadSecurityData();
  }, 5 * 60 * 1000); // 5 minutes

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    setIsLoading(true);
    try {
      // Load recent security metrics
      const { data: metricsData, error: metricsError } = await supabase
        .from('system_metrics')
        .select('*')
        .in('metric_name', [
          'failed_auth_attempts_24h',
          'rls_violations_1h',
          'active_admin_users',
          'system_health_status'
        ])
        .order('created_at', { ascending: false })
        .limit(20);

      if (metricsError) throw metricsError;
      setMetrics(metricsData || []);

      // Load recent validation results
      const { data: validationData, error: validationError } = await supabase
        .from('automated_actions_log')
        .select('*')
        .eq('action_type', 'validation_service')
        .order('created_at', { ascending: false })
        .limit(10);

      if (validationError) throw validationError;
      
      const parsedValidations = validationData?.map(log => {
        try {
          const metadata = log.metadata as any;
          return metadata?.validation_result;
        } catch {
          return null;
        }
      }).filter(Boolean) || [];

      setValidationResults(parsedValidations);
      setLastUpdate(new Date());

    } catch (error) {
      console.error('Error loading security data:', error);
      toast({
        title: 'Erro ao carregar dados',
        description: 'Não foi possível carregar os dados de segurança',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const runSecurityMonitoring = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('security-monitor');
      
      if (error) throw error;

      toast({
        title: 'Monitoramento executado',
        description: `Coletadas ${data.metrics_collected} métricas, ${data.critical_alerts} alertas críticos`,
      });

      // Reload data after monitoring
      await loadSecurityData();

    } catch (error) {
      console.error('Error running security monitoring:', error);
      toast({
        title: 'Erro no monitoramento',
        description: 'Não foi possível executar o monitoramento de segurança',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const runValidationService = async (type: 'fiscal_compliance' | 'data_integrity' | 'security_audit') => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('validation-service', {
        body: { type }
      });
      
      if (error) throw error;

      toast({
        title: 'Validação executada',
        description: `Validação ${type} concluída com sucesso`,
      });

      // Reload data after validation
      await loadSecurityData();

    } catch (error) {
      console.error('Error running validation service:', error);
      toast({
        title: 'Erro na validação',
        description: 'Não foi possível executar o serviço de validação',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'failed': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const criticalMetrics = metrics.filter(m => 
    (m.metric_name === 'failed_auth_attempts_24h' && m.metric_value > 10) ||
    (m.metric_name === 'rls_violations_1h' && m.metric_value > 5)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard de Segurança</h1>
          <p className="text-muted-foreground">
            Monitoramento ativo e validações de segurança do sistema
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={runSecurityMonitoring}
            disabled={isLoading}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Executar Monitoramento
          </Button>
        </div>
      </div>

      {/* Critical Alerts */}
      {criticalMetrics.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Alertas Críticos de Segurança</AlertTitle>
          <AlertDescription>
            {criticalMetrics.map(metric => (
              <div key={metric.metric_name} className="mt-2">
                <strong>{metric.metric_name}:</strong> {metric.metric_value}
              </div>
            ))}
          </AlertDescription>
        </Alert>
      )}

      {/* Security Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { name: 'failed_auth_attempts_24h', label: 'Tentativas de Login Falhadas (24h)', icon: Shield },
          { name: 'rls_violations_1h', label: 'Violações RLS (1h)', icon: AlertTriangle },
          { name: 'active_admin_users', label: 'Administradores Ativos', icon: CheckCircle },
          { name: 'system_health_status', label: 'Status do Sistema', icon: Activity }
        ].map(({ name, label, icon: Icon }) => {
          const metric = metrics.find(m => m.metric_name === name);
          const value = metric?.metric_value || 0;
          const isWarning = (name === 'failed_auth_attempts_24h' && value > 5) || 
                           (name === 'rls_violations_1h' && value > 0);
          
          return (
            <Card key={name}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{label}</CardTitle>
                <Icon className={`h-4 w-4 ${isWarning ? 'text-yellow-600' : 'text-muted-foreground'}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${isWarning ? 'text-yellow-600' : ''}`}>
                  {value}
                </div>
                {metric && (
                  <p className="text-xs text-muted-foreground">
                    Última atualização: {new Date(metric.timestamp).toLocaleTimeString()}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Validation Services */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Compliance Fiscal</CardTitle>
            <CardDescription>
              Validação de conformidade fiscal e parâmetros
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => runValidationService('fiscal_compliance')}
              disabled={isLoading}
              className="w-full"
            >
              Executar Validação Fiscal
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Integridade de Dados</CardTitle>
            <CardDescription>
              Verificação da consistência dos dados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => runValidationService('data_integrity')}
              disabled={isLoading}
              className="w-full"
            >
              Executar Validação de Dados
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Auditoria de Segurança</CardTitle>
            <CardDescription>
              Análise completa de segurança do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => runValidationService('security_audit')}
              disabled={isLoading}
              className="w-full"
            >
              Executar Auditoria
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Validation Results */}
      <Card>
        <CardHeader>
          <CardTitle>Resultados de Validação Recentes</CardTitle>
          <CardDescription>
            Últimas validações executadas no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {validationResults.length === 0 ? (
            <p className="text-muted-foreground">Nenhuma validação executada recentemente</p>
          ) : (
            <div className="space-y-4">
              {validationResults.map((result, index) => (
                <div key={`${result.validation_id}-${index}`} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(result.status)}
                      <h4 className="font-medium">{result.type.replace('_', ' ').toUpperCase()}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        result.status === 'passed' ? 'default' :
                        result.status === 'warning' ? 'secondary' : 'destructive'
                      }>
                        {result.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Score: {result.score}%
                      </span>
                    </div>
                  </div>
                  
                  <Progress value={result.score} className="mb-2" />
                  
                  {result.recommendations.length > 0 && (
                    <div className="mt-2">
                      <h5 className="text-sm font-medium mb-1">Recomendações:</h5>
                      <ul className="text-sm text-muted-foreground list-disc list-inside">
                        {result.recommendations.map((rec, i) => (
                          <li key={i}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {lastUpdate && (
        <p className="text-sm text-muted-foreground text-center">
          Última atualização: {lastUpdate.toLocaleString()}
        </p>
      )}
    </div>
  );
}