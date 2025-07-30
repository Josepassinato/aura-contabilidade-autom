/**
 * Hook que força o uso da camada de serviços como boundary único
 * NUNCA acesse Supabase diretamente dos componentes - use este hook
 */

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logSecurityEvent, logAuditEvent } from '@/services/auditService';
import { logger } from '@/utils/logger';

// Lista de serviços aprovados que podem acessar dados
const APPROVED_SERVICES = [
  'contabilService',
  'clientsService',
  'auditService',
  'reportService',
  'authService'
];

export function useSecureDataAccess() {
  const [isBlocked, setIsBlocked] = useState(false);

  // Interceptar tentativas de acesso direto ao Supabase
  useEffect(() => {
    const originalFrom = supabase.from;

    // Override supabase.from para detectar acesso direto
    (supabase as any).from = function(table: string) {
      const stack = new Error().stack || '';
      const isFromComponent = stack.includes('components/') && 
                              !stack.includes('services/');
      
      if (isFromComponent) {
        // Log crítico de violação de arquitetura
        logSecurityEvent(
          'direct_supabase_access_violation',
          `Acesso direto ao Supabase detectado na tabela: ${table}`,
          {
            table,
            stack_trace: stack,
            timestamp: new Date().toISOString(),
            violation_type: 'bypass_service_boundary'
          }
        );

        logger.error(
          `🚫 VIOLAÇÃO DE ARQUITETURA: Acesso direto ao Supabase na tabela ${table}`,
          { stack },
          'SecurityBoundary'
        );

        setIsBlocked(true);

        // Em desenvolvimento, bloquear completamente
        if (import.meta.env.DEV) {
          throw new Error(
            `🚫 VIOLAÇÃO DE ARQUITETURA: Acesso direto ao Supabase não é permitido. Use um serviço em /services/`
          );
        }
      }

      return originalFrom.call(this, table);
    };

    return () => {
      // Restaurar métodos originais
      (supabase as any).from = originalFrom;
    };
  }, []);

  /**
   * Chamar serviço de forma segura
   */
  const callService = useCallback(async (
    serviceName: string,
    method: string,
    parameters?: any
  ): Promise<any> => {
    try {
      // Validar se é um serviço aprovado
      if (!APPROVED_SERVICES.includes(serviceName)) {
        throw new Error(`Serviço não aprovado: ${serviceName}`);
      }

      // Log da chamada de serviço
      await logAuditEvent({
        eventType: 'service_call',
        message: `Chamada ao serviço: ${serviceName}.${method}`,
        metadata: {
          service: serviceName,
          method,
          parameters: parameters ? Object.keys(parameters) : [],
          timestamp: new Date().toISOString()
        },
        severity: 'info'
      });

      // Importar dinamicamente o serviço
      let service: any;
      switch (serviceName) {
        case 'contabilService':
          service = await import('@/services/contabilService');
          break;
        case 'clientsService':
          service = await import('@/services/supabase/clientsService');
          break;
        case 'auditService':
          service = await import('@/services/auditService');
          break;
        default:
          throw new Error(`Serviço não implementado: ${serviceName}`);
      }

      // Chamar método do serviço
      if (typeof service[method] !== 'function') {
        throw new Error(`Método não encontrado: ${serviceName}.${method}`);
      }

      const result = await service[method](parameters);

      logger.info(
        `✅ Chamada de serviço bem-sucedida: ${serviceName}.${method}`,
        { hasResult: !!result },
        'ServiceBoundary'
      );

      return result;

    } catch (error) {
      logger.error(
        `❌ Erro na chamada de serviço: ${serviceName}.${method}`,
        error,
        'ServiceBoundary'
      );

      // Log crítico de erro
      await logAuditEvent({
        eventType: 'service_call_failed',
        message: `Falha na chamada: ${serviceName}.${method}`,
        metadata: {
          service: serviceName,
          method,
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString()
        },
        severity: 'error'
      });

      throw error;
    }
  }, []);

  /**
   * Shortcut para serviços comuns
   */
  const contabil = {
    criarLancamento: useCallback((dados: any) => 
      callService('contabilService', 'criarLancamentoContabil', dados), [callService]),
    buscarLancamentos: useCallback((filtros?: any) => 
      callService('contabilService', 'buscarLancamentosContabeis', filtros), [callService]),
    buscarPlanoContas: useCallback(() => 
      callService('contabilService', 'buscarPlanoContas'), [callService]),
    buscarCentrosCusto: useCallback(() => 
      callService('contabilService', 'buscarCentrosCusto'), [callService]),
    obterProximoNumero: useCallback((clientId: string) => 
      callService('contabilService', 'obterProximoNumeroLancamento', clientId), [callService]),
  };

  const clients = {
    fetchAll: useCallback(() => 
      callService('clientsService', 'fetchAllClients'), [callService]),
    create: useCallback((data: any) => 
      callService('clientsService', 'createClient', data), [callService]),
    update: useCallback((id: string, data: any) => 
      callService('clientsService', 'updateClient', { id, ...data }), [callService]),
  };

  return {
    isBlocked,
    callService,
    contabil,
    clients,
    
    // Status da arquitetura
    getArchitectureStatus: useCallback(() => ({
      secure_boundary_active: !isBlocked,
      services_available: APPROVED_SERVICES,
      last_check: new Date().toISOString()
    }), [isBlocked])
  };
}

/**
 * Hook de desenvolvimento para monitorar violações
 */
export function useArchitectureMonitor() {
  const [violations, setViolations] = useState<string[]>([]);

  useEffect(() => {
    if (!import.meta.env.DEV) return;

    const checkInterval = setInterval(() => {
      // Verificar se há componentes acessando Supabase diretamente
      const performanceEntries = performance.getEntriesByType('measure');
      const suspiciousPatterns = performanceEntries.filter(entry => 
        entry.name.includes('supabase') && 
        !entry.name.includes('service')
      );

      if (suspiciousPatterns.length > 0) {
        const newViolations = suspiciousPatterns.map(p => p.name);
        setViolations(prev => [...prev, ...newViolations]);
      }
    }, 5000);

    return () => clearInterval(checkInterval);
  }, []);

  return {
    violations,
    clearViolations: () => setViolations([]),
    hasViolations: violations.length > 0
  };
}