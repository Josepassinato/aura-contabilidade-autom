
import { useState, useEffect, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { AuthContext } from './AuthContext';
import { useSupabaseClient } from '@/lib/supabase';
import { UserRole } from '@/lib/supabase';

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return {
    ...context,
    
    // Helper function to navigate to login page
    navigateToLogin: () => {
      // Forçar navegação para login - isso garante que funcionará independentemente do contexto
      window.location.href = '/login';
    }
  };
};
