
import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth';
import { cleanupAuthState } from '@/contexts/auth/cleanupUtils';

export const QuickLoginButtons = () => {
  const { enhancedLogin } = useAuth();

  const quickLogin = async (type: 'contador' | 'cliente' | 'admin') => {
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
    
    await enhancedLogin(email, password);
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
        >
          <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs mr-2">C</span>
          Entrar como Contador
        </Button>
        
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => quickLogin('cliente')}
          className="justify-start"
        >
          <span className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs mr-2">E</span>
          Entrar como Empresa
        </Button>
        
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => quickLogin('admin')}
          className="justify-start"
        >
          <span className="w-5 h-5 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs mr-2">A</span>
          Entrar como Administrador
        </Button>
      </div>
    </div>
  );
};
