
import React, { useEffect } from "react";
import { ClientAccessForm } from "@/components/client-access/ClientAccessForm";
import { ClientAccessLayout } from "@/components/client-access/ClientAccessLayout";
import { ClientTokenManager } from "@/components/client-access/ClientTokenManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/auth";
import { Navigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

const ClientAccess = () => {
  const { isAuthenticated, isAccountant, isAdmin } = useAuth();
  const isAccountantOrAdmin = isAccountant || isAdmin;
  const { toast } = useToast();
  
  // Se o usuário logado for um contador ou administrador, mostrar a página de gerenciamento de tokens
  // Caso contrário, mostrar o formulário de acesso para clientes
  
  const accessTestAccount = () => {
    // Configurar cliente de exemplo para teste
    sessionStorage.setItem('client_id', 'test-client-123');
    sessionStorage.setItem('client_name', 'Empresa Teste');
    sessionStorage.setItem('client_cnpj', '12.345.678/0001-90');
    
    toast({
      title: "Acesso direto ativado",
      description: "Você está acessando como cliente de teste",
    });
    
    // Redirecionar para o portal do cliente
    window.location.href = '/client-portal';
  };
  
  if (isAuthenticated && isAccountantOrAdmin) {
    return (
      <div className="container max-w-4xl py-8">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="flex items-center">
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para o painel principal
            </Link>
          </Button>
        </div>
        
        <h1 className="text-3xl font-bold mb-8">Acesso de Clientes</h1>
        
        <Tabs defaultValue="form">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="form">Página de Login</TabsTrigger>
            <TabsTrigger value="tokens">Gerenciar Tokens</TabsTrigger>
          </TabsList>
          
          <TabsContent value="form" className="space-y-4">
            <div className="flex justify-end mb-4">
              <Button 
                variant="secondary" 
                onClick={accessTestAccount}
              >
                Acessar como Cliente Teste
              </Button>
            </div>
            <ClientAccessLayout>
              <ClientAccessForm />
            </ClientAccessLayout>
          </TabsContent>
          
          <TabsContent value="tokens" className="space-y-4">
            <ClientTokenManager />
          </TabsContent>
        </Tabs>
      </div>
    );
  }
  
  // Para usuários não autenticados ou clientes, mostrar apenas o formulário de acesso
  return (
    <ClientAccessLayout>
      <div className="mb-4 text-center">
        <Button
          variant="secondary"
          onClick={accessTestAccount}
          className="mx-auto"
        >
          Acessar como Cliente Teste
        </Button>
      </div>
      <ClientAccessForm />
    </ClientAccessLayout>
  );
};

export default ClientAccess;
