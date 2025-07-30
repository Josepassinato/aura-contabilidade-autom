import { supabase } from '@/integrations/supabase/client';

/**
 * Testes de validação das políticas RLS
 * Este arquivo contém testes para verificar se as políticas RLS estão funcionando corretamente
 */

export interface RLSTestResult {
  table: string;
  userRole: string;
  accessible: boolean;
  recordCount: number;
  error?: string;
  timestamp: string;
}

/**
 * Executa testes de RLS para usuários autenticados
 */
export class RLSValidator {
  
  /**
   * Testa acesso à tabela system_metrics
   */
  static async testSystemMetrics(): Promise<RLSTestResult> {
    try {
      const { data, error } = await supabase
        .from('system_metrics')
        .select('count(*)', { count: 'exact', head: true });

      return {
        table: 'system_metrics',
        userRole: 'current_user',
        accessible: !error,
        recordCount: data?.length || 0,
        error: error?.message,
        timestamp: new Date().toISOString()
      };
    } catch (err) {
      return {
        table: 'system_metrics',
        userRole: 'current_user',
        accessible: false,
        recordCount: 0,
        error: err instanceof Error ? err.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Testa acesso à tabela user_invitations
   */
  static async testUserInvitations(): Promise<RLSTestResult> {
    try {
      const { data, error } = await supabase
        .from('user_invitations')
        .select('count(*)', { count: 'exact', head: true });

      return {
        table: 'user_invitations',
        userRole: 'current_user',
        accessible: !error,
        recordCount: data?.length || 0,
        error: error?.message,
        timestamp: new Date().toISOString()
      };
    } catch (err) {
      return {
        table: 'user_invitations',
        userRole: 'current_user',
        accessible: false,
        recordCount: 0,
        error: err instanceof Error ? err.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Testa acesso à tabela notification_escalation_rules
   */
  static async testNotificationEscalationRules(): Promise<RLSTestResult> {
    try {
      const { data, error } = await supabase
        .from('notification_escalation_rules')
        .select('count(*)', { count: 'exact', head: true });

      return {
        table: 'notification_escalation_rules',
        userRole: 'current_user',
        accessible: !error,
        recordCount: data?.length || 0,
        error: error?.message,
        timestamp: new Date().toISOString()
      };
    } catch (err) {
      return {
        table: 'notification_escalation_rules',
        userRole: 'current_user',
        accessible: false,
        recordCount: 0,
        error: err instanceof Error ? err.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Testa acesso à tabela automated_actions_log
   */
  static async testAutomatedActionsLog(): Promise<RLSTestResult> {
    try {
      const { data, error } = await supabase
        .from('automated_actions_log')
        .select('count(*)', { count: 'exact', head: true });

      return {
        table: 'automated_actions_log',
        userRole: 'current_user',
        accessible: !error,
        recordCount: data?.length || 0,
        error: error?.message,
        timestamp: new Date().toISOString()
      };
    } catch (err) {
      return {
        table: 'automated_actions_log',
        userRole: 'current_user',
        accessible: false,
        recordCount: 0,
        error: err instanceof Error ? err.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Executa todos os testes de RLS
   */
  static async runAllTests(): Promise<RLSTestResult[]> {
    console.log('🔒 Iniciando testes de validação RLS...');
    
    const tests = [
      this.testSystemMetrics(),
      this.testUserInvitations(),
      this.testNotificationEscalationRules(),
      this.testAutomatedActionsLog()
    ];

    const results = await Promise.all(tests);
    
    console.log('📊 Resultados dos testes RLS:', results);
    
    // Log para auditoria
    for (const result of results) {
      await this.logTestResult(result);
    }
    
    return results;
  }

  /**
   * Registra resultado do teste para auditoria
   */
  private static async logTestResult(result: RLSTestResult): Promise<void> {
    try {
      await supabase
        .from('automated_actions_log')
        .insert({
          action_type: 'rls_validation_test_frontend',
          description: `Teste RLS da tabela ${result.table}`,
          metadata: {
            table: result.table,
            accessible: result.accessible,
            record_count: result.recordCount,
            error: result.error,
            timestamp: result.timestamp
          }
        });
    } catch (error) {
      console.warn('Falha ao registrar resultado do teste:', error);
    }
  }

  /**
   * Valida função RLS específica via RPC
   */
  static async testRLSFunction(tableName: string, userRole: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .rpc('validate_rls_user_access', {
          test_table_name: tableName,
          user_role_type: userRole
        });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error(`Erro ao testar RLS para ${tableName}:`, error);
      return {
        table: tableName,
        user_role: userRole,
        accessible_records: -1,
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Obtém informações sobre o usuário atual
   */
  static async getCurrentUserInfo(): Promise<any> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { authenticated: false };
      }

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role, full_name, email')
        .eq('user_id', user.id)
        .single();

      return {
        authenticated: true,
        user_id: user.id,
        email: user.email,
        profile
      };
    } catch (error) {
      return { 
        authenticated: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}

/**
 * Hook para usar validação RLS em componentes React
 */
export const useRLSValidation = () => {
  const runTests = async () => {
    return await RLSValidator.runAllTests();
  };

  const testSpecificTable = async (tableName: string) => {
    switch (tableName) {
      case 'system_metrics':
        return await RLSValidator.testSystemMetrics();
      case 'user_invitations':
        return await RLSValidator.testUserInvitations();
      case 'notification_escalation_rules':
        return await RLSValidator.testNotificationEscalationRules();
      case 'automated_actions_log':
        return await RLSValidator.testAutomatedActionsLog();
      default:
        throw new Error(`Tabela ${tableName} não suportada para teste`);
    }
  };

  const getCurrentUser = async () => {
    return await RLSValidator.getCurrentUserInfo();
  };

  return {
    runTests,
    testSpecificTable,
    getCurrentUser
  };
};