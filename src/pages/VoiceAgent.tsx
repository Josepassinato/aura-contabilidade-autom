import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { VoiceAgentInterface } from '@/components/voice-agent/VoiceAgentInterface';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Bot, ArrowLeft } from 'lucide-react';

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

    setToken(tokenParam);
  }, [searchParams]);

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

  return <VoiceAgentInterface token={token} />;
}