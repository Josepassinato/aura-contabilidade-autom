
import { useContext } from "react";
import { AuthContext } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { cleanupAuthState, checkForAuthLimboState } from "./cleanupUtils";

export const useAuth = () => {
  const context = useContext(AuthContext);
  const navigate = useNavigate();

  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }

  // Navegação consistente para página de login
  const navigateToLogin = () => {
    try {
      // Limpar estado de autenticação e flags de navegação
      cleanupAuthState();
      
      // Usar window.location para navegação direta e garantir recarga completa
      window.location.href = "/login";
    } catch (error) {
      console.error("Erro na navegação para login:", error);
      // Fallback para window.location se navigate falhar
      window.location.href = "/login";
    }
  };

  // Logout aprimorado com feedback
  const enhancedLogout = async () => {
    try {
      toast({
        title: "Saindo...",
        description: "Encerrando sua sessão",
      });
      
      // Limpar completamente o estado de autenticação
      cleanupAuthState();
      
      // Usar a função logout do contexto
      await context.logout?.();
      
      // Redirecionar para página de login com recarga completa
      window.location.href = "/login";
      
      toast({
        title: "Sessão encerrada",
        description: "Você saiu com sucesso",
      });
    } catch (error) {
      console.error("Erro durante logout:", error);
      toast({
        title: "Erro ao sair",
        description: "Não foi possível encerrar a sessão corretamente",
        variant: "destructive",
      });
      
      // Forçar logout em caso de erro
      cleanupAuthState();
      window.location.href = "/login";
    }
  };

  // Login aprimorado com feedback e navegação inteligente
  const enhancedLogin = async (email: string, password: string) => {
    try {
      // Limpar possíveis estados de autenticação anteriores
      cleanupAuthState();
      
      // Verificar e limpar estados de limbo
      checkForAuthLimboState();
      
      const result = await context.login?.(email, password);
      
      if (result?.success) {
        toast({
          title: "Login bem-sucedido",
          description: "Bem-vindo de volta!",
        });
        
        // Definir flag de login bem-sucedido
        sessionStorage.setItem('from_login', 'true');
        sessionStorage.setItem('last_auth_cleanup', Date.now().toString());
        
        // Navegação apropriada com base no perfil
        const role = localStorage.getItem('user_role');
        
        if (role === 'admin') {
          window.location.href = '/admin/analytics';
        } else if (role === 'client') {
          window.location.href = '/client-portal';
        } else if (role === 'accountant') {
          window.location.href = '/dashboard';
        } else {
          // Fallback
          window.location.href = '/dashboard';
        }
        
        return { success: true, error: null };
      } else {
        toast({
          title: "Falha no login",
          description: result?.error || "Credenciais inválidas",
          variant: "destructive",
        });
        return { success: false, error: result?.error };
      }
    } catch (error: any) {
      console.error("Erro durante login:", error);
      toast({
        title: "Erro no sistema",
        description: "Não foi possível processar o login",
        variant: "destructive",
      });
      return { success: false, error: "Erro no sistema" };
    }
  };

  // Verificação de autenticação com feedback
  const requireAuth = (redirectPath = '/login') => {
    // Verificar e limpar estado de limbo
    if (checkForAuthLimboState()) {
      console.warn("Auth limbo state detected in requireAuth, cleaning up");
      cleanupAuthState();
      window.location.href = redirectPath;
      return { authenticated: false };
    }
    
    if (context.isLoading) {
      return { loading: true, authenticated: false };
    }
    
    if (!context.isAuthenticated) {
      console.log("User not authenticated, redirecting to login");
      toast({
        title: "Acesso restrito",
        description: "Faça login para acessar esta página",
        variant: "destructive",
      });
      
      // Usar window.location para navegação direta
      window.location.href = redirectPath;
      return { authenticated: false, loading: false };
    }
    
    return { authenticated: true, loading: false };
  };

  // Verificar se o usuário tem um determinado papel
  const checkRole = (role: 'admin' | 'accountant' | 'client', redirectPath = '/') => {
    const { authenticated, loading } = requireAuth();
    
    if (loading) return { hasRole: false, loading: true };
    if (!authenticated) return { hasRole: false, loading: false };
    
    const hasRole = (
      (role === 'admin' && context.isAdmin) ||
      (role === 'accountant' && context.isAccountant) ||
      (role === 'client' && context.isClient)
    );
    
    if (!hasRole) {
      toast({
        title: "Acesso negado",
        description: "Você não tem permissão para acessar esta página",
        variant: "destructive",
      });
      
      // Usar window.location para navegação direta
      window.location.href = redirectPath;
    }
    
    return { hasRole, loading: false };
  };

  return {
    ...context,
    navigateToLogin,
    enhancedLogout,
    enhancedLogin,
    requireAuth,
    checkRole,
  };
};
