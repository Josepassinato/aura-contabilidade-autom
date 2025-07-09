
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { AlertCircle, Settings } from 'lucide-react';
import { useOpenAIConfig } from '@/hooks/useOpenAIConfig';
import { 
  getEnhancedTokenUsageStats, 
  resetAllTokenUsage, 
  setTokenUsageLimit,
  getTokenUsageLimit
} from '@/hooks/nlp/tokenUsageService';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function OpenAIManagement() {
  const { isConfigured, config, supabaseConfigured } = useOpenAIConfig();
  const [tokenStats, setTokenStats] = useState(getEnhancedTokenUsageStats());
  const [tokenLimit, setTokenLimit] = useState(getTokenUsageLimit());
  const [newLimit, setNewLimit] = useState(tokenLimit.toString());
  
  // Refresh stats periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setTokenStats(getEnhancedTokenUsageStats());
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Handle token limit update
  const handleUpdateLimit = () => {
    const limit = parseInt(newLimit);
    if (isNaN(limit) || limit <= 0) {
      toast({
        title: "Valor inválido",
        description: "Por favor, insira um número válido maior que zero.",
        variant: "destructive"
      });
      return;
    }
    
    setTokenLimit(limit);
    setTokenUsageLimit(limit);
  };
  
  // Handle reset stats
  const handleResetStats = () => {
    if (confirm("Tem certeza de que deseja redefinir todas as estatísticas de uso de tokens? Esta ação não pode ser desfeita.")) {
      resetAllTokenUsage();
      setTokenStats(getEnhancedTokenUsageStats());
    }
  };
  
  // Format date string
  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleString();
    } catch (e) {
      return "Data desconhecida";
    }
  };
  
  // Calculate token usage percentage
  const usagePercentage = Math.min(100, Math.round((tokenStats.totalTokens / tokenLimit) * 100));
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Gerenciamento de OpenAI</h2>
          <p className="text-muted-foreground mt-1">
            Monitore e gerencie o uso de tokens, custos e limites da API OpenAI
          </p>
        </div>
        
        {!isConfigured && (
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => window.location.href = '/settings?openai=true'}
          >
            <Settings className="h-4 w-4" />
            Configurar OpenAI
          </Button>
        )}
      </div>
      
      {!isConfigured ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>OpenAI não configurada</AlertTitle>
          <AlertDescription>
            A API OpenAI não está configurada. Configure-a nas configurações antes de usar os recursos de IA.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Resumo de uso de tokens */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total de Tokens Utilizados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col">
                  <div className="text-2xl font-bold">
                    {tokenStats.totalTokens.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Custo estimado: ${tokenStats.estimatedCost?.toFixed(2)}
                  </div>
                  <div className="w-full bg-muted h-2 rounded-full mt-2">
                    <div 
                      className={`h-2 rounded-full ${
                        usagePercentage < 80 ? 'bg-green-500' : 
                        usagePercentage < 95 ? 'bg-yellow-500' : 
                        'bg-red-500'
                      }`} 
                      style={{ width: `${usagePercentage}%` }}
                    />
                  </div>
                  <div className="text-xs mt-1 flex justify-between">
                    <span>{usagePercentage}% do limite</span>
                    <span>{tokenLimit.toLocaleString()} tokens</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Número de requisições */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Requisições Processadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {tokenStats.requests.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Desde {formatDate(tokenStats.lastReset)}
                </div>
              </CardContent>
            </Card>
            
            {/* Configuração atual */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Configuração da API</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Status:</span>{" "}
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      supabaseConfigured 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {supabaseConfigured ? "Configurada no Supabase" : "Configuração local"}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Modelo:</span> {config?.model || "gpt-4o-mini"}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Temperatura:</span> {config?.temperature || "0.7"}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Max Tokens:</span> {config?.maxTokens || "4000"}
                  </div>
                  {config?.message && (
                    <div className="text-xs text-muted-foreground mt-2 p-2 bg-muted rounded">
                      {config.message}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="settings" className="space-y-4">
            <TabsList>
              <TabsTrigger value="settings">Configurações</TabsTrigger>
            </TabsList>
            
            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Gerenciar Limites de Uso</CardTitle>
                  <CardDescription>
                    Configure alertas e limites para controlar custos
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="tokenLimit">Limite de tokens</Label>
                    <div className="flex gap-2 items-center mt-1.5">
                      <Input 
                        id="tokenLimit" 
                        type="number" 
                        min="1000"
                        value={newLimit}
                        onChange={(e) => setNewLimit(e.target.value)}
                        className="max-w-xs"
                      />
                      <Button onClick={handleUpdateLimit}>Atualizar</Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      O sistema alertará quando o uso de tokens atingir 80% deste limite.
                    </p>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <h3 className="text-sm font-medium mb-2">Ações</h3>
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        variant="destructive" 
                        onClick={handleResetStats}
                      >
                        Redefinir estatísticas
                      </Button>
                      
                      <Button 
                        variant="outline"
                        onClick={() => window.location.href = '/settings?openai=true'}
                      >
                        Configuração da OpenAI
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Estatísticas de Uso Real</CardTitle>
                  <CardDescription>
                    Dados reais do uso atual da API OpenAI
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="font-medium">Tokens utilizados:</p>
                        <p className="text-2xl font-bold">{tokenStats.totalTokens.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="font-medium">Requisições:</p>
                        <p className="text-2xl font-bold">{tokenStats.requests.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="pt-2">
                      <p className="font-medium">Última reinicialização:</p>
                      <p>{formatDate(tokenStats.lastReset)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Explicação dos Custos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <p>
                      Os custos da API OpenAI são calculados com base no número de tokens processados. 
                      Cada token representa aproximadamente 4 caracteres de texto em português.
                    </p>
                    <div className="space-y-1 pt-2">
                      <p className="font-medium">Preços aproximados por modelo (por 1K tokens):</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>GPT-4o Mini: $0.15 por 1K tokens ($0.00015 por token)</li>
                        <li>GPT-4o: $3.00 por 1K tokens ($0.003 por token)</li>
                        <li>GPT-4.5 Preview: $5.00 por 1K tokens ($0.005 por token)</li>
                      </ul>
                    </div>
                    <p className="pt-2">
                      Observação: Os valores apresentados são aproximados e podem mudar conforme as 
                      atualizações de preço da OpenAI. Para valores precisos, consulte a 
                      <a href="https://openai.com/pricing" target="_blank" rel="noopener noreferrer" className="text-primary ml-1">
                        página de preços da OpenAI
                      </a>.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
