import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  type: string;
  trigger: string;
  conditions: any;
  actions: any;
  enabled: boolean;
  last_run?: string;
  success_count: number;
  error_count: number;
  created_at: string;
}

interface AutomationMetrics {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageExecutionTime: number;
  activeRules: number;
  rulesWithErrors: number;
}

export const useTaskAutomation = () => {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [metrics, setMetrics] = useState<AutomationMetrics>({
    totalExecutions: 0,
    successfulExecutions: 0,
    failedExecutions: 0,
    averageExecutionTime: 0,
    activeRules: 0,
    rulesWithErrors: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const loadAutomationData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Load automation logs for metrics
      const { data: logsData, error: logsError } = await supabase
        .from('automation_logs')
        .select('*')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      if (logsError) throw logsError;

      // Calculate metrics from logs
      const logs = logsData || [];
      const successfulLogs = logs.filter(log => log.status === 'completed');
      const failedLogs = logs.filter(log => log.status === 'failed');
      
      const avgExecutionTime = successfulLogs.reduce((sum, log) => 
        sum + (log.duration_seconds || 0), 0
      ) / Math.max(successfulLogs.length, 1);

      // Mock automation rules (in real implementation, these would come from database)
      const mockRules: AutomationRule[] = [
        {
          id: '1',
          name: 'Processamento Contábil Diário',
          description: 'Processa automaticamente todos os lançamentos contábeis pendentes',
          type: 'scheduled',
          trigger: 'time',
          conditions: { schedule: '0 2 * * *' },
          actions: { process_type: 'daily_accounting' },
          enabled: true,
          last_run: new Date(Date.now() - 86400000).toISOString(),
          success_count: 45,
          error_count: 2,
          created_at: new Date(Date.now() - 7 * 86400000).toISOString()
        },
        {
          id: '2',
          name: 'Backup Automático',
          description: 'Realiza backup dos dados críticos do sistema',
          type: 'scheduled',
          trigger: 'time',
          conditions: { schedule: '0 0 * * 0' },
          actions: { process_type: 'data_backup' },
          enabled: true,
          last_run: new Date(Date.now() - 7 * 86400000).toISOString(),
          success_count: 12,
          error_count: 0,
          created_at: new Date(Date.now() - 30 * 86400000).toISOString()
        },
        {
          id: '3',
          name: 'Análise de Performance',
          description: 'Analisa métricas de performance do sistema',
          type: 'scheduled',
          trigger: 'time',
          conditions: { schedule: '0 */6 * * *' },
          actions: { process_type: 'performance_analysis' },
          enabled: false,
          last_run: new Date(Date.now() - 2 * 86400000).toISOString(),
          success_count: 8,
          error_count: 1,
          created_at: new Date(Date.now() - 15 * 86400000).toISOString()
        }
      ];

      setRules(mockRules);
      
      const activeRules = mockRules.filter(rule => rule.enabled).length;
      const rulesWithErrors = mockRules.filter(rule => rule.error_count > 0).length;

      setMetrics({
        totalExecutions: logs.length,
        successfulExecutions: successfulLogs.length,
        failedExecutions: failedLogs.length,
        averageExecutionTime: Math.round(avgExecutionTime),
        activeRules,
        rulesWithErrors
      });

    } catch (error) {
      console.error('Error loading automation data:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar dados de automação",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const executeRule = useCallback(async (ruleId: string) => {
    try {
      const rule = rules.find(r => r.id === ruleId);
      if (!rule) {
        throw new Error('Regra não encontrada');
      }

      // Add task to processing queue
      const { data, error } = await supabase.functions.invoke('queue-processor', {
        body: {
          action: 'add_task',
          processType: rule.actions.process_type,
          clientId: 'system',
          priority: 1,
          parameters: {
            automated: true,
            rule_id: ruleId,
            rule_name: rule.name,
            manual_trigger: true
          }
        }
      });

      if (error) throw error;

      // Update rule's last run time locally
      setRules(prev => prev.map(r => 
        r.id === ruleId 
          ? { ...r, last_run: new Date().toISOString() }
          : r
      ));

      toast({
        title: "Regra Executada",
        description: `A regra "${rule.name}" foi adicionada à fila de execução.`
      });

      return data;
    } catch (error: any) {
      console.error('Error executing rule:', error);
      toast({
        title: "Erro na Execução",
        description: error.message || "Falha ao executar regra de automação",
        variant: "destructive"
      });
      throw error;
    }
  }, [rules, toast]);

  const toggleRule = useCallback(async (ruleId: string, enabled: boolean) => {
    try {
      // Update rule status locally
      setRules(prev => prev.map(rule => 
        rule.id === ruleId ? { ...rule, enabled } : rule
      ));

      // In a real implementation, this would update the database
      toast({
        title: enabled ? "Regra Ativada" : "Regra Desativada",
        description: `A regra foi ${enabled ? 'ativada' : 'desativada'} com sucesso.`
      });

      // Update metrics
      await loadAutomationData();
    } catch (error: any) {
      console.error('Error toggling rule:', error);
      toast({
        title: "Erro",
        description: "Falha ao alterar status da regra",
        variant: "destructive"
      });
      throw error;
    }
  }, [loadAutomationData, toast]);

  const createRule = useCallback(async (newRule: Omit<AutomationRule, 'id' | 'success_count' | 'error_count' | 'created_at'>) => {
    try {
      const rule: AutomationRule = {
        ...newRule,
        id: Date.now().toString(),
        success_count: 0,
        error_count: 0,
        created_at: new Date().toISOString()
      };

      // In a real implementation, this would save to database
      setRules(prev => [...prev, rule]);

      toast({
        title: "Regra Criada",
        description: "Nova regra de automação criada com sucesso."
      });

      return rule;
    } catch (error: any) {
      console.error('Error creating rule:', error);
      toast({
        title: "Erro",
        description: "Falha ao criar regra de automação",
        variant: "destructive"
      });
      throw error;
    }
  }, [toast]);

  const deleteRule = useCallback(async (ruleId: string) => {
    try {
      setRules(prev => prev.filter(rule => rule.id !== ruleId));

      toast({
        title: "Regra Removida",
        description: "Regra de automação removida com sucesso."
      });
    } catch (error: any) {
      console.error('Error deleting rule:', error);
      toast({
        title: "Erro",
        description: "Falha ao remover regra",
        variant: "destructive"
      });
      throw error;
    }
  }, [toast]);

  const getRecentExecutions = useCallback(async (limit: number = 10) => {
    try {
      const { data, error } = await supabase
        .from('automation_logs')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error loading recent executions:', error);
      return [];
    }
  }, []);

  useEffect(() => {
    loadAutomationData();
    
    // Set up real-time updates
    const interval = setInterval(loadAutomationData, 30000);
    
    return () => clearInterval(interval);
  }, [loadAutomationData]);

  return {
    rules,
    metrics,
    isLoading,
    executeRule,
    toggleRule,
    createRule,
    deleteRule,
    loadAutomationData,
    getRecentExecutions
  };
};