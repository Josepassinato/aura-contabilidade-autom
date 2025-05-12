
import React, { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { useSupabaseClient, UserProfile, UserRole } from '@/lib/supabase';
import { getUserProfile, mapUserToProfile, signOut } from './authUtils';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
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
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsAuthenticated(false);
        setUserProfile(null);
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
        const mockProfile: UserProfile = {
          id: '123',
          email: email,
          name: 'Test User',
          role: UserRole.ACCOUNTANT,
          full_name: 'Test User Full Name',
          company_id: '456'
        };
        
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
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: 'Logout failed' };
    }
  };

  const isAdmin = userProfile?.role === UserRole.ADMIN;
  const isAccountant = userProfile?.role === UserRole.ACCOUNTANT || isAdmin;
  const isClient = userProfile?.role === UserRole.CLIENT;

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        userProfile,
        login,
        logout,
        isAdmin,
        isAccountant,
        isClient,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
