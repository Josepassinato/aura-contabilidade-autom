
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { cleanupAuthState } from '@/contexts/auth/cleanupUtils';

export const QuickLoginButtons = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Função para login rápido como contador para teste
  const loginAsAccountant = () => {
    setIsLoading(true);
    // Clean up any existing auth state first
    cleanupAuthState();
    
    try {
      // Set up mock session for accountant
      localStorage.setItem('mock_session', 'true');
      localStorage.setItem('user_role', 'accountant');
      
      // Create a toast notification
      toast({
        title: "Login como contador",
        description: "Acessando como Contador Teste",
      });
      
      // Navigate to dashboard
      navigate("/dashboard");
      window.location.reload();
    } catch (error) {
      console.error("Erro no login como contador:", error);
      toast({
        title: "Falha no acesso",
        description: "Não foi possível acessar como contador",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };
  
  // Função para login rápido como cliente para teste
  const loginAsClient = () => {
    setIsLoading(true);
    // Clean up any existing auth state first
    cleanupAuthState();
    
    try {
      // Set up mock session for client
      localStorage.setItem('mock_session', 'true');
      localStorage.setItem('user_role', 'client');
      
      // Create a toast notification
      toast({
        title: "Login como cliente",
        description: "Acessando como Empresa Cliente",
      });
      
      // Navigate to client portal
      navigate("/client-portal");
      window.location.reload();
    } catch (error) {
      console.error("Erro no login como cliente:", error);
      toast({
        title: "Falha no acesso",
        description: "Não foi possível acessar como cliente",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };
  
  // Função para login rápido como admin para teste
  const loginAsAdmin = () => {
    setIsLoading(true);
    // Clean up any existing auth state first
    cleanupAuthState();
    
    try {
      // Set up mock session for admin
      localStorage.setItem('mock_session', 'true');
      localStorage.setItem('user_role', 'admin');
      
      // Create a toast notification
      toast({
        title: "Login como admin",
        description: "Acessando como Admin Contaflix",
      });
      
      // Navigate to admin analytics
      navigate("/admin/analytics");
      window.location.reload();
    } catch (error) {
      console.error("Erro no login como admin:", error);
      toast({
        title: "Falha no acesso",
        description: "Não foi possível acessar como admin",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-6 border-t pt-4">
      <p className="text-sm text-muted-foreground mb-2">Acesso rápido para testes:</p>
      <div className="grid grid-cols-3 gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={loginAsAccountant} 
          disabled={isLoading}
        >
          Contador
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={loginAsClient} 
          disabled={isLoading}
        >
          Cliente
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={loginAsAdmin} 
          disabled={isLoading}
        >
          Admin
        </Button>
      </div>
    </div>
  );
};
