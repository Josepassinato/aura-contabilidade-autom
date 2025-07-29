
import { useContext } from "react";
import { AuthContext } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { cleanupAuthState, checkForAuthLimboState } from "./cleanupUtils";

export const useAuth = () => {
  const context = useContext(AuthContext);
  const navigate = useNavigate();

  if (context === undefined) {
    console.error("useAuth deve ser usado dentro de um AuthProvider");
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }

  // Navegação consistente para página de login
  const navigateToLogin = () => {
    console.log("Navegando para página de login...");
    try {
      // Tentar usar o hook navigate do React Router para transições suaves
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Erro na navegação com useNavigate:", error);
      // Fallback para window.location se navigate falhar
      window.location.href = "/login";
    }
  };

  // Logout aprimorado com feedback
  const enhancedLogout = async () => {
    console.log("Iniciando processo de logout...");
    try {
      toast({
        title: "Saindo...",
        description: "Encerrando sua sessão",
      });
      
      // Limpar completamente o estado de autenticação
      cleanupAuthState();
      
      // Usar a função logout do contexto
      await context.logout?.();
      
      // Redirecionar para página de login
      navigate("/login", { replace: true });
      
      toast({
        title: "Sessão encerrada",
        description: "Você saiu com sucesso",
      });
      
      console.log("Logout realizado com sucesso");
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
    console.log("Iniciando processo de login para:", email);
    try {
      // Limpar possíveis estados de autenticação anteriores
      cleanupAuthState();
      
      // Check for and clean any limbo states
      checkForAuthLimboState();
      
      const result = await context.login?.(email, password);
      
      if (result?.success) {
        console.log("Login bem-sucedido para:", email);
        toast({
          title: "Login bem-sucedido",
          description: "Bem-vindo de volta!",
        });
        
        // Navegação apropriada com base no perfil
        const role = localStorage.getItem('user_role');
        console.log("Role do usuário:", role);
        
        if (role === 'admin') {
          navigate('/admin/business-analytics', { replace: true });
        } else if (role === 'client') {
          navigate('/client-portal', { replace: true });
        } else if (role === 'accountant') {
          navigate('/dashboard', { replace: true });
        } else {
          // Fallback
          navigate('/dashboard', { replace: true });
        }
        
        return { success: true, error: null };
      } else {
        console.error("Falha no login:", result?.error);
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
    console.log("Verificando autenticação...");
    
    // Check for auth limbo state and clean it up if found
    if (checkForAuthLimboState()) {
      console.warn("Auth limbo state detected in requireAuth, cleaning up");
      cleanupAuthState();
      navigate(redirectPath, { replace: true });
      return { authenticated: false };
    }
    
    if (context.isLoading) {
      console.log("Autenticação ainda carregando...");
      return { loading: true, authenticated: false };
    }
    
    if (!context.isAuthenticated) {
      console.log("User not authenticated, redirecting to login");
      toast({
        title: "Acesso restrito",
        description: "Faça login para acessar esta página",
        variant: "destructive",
      });
      
      navigate(redirectPath, { replace: true });
      return { authenticated: false, loading: false };
    }
    
    console.log("Usuário autenticado com sucesso");
    return { authenticated: true, loading: false };
  };

  // Verificar se o usuário tem um determinado papel
  const checkRole = (role: 'admin' | 'accountant' | 'client', redirectPath = '/') => {
    console.log("Verificando role:", role);
    const { authenticated, loading } = requireAuth();
    
    if (loading) return { hasRole: false, loading: true };
    if (!authenticated) return { hasRole: false, loading: false };
    
    const hasRole = (
      (role === 'admin' && context.isAdmin) ||
      (role === 'accountant' && context.isAccountant) ||
      (role === 'client' && context.isClient)
    );
    
    console.log("Usuário tem role?", hasRole);
    
    if (!hasRole) {
      console.log("Usuário não tem permissão para role:", role);
      toast({
        title: "Acesso negado",
        description: "Você não tem permissão para acessar esta página",
        variant: "destructive",
      });
      
      navigate(redirectPath, { replace: true });
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
