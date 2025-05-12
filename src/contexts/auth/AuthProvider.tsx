
import React, { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { useSupabaseClient, UserProfile, UserRole } from '@/lib/supabase';
import { getUserProfile, mapUserToProfile, signOut, signInWithEmail } from './authUtils';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const supabase = useSupabaseClient();

  useEffect(() => {
    const checkSession = async () => {
      setIsLoading(true);
      try {
        // This is a mock check since we don't have real Supabase auth
        const mockSessionUser = {
          id: '123',
          email: 'user@example.com',
          user_metadata: {
            name: 'Test User',
          }
        };
        
        // Only for testing/demo purposes
        const hasSession = localStorage.getItem('mock_session') === 'true';
        
        if (hasSession) {
          // Set session and user
          setSession({ user: mockSessionUser });
          setUser(mockSessionUser);
          
          // Get user profile data from database
          const profile = await getUserProfile(mockSessionUser.id);
          
          if (profile) {
            setUserProfile(profile);
            setIsAuthenticated(true);
          } else {
            // Create a basic profile if none exists
            const basicProfile = mapUserToProfile(mockSessionUser);
            setUserProfile(basicProfile);
            setIsAuthenticated(true);
          }
        } else {
          setIsAuthenticated(false);
          setUserProfile(null);
          setSession(null);
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsAuthenticated(false);
        setUserProfile(null);
        setSession(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Mock login for testing/demo
      if (email && password) {
        // Set mock session
        localStorage.setItem('mock_session', 'true');
        
        // Create a mock user profile for testing
        const mockUser = {
          id: '123',
          email: email,
          user_metadata: {
            name: 'Test User',
          }
        };

        const mockProfile: UserProfile = {
          id: '123',
          email: email,
          name: 'Test User',
          role: UserRole.ACCOUNTANT,
          full_name: 'Test User Full Name',
          company_id: '456'
        };
        
        setUser(mockUser);
        setSession({ user: mockUser });
        setUserProfile(mockProfile);
        setIsAuthenticated(true);
        return { success: true, error: null };
      }
      return { success: false, error: 'Invalid credentials' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Authentication failed' };
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem('mock_session');
      setIsAuthenticated(false);
      setUserProfile(null);
      setSession(null);
      setUser(null);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: 'Logout failed' };
    }
  };

  // Implement signIn to match AuthContextType
  const signIn = async (email: string, password: string) => {
    try {
      const result = await login(email, password);
      return { error: result.success ? null : new Error(result.error) };
    } catch (error) {
      console.error('SignIn error:', error);
      return { error: new Error('Authentication failed') };
    }
  };

  // Implement signUp to match AuthContextType
  const signUp = async (email: string, password: string, userData: Partial<UserProfile>) => {
    try {
      // Mock signup for testing/demo
      if (email && password) {
        await login(email, password);
        return { error: null };
      }
      return { error: new Error('Invalid credentials') };
    } catch (error) {
      console.error('SignUp error:', error);
      return { error: new Error('SignUp failed') };
    }
  };

  // Mock auth signOut function
  const handleSignOut = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('SignOut error:', error);
    }
  };

  const isAdmin = userProfile?.role === UserRole.ADMIN;
  const isAccountant = userProfile?.role === UserRole.ACCOUNTANT || isAdmin;
  const isClient = userProfile?.role === UserRole.CLIENT;

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
