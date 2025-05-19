
/**
 * Utilitários para limpeza e verificação de estado de autenticação
 */

/**
 * Limpa todo o estado de autenticação do localStorage e sessionStorage
 * para garantir que não haja conflitos em novas tentativas de login
 */
export const cleanupAuthState = () => {
  try {
    console.log('Limpando estado de autenticação');
    
    // Limpar tokens de autenticação do Supabase
    localStorage.removeItem('supabase.auth.token');
    
    // Limpar todas as chaves relacionadas a autenticação do Supabase
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    
    // Limpar do sessionStorage se estiver em uso
    if (typeof sessionStorage !== 'undefined') {
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          sessionStorage.removeItem(key);
        }
      });
      
      // Limpar sinalizadores de navegação
      sessionStorage.removeItem('from_login');
      sessionStorage.removeItem('redirect_after_login');
    }
    
    // Limpar variáveis de controle de sessão mock
    localStorage.removeItem('mock_session');
    localStorage.removeItem('user_role');
    
    // Limpar outras variáveis de estado que podem interferir
    localStorage.removeItem('current_user');
    localStorage.removeItem('active_profile');
    sessionStorage.removeItem('client_authenticated');
    sessionStorage.removeItem('client_id');
    sessionStorage.removeItem('client_name');
    sessionStorage.removeItem('client_cnpj');
    sessionStorage.removeItem('client_access_token');
    
    // Limpar cache de navegação para evitar problemas com estados salvos
    if (typeof window !== 'undefined' && window.history && window.history.replaceState) {
      try {
        const cleanUrl = window.location.pathname;
        window.history.replaceState(null, '', cleanUrl);
      } catch (e) {
        console.error('Erro ao limpar histórico:', e);
      }
    }
    
    console.log('Estado de autenticação limpo com sucesso');
    return true;
  } catch (error) {
    console.error('Erro ao limpar estado de autenticação:', error);
    return false;
  }
};

/**
 * Verifica se há um estado de "limbo" na autenticação
 * onde o usuário não está completamente autenticado nem desautenticado
 * @returns {boolean} true se um estado de limbo foi detectado e corrigido
 */
export const checkForAuthLimboState = () => {
  // Verificar tokens expirados ou corrompidos no localStorage
  try {
    let limboDetected = false;
    
    // Verificar token do Supabase
    const storedSession = localStorage.getItem('supabase.auth.token');
    if (storedSession) {
      try {
        const parsedSession = JSON.parse(storedSession);
        const expiresAt = parsedSession?.expiresAt;
        
        if (expiresAt && new Date(expiresAt * 1000) < new Date()) {
          // Sessão expirada, limpar
          console.warn('Sessão expirada detectada, limpando');
          limboDetected = true;
        }
      } catch (e) {
        // Token corrompido, limpar
        console.warn('Token de autenticação corrompido, limpando');
        limboDetected = true;
      }
    }
    
    // Verificar estado inconsistente (mock_session sem user_role ou vice-versa)
    const mockSession = localStorage.getItem('mock_session');
    const userRole = localStorage.getItem('user_role');
    
    if ((mockSession && !userRole) || (!mockSession && userRole)) {
      console.warn('Estado inconsistente de mock_session/user_role detectado');
      limboDetected = true;
    }
    
    // Verificar sessão de cliente em estado inconsistente
    const clientAuthenticated = sessionStorage.getItem('client_authenticated') === 'true';
    const clientId = sessionStorage.getItem('client_id');
    
    if ((clientAuthenticated && !clientId) || (!clientAuthenticated && clientId)) {
      console.warn('Estado inconsistente de sessão de cliente detectado');
      limboDetected = true;
    }
    
    // Verificar flags de navegação inconsistentes
    const fromLogin = sessionStorage.getItem('from_login');
    const lastCleanup = sessionStorage.getItem('last_auth_cleanup');
    
    // Se tivermos um from_login antigo (mais de 1 minuto), considerar isso um problema
    if (fromLogin && lastCleanup) {
      const cleanupTime = parseInt(lastCleanup, 10);
      const now = Date.now();
      if ((now - cleanupTime) > 60000) { // 60 segundos
        console.warn('Flag de navegação antiga detectada, possível problema de redirecionamento');
        limboDetected = true;
      }
    }
    
    // Se qualquer estado de limbo foi detectado, limpar tudo
    if (limboDetected) {
      cleanupAuthState();
      return true;
    }
    
    return false;
  } catch (err) {
    console.error('Erro ao verificar estado de limbo da autenticação:', err);
    // Em caso de erro, limpar tudo por segurança
    cleanupAuthState();
    return true;
  }
};
