
import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth';

export const QuickLoginButtons = () => {
  const { enhancedLogin } = useAuth();

  const quickLogin = async (type: 'contador' | 'cliente' | 'admin') => {
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
    <div className="mt-8">
      <div className="text-2xl text-center mb-6 text-muted-foreground">
        Acesso rápido para demonstração
      </div>
      <div className="flex flex-col gap-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => quickLogin('contador')}
          className="justify-start h-20 text-2xl px-4 py-4"
        >
          <span className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl mr-4 font-medium">C</span>
          Entrar como Contador
        </Button>
        
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => quickLogin('cliente')}
          className="justify-start h-20 text-2xl px-4 py-4"
        >
          <span className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xl mr-4 font-medium">E</span>
          Entrar como Empresa
        </Button>
        
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => quickLogin('admin')}
          className="justify-start h-20 text-2xl px-4 py-4"
        >
          <span className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xl mr-4 font-medium">A</span>
          Entrar como Administrador
        </Button>
      </div>
    </div>
  );
};
