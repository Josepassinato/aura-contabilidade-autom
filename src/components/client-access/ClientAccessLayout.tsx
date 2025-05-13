
import React from "react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { useNavigate } from "react-router-dom";

interface ClientAccessLayoutProps {
  children: React.ReactNode;
}

export const ClientAccessLayout = ({ children }: ClientAccessLayoutProps) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    console.log('Logout button clicked');
    
    try {
      // Primeiro executamos o logout para limpar o estado
      await logout?.();
      console.log('Logout successful, redirecting to login page');
      // Após o logout, redirecionamos para a página de login
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
      // Em caso de falha, tentamos redirecionar diretamente
      window.location.href = '/login';
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">ContaFácil</h1>
          <p className="text-muted-foreground mt-2">Portal de acesso ao cliente</p>
        </div>
        
        <div className="mb-6">
          <Button 
            variant="destructive" 
            size="sm" 
            className="flex items-center"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
        
        {children}
      </div>
    </div>
  );
};
