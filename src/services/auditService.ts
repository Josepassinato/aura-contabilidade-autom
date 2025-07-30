/**
 * Serviço de auditoria centralizado para logs críticos e rastreamento de ações
 */

import { supabase } from "@/lib/supabase/client";
import { logger } from "@/utils/logger";

export interface AuditEvent {
  eventType: string;
  message: string;
  metadata?: Record<string, any>;
  severity?: 'info' | 'warning' | 'error' | 'critical';
  userId?: string;
  tableName?: string;
  recordId?: string;
  operation?: 'INSERT' | 'UPDATE' | 'DELETE' | 'SELECT';
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Registra evento crítico na auditoria
 */
export async function logAuditEvent(event: AuditEvent): Promise<void> {
  try {
    // Log local primeiro
    logger.info(`Audit Event: ${event.eventType}`, event, 'AuditService');

    // Log na tabela de auditoria
    const { error } = await supabase.rpc('log_critical_event', {
      p_event_type: event.eventType,
      p_message: event.message,
      p_metadata: event.metadata || {},
      p_severity: event.severity || 'info'
    });

    if (error) {
      logger.error('Erro ao registrar evento de auditoria', error, 'AuditService');
    }

    // Se for crítico, também inserir nas métricas do sistema
    if (event.severity === 'critical') {
      await supabase
        .from('system_metrics')
        .insert({
          metric_name: 'critical_audit_event',
          metric_value: 1,
          metric_type: 'counter',
          labels: {
            event_type: event.eventType,
            source: 'audit_service'
          }
        });
    }
  } catch (error) {
    logger.error('Falha ao registrar evento de auditoria', error, 'AuditService');
  }
}

/**
 * Log de auditoria para operações de banco de dados
 */
export async function logDatabaseOperation(
  tableName: string,
  operation: 'INSERT' | 'UPDATE' | 'DELETE' | 'SELECT',
  recordId?: string,
  oldValues?: Record<string, any>,
  newValues?: Record<string, any>,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    // Capturar informações do usuário e sessão
    const userAgent = navigator?.userAgent;
    
    const { error } = await supabase
      .from('audit_logs')
      .insert({
        table_name: tableName,
        operation,
        record_id: recordId,
        old_values: oldValues,
        new_values: newValues,
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString(),
          source: 'application'
        },
        user_agent: userAgent,
        severity: operation === 'DELETE' ? 'warning' : 'info',
        source: 'app'
      });

    if (error) {
      logger.error('Erro ao registrar operação de banco de dados', error, 'AuditService');
    }
  } catch (error) {
    logger.error('Falha ao registrar operação de banco de dados', error, 'AuditService');
  }
}

/**
 * Log de eventos de autenticação
 */
export async function logAuthEvent(
  eventType: 'login' | 'logout' | 'failed_login' | 'signup' | 'password_reset',
  userId?: string,
  metadata?: Record<string, any>
): Promise<void> {
  await logAuditEvent({
    eventType: `auth_${eventType}`,
    message: `Evento de autenticação: ${eventType}`,
    metadata: {
      ...metadata,
      timestamp: new Date().toISOString()
    },
    severity: eventType === 'failed_login' ? 'warning' : 'info',
    userId
  });
}

/**
 * Log de eventos de segurança
 */
export async function logSecurityEvent(
  eventType: string,
  message: string,
  metadata?: Record<string, any>
): Promise<void> {
  await logAuditEvent({
    eventType: `security_${eventType}`,
    message,
    metadata: {
      ...metadata,
      security_alert: true,
      timestamp: new Date().toISOString()
    },
    severity: 'critical'
  });
}

/**
 * Log de eventos de sistema
 */
export async function logSystemEvent(
  eventType: string,
  message: string,
  metadata?: Record<string, any>,
  severity: 'info' | 'warning' | 'error' | 'critical' = 'info'
): Promise<void> {
  await logAuditEvent({
    eventType: `system_${eventType}`,
    message,
    metadata: {
      ...metadata,
      timestamp: new Date().toISOString()
    },
    severity
  });
}

/**
 * Buscar logs de auditoria com filtros
 */
export async function getAuditLogs(filters?: {
  startDate?: string;
  endDate?: string;
  eventType?: string;
  severity?: string;
  userId?: string;
  limit?: number;
}) {
  try {
    let query = supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate);
    }

    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate);
    }

    if (filters?.severity) {
      query = query.eq('severity', filters.severity);
    }

    if (filters?.userId) {
      query = query.eq('user_id', filters.userId);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) {
      logger.error('Erro ao buscar logs de auditoria', error, 'AuditService');
      return [];
    }

    return data || [];
  } catch (error) {
    logger.error('Falha ao buscar logs de auditoria', error, 'AuditService');
    return [];
  }
}