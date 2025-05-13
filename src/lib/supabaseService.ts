
import { createClient } from '@supabase/supabase-js';
import { cleanupAuthState } from '@/contexts/auth/cleanupUtils';
import { toast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';
import { UserProfile } from './supabase';

// URLs e chaves do Supabase
const SUPABASE_URL = "https://watophocqlcyimirzrpe.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhdG9waG9jcWxjeWltaXJ6cnBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5OTUyNjQsImV4cCI6MjA2MjU3MTI2NH0.aTF2XWWUhxtrrp4V08BvM5WAGQULlppgkIhXnCSLXrg";

// Configuração explícita da instância do cliente Supabase
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Centralização das funções de autenticação
export const supabaseAuth = {
  // Login com email/senha
  signIn: async (email: string, password: string) => {
    try {
      // Limpar estado de autenticação existente para evitar conflitos
      cleanupAuthState();
      
      // Tentativa de desconexão global antes de nova autenticação
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Ignorar erros nesta etapa, prosseguir com login
        console.warn('Erro ao fazer logout global pré-login:', err);
      }
      
      // Login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Login bem-sucedido",
        description: "Bem-vindo de volta!",
      });
      
      return { data, error: null };
    } catch (error: any) {
      console.error('Erro no login:', error);
      
      toast({
        title: "Falha no login",
        description: error.message || "Não foi possível fazer login",
        variant: "destructive"
      });
      
      return { data: null, error };
    }
  },
  
  // Registro de novos usuários
  signUp: async (email: string, password: string, userData?: Partial<UserProfile>) => {
    try {
      // Limpar estado de autenticação existente
      cleanupAuthState();
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        }
      });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Conta criada com sucesso",
        description: "Verifique seu email para confirmar o registro",
      });
      
      return { data, error: null };
    } catch (error: any) {
      console.error('Erro no registro:', error);
      
      toast({
        title: "Falha no registro",
        description: error.message || "Não foi possível criar a conta",
        variant: "destructive"
      });
      
      return { data: null, error };
    }
  },
  
  // Logout com limpeza completa de sessão
  signOut: async () => {
    try {
      // Limpeza completa do estado de autenticação
      cleanupAuthState();
      
      // Tentativa de logout global
      await supabase.auth.signOut({ scope: 'global' });
      
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso",
      });
      
      // Forçar atualização da página para garantir estado limpo
      window.location.href = '/login';
      
      return { error: null };
    } catch (error) {
      console.error('Erro no logout:', error);
      
      toast({
        title: "Erro no logout",
        description: "Houve um problema ao desconectar, tentando novamente...",
        variant: "destructive"
      });
      
      // Em caso de erro, forçar limpeza e redirecionamento
      cleanupAuthState();
      window.location.href = '/login';
      
      return { error };
    }
  },
  
  // Obter a sessão atual
  getSession: async () => {
    try {
      // Verificar possíveis estados de limbo antes
      checkForAuthLimboState();
      
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        throw error;
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Erro ao obter sessão:', error);
      return { data: { session: null }, error };
    }
  },
  
  // Recuperação de senha
  resetPassword: async (email: string) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Email enviado",
        description: "Verifique seu email para redefinir sua senha",
      });
      
      return { data, error: null };
    } catch (error: any) {
      console.error('Erro na recuperação de senha:', error);
      
      toast({
        title: "Falha no envio",
        description: error.message || "Não foi possível enviar o email de recuperação",
        variant: "destructive"
      });
      
      return { data: null, error };
    }
  }
};

// Exportar cliente centralizado
export const useSupabaseClient = () => {
  return supabase;
};

// Serviço para recuperar perfil de usuário
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    if (!userId) return null;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    
    return data as UserProfile;
  } catch (error) {
    console.error('Erro ao buscar perfil do usuário:', error);
    return null;
  }
};
