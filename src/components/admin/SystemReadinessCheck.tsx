import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle, Activity, Database, Shield, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase/client';

interface SystemStatus {
  component: string;
  status: 'ok' | 'warning' | 'error';
  message: string;
  details?: any;
}

export function SystemReadinessCheck() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [overallStatus, setOverallStatus] = useState<'ready' | 'partial' | 'not_ready'>('not_ready');
  const { toast } = useToast();

  useEffect(() => {
    runSystemCheck();
  }, []);

  const runSystemCheck = async () => {
    setIsChecking(true);
    const checks: SystemStatus[] = [];

    try {
      // 1. Verificar parâmetros fiscais
      const { data: fiscalParams, error: fiscalError } = await supabase
        .from('parametros_fiscais')
        .select('*')
        .eq('ativo', true);

      if (fiscalError) throw fiscalError;

      checks.push({
        component: 'Parâmetros Fiscais',
        status: fiscalParams && fiscalParams.length >= 2 ? 'ok' : 'warning',
        message: fiscalParams && fiscalParams.length >= 2 
          ? `${fiscalParams.length} parâmetros fiscais configurados`
          : 'Parâmetros fiscais insuficientes',
        details: fiscalParams
      });

      // 2. Verificar regras de escalação
      const { data: escalationRules, error: escalationError } = await supabase
        .from('notification_escalation_rules')
        .select('*')
        .eq('is_active', true);

      if (escalationError) throw escalationError;

      checks.push({
        component: 'Regras de Escalação',
        status: escalationRules && escalationRules.length >= 4 ? 'ok' : 'warning',
        message: escalationRules && escalationRules.length >= 4 
          ? `${escalationRules.length} regras de escalação ativas`
          : 'Regras de escalação insuficientes',
        details: escalationRules
      });

      // 3. Verificar métricas do sistema
      const { data: systemMetrics, error: metricsError } = await supabase
        .from('system_metrics')
        .select('*')
        .in('metric_name', ['system_initialization', 'security_policies_active', 'fiscal_parameters_configured']);

      if (metricsError) throw metricsError;

      checks.push({
        component: 'Métricas do Sistema',
        status: systemMetrics && systemMetrics.length >= 3 ? 'ok' : 'warning',
        message: systemMetrics && systemMetrics.length >= 3 
          ? `${systemMetrics.length} métricas de sistema registradas`
          : 'Métricas do sistema incompletas',
        details: systemMetrics
      });

      // 4. Verificar plano de contas
      const { data: chartOfAccounts, error: chartError } = await supabase
        .from('plano_contas')
        .select('*')
        .eq('ativo', true);

      if (chartError) throw chartError;

      checks.push({
        component: 'Plano de Contas',
        status: chartOfAccounts && chartOfAccounts.length >= 10 ? 'ok' : 'warning',
        message: chartOfAccounts && chartOfAccounts.length >= 10 
          ? `${chartOfAccounts.length} contas configuradas`
          : 'Plano de contas básico precisa ser expandido',
        details: chartOfAccounts?.length
      });

      // 5. Verificar centro de custos
      const { data: costCenters, error: costError } = await supabase
        .from('centro_custos')
        .select('*')
        .eq('ativo', true);

      if (costError) throw costError;

      checks.push({
        component: 'Centros de Custo',
        status: costCenters && costCenters.length >= 1 ? 'ok' : 'warning',
        message: costCenters && costCenters.length >= 1 
          ? `${costCenters.length} centros de custo configurados`
          : 'Centros de custo não configurados',
        details: costCenters?.length
      });

      // 6. Testar edge functions
      try {
        const { data: securityData, error: securityError } = await supabase.functions.invoke('security-monitor');
        
        checks.push({
          component: 'Monitoramento de Segurança',
          status: !securityError ? 'ok' : 'error',
          message: !securityError 
            ? 'Edge function de monitoramento funcionando'
            : `Erro no monitoramento: ${securityError.message}`,
          details: securityData
        });
      } catch (error) {
        checks.push({
          component: 'Monitoramento de Segurança',
          status: 'error',
          message: `Edge function não acessível: ${error}`,
          details: null
        });
      }

      try {
        const { data: validationData, error: validationError } = await supabase.functions.invoke('validation-service', {
          body: { type: 'security_audit' }
        });
        
        checks.push({
          component: 'Serviço de Validação',
          status: !validationError ? 'ok' : 'error',
          message: !validationError 
            ? 'Edge function de validação funcionando'
            : `Erro na validação: ${validationError.message}`,
          details: validationData
        });
      } catch (error) {
        checks.push({
          component: 'Serviço de Validação',
          status: 'error',
          message: `Edge function não acessível: ${error}`,
          details: null
        });
      }

      setSystemStatus(checks);

      // Determinar status geral
      const errorCount = checks.filter(c => c.status === 'error').length;
      const warningCount = checks.filter(c => c.status === 'warning').length;
      
      if (errorCount === 0 && warningCount <= 2) {
        setOverallStatus('ready');
      } else if (errorCount <= 1) {
        setOverallStatus('partial');
      } else {
        setOverallStatus('not_ready');
      }

    } catch (error) {
      console.error('Error checking system status:', error);
      toast({
        title: 'Erro na verificação',
        description: 'Não foi possível verificar o status do sistema',
        variant: 'destructive'
      });
    } finally {
      setIsChecking(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Verificação de Prontidão do Sistema</h1>
          <p className="text-muted-foreground">
            Status completo dos componentes implementados
          </p>
        </div>
        <Button
          onClick={runSystemCheck}
          disabled={isChecking}
          variant="outline"
        >
          <Activity className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
          Verificar Novamente
        </Button>
      </div>

      {/* Overall Status */}
      <Alert className={
        overallStatus === 'ready' ? 'border-green-200 bg-green-50' :
        overallStatus === 'partial' ? 'border-yellow-200 bg-yellow-50' :
        'border-red-200 bg-red-50'
      }>
        {overallStatus === 'ready' ? (
          <CheckCircle className="h-4 w-4 text-green-600" />
        ) : (
          <AlertTriangle className={`h-4 w-4 ${overallStatus === 'partial' ? 'text-yellow-600' : 'text-red-600'}`} />
        )}
        <AlertTitle className={
          overallStatus === 'ready' ? 'text-green-800' :
          overallStatus === 'partial' ? 'text-yellow-800' :
          'text-red-800'
        }>
          Sistema {
            overallStatus === 'ready' ? 'Pronto para Uso' :
            overallStatus === 'partial' ? 'Parcialmente Pronto' :
            'Não Pronto'
          }
        </AlertTitle>
        <AlertDescription className={
          overallStatus === 'ready' ? 'text-green-700' :
          overallStatus === 'partial' ? 'text-yellow-700' :
          'text-red-700'
        }>
          {overallStatus === 'ready' && 'Todos os componentes críticos estão funcionando. O sistema está pronto para uso em produção.'}
          {overallStatus === 'partial' && 'A maioria dos componentes está funcionando. Algumas funcionalidades podem ter limitações.'}
          {overallStatus === 'not_ready' && 'Componentes críticos apresentam problemas. Resolva os erros antes do uso em produção.'}
        </AlertDescription>
      </Alert>

      {/* Component Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {systemStatus.map((check, index) => (
          <Card key={index} className={`border ${getStatusColor(check.status)}`}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  {getStatusIcon(check.status)}
                  {check.component}
                </span>
                <Badge variant={
                  check.status === 'ok' ? 'default' :
                  check.status === 'warning' ? 'secondary' : 'destructive'
                }>
                  {check.status.toUpperCase()}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm">{check.message}</p>
              {check.details && (
                <details className="mt-2">
                  <summary className="text-xs text-muted-foreground cursor-pointer">
                    Ver detalhes
                  </summary>
                  <pre className="text-xs mt-1 p-2 bg-gray-100 rounded overflow-auto max-h-20">
                    {JSON.stringify(check.details, null, 2)}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Next Steps */}
      {overallStatus === 'ready' && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">Próximos Passos para Uso Real</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-green-700">
              <li>Fazer login como administrador usando os botões de acesso rápido</li>
              <li>Acessar o Dashboard de Segurança em /admin/security</li>
              <li>Configurar clientes reais no sistema</li>
              <li>Executar validações iniciais</li>
              <li>Monitorar métricas de segurança regularmente</li>
            </ol>
          </CardContent>
        </Card>
      )}

      {overallStatus !== 'ready' && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800">Ações Recomendadas</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-1 text-yellow-700">
              {systemStatus.filter(s => s.status === 'error').map((check, i) => (
                <li key={i}>Resolver erro em: {check.component}</li>
              ))}
              {systemStatus.filter(s => s.status === 'warning').map((check, i) => (
                <li key={i}>Melhorar: {check.component}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}