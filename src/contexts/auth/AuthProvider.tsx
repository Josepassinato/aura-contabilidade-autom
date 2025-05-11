
import React, { useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { useSupabaseClient, UserProfile } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { AuthContext } from './AuthContext';
import { signInWithCredentials, signUpWithCredentials, handleSignOut } from './authUtils';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
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
    return signInWithCredentials(supabase, email, password, toast);
  };
  
  // Sign up with email and password
  const signUp = async (email: string, password: string, userData: Partial<UserProfile>) => {
    return signUpWithCredentials(supabase, email, password, userData, toast);
  };
  
  // Sign out
  const signOut = async () => {
    await handleSignOut(supabase, toast);
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
