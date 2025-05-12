
import React, { createContext, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { UserProfile } from '@/lib/supabase';

// Define the AuthContext type
export interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  userProfile: UserProfile | null; // Add this line to include userProfile
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{error: any | null}>;
  signUp: (email: string, password: string, userData: Partial<UserProfile>) => Promise<{error: any | null}>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  isClient: boolean;
  isAccountant: boolean;
  isAdmin: boolean;
  login?: (email: string, password: string) => Promise<{success: boolean, error: any | null}>; // Optional property to support existing implementations
  logout?: () => Promise<void>; // Updated to match the expected return type
}

// Create the context with default values to avoid null issues
const defaultContextValue: AuthContextType = {
  session: null,
  user: null,
  profile: null,
  userProfile: null, // Add default value for userProfile
  isLoading: true,
  signIn: async () => ({ error: new Error('AuthProvider not initialized') }),
  signUp: async () => ({ error: new Error('AuthProvider not initialized') }),
  signOut: async () => {},
  isAuthenticated: false,
  isClient: false,
  isAccountant: false,
  isAdmin: false
};

// Create the context with default values
export const AuthContext = createContext<AuthContextType>(defaultContextValue);
