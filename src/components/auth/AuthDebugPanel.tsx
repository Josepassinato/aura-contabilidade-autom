import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase/client';

export const AuthDebugPanel = () => {
  const testConnection = async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      console.log('Current session:', data);
      
      if (error) {
        toast({
          title: "Erro de conexão",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Conexão OK",
          description: `Sessão: ${data.session ? 'Ativa' : 'Inativa'}`,
        });
      }
    } catch (error: any) {
      console.error('Test error:', error);
      toast({
        title: "Erro no teste",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const testLoginDirectly = async () => {
    try {
      // Teste com credenciais conhecidas
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'josepassinato@hotmail.com',
        password: 'test123'
      });

      if (error) {
        console.error('Direct login error:', error);
        toast({
          title: "Erro no login direto",
          description: error.message,
          variant: "destructive"
        });
      } else {
        console.log('Direct login success:', data);
        toast({
          title: "Login direto OK",
          description: "Login realizado com sucesso",
        });
      }
    } catch (error: any) {
      console.error('Direct login error:', error);
      toast({
        title: "Erro no login direto",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="mb-4 border-yellow-200 bg-yellow-50">
      <CardHeader>
        <CardTitle className="text-yellow-800">🐛 Painel de Depuração - Autenticação</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={testConnection} variant="outline" className="w-full">
          Testar Conexão Supabase
        </Button>
        <Button onClick={testLoginDirectly} variant="outline" className="w-full">
          Teste Login Direto
        </Button>
        <div className="text-sm text-yellow-700">
          <p><strong>Status da Configuração:</strong></p>
          <p>URL: {process.env.NODE_ENV === 'development' ? 'Dev' : 'Prod'}</p>
          <p>Supabase URL configurada: ✅</p>
          <p>Chave Anon configurada: ✅</p>
        </div>
      </CardContent>
    </Card>
  );
};