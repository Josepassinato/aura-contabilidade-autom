import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSafeInterval } from '@/hooks/useTimerManager';
import { supabase } from '@/lib/supabase/client';
import { SecurityMetricsGrid } from './security/SecurityMetricsGrid';
import { CriticalAlerts } from './security/CriticalAlerts';
import { ValidationServices } from './security/ValidationServices';
import { ValidationResults } from './security/ValidationResults';
import { SecurityMetric, ValidationResult } from './types/security';


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
      // Load recent security metrics - apenas campos necessários
      const { data: metricsData, error: metricsError } = await supabase
        .from('system_metrics')
        .select('metric_name, metric_value, timestamp, labels')
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

      // Load recent validation results - apenas campos necessários
      const { data: validationData, error: validationError } = await supabase
        .from('automated_actions_log')
        .select('metadata')
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

      <CriticalAlerts metrics={metrics} />

      <SecurityMetricsGrid metrics={metrics} />

      <ValidationServices onRunValidation={runValidationService} isLoading={isLoading} />

      <ValidationResults results={validationResults} />

      {lastUpdate && (
        <p className="text-sm text-muted-foreground text-center">
          Última atualização: {lastUpdate.toLocaleString()}
        </p>
      )}
    </div>
  );
}