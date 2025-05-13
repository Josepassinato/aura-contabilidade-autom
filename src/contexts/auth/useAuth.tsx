
import { useContext } from "react";
import { AuthContext } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

export const useAuth = () => {
  const context = useContext(AuthContext);
  const navigate = useNavigate();

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  // Consistent navigation to login page
  const navigateToLogin = () => {
    try {
      // Try using React Router's navigate for smooth transitions
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Error navigating with useNavigate:", error);
      // Fallback to window.location if navigate fails
      window.location.href = "/login";
    }
  };

  // Enhanced logout with feedback
  const enhancedLogout = async () => {
    try {
      toast({
        title: "Saindo...",
        description: "Encerrando sua sessão",
      });
      
      // Use the context's logout function
      await context.logout?.();
      
      // Redirect to login page
      navigate("/login", { replace: true });
      
      toast({
        title: "Sessão encerrada",
        description: "Você saiu com sucesso",
      });
    } catch (error) {
      console.error("Error during logout:", error);
      toast({
        title: "Erro ao sair",
        description: "Não foi possível encerrar a sessão",
        variant: "destructive",
      });
      
      // Force logout on error
      window.location.href = "/login";
    }
  };

  // Enhanced login with feedback
  const enhancedLogin = async (email: string, password: string) => {
    try {
      const result = await context.login?.(email, password);
      
      if (result?.success) {
        toast({
          title: "Login bem-sucedido",
          description: "Bem-vindo de volta!",
        });
        return { success: true, error: null };
      } else {
        toast({
          title: "Falha no login",
          description: result?.error || "Credenciais inválidas",
          variant: "destructive",
        });
        return { success: false, error: result?.error };
      }
    } catch (error) {
      console.error("Error during login:", error);
      toast({
        title: "Erro no sistema",
        description: "Não foi possível processar o login",
        variant: "destructive",
      });
      return { success: false, error: "Erro no sistema" };
    }
  };

  return {
    ...context,
    navigateToLogin,
    enhancedLogout,
    enhancedLogin,
  };
};
