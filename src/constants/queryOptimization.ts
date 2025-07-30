/**
 * Constantes para performance e paginação
 */

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 25,
  MAX_PAGE_SIZE: 100,
  LARGE_TABLE_PAGE_SIZE: 50
} as const;

export const QUERY_LIMITS = {
  DASHBOARD_ITEMS: 10,
  RECENT_ITEMS: 5,
  SEARCH_RESULTS: 20,
  EXPORT_BATCH: 1000
} as const;

/**
 * Campos otimizados para consultas específicas
 */
export const SELECT_FIELDS = {
  // Clients
  CLIENT_LIST: 'id, name, email, cnpj, status, created_at',
  CLIENT_BASIC: 'id, name, email, status',
  CLIENT_FULL: 'id, name, email, cnpj, phone, address, status, regime, created_at, updated_at',

  // Accounting
  LANCAMENTO_LIST: 'id, numero_lancamento, data_lancamento, historico, valor_total, status, created_at',
  LANCAMENTO_BASIC: 'id, numero_lancamento, data_lancamento, valor_total, status',
  PLANO_CONTAS: 'id, codigo, nome, aceita_lancamento, ativo',
  CENTRO_CUSTOS: 'id, codigo, nome, ativo',

  // Documents
  DOCUMENT_LIST: 'id, name, file_path, status, created_at, file_size',
  DOCUMENT_BASIC: 'id, name, status, created_at',

  // Reports
  REPORT_LIST: 'id, title, report_type, generation_status, created_at, file_size',
  REPORT_BASIC: 'id, title, report_type, generation_status',

  // Users & Auth
  USER_PROFILE: 'id, user_id, full_name, email, role, created_at',
  USER_BASIC: 'id, full_name, email, role',

  // Notifications
  NOTIFICATION_LIST: 'id, title, message, type, priority, is_read, created_at',
  NOTIFICATION_BASIC: 'id, title, type, priority, is_read, created_at',

  // Queue & Performance
  QUEUE_STATUS: 'id, task_type, status, priority, created_at, started_at, retry_count',
  WORKER_STATUS: 'id, worker_id, function_name, status, current_task_count, last_heartbeat',

  // Audit
  AUDIT_LIST: 'id, table_name, operation, severity, created_at, user_id',
  AUDIT_DETAIL: 'id, table_name, operation, old_values, new_values, severity, metadata, created_at'
} as const;

/**
 * Helper para criar consultas paginadas
 */
export function createPaginatedQuery<T>(
  query: any,
  page: number = 1,
  pageSize: number = PAGINATION.DEFAULT_PAGE_SIZE
) {
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;
  
  return query.range(start, end);
}

/**
 * Helper para adicionar ordenação padrão
 */
export function addDefaultOrder(query: any, orderBy: string = 'created_at', ascending: boolean = false) {
  return query.order(orderBy, { ascending });
}