
/**
 * Utility functions for cleaning up authentication state
 * and detecting problematic authentication states
 */

/**
 * Limpa completamente o estado de autenticação do browser
 * para prevenir problemas de sessão
 */
export const cleanupAuthState = () => {
  // Limpar dados de sessão do localStorage
  localStorage.removeItem('mock_session');
  localStorage.removeItem('user_role');
  
  // Limpar tokens da Supabase (quando aplicável)
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  
  // Limpar dados de sessão do sessionStorage (quando aplicável)
  try {
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
  } catch (e) {
    // Ignore errors if sessionStorage is not available
  }
  
  // Limpar tokens de cliente para acesso portal
  sessionStorage.removeItem('client_id');
  sessionStorage.removeItem('client_name');
  sessionStorage.removeItem('client_cnpj');
  sessionStorage.removeItem('client_access_token');
  sessionStorage.removeItem('client_authenticated');
};

/**
 * Verifica problemas potenciais de estado de autenticação
 * que podem causar comportamento inconsistente
 * @returns true se um problema foi detectado e corrigido
 */
export const checkForAuthLimboState = (): boolean => {
  try {
    // Verificar tokens inconsistentes em mock_session
    const mockSession = localStorage.getItem('mock_session') === 'true';
    const userRole = localStorage.getItem('user_role');
    
    // Verificar inconsistência entre mock_session e user_role
    if (mockSession && !userRole) {
      console.warn('Estado inconsistente: mock_session = true mas sem user_role');
      cleanupAuthState();
      return true;
    }
    
    if (!mockSession && userRole) {
      console.warn('Estado inconsistente: user_role definido mas mock_session = false');
      cleanupAuthState();
      return true;
    }
    
    // Para cada sessão de teste, garantir que as variáveis de sessão são consistentes
    const clientAuthenticated = sessionStorage.getItem('client_authenticated') === 'true';
    const clientId = sessionStorage.getItem('client_id');
    
    if (clientAuthenticated && !clientId) {
      console.warn('Estado inconsistente: cliente autenticado mas sem ID');
      cleanupAuthState();
      return true;
    }
    
    // Verificar problemas em tokens do Supabase (quando aplicável)
    // Se detectar um token expirado ou inválido
    const authToken = localStorage.getItem('supabase.auth.token');
    if (authToken && (authToken.includes('invalid') || authToken.includes('expired'))) {
      console.warn('Token Supabase potencialmente inválido ou expirado');
      cleanupAuthState();
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Erro ao verificar estado de autenticação:', error);
    return false;
  }
};
