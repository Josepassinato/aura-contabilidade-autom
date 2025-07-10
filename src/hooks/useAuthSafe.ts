import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '@/contexts/auth/AuthContext';
import { log } from '@/utils/logger';
import { isNullOrUndefined } from '@/utils/validation';

interface AuthSafeState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
  profile: any | null;
  isAdmin: boolean;
  isAccountant: boolean;
  isClient: boolean;
  error: string | null;
}

/**
 * Safe authentication hook with proper error handling and null checks
 */
export function useAuthSafe(componentName?: string): AuthSafeState {
  const context = useContext(AuthContext);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isNullOrUndefined(context)) {
      const errorMsg = 'AuthContext not available. Component must be wrapped in AuthProvider.';
      log.error(errorMsg, null, componentName || 'useAuthSafe');
      setError(errorMsg);
      return;
    }

    // Clear any previous errors if context is now available
    if (error) {
      setError(null);
    }
  }, [context, error, componentName]);

  // Return safe defaults if context is not available
  if (isNullOrUndefined(context)) {
    return {
      isAuthenticated: false,
      isLoading: false,
      user: null,
      profile: null,
      isAdmin: false,
      isAccountant: false,
      isClient: false,
      error: error || 'Authentication context not available'
    };
  }

  // Safe access to context properties with fallbacks
  const isAuthenticated = context.isAuthenticated ?? false;
  const isLoading = context.isLoading ?? false;
  const user = context.user ?? null;
  const profile = context.profile ?? context.userProfile ?? null;
  
  // Safe role checks with null guards
  const isAdmin = context.isAdmin ?? false;
  const isAccountant = context.isAccountant ?? false;
  const isClient = context.isClient ?? false;

  // Log authentication state changes for debugging
  useEffect(() => {
    log.debug('Auth state changed', {
      isAuthenticated,
      isLoading,
      hasUser: !isNullOrUndefined(user),
      hasProfile: !isNullOrUndefined(profile),
      isAdmin,
      isAccountant,
      isClient
    }, componentName || 'useAuthSafe');
  }, [isAuthenticated, isLoading, user, profile, isAdmin, isAccountant, isClient, componentName]);

  return {
    isAuthenticated,
    isLoading,
    user,
    profile,
    isAdmin,
    isAccountant,
    isClient,
    error: null
  };
}

/**
 * Hook for components that require authentication
 * Throws an error if user is not authenticated
 */
export function useRequireAuth(componentName?: string) {
  const auth = useAuthSafe(componentName);
  
  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      const errorMsg = 'Component requires authentication but user is not logged in';
      log.error(errorMsg, null, componentName || 'useRequireAuth');
      throw new Error(errorMsg);
    }
  }, [auth.isAuthenticated, auth.isLoading, componentName]);

  return auth;
}

/**
 * Hook for components that require admin access
 */
export function useRequireAdmin(componentName?: string) {
  const auth = useRequireAuth(componentName);
  
  useEffect(() => {
    if (!auth.isLoading && auth.isAuthenticated && !auth.isAdmin) {
      const errorMsg = 'Component requires admin access but user is not an admin';
      log.error(errorMsg, null, componentName || 'useRequireAdmin');
      throw new Error(errorMsg);
    }
  }, [auth.isAdmin, auth.isAuthenticated, auth.isLoading, componentName]);

  return auth;
}

/**
 * Hook for components that require accountant or admin access
 */
export function useRequireAccountantOrAdmin(componentName?: string) {
  const auth = useRequireAuth(componentName);
  
  useEffect(() => {
    if (!auth.isLoading && auth.isAuthenticated && !auth.isAdmin && !auth.isAccountant) {
      const errorMsg = 'Component requires accountant or admin access';
      log.error(errorMsg, null, componentName || 'useRequireAccountantOrAdmin');
      throw new Error(errorMsg);
    }
  }, [auth.isAdmin, auth.isAccountant, auth.isAuthenticated, auth.isLoading, componentName]);

  return auth;
}