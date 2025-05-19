
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth';
import { cleanupAuthState } from '@/contexts/auth/cleanupUtils';
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const QuickLoginButtons = () => {
  const { enhancedLogin } = useAuth();
  const [isLoading, setIsLoading] = useState<{
    contador: boolean;
    cliente: boolean;
    admin: boolean;
  }>({
    contador: false,
    cliente: false,
    admin: false
  });

  const quickLogin = async (type: 'contador' | 'cliente' | 'admin') => {
    // Definir estado de carregamento para o botão específico
    setIsLoading(prev => ({ ...prev, [type]: true }));
    
    try {
      // Limpar qualquer estado de autenticação anterior
      cleanupAuthState();
      
      let email, password;
      
      if (type === 'contador') {
        email = 'contador@contaflix.com.br';
        password = 'senha123';
      } else if (type === 'cliente') {
        email = 'cliente@empresa.com.br';
        password = 'senha123';
      } else {
        email = 'admin@contaflix.com.br';
        password = 'senha123';
      }
      
      // Usar setTimeout para garantir que a limpeza seja concluída antes do login
      setTimeout(async () => {
        try {
          const result = await enhancedLogin(email, password);
          
          if (!result?.success) {
            toast({
              title: "Falha no login rápido",
              description: `Erro ao acessar como ${type}: ${result?.error || 'Credenciais inválidas'}`,
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error(`Erro no login rápido como ${type}:`, error);
          toast({
            title: "Erro no sistema",
            description: `Não foi possível fazer login como ${type}`,
            variant: "destructive",
          });
        } finally {
          setIsLoading(prev => ({ ...prev, [type]: false }));
        }
      }, 300);
    } catch (error) {
      console.error(`Erro ao preparar login rápido como ${type}:`, error);
      setIsLoading(prev => ({ ...prev, [type]: false }));
      toast({
        title: "Erro no sistema",
        description: "Não foi possível preparar o login rápido",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="mt-6">
      <div className="text-sm text-center mb-3 text-muted-foreground">
        Acesso rápido para demonstração
      </div>
      <div className="flex flex-col gap-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => quickLogin('contador')}
          className="justify-start"
          disabled={isLoading.contador || isLoading.cliente || isLoading.admin}
        >
          {isLoading.contador ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs mr-2">C</span>
          )}
          Entrar como Contador
        </Button>
        
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => quickLogin('cliente')}
          className="justify-start"
          disabled={isLoading.contador || isLoading.cliente || isLoading.admin}
        >
          {isLoading.cliente ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <span className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs mr-2">E</span>
          )}
          Entrar como Empresa
        </Button>
        
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => quickLogin('admin')}
          className="justify-start"
          disabled={isLoading.contador || isLoading.cliente || isLoading.admin}
        >
          {isLoading.admin ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <span className="w-5 h-5 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs mr-2">A</span>
          )}
          Entrar como Administrador
        </Button>
      </div>
    </div>
  );
};
