
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
      
      // Force immediate replacement of current URL with login page
      window.location.replace('/login');
      
      // Emergency fallback if replace doesn't work
      setTimeout(() => {
        console.log('Using emergency fallback for navigation');
        document.location.href = '/login';
      }, 200);
    }
  };
};
