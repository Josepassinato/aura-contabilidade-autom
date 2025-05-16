
/**
 * Clean up auth state completely
 */
export const cleanupAuthState = () => {
  localStorage.removeItem('mock_session');
  localStorage.removeItem('user_role');
  localStorage.removeItem('supabase.auth.token');
  localStorage.removeItem('client_id');
  localStorage.removeItem('client_name');
  localStorage.removeItem('client_cnpj');
  sessionStorage.removeItem('client_id');
  sessionStorage.removeItem('client_name');
  sessionStorage.removeItem('client_cnpj');
  
  // Limpar também outros tokens que possam estar causando conflito
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  
  // Limpar sessionStorage também
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      sessionStorage.removeItem(key);
    }
  });
};

/**
 * Check for potential limbo state
 */
export const checkForAuthLimboState = () => {
  const hasLocalStorageAuth = localStorage.getItem('mock_session') === 'true' || 
                           localStorage.getItem('user_role') !== null;
  const hasSupabaseAuth = localStorage.getItem('supabase.auth.token') !== null;
  const hasClientSession = sessionStorage.getItem('client_id') !== null;
  
  // Verificar se há tokens Supabase
  let hasSupabaseTokens = false;
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      hasSupabaseTokens = true;
    }
  });
  
  // Se tivermos estados de autenticação conflitantes, limpar tudo
  if ((hasLocalStorageAuth || hasSupabaseAuth || hasSupabaseTokens) && hasClientSession) {
    console.warn('Detectados estados de autenticação conflitantes, limpando...');
    cleanupAuthState();
    return true;
  }
  
  // Verificar outras inconsistências possíveis
  if (hasLocalStorageAuth && !hasSupabaseAuth) {
    console.warn('Estado de autenticação local sem token Supabase, limpando...');
    cleanupAuthState();
    return true;
  }
  
  return false;
};
