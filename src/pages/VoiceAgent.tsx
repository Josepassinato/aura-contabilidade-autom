import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import VoiceAgentInterface from '@/components/voice-agent/VoiceAgentInterface';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Bot, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function VoiceAgent() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    
    if (!tokenParam) {
      setError('Token de acesso não fornecido. Verifique o link enviado pelo seu contador.');
      return;
    }

    // Store token and validate it
    localStorage.setItem('contaflix_access_token', tokenParam);
    validateToken(tokenParam);
  }, [searchParams]);

  const validateToken = async (token: string) => {
    try {
      // Decode and validate token
      const decodedData = JSON.parse(atob(token));
      
      // Check if token is expired
      if (decodedData.expires && Date.now() > decodedData.expires) {
        setError('Token expirado. Solicite um novo link ao seu contador.');
        return;
      }

      // Validate client exists
      const { data: client, error } = await supabase
        .from('accounting_clients')
        .select('id, name, accounting_firms(name)')
        .eq('id', decodedData.clientId)
        .single();

      if (error || !client) {
        setError('Cliente não encontrado ou token inválido.');
        return;
      }

      // Store client data for the voice agent
      localStorage.setItem('contaflix_client_id', client.id);
      localStorage.setItem('contaflix_client_data', JSON.stringify({
        id: client.id,
        name: client.name,
        accounting_firm_name: client.accounting_firms?.name || 'Não informado'
      }));

      setToken(token);
    } catch (error) {
      console.error('Token validation error:', error);
      setError('Token inválido. Verifique o link enviado pelo seu contador.');
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-destructive/5 to-muted/5 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-destructive/20">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-destructive">Acesso Negado</CardTitle>
            <CardDescription className="text-center">
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button 
              onClick={() => navigate('/')}
              variant="outline"
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bot className="h-8 w-8 text-primary animate-pulse" />
            </div>
            <CardTitle>Carregando Assistente</CardTitle>
            <CardDescription>
              Verificando suas credenciais...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return <VoiceAgentInterface />;
}