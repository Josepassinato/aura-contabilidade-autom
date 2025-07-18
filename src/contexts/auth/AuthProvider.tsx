
import React, { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { UserProfile, UserRole, SupabaseUser, SupabaseSession } from '@/lib/supabase';
import { supabase, supabaseAuth, getUserProfile } from '@/lib/supabaseService';
import { useToast } from '@/hooks/use-toast';
import { Session, User } from '@supabase/supabase-js';
import { cleanupAuthState, checkForAuthLimboState } from './cleanupUtils';
import { cleanupAllMockData } from '@/utils/cleanupMockData';


export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const { toast } = useToast();

  // Initialize and configure auth state change listener
  useEffect(() => {
    setIsLoading(true);
    
    // Force production mode - clean all mock data
    cleanupAllMockData();
    
    // Check for and report potential limbo states
    checkForAuthLimboState();
    
    // 1. Set up auth event listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log('Auth state changed:', event);
      
      // Update session and user states immediately (synchronous)
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setIsAuthenticated(!!newSession);
      
      // If login occurred, fetch additional data asynchronously using setTimeout
      if (event === 'SIGNED_IN' && newSession?.user) {
        setTimeout(() => {
          fetchUserProfile(newSession.user.id);
        }, 0);
      }
      
      // If logout occurred, clear profile data
      if (event === 'SIGNED_OUT') {
        setUserProfile(null);
        setIsAuthenticated(false);
      }
    });
    
    // 2. Check existing session
    const initializeAuth = async () => {
      try {
        // Only use real Supabase session - no more mock sessions
        const { data: { session: existingSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        if (existingSession) {
          setSession(existingSession);
          setUser(existingSession.user);
          setIsAuthenticated(true);
          
          // Fetch additional profile using setTimeout to avoid deadlocks
          setTimeout(() => {
            fetchUserProfile(existingSession.user.id);
          }, 0);
        } else {
          setIsAuthenticated(false);
          setUserProfile(null);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setIsAuthenticated(false);
        setUserProfile(null);
        setSession(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeAuth();
    
    // Clean up the listener when component unmounts
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch additional user profile
  const fetchUserProfile = async (userId: string) => {
    try {
      if (!userId) return;
      
      // Fetch real profile from user_profiles table
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }

      if (data) {
        setUserProfile({
          id: data.id,
          email: data.email,
          name: data.full_name,
          role: data.role as UserRole,
          full_name: data.full_name,
          company_id: data.company_id
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };


  // Login with real authentication
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // Clear previous auth state
      cleanupAuthState();
      
      // Use real Supabase authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Login error:', error);
        toast({
          title: "Erro no login",
          description: error.message || "Credenciais inválidas",
          variant: "destructive",
        });
        return { success: false, error: error.message };
      }
      
      if (data.user) {
        toast({
          title: "Login bem-sucedido",
          description: "Bem-vindo de volta!",
        });
        
        return { success: true, error: null };
      }
      
      return { success: false, error: 'Credenciais inválidas' };
    } catch (error: any) {
      console.error('Error in login:', error);
      toast({
        title: "Falha no login",
        description: error.message || "Não foi possível efetuar o login",
        variant: "destructive"
      });
      return { success: false, error: error.message || 'Falha na autenticação' };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout with complete cleanup
  const logout = async () => {
    try {
      setIsLoading(true);
      
      // Clear auth state
      cleanupAuthState();
      
      // Try real Supabase logout
      try {
        await supabase.auth.signOut();
      } catch (err) {
        // Continue even if this fails
      }
      
      // Reset states
      setIsAuthenticated(false);
      setUserProfile(null);
      setSession(null);
      setUser(null);
      
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso",
      });
    } catch (error) {
      console.error('Error in logout:', error);
      toast({
        title: "Erro no logout",
        description: "Ocorreu um erro ao tentar desconectar",
        variant: "destructive"
      });
      
      // Force cleanup in case of error
      cleanupAuthState();
      window.location.href = '/login';
    } finally {
      setIsLoading(false);
    }
  };

  // Adapters for AuthContext API
  const signIn = async (email: string, password: string) => {
    try {
      const result = await login(email, password);
      return { error: result.success ? null : new Error(result.error) };
    } catch (error) {
      console.error('Error in SignIn:', error);
      toast({
        title: "Falha no login",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
      return { error: new Error('Falha na autenticação') };
    }
  };

  const signUp = async (email: string, password: string, userData: Partial<UserProfile>) => {
    try {
      // Use real Supabase signup
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.full_name || userData.name,
            role: userData.role || 'client',
            company: userData.company_id,
            cnpj: userData.cnpj,
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        toast({
          title: "Conta criada",
          description: "Sua conta foi criada com sucesso",
        });
        return { error: null };
      }

      return { error: new Error('Falha ao criar conta') };
    } catch (error: any) {
      console.error('Error in SignUp:', error);
      toast({
        title: "Erro no cadastro",
        description: error.message || "Não foi possível criar sua conta",
        variant: "destructive"
      });
      return { error: new Error(error.message || 'Falha no cadastro') };
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error in SignOut:', error);
      toast({
        title: "Erro ao sair",
        description: error instanceof Error ? error.message : "Falha ao fazer logout",
        variant: "destructive"
      });
      
      // Force cleanup and redirect in case of error
      cleanupAuthState();
      window.location.href = '/login';
    }
  };

  // Determine roles based on profile
  const isAdmin = userProfile?.role === 'admin';
  const isAccountant = userProfile?.role === 'accountant' || isAdmin;
  const isClient = userProfile?.role === 'client';

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile: userProfile,
        userProfile,
        isLoading,
        isAuthenticated,
        signIn,
        signUp,
        signOut: handleSignOut,
        isAdmin,
        isAccountant,
        isClient,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
