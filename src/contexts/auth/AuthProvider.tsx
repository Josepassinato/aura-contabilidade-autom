
// Adding a fixed version of AuthProvider.tsx to fix build errors
import React, { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import { UserProfile, UserRole } from "@/lib/supabase";
import { getUserProfile, mapUserToProfile } from "./authUtils";
import { useSupabaseClient } from "@/lib/supabase";

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const supabase = useSupabaseClient();

  useEffect(() => {
    const checkUser = async () => {
      // Mock implementation for demo purposes
      setUser({
        id: "1",
        email: "accountant@example.com",
        name: "Example Accountant",
        role: UserRole.ACCOUNTANT,
        full_name: "Example Full Name",
        company_id: "123"
      });
      setIsLoading(false);
    };

    checkUser();
    
    // In a real app with real Supabase, this would listen for auth state changes
    const mockAuthStateListener = () => {
      // This is where you'd subscribe to auth state changes
    };

    return () => {
      // Cleanup function
    };
  }, [supabase]);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      // Mock sign in process
      if (email && password) {
        const mockUser = {
          id: "1",
          email: email,
          name: "Example User",
          role: UserRole.ACCOUNTANT
        };
        setUser(mockUser);
        return { user: mockUser, error: null };
      }
      return { user: null, error: new Error("Invalid credentials") };
    } catch (error) {
      return { user: null, error };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    // Mock sign out
    setUser(null);
    setIsLoading(false);
  };

  const isAdmin = user?.role === UserRole.ADMIN;
  const isAccountant = user?.role === UserRole.ACCOUNTANT || isAdmin;
  const isClient = user?.role === UserRole.CLIENT;
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signIn,
        signOut,
        isAdmin,
        isAccountant,
        isClient,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
