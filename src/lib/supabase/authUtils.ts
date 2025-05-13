
// Utilitários para limpeza de estado de autenticação

/**
 * Limpa todos os estados de autenticação do Supabase
 * do localStorage e sessionStorage para evitar problemas
 * com tokens expirados ou corrompidos.
 */
export const cleanupAuthState = () => {
  try {
    // Remover tokens de autenticação padrão
    localStorage.removeItem('supabase.auth.token');
    
    // Remover todas as chaves de autenticação do Supabase do localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    
    // Remover do sessionStorage se em uso
    if (typeof sessionStorage !== 'undefined') {
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          sessionStorage.removeItem(key);
        }
      });
    }
    
    console.log('Estado de autenticação limpo com sucesso');
  } catch (error) {
    console.error('Erro ao limpar estado de autenticação:', error);
  }
};
