
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
    }
    
    // Limpar variáveis de controle de sessão mock
    localStorage.removeItem('mock_session');
    localStorage.removeItem('user_role');
    
    // Limpar outras variáveis de estado que podem interferir
    localStorage.removeItem('current_user');
    localStorage.removeItem('active_profile');
    
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
