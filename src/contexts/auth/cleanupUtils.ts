
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
};

/**
 * Check for potential limbo state
 */
export const checkForAuthLimboState = () => {
  const hasLocalStorageAuth = localStorage.getItem('mock_session') === 'true' || 
                           localStorage.getItem('user_role') !== null;
  const hasSupabaseAuth = localStorage.getItem('supabase.auth.token') !== null;
  const hasClientSession = sessionStorage.getItem('client_id') !== null;
  
  // If we have conflicting auth states, clean up
  if ((hasLocalStorageAuth || hasSupabaseAuth) && hasClientSession) {
    console.warn('Detected conflicting auth states, cleaning up');
    cleanupAuthState();
    return true;
  }
  
  return false;
};
