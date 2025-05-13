
import React, { useEffect } from "react";
import { ClientAccessForm } from "@/components/client-access/ClientAccessForm";
import { ClientAccessLayout } from "@/components/client-access/ClientAccessLayout";
import { ClientTokenManager } from "@/components/client-access/ClientTokenManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/auth";
import { Navigate } from "react-router-dom";

const ClientAccess = () => {
  const { isAuthenticated, isAccountant, isAdmin } = useAuth();
  const isAccountantOrAdmin = isAccountant || isAdmin;
  
  // Se o usuário logado for um contador ou administrador, mostrar a página de gerenciamento de tokens
  // Caso contrário, mostrar o formulário de acesso para clientes
  
  if (isAuthenticated && isAccountantOrAdmin) {
    return (
      <div className="container max-w-4xl py-8">
        <h1 className="text-3xl font-bold mb-8">Acesso de Clientes</h1>
        
        <Tabs defaultValue="form">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="form">Página de Login</TabsTrigger>
            <TabsTrigger value="tokens">Gerenciar Tokens</TabsTrigger>
          </TabsList>
          
          <TabsContent value="form" className="space-y-4">
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
      <ClientAccessForm />
    </ClientAccessLayout>
  );
};

export default ClientAccess;
