
// Utility functions to clean up authentication state and prevent auth limbo

/**
 * Limpa completamente todos os estados de autenticação no localStorage e sessionStorage
 * para evitar conflitos e estados inconsistentes
 */
export const cleanupAuthState = () => {
  console.log("Cleaning up authentication state");
  
  // Clear mock session data
  localStorage.removeItem('mock_session');
  localStorage.removeItem('user_role');
  
  // Clear navigation flags
  sessionStorage.removeItem('from_login');
  
  // Clear all potential Supabase auth tokens from localStorage
  const keysToRemove = [
    'supabase.auth.token',
    'sb-access-token',
    'sb-refresh-token',
    'sb-auth-token',
    'supabase.auth.refreshToken',
  ];
  
  // Remove specific keys
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    try {
      sessionStorage.removeItem(key);
    } catch (e) {
      // Ignore errors if sessionStorage is not available
    }
  });
  
  // Remove all storage items that match patterns
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  
  try {
    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
  } catch (e) {
    // Ignore errors if sessionStorage is not available
  }

  console.log("Auth cleanup complete");
};

/**
 * Verifica se existe algum estado de autenticação "limbo"
 * onde tokens e sessões podem estar em estado inconsistente
 */
export const checkForAuthLimboState = (): boolean => {
  // Verificar localStorage
  const mockSession = localStorage.getItem('mock_session');
  const userRole = localStorage.getItem('user_role');
  
  // Se tiver um role sem mock_session ou vice-versa, está em limbo
  const hasInconsistentMockState = 
    (mockSession === 'true' && !userRole) || 
    (mockSession !== 'true' && userRole);
    
  if (hasInconsistentMockState) {
    console.warn("Detected inconsistent mock session state");
    return true;
  }
  
  // Checar se há tokens Supabase parciais
  let hasAuthToken = false;
  let hasRefreshToken = false;
  
  Object.keys(localStorage).forEach(key => {
    if (key.includes('access') || key.includes('token')) hasAuthToken = true;
    if (key.includes('refresh')) hasRefreshToken = true;
  });
  
  // Estado limbo: ter um tipo de token mas não o outro
  const hasInconsistentTokens = hasAuthToken !== hasRefreshToken;
  
  if (hasInconsistentTokens) {
    console.warn("Detected inconsistent token state");
    return true;
  }
  
  return false;
};
