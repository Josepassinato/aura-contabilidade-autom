
/**
 * Utilities for cleaning up authentication state
 * to prevent auth limbo states and token conflicts
 */

/**
 * Clean up all authentication state from local storage and session storage
 * to ensure a fresh authentication state
 */
export const cleanupAuthState = () => {
  try {
    // Clear standard auth tokens
    localStorage.removeItem('supabase.auth.token');
    
    // Clear mock session related items
    localStorage.removeItem('mock_session');
    localStorage.removeItem('user_role');
    
    // Clear all Supabase auth related items from localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    
    // Clear from sessionStorage if available
    if (typeof sessionStorage !== 'undefined') {
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          sessionStorage.removeItem(key);
        }
      });
    }
    
    console.log('Auth state cleaned successfully');
  } catch (error) {
    console.error('Error cleaning auth state:', error);
  }
};

/**
 * Check for potential auth limbo states where tokens might be
 * expired but still present, causing authentication issues
 * @returns {boolean} true if a limbo state was detected and fixed
 */
export const checkForAuthLimboState = () => {
  // Check for inconsistent auth state
  const hasSession = localStorage.getItem('supabase.auth.token') !== null;
  const hasSessionExpiry = localStorage.getItem('supabase.auth.expires_at') !== null;
  const hasMockSession = localStorage.getItem('mock_session') === 'true';
  
  // Check if session is expired
  let isExpired = false;
  if (hasSessionExpiry) {
    try {
      const expiresAt = parseInt(localStorage.getItem('supabase.auth.expires_at') || '0');
      isExpired = expiresAt > 0 && Date.now() > expiresAt;
    } catch (e) {
      // If we can't parse the expiry, assume it's corrupted
      isExpired = true;
    }
  }
  
  // Detect mock session without proper role
  const hasMockWithoutRole = hasMockSession && !localStorage.getItem('user_role');
  
  // If we have a session that's expired or corrupted, clean up
  if ((hasSession && isExpired) || hasMockWithoutRole) {
    console.warn('Detected auth limbo state, cleaning up');
    cleanupAuthState();
    return true;
  }
  
  return false;
};
