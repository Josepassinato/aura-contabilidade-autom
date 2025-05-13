
import { toast } from '@/hooks/use-toast';
import { supabase } from './client';
import { cleanupAuthState } from './authUtils';

// Verificar estados problemáticos de autenticação
export const checkForAuthLimboState = () => {
  // Verificar tokens expirados ou corrompidos no localStorage
  try {
    const storedSession = localStorage.getItem('supabase.auth.token');
    if (storedSession) {
      try {
        const parsedSession = JSON.parse(storedSession);
        const expiresAt = parsedSession?.expiresAt;
        
        if (expiresAt && new Date(expiresAt * 1000) < new Date()) {
          // Sessão expirada, limpar
          console.warn('Detectada sessão expirada, limpando estado de autenticação');
          cleanupAuthState();
        }
      } catch (e) {
        // Token corrompido, limpar
        console.warn('Token de autenticação corrompido, limpando');
        cleanupAuthState();
      }
    }
  } catch (err) {
    console.error('Erro ao verificar estado de autenticação:', err);
  }
};

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
  signUp: async (email: string, password: string, userData?: any) => {
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
