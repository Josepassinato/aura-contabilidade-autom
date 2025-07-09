import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { handleError } from '@/services/errorHandlingService';

export interface ClosingStatus {
  id: string;
  client_id: string;
  client_name: string;
  period_month: number;
  period_year: number;
  status: 'pending' | 'in_progress' | 'review' | 'completed' | 'blocked';
  started_at?: string;
  completed_at?: string;
  documents_processed: number;
  documents_total: number;
  validations_passed: number;
  validations_total: number;
  blocking_issues: any[];
  last_activity: string;
  confidence_score: number;
  manual_adjustments_count: number;
  assigned_to?: string;
  estimated_completion?: string;
}

export interface ClosingMetrics {
  totalClients: number;
  completed: number;
  inProgress: number;
  blocked: number;
  pending: number;
  averageProgress: number;
  estimatedTimeRemaining: number;
  completionRate: number;
}

export interface ChecklistItem {
  id: string;
  closing_id: string;
  item_type: 'document_validation' | 'reconciliation' | 'report_generation' | 'compliance_check';
  item_name: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';
  priority: 1 | 2 | 3;
  estimated_minutes: number;
  actual_minutes?: number;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
}

export function useMonthlyClosing(month?: number, year?: number) {
  const [closingStatuses, setClosingStatuses] = useState<ClosingStatus[]>([]);
  const [metrics, setMetrics] = useState<ClosingMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Default para mês/ano atual
  const currentDate = new Date();
  const targetMonth = month || currentDate.getMonth() + 1;
  const targetYear = year || currentDate.getFullYear();

  const fetchClosingData = async () => {
    try {
      const { data: closingData, error: closingError } = await supabase
        .from('monthly_closing_status')
        .select(`
          *,
          accounting_clients (
            name
          )
        `)
        .eq('period_month', targetMonth)
        .eq('period_year', targetYear)
        .order('status', { ascending: true })
        .order('last_activity', { ascending: false });

      if (closingError) throw closingError;

      // Se não há dados para o período, criar automaticamente para todos os clientes ativos
      if (!closingData || closingData.length === 0) {
        await initializeMonthlyClosing(targetMonth, targetYear);
        // Buscar novamente após inicialização
        const { data: newClosingData, error: newError } = await supabase
          .from('monthly_closing_status')
          .select(`
            *,
            accounting_clients (
              name
            )
          `)
          .eq('period_month', targetMonth)
          .eq('period_year', targetYear)
          .order('status', { ascending: true })
          .order('last_activity', { ascending: false });

        if (newError) throw newError;
        setClosingStatuses(transformClosingData(newClosingData || []));
      } else {
        setClosingStatuses(transformClosingData(closingData));
      }
    } catch (error) {
      handleError(error, 'useMonthlyClosing.fetchClosingData');
    }
  };

  const transformClosingData = (data: any[]): ClosingStatus[] => {
    return data.map(item => ({
      id: item.id,
      client_id: item.client_id,
      client_name: item.accounting_clients?.name || 'Cliente não encontrado',
      period_month: item.period_month,
      period_year: item.period_year,
      status: item.status,
      started_at: item.started_at,
      completed_at: item.completed_at,
      documents_processed: item.documents_processed || 0,
      documents_total: item.documents_total || 0,
      validations_passed: item.validations_passed || 0,
      validations_total: item.validations_total || 5,
      blocking_issues: item.blocking_issues || [],
      last_activity: item.last_activity,
      confidence_score: item.confidence_score || 0.95,
      manual_adjustments_count: item.manual_adjustments_count || 0,
      assigned_to: item.assigned_to,
      estimated_completion: calculateEstimatedCompletion(item)
    }));
  };

  const calculateEstimatedCompletion = (closing: any): string => {
    if (closing.status === 'completed') return 'Concluído';
    if (closing.status === 'blocked') return 'Bloqueado';
    
    const progress = closing.validations_total > 0 
      ? closing.validations_passed / closing.validations_total 
      : 0;
    
    if (progress === 0) return 'Não iniciado';
    
    // Estimar tempo baseado no progresso atual e atividade recente
    const remainingValidations = closing.validations_total - closing.validations_passed;
    const estimatedMinutes = remainingValidations * 15; // 15 min por validação
    
    const now = new Date();
    const estimated = new Date(now.getTime() + estimatedMinutes * 60000);
    
    return estimated.toLocaleString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateMetrics = (closings: ClosingStatus[]): ClosingMetrics => {
    const totalClients = closings.length;
    const completed = closings.filter(c => c.status === 'completed').length;
    const inProgress = closings.filter(c => c.status === 'in_progress').length;
    const blocked = closings.filter(c => c.status === 'blocked').length;
    const pending = closings.filter(c => c.status === 'pending').length;
    
    const totalProgress = closings.reduce((sum, closing) => {
      return sum + (closing.validations_total > 0 ? 
        (closing.validations_passed / closing.validations_total) * 100 : 0);
    }, 0);
    
    const averageProgress = totalClients > 0 ? totalProgress / totalClients : 0;
    const completionRate = totalClients > 0 ? (completed / totalClients) * 100 : 0;
    
    // Estimar tempo restante baseado no progresso
    const remainingWork = closings
      .filter(c => c.status !== 'completed')
      .reduce((sum, closing) => {
        const remaining = closing.validations_total - closing.validations_passed;
        return sum + (remaining * 15); // 15 min por validação
      }, 0);
    
    return {
      totalClients,
      completed,
      inProgress,
      blocked,
      pending,
      averageProgress,
      estimatedTimeRemaining: remainingWork,
      completionRate
    };
  };

  const initializeMonthlyClosing = async (month: number, year: number) => {
    try {
      // Buscar todos os clientes ativos
      const { data: clients, error: clientsError } = await supabase
        .from('accounting_clients')
        .select('id, name')
        .eq('status', 'active');

      if (clientsError) throw clientsError;

      if (!clients || clients.length === 0) return;

      // Criar registros de fechamento para cada cliente
      const closingRecords = clients.map(client => ({
        client_id: client.id,
        period_month: month,
        period_year: year,
        status: 'pending',
        documents_total: Math.floor(Math.random() * 50) + 10, // Simular quantidade de documentos
        validations_total: 5
      }));

      const { error: insertError } = await supabase
        .from('monthly_closing_status')
        .insert(closingRecords);

      if (insertError) throw insertError;

      // Criar checklists padrão para cada fechamento
      const { data: newClosings, error: newClosingsError } = await supabase
        .from('monthly_closing_status')
        .select('id')
        .eq('period_month', month)
        .eq('period_year', year);

      if (newClosingsError) throw newClosingsError;

      if (newClosings) {
        const checklistItems = newClosings.flatMap(closing => [
          {
            closing_id: closing.id,
            item_type: 'document_validation',
            item_name: 'Validação de Documentos',
            description: 'Verificar e classificar todos os documentos do período',
            priority: 1,
            estimated_minutes: 30
          },
          {
            closing_id: closing.id,
            item_type: 'reconciliation',
            item_name: 'Reconciliação Bancária',
            description: 'Conciliar extratos bancários com lançamentos',
            priority: 1,
            estimated_minutes: 20
          },
          {
            closing_id: closing.id,
            item_type: 'report_generation',
            item_name: 'Geração de DRE',
            description: 'Gerar e revisar Demonstrativo de Resultado',
            priority: 2,
            estimated_minutes: 15
          },
          {
            closing_id: closing.id,
            item_type: 'report_generation',
            item_name: 'Geração de Balancete',
            description: 'Gerar e revisar Balancete de Verificação',
            priority: 2,
            estimated_minutes: 10
          },
          {
            closing_id: closing.id,
            item_type: 'compliance_check',
            item_name: 'Verificação de Compliance',
            description: 'Verificar obrigações fiscais e prazos',
            priority: 3,
            estimated_minutes: 10
          }
        ]);

        const { error: checklistError } = await supabase
          .from('closing_checklist_items')
          .insert(checklistItems);

        if (checklistError) throw checklistError;
      }
    } catch (error) {
      handleError(error, 'useMonthlyClosing.initializeMonthlyClosing');
    }
  };

  const updateClosingStatus = async (closingId: string, status: ClosingStatus['status']) => {
    try {
      const updates: any = {
        status,
        last_activity: new Date().toISOString()
      };

      if (status === 'in_progress' && !closingStatuses.find(c => c.id === closingId)?.started_at) {
        updates.started_at = new Date().toISOString();
      }

      if (status === 'completed') {
        updates.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('monthly_closing_status')
        .update(updates)
        .eq('id', closingId);

      if (error) throw error;

      await fetchClosingData();
    } catch (error) {
      handleError(error, 'useMonthlyClosing.updateClosingStatus');
    }
  };

  const startBatchClosing = async (clientIds: string[]) => {
    try {
      const { error } = await supabase.functions.invoke('process-batch-closing', {
        body: {
          clientIds,
          month: targetMonth,
          year: targetYear
        }
      });

      if (error) throw error;

      await fetchClosingData();
    } catch (error) {
      handleError(error, 'useMonthlyClosing.startBatchClosing');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchClosingData();
      setLoading(false);
    };

    loadData();
  }, [targetMonth, targetYear]);

  useEffect(() => {
    if (closingStatuses.length > 0) {
      setMetrics(calculateMetrics(closingStatuses));
    }
  }, [closingStatuses]);

  return {
    closingStatuses,
    metrics,
    loading,
    currentPeriod: { month: targetMonth, year: targetYear },
    refetch: fetchClosingData,
    updateClosingStatus,
    startBatchClosing
  };
}