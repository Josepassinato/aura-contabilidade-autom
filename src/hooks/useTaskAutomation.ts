import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AutomationRule {
  id: string;
  name: string;
  description?: string;
  type: string;
  trigger_type: string;
  trigger_conditions: any;
  actions: any[];
  enabled: boolean;
  last_run?: string;
  success_count: number;
  error_count: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
  client_id?: string;
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
      // Load automation rules from database
      const { data: rulesData, error: rulesError } = await supabase
        .from('automation_rules')
        .select('*')
        .order('created_at', { ascending: false });

      if (rulesError) throw rulesError;

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

      const automationRules = (rulesData || []).map(rule => ({
        ...rule,
        actions: Array.isArray(rule.actions) ? rule.actions : []
      }));
      setRules(automationRules);
      
      const activeRules = automationRules.filter(rule => rule.enabled).length;
      const rulesWithErrors = automationRules.filter(rule => rule.error_count > 0).length;

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

      // Get process type from first action or use a default
      const firstAction = rule.actions?.[0];
      const processType = firstAction?.type || 'automation_rule_execution';

      // Add task to processing queue
      const { data, error } = await supabase.functions.invoke('queue-processor', {
        body: {
          action: 'add_task',
          processType,
          clientId: 'system',
          priority: 1,
          parameters: {
            automated: true,
            rule_id: ruleId,
            rule_name: rule.name,
            manual_trigger: true,
            actions: rule.actions
          }
        }
      });

      if (error) throw error;

      // Update rule's last run time in database
      const { error: updateError } = await supabase
        .from('automation_rules')
        .update({ 
          last_run: new Date().toISOString(),
          success_count: rule.success_count + 1
        })
        .eq('id', ruleId);

      if (updateError) throw updateError;

      // Update local state
      setRules(prev => prev.map(r => 
        r.id === ruleId 
          ? { 
              ...r, 
              last_run: new Date().toISOString(),
              success_count: r.success_count + 1
            }
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
      // Update rule status in database
      const { error } = await supabase
        .from('automation_rules')
        .update({ enabled })
        .eq('id', ruleId);

      if (error) throw error;

      // Update rule status locally
      setRules(prev => prev.map(rule => 
        rule.id === ruleId ? { ...rule, enabled } : rule
      ));

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

  const createRule = useCallback(async (newRule: Omit<AutomationRule, 'id' | 'success_count' | 'error_count' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('automation_rules')
        .insert({
          name: newRule.name,
          description: newRule.description || null,
          type: newRule.type,
          trigger_type: newRule.trigger_type,
          trigger_conditions: newRule.trigger_conditions,
          actions: newRule.actions,
          enabled: newRule.enabled,
          created_by: newRule.created_by || null,
          client_id: newRule.client_id || null
        })
        .select()
        .single();

      if (error) throw error;

      const createdRule = {
        ...data,
        actions: Array.isArray(data.actions) ? data.actions : []
      };

      setRules(prev => [...prev, createdRule]);

      toast({
        title: "Regra Criada",
        description: "Nova regra de automação criada com sucesso."
      });

      return createdRule;
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
      // Delete rule from database
      const { error } = await supabase
        .from('automation_rules')
        .delete()
        .eq('id', ruleId);

      if (error) throw error;

      // Update local state
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