import { useStaticQuery, useReferenceQuery, useOperationalQuery } from './useCachedSupabaseQuery';
import { ClientsQueryService } from '@/services/clients/clientsQueryService';
import { DocumentsQueryService } from '@/services/documents/documentsQueryService';
import { ReportsQueryService } from '@/services/reports/reportsQueryService';

/**
 * Hook para lista de clientes com cache de referência (muda ocasionalmente)
 */
export function useCachedAccountantClients(accountantId: string | null) {
  return useReferenceQuery(
    ['clients', 'accountant', accountantId],
    async () => {
      if (!accountantId) return { data: null, error: null };
      return await ClientsQueryService.getAccountantClients(accountantId);
    },
    {
      enabled: !!accountantId,
    }
  );
}

/**
 * Hook para todos os clientes (admin) com cache de referência
 */
export function useCachedAllClients() {
  return useReferenceQuery(
    ['clients', 'all'],
    async () => await ClientsQueryService.getAllClients()
  );
}

/**
 * Hook para cliente específico com cache operacional
 */
export function useCachedClientById(clientId: string | null) {
  return useOperationalQuery(
    ['client', clientId],
    async () => {
      if (!clientId) return { data: null, error: null };
      return await ClientsQueryService.getClientById(clientId);
    },
    {
      enabled: !!clientId,
    }
  );
}

/**
 * Hook para estatísticas de clientes com cache estático (muda raramente)
 */
export function useCachedClientStats() {
  return useStaticQuery(
    ['clients', 'stats'],
    async () => await ClientsQueryService.getClientStats()
  );
}

/**
 * Hook para documentos de cliente com cache operacional
 */
export function useCachedClientDocuments(clientId: string | null) {
  return useOperationalQuery(
    ['documents', 'client', clientId],
    async () => {
      if (!clientId) return { data: null, error: null };
      return await DocumentsQueryService.getClientDocuments(clientId);
    },
    {
      enabled: !!clientId,
    }
  );
}

/**
 * Hook para todos os documentos com cache operacional
 */
export function useCachedAllDocuments() {
  return useOperationalQuery(
    ['documents', 'all'],
    async () => await DocumentsQueryService.getAllDocuments()
  );
}

/**
 * Hook para documento específico com cache operacional
 */
export function useCachedDocumentById(documentId: string | null) {
  return useOperationalQuery(
    ['document', documentId],
    async () => {
      if (!documentId) return { data: null, error: null };
      return await DocumentsQueryService.getDocumentById(documentId);
    },
    {
      enabled: !!documentId,
    }
  );
}

/**
 * Hook para estatísticas de documentos com cache estático
 */
export function useCachedDocumentStats(clientId?: string) {
  return useStaticQuery(
    ['documents', 'stats', clientId],
    async () => await DocumentsQueryService.getDocumentStats(clientId)
  );
}

/**
 * Hook para relatórios de cliente com cache operacional
 */
export function useCachedClientReports(clientId: string | null) {
  return useOperationalQuery(
    ['reports', 'client', clientId],
    async () => {
      if (!clientId) return { data: null, error: null };
      return await ReportsQueryService.getClientReports(clientId);
    },
    {
      enabled: !!clientId,
    }
  );
}

/**
 * Hook para todos os relatórios com cache operacional
 */
export function useCachedAllReports() {
  return useOperationalQuery(
    ['reports', 'all'],
    async () => await ReportsQueryService.getAllReports()
  );
}

/**
 * Hook para relatório específico com cache operacional
 */
export function useCachedReportById(reportId: string | null) {
  return useOperationalQuery(
    ['report', reportId],
    async () => {
      if (!reportId) return { data: null, error: null };
      return await ReportsQueryService.getReportById(reportId);
    },
    {
      enabled: !!reportId,
    }
  );
}

/**
 * Hook para relatórios próximos do vencimento com cache dinâmico
 */
export function useCachedExpiringReports(daysFromNow: number = 7) {
  return useOperationalQuery(
    ['reports', 'expiring', daysFromNow],
    async () => await ReportsQueryService.getExpiringReports(daysFromNow)
  );
}