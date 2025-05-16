
import React from 'react';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/auth';
import { toast } from '@/hooks/use-toast';
import { cleanupAuthState, checkForAuthLimboState } from '@/contexts/auth/cleanupUtils';

export function QuickLoginButtons() {
  const { enhancedLogin } = useAuth();
  const [isLoading, setIsLoading] = React.useState<string | null>(null);

  const handleQuickLogin = async (type: 'accountant' | 'client' | 'admin') => {
    setIsLoading(type);
    
    try {
      // Clean up auth state before login attempt
      cleanupAuthState();
      
      // Check for and fix any potential auth limbo states
      if (checkForAuthLimboState()) {
        console.log("Fixed auth limbo state during quick login");
      }
      
      let email = '';
      let password = 'senha123';
      
      switch (type) {
        case 'accountant':
          email = 'contador@example.com';
          break;
        case 'client':
          email = 'cliente@example.com';
          break;
        case 'admin':
          email = 'admin@example.com';
          break;
      }
      
      console.log(`Tentando login rápido como ${type} com email: ${email}`);
      const result = await enhancedLogin(email, password);
      
      if (!result.success) {
        throw new Error(result.error || "Falha na autenticação");
      }
      
      // Login successful, will be redirected by the auth context
    } catch (error) {
      console.error('Erro no login rápido:', error);
      toast({
        title: "Erro no login",
        description: error instanceof Error ? error.message : "Não foi possível fazer login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="mt-6 space-y-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Acesso rápido para teste
          </span>
        </div>
      </div>

      <div className="grid gap-2">
        <Button 
          variant="outline" 
          onClick={() => handleQuickLogin('accountant')}
          disabled={!!isLoading}
        >
          {isLoading === 'accountant' ? (
            <>
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></span>
              Entrando...
            </>
          ) : (
            "Entrar como Contador"
          )}
        </Button>
        
        <Button 
          variant="outline" 
          onClick={() => handleQuickLogin('client')}
          disabled={!!isLoading}
        >
          {isLoading === 'client' ? (
            <>
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></span>
              Entrando...
            </>
          ) : (
            "Entrar como Cliente"
          )}
        </Button>
        
        <Button 
          variant="outline" 
          onClick={() => handleQuickLogin('admin')}
          disabled={!!isLoading}
        >
          {isLoading === 'admin' ? (
            <>
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></span>
              Entrando...
            </>
          ) : (
            "Entrar como Administrador"
          )}
        </Button>
      </div>
    </div>
  );
}

export default QuickLoginButtons;
