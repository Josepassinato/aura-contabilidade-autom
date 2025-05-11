
import React, { createContext, useContext, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { UserProfile } from '@/lib/supabase';

// Define the AuthContext type
export interface AuthContextType {
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

// Create the context with null as default
const AuthContext = createContext<AuthContextType | null>(null);

export { AuthContext };
