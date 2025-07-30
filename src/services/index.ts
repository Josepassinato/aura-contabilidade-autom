/**
 * Serviços centralizados para consultas Supabase
 * 
 * Este módulo exporta todos os serviços de consulta organizados por domínio:
 * - Auth: Autenticação e sessão
 * - Users: Perfis e convites de usuário  
 * - Security: Controle de acesso e tokens
 * - Clients: Dados dos clientes
 * - Reports: Relatórios gerados
 * - Documents: Documentos dos clientes
 */

// Auth Services
export { AuthService } from './auth/authService';

// User Services  
export { UserProfileService } from './user/userProfileService';
export { UserInvitationService } from './user/userInvitationService';

// Security Services
export { SecurityService } from './security/securityService';

// Client Services
export { ClientsQueryService } from './clients/clientsQueryService';

// Report Services
export { ReportsQueryService } from './reports/reportsQueryService';

// Document Services
export { DocumentsQueryService } from './documents/documentsQueryService';

// Re-exports de serviços específicos existentes
export * from './fiscal/integration';
export * from './supabase/obrigacoesService';
export * from './supabase/storageService';
export * from './governamental/procuracaoService';
export * from './relatorios/reportsService';

// Types
export * from '../types/pagination';