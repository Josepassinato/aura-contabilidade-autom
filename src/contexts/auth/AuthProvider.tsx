
import React, { useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { AuthContext } from './AuthContext';
import { signInWithCredentials, signUpWithCredentials, handleSignOut } from './authUtils';
import { UserProfile, initializeSupabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [supabase] = useState(() => initializeSupabase());
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [isAccountant, setIsAccountant] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!supabase) {
      console.error('Supabase client not initialized');
      setIsLoading(false);
      return;
    }

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        setUser(data.session?.user ?? null);
        
        if (data.session?.user) {
          const { data: profileData, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', data.session.user.id)
            .single();
            
          if (error) {
            console.error('Error fetching user profile:', error);
          } else {
            setProfile(profileData);
            setIsClient(profileData?.role === 'client');
            setIsAccountant(profileData?.role === 'accountant');
            setIsAdmin(profileData?.role === 'admin');
          }
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          const { data: profileData, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', currentSession.user.id)
            .single();
            
          if (error) {
            console.error('Error fetching user profile:', error);
          } else {
            setProfile(profileData);
            setIsClient(profileData?.role === 'client');
            setIsAccountant(profileData?.role === 'accountant');
            setIsAdmin(profileData?.role === 'admin');
          }
        } else {
          // Clear user state when signed out
          setProfile(null);
          setIsClient(false);
          setIsAccountant(false);
          setIsAdmin(false);
        }
      }
    );

    // Cleanup the subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signIn = async (email: string, password: string) => {
    if (!supabase) return { error: new Error('Supabase client not initialized') };
    return await signInWithCredentials(supabase, email, password, toast);
  };

  const signUp = async (email: string, password: string, userData: Partial<UserProfile>) => {
    if (!supabase) return { error: new Error('Supabase client not initialized') };
    return await signUpWithCredentials(supabase, email, password, userData, toast);
  };

  const signOut = async () => {
    if (!supabase) return;
    await handleSignOut(supabase, toast);
  };

  const value = {
    session,
    user,
    profile,
    isLoading,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!session,
    isClient,
    isAccountant,
    isAdmin
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
