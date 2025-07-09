import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { handleError } from '@/services/errorHandlingService';

export interface WorkflowProblem {
  id: string;
  type: 'classification_error' | 'processing_failure' | 'low_confidence' | 'manual_review_needed';
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  client_id?: string;
  client_name?: string;
  document_id?: string;
  document_name?: string;
  created_at: string;
  status: 'pending' | 'in_progress' | 'resolved';
  metadata?: any;
}

export interface WorkflowMetrics {
  totalProblems: number;
  pendingProblems: number;
  resolvedToday: number;
  automationRate: number;
  averageResolutionTime: number;
  errorsByType: Record<string, number>;
}

export function useWorkflowMonitoring() {
  const [problems, setProblems] = useState<WorkflowProblem[]>([]);
  const [metrics, setMetrics] = useState<WorkflowMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProblems = async () => {
    try {
      // Buscar classificações de erro pendentes
      const { data: errorClassifications, error: errorClassError } = await supabase
        .from('error_classifications')
        .select(`
          *,
          client_documents (
            id,
            name,
            client_id,
            accounting_clients (
              name
            )
          )
        `)
        .in('status', ['pending', 'reviewed'])
        .order('created_at', { ascending: false });

      if (errorClassError) throw errorClassError;

      // Buscar logs de automação com falhas
      const { data: automationLogs, error: logsError } = await supabase
        .from('automation_logs')
        .select(`
          *,
          accounting_clients (
            name
          )
        `)
        .eq('status', 'failed')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      if (logsError) throw logsError;

      // Transformar em WorkflowProblem
      const workflowProblems: WorkflowProblem[] = [
        ...(errorClassifications || []).map(error => ({
          id: error.id,
          type: error.error_type as WorkflowProblem['type'],
          severity: error.confidence_score < 0.5 ? 'high' : error.confidence_score < 0.8 ? 'medium' : 'low' as WorkflowProblem['severity'],
          title: `Erro de Classificação: ${error.original_classification}`,
          description: error.error_type === 'misclassification' 
            ? 'Documento classificado incorretamente pelo sistema'
            : error.error_type === 'low_confidence'
            ? `Classificação com baixa confiança (${Math.round((error.confidence_score || 0) * 100)}%)`
            : 'Erro durante processamento do documento',
          client_id: error.client_documents?.client_id,
          client_name: error.client_documents?.accounting_clients?.name,
          document_id: error.document_id,
          document_name: error.client_documents?.name,
          created_at: error.created_at,
          status: error.status === 'pending' ? 'pending' : 'in_progress' as WorkflowProblem['status'],
          metadata: error.metadata
        })),
        ...(automationLogs || []).map(log => ({
          id: log.id,
          type: 'processing_failure' as WorkflowProblem['type'],
          severity: 'high' as WorkflowProblem['severity'],
          title: `Falha na Automação: ${log.process_type}`,
          description: (typeof log.error_details === 'object' && log.error_details && 'message' in log.error_details ? log.error_details.message : 'Processo automatizado falhou') as string,
          client_id: log.client_id,
          client_name: log.accounting_clients?.name,
          created_at: log.created_at,
          status: 'pending' as WorkflowProblem['status'],
          metadata: log.metadata
        }))
      ];

      setProblems(workflowProblems);
    } catch (error) {
      handleError(error, 'useWorkflowMonitoring.fetchProblems');
    }
  };

  const fetchMetrics = async () => {
    try {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      // Calcular métricas básicas
      const totalProblems = problems.length;
      const pendingProblems = problems.filter(p => p.status === 'pending').length;
      
      // Buscar problemas resolvidos hoje
      const { data: resolvedToday, error: resolvedError } = await supabase
        .from('error_classifications')
        .select('id')
        .eq('status', 'corrected')
        .gte('reviewed_at', startOfDay.toISOString())
        .lt('reviewed_at', new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000).toISOString());

      if (resolvedError) throw resolvedError;

      // Calcular taxa de automação (sucessos vs falhas)
      const { data: automationStats, error: statsError } = await supabase
        .from('automation_logs')
        .select('status')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (statsError) throw statsError;

      const totalAutomation = automationStats?.length || 0;
      const successfulAutomation = automationStats?.filter(a => a.status === 'completed').length || 0;
      const automationRate = totalAutomation > 0 ? (successfulAutomation / totalAutomation) * 100 : 0;

      // Contar erros por tipo
      const errorsByType = problems.reduce((acc, problem) => {
        acc[problem.type] = (acc[problem.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      setMetrics({
        totalProblems,
        pendingProblems,
        resolvedToday: resolvedToday?.length || 0,
        automationRate,
        averageResolutionTime: 0, // TODO: Calcular baseado em dados históricos
        errorsByType
      });
    } catch (error) {
      handleError(error, 'useWorkflowMonitoring.fetchMetrics');
    }
  };

  const resolveErrorClassification = async (errorId: string, correctedClassification: string, notes?: string) => {
    try {
      const { error } = await supabase
        .from('error_classifications')
        .update({
          corrected_classification: correctedClassification,
          status: 'corrected',
          reviewed_at: new Date().toISOString(),
          reviewer_id: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', errorId);

      if (error) throw error;

      // Registrar no histórico de correções
      if (notes) {
        const { error: historyError } = await supabase
          .from('correction_history')
          .insert({
            error_classification_id: errorId,
            action_taken: 'manual_correction',
            new_value: correctedClassification,
            correction_notes: notes,
            corrected_by: (await supabase.auth.getUser()).data.user?.id
          });

        if (historyError) throw historyError;
      }

      // Atualizar lista de problemas
      await fetchProblems();
      await fetchMetrics();
    } catch (error) {
      handleError(error, 'useWorkflowMonitoring.resolveErrorClassification');
    }
  };

  const retryAutomationProcess = async (processId: string) => {
    try {
      // Chamar edge function para tentar novamente o processo
      const { error } = await supabase.functions.invoke('retry-automation-process', {
        body: { processId }
      });

      if (error) throw error;

      // Atualizar dados
      await fetchProblems();
      await fetchMetrics();
    } catch (error) {
      handleError(error, 'useWorkflowMonitoring.retryAutomationProcess');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchProblems();
      setLoading(false);
    };

    loadData();
  }, []);

  useEffect(() => {
    if (problems.length > 0) {
      fetchMetrics();
    }
  }, [problems]);

  return {
    problems,
    metrics,
    loading,
    refetch: () => {
      fetchProblems();
      fetchMetrics();
    },
    resolveErrorClassification,
    retryAutomationProcess
  };
}