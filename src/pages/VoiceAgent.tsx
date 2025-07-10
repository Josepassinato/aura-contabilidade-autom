import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import VoiceAgentInterface from '@/components/voice-agent/VoiceAgentInterface';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Bot, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { authStorage } from '@/utils/secureStorage';

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
    authStorage.setAccessToken(tokenParam);
    validateToken(tokenParam);
  }, [searchParams]);

  const validateToken = async (token: string) => {
    try {
      // Decode and validate token with proper error handling
      let decodedData;
      try {
        decodedData = JSON.parse(atob(token));
      } catch (parseError) {
        setError('Token inválido ou corrompido. Verifique o link enviado pelo seu contador.');
        return;
      }
      
      // Validate required fields in token
      if (!decodedData.clientId && !decodedData.setup) {
        setError('Token malformado - dados obrigatórios ausentes.');
        return;
      }
      
      // Check if it's a setup token (no expiration check needed)
      if (decodedData.setup) {
        // For setup tokens, client data should already be in secure storage
        const storedClientId = authStorage.getClientId();
        const storedClientData = authStorage.getClientData();
        
        if (storedClientId && storedClientData) {
          // Additional security: verify stored client data structure
          if (!storedClientData.id || !storedClientData.name) {
            authStorage.clearAll();
            setError('Dados armazenados corrompidos. Configure o acesso novamente.');
            return;
          }
          setToken(token);
          return;
        } else {
          setError('Dados de configuração não encontrados. Escaneie o QR code novamente.');
          return;
        }
      }
      
      // For non-setup tokens, check expiration strictly
      if (!decodedData.setup) {
        if (!decodedData.expires) {
          setError('Token sem data de expiração - formato inválido.');
          return;
        }
        
        if (Date.now() > decodedData.expires) {
          setError('Token expirado. Solicite um novo link ao seu contador.');
          return;
        }
        
        // Check if token is not too old (max 24 hours for non-setup tokens)
        const tokenAge = Date.now() - (decodedData.timestamp || 0);
        if (tokenAge > 24 * 60 * 60 * 1000) {
          setError('Token muito antigo. Solicite um novo link ao seu contador.');
          return;
        }
      }

      // Validate client exists and is active
      const { data: client, error } = await supabase
        .from('accounting_clients')
        .select('id, name, status, accounting_firms(name)')
        .eq('id', decodedData.clientId)
        .eq('status', 'active')
        .single();

      if (error || !client) {
        setError('Cliente não encontrado, inativo ou token inválido.');
        return;
      }

      // Additional security check: verify token clientId matches database
      if (client.id !== decodedData.clientId) {
        setError('Inconsistência nos dados de cliente. Token possivelmente adulterado.');
        return;
      }

      // Store client data for the voice agent with additional validation
      const clientDataToStore = {
        id: client.id,
        name: client.name,
        accounting_firm_name: client.accounting_firms?.name || 'Não informado'
      };
      
      authStorage.setClientId(client.id);
      authStorage.setClientData(clientDataToStore);

      setToken(token);
    } catch (error) {
      console.error('Token validation error:', error);
      setError('Erro interno na validação do token. Tente novamente ou contate o suporte.');
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