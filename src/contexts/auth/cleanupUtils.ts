
/**
 * Utilitário para limpeza e gerenciamento de estados de autenticação
 * Previne estados de "limbo" na autenticação
 */

/**
 * Limpa todos os tokens e estados de autenticação do Supabase
 * armazenados no localStorage e sessionStorage
 */
export const cleanupAuthState = () => {
  try {
    // Remover tokens de autenticação padrão
    localStorage.removeItem('supabase.auth.token');
    
    // Remover todas as chaves relacionadas ao Supabase auth do localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    
    // Remover do sessionStorage se estiver em uso
    if (typeof sessionStorage !== 'undefined') {
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          sessionStorage.removeItem(key);
        }
      });
    }
    
    // Remover dados de cliente mock
    localStorage.removeItem('mock_session');
    localStorage.removeItem('user_role');
    sessionStorage.removeItem('client_id');
    sessionStorage.removeItem('client_name');
    sessionStorage.removeItem('client_cnpj');
    
    console.log('Estado de autenticação limpo com sucesso');
  } catch (error) {
    console.error('Erro ao limpar estado de autenticação:', error);
  }
};

/**
 * Verifica e relata quaisquer chaves de autenticação residuais
 * que possam causar problemas de "limbo" na autenticação
 */
export const checkForAuthLimboState = () => {
  const authKeys = [];
  
  // Verificar localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      authKeys.push({ storage: 'localStorage', key });
    }
  });
  
  // Verificar sessionStorage
  if (typeof sessionStorage !== 'undefined') {
    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        authKeys.push({ storage: 'sessionStorage', key });
      }
    });
  }
  
  // Verificar dados de cliente mock
  if (localStorage.getItem('mock_session') || localStorage.getItem('user_role')) {
    authKeys.push({ storage: 'localStorage', key: 'mock_session/user_role' });
  }
  
  if (sessionStorage.getItem('client_id') || 
      sessionStorage.getItem('client_name') || 
      sessionStorage.getItem('client_cnpj')) {
    authKeys.push({ storage: 'sessionStorage', key: 'client_data' });
  }
  
  if (authKeys.length > 0) {
    console.warn('Possível estado de limbo de autenticação detectado:', authKeys);
    return authKeys;
  }
  
  return null;
};
