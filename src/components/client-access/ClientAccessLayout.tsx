
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/auth";

interface ClientAccessLayoutProps {
  children: React.ReactNode;
}

export const ClientAccessLayout = ({ children }: ClientAccessLayoutProps) => {
  const { navigateToLogin } = useAuth();
  
  const handleBackToLogin = () => {
    console.log('Back to login button clicked');
    navigateToLogin();
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
            variant="ghost" 
            size="sm" 
            className="flex items-center"
            onClick={handleBackToLogin}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para o login geral
          </Button>
        </div>
        
        {children}
      </div>
    </div>
  );
};
