import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2, Bot, Zap, Brain } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const AIStatusChecker = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [aiStatus, setAiStatus] = useState<{
    isConfigured: boolean;
    message: string;
  } | null>(null);
  const [aiTest, setAiTest] = useState<{
    success: boolean;
    response: string;
  } | null>(null);
  const { toast } = useToast();

  const checkAIConfiguration = async () => {
    setIsChecking(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-openai-secret');
      
      if (error) {
        throw new Error(error.message);
      }

      setAiStatus(data);
      toast({
        title: data.isConfigured ? "✅ IA Configurada!" : "❌ IA Não Configurada",
        description: data.message,
        variant: data.isConfigured ? "default" : "destructive",
      });
    } catch (error: any) {
      console.error('Erro ao verificar IA:', error);
      toast({
        title: "Erro na verificação",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  const testAIClassification = async () => {
    setIsChecking(true);
    try {
      const { data, error } = await supabase.functions.invoke('classify-document-ai', {
        body: {
          documentContent: "NOTA FISCAL ELETRÔNICA - NFe\nENPJ: 12.345.678/0001-90\nValor: R$ 1.500,00\nServiços de consultoria em TI",
          documentType: "nfe",
          metadata: { test: true }
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }

      setAiTest({
        success: true,
        response: JSON.stringify(data, null, 2)
      });

      toast({
        title: "🤖 IA Funcionando!",
        description: "Classificação automática realizada com sucesso",
      });
    } catch (error: any) {
      console.error('Erro no teste de IA:', error);
      setAiTest({
        success: false,
        response: error.message
      });
      toast({
        title: "Erro no teste de IA",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Status da Inteligência Artificial
          </CardTitle>
          <CardDescription>
            Verificar se a IA está configurada e funcionando no sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button 
              onClick={checkAIConfiguration}
              disabled={isChecking}
              variant="outline"
            >
              {isChecking ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Verificar Configuração
            </Button>

            <Button 
              onClick={testAIClassification}
              disabled={isChecking || !aiStatus?.isConfigured}
              variant="default"
            >
              {isChecking ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Brain className="h-4 w-4 mr-2" />
              )}
              Testar Classificação IA
            </Button>
          </div>

          {aiStatus && (
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                {aiStatus.isConfigured ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <Badge variant={aiStatus.isConfigured ? "default" : "destructive"}>
                  {aiStatus.isConfigured ? "Configurado" : "Não Configurado"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{aiStatus.message}</p>
            </div>
          )}

          {aiTest && (
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                {aiTest.success ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <Badge variant={aiTest.success ? "default" : "destructive"}>
                  {aiTest.success ? "Teste Passou" : "Teste Falhou"}
                </Badge>
              </div>
              <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-40">
                {aiTest.response}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Funcionalidades de IA Disponíveis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 border rounded-lg">
              <h4 className="font-semibold text-sm">🤖 Classificação Automática</h4>
              <p className="text-xs text-muted-foreground">
                Classifica documentos fiscais automaticamente usando IA
              </p>
            </div>
            <div className="p-3 border rounded-lg">
              <h4 className="font-semibold text-sm">🔍 Detecção de Anomalias</h4>
              <p className="text-xs text-muted-foreground">
                Identifica irregularidades em dados contábeis
              </p>
            </div>
            <div className="p-3 border rounded-lg">
              <h4 className="font-semibold text-sm">📊 Análise Preditiva</h4>
              <p className="text-xs text-muted-foreground">
                Prediz tendências e padrões financeiros
              </p>
            </div>
            <div className="p-3 border rounded-lg">
              <h4 className="font-semibold text-sm">💬 Assistente Virtual</h4>
              <p className="text-xs text-muted-foreground">
                Responde perguntas sobre contabilidade
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};