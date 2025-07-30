import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Activity } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase/client';
import { SystemStatusGrid, SystemStatus } from './system/SystemStatusGrid';
import { OverallStatusAlert } from './system/OverallStatusAlert';
import { NextStepsCard } from './system/NextStepsCard';

type OverallStatus = 'ready' | 'partial' | 'not_ready';

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
      // 1. Verificar parâmetros fiscais - apenas necessário para contagem
      const { data: fiscalParams, error: fiscalError } = await supabase
        .from('parametros_fiscais')
        .select('id, tipo, versao')
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

      // 2. Verificar regras de escalação - apenas necessário para contagem
      const { data: escalationRules, error: escalationError } = await supabase
        .from('notification_escalation_rules')
        .select('id, rule_name')
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

      // 3. Verificar métricas do sistema - apenas necessário para contagem
      const { data: systemMetrics, error: metricsError } = await supabase
        .from('system_metrics')
        .select('metric_name')
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

      // 4. Verificar plano de contas - apenas ID para contagem
      const { data: chartOfAccounts, error: chartError } = await supabase
        .from('plano_contas')
        .select('id')
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

      // 5. Verificar centro de custos - apenas ID para contagem
      const { data: costCenters, error: costError } = await supabase
        .from('centro_custos')
        .select('id')
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

      <OverallStatusAlert status={overallStatus} />

      <SystemStatusGrid systemStatus={systemStatus} />

      <NextStepsCard status={overallStatus} systemStatus={systemStatus} />
    </div>
  );
}