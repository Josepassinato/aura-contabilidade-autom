
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
      console.log('Navigating to login page');
      // Use the most direct and forceful method to navigate
      window.location.href = '/login';
      // Force page reload if needed
      setTimeout(() => {
        if (window.location.pathname !== '/login') {
          window.location.replace('/login');
        }
      }, 100);
    }
  };
};
