
import { useState, useEffect, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { AuthContext } from './AuthContext';
import { useSupabaseClient } from '@/lib/supabase';
import { UserRole } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  // Função de navegação para o login com fallback para redirecionamento direto
  const navigateToLogin = () => {
    console.log('Navegando para a página de login...');
    
    try {
      // Primeiro tenta navegar via window.location para garantir uma navegação completa
      window.location.href = '/login';
    } catch (error) {
      console.error('Erro ao navegar para login:', error);
      
      // Emergencial: caso falhe o redirecionamento primário
      setTimeout(() => {
        console.log('Usando fallback de navegação para login');
        document.location.replace('/login');
      }, 100);
    }
  };
  
  return {
    ...context,
    navigateToLogin
  };
};
