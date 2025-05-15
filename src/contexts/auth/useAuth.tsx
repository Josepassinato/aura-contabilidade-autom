
import { useContext } from "react";
import { AuthContext } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { cleanupAuthState } from "./cleanupUtils";

export const useAuth = () => {
  const context = useContext(AuthContext);
  const navigate = useNavigate();

  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }

  // Navegação consistente para página de login
  const navigateToLogin = () => {
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

  // Login aprimorado com feedback
  const enhancedLogin = async (email: string, password: string) => {
    try {
      // Limpar possíveis estados de autenticação anteriores
      cleanupAuthState();
      
      const result = await context.login?.(email, password);
      
      if (result?.success) {
        toast({
          title: "Login bem-sucedido",
          description: "Bem-vindo de volta!",
        });
        
        // Navegação apropriada com base no perfil
        if (context.isAdmin) {
          navigate('/admin/business-analytics', { replace: true });
        } else if (context.isClient) {
          navigate('/client-portal', { replace: true });
        } else if (context.isAccountant) {
          navigate('/dashboard', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
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
    if (context.isLoading) {
      return { loading: true };
    }
    
    if (!context.isAuthenticated) {
      toast({
        title: "Acesso restrito",
        description: "Faça login para acessar esta página",
        variant: "destructive",
      });
      
      navigate(redirectPath, { replace: true });
      return { authenticated: false };
    }
    
    return { authenticated: true };
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
