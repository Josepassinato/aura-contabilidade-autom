
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSupabaseClient, UserProfile } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{error: any | null}>;
  signUp: (email: string, password: string, userData: Partial<UserProfile>) => Promise<{error: any | null}>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  isClient: boolean;
  isAccountant: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = useSupabaseClient();
  const { toast } = useToast();

  useEffect(() => {
    if (!supabase) return;
    
    // Check for active session
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error fetching session:', error);
          return;
        }
        
        if (session) {
          setSession(session);
          setUser(session.user);
          
          // Fetch user profile
          const { data: profileData, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single();
          
          if (profileError) {
            console.error('Error fetching user profile:', profileError);
          } else {
            setProfile(profileData);
          }
        }
      } catch (error) {
        console.error('Session check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSession();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setIsLoading(true);
        
        if (newSession?.user) {
          // Fetch user profile when auth state changes
          const { data: profileData } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', newSession.user.id)
            .single();
            
          setProfile(profileData);
        } else {
          setProfile(null);
        }
        
        setIsLoading(false);
      }
    );
    
    return () => {
      subscription?.unsubscribe();
    };
  }, [supabase]);
  
  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    if (!supabase) return { error: new Error('Supabase client not initialized') };
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        toast({
          title: "Erro ao fazer login",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }
      
      toast({
        title: "Login realizado com sucesso",
        description: "Bem-vindo de volta!",
      });
      
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Erro ao fazer login",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
      return { error };
    }
  };
  
  // Sign up with email and password
  const signUp = async (email: string, password: string, userData: Partial<UserProfile>) => {
    if (!supabase) return { error: new Error('Supabase client not initialized') };
    
    try {
      // Create auth user
      const { data, error } = await supabase.auth.signUp({ email, password });
      
      if (error) {
        toast({
          title: "Erro ao criar conta",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }
      
      if (data.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert([{
            user_id: data.user.id,
            email,
            full_name: userData.full_name || '',
            role: userData.role || 'client',
            company_id: userData.company_id,
          }]);
          
        if (profileError) {
          toast({
            title: "Erro ao criar perfil",
            description: profileError.message,
            variant: "destructive",
          });
          return { error: profileError };
        }
      }
      
      toast({
        title: "Conta criada com sucesso",
        description: "Você já pode fazer login",
      });
      
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Erro ao criar conta",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
      return { error };
    }
  };
  
  // Sign out
  const signOut = async () => {
    if (!supabase) return;
    
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logout realizado com sucesso",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao fazer logout",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    }
  };
  
  const isAuthenticated = !!session;
  const isClient = profile?.role === 'client';
  const isAccountant = profile?.role === 'accountant';
  const isAdmin = profile?.role === 'admin';
  
  const value = {
    session,
    user,
    profile,
    isLoading,
    signIn,
    signUp,
    signOut,
    isAuthenticated,
    isClient,
    isAccountant,
    isAdmin,
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
