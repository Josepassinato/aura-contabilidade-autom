
import React, { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/auth";
import { OpenAiConfigForm } from "./openai/OpenAiConfigForm";
import { TestResultDisplay } from "./openai/TestResultDisplay";
import { AccessRestriction } from "./AccessRestriction";
import { OpenAiConfigFormValues } from "./openai/schema";
import { 
  getOpenAiStoredValues, 
  saveOpenAiConfig, 
  testOpenAiConnection, 
  getTokenUsageStats,
  resetTokenUsage,
  isOpenAIConfigured
} from "./openai/supabaseOpenAiService";

export function APIConfigForm() {
  const { isAdmin } = useAuth();
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{success: boolean; message: string} | null>(null);
  const [usageStats, setUsageStats] = useState({ totalTokens: 0, lastReset: '', requests: 0 });
  const [showApiKeyForm, setShowApiKeyForm] = useState(false);

  // Get stored values
  const storedValues = getOpenAiStoredValues();
  
  // Load usage statistics
  useEffect(() => {
    const stats = getTokenUsageStats();
    setUsageStats(stats);
    
    // Update stats every 5 seconds
    const interval = setInterval(() => {
      const updatedStats = getTokenUsageStats();
      setUsageStats(updatedStats);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Redirect non-admin users
  if (!isAdmin) {
    return <AccessRestriction />;
  }

  async function onSubmit(data: OpenAiConfigFormValues) {
    try {
      await saveOpenAiConfig(data);

      toast({
        title: "Configuração salva",
        description: "As configurações da API OpenAI foram atualizadas com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive"
      });
    }
  }

  // Test API connection function
  const testApiConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const result = await testOpenAiConnection(storedValues.model);
      
      setTestResult(result);
      
      toast({
        title: result.success ? "Configuração válida" : "Configuração inválida",
        description: result.message,
        variant: result.success ? "default" : "destructive"
      });
    } catch (error) {
      console.error("Erro ao testar a configuração:", error);
      setTestResult({
        success: false,
        message: `Erro ao validar a configuração: ${error instanceof Error ? error.message : "Erro desconhecido"}`
      });
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao tentar validar a configuração.",
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
    }
  };
  
  // Reset usage counter function
  const handleResetUsage = () => {
    resetTokenUsage();
    setUsageStats({ totalTokens: 0, lastReset: new Date().toISOString(), requests: 0 });
    
    toast({
      title: "Contador resetado",
      description: "As estatísticas de uso da API foram zeradas.",
    });
  };
  
  // Date formatter
  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleString();
    } catch (e) {
      return "Data desconhecida";
    }
  };

  const openAiConfigured = isOpenAIConfigured();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Configuração da API OpenAI (Supabase)</h2>
        <p className="text-sm text-muted-foreground">
          Configure os parâmetros de conexão com a API da OpenAI. A chave da API é armazenada de forma segura no Supabase.
        </p>
      </div>

      {!openAiConfigured && (
        <Alert>
          <AlertTitle>Configuração necessária</AlertTitle>
          <AlertDescription>
            A chave da API OpenAI não foi configurada. Use o botão abaixo para configurar de forma segura no Supabase.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Usage statistics */}
      <div className="bg-muted/50 p-4 rounded-lg border">
        <h3 className="text-sm font-medium mb-2">Estatísticas de uso da API</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-background p-3 rounded-md">
            <p className="text-xs text-muted-foreground">Tokens utilizados:</p>
            <p className="text-lg font-medium">{usageStats.totalTokens.toLocaleString()}</p>
          </div>
          <div className="bg-background p-3 rounded-md">
            <p className="text-xs text-muted-foreground">Requisições:</p>
            <p className="text-lg font-medium">{usageStats.requests.toLocaleString()}</p>
          </div>
          <div className="bg-background p-3 rounded-md">
            <p className="text-xs text-muted-foreground">Última reinicialização:</p>
            <p className="text-sm">{formatDate(usageStats.lastReset)}</p>
          </div>
        </div>
        <div className="mt-3 flex gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={handleResetUsage}>
            Zerar contadores
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowApiKeyForm(true)}
          >
            {openAiConfigured ? "Atualizar" : "Configurar"} Chave API
          </Button>
        </div>
      </div>

      <OpenAiConfigForm 
        onSubmit={onSubmit}
        initialValues={storedValues}
      >
        <div className="flex flex-col sm:flex-row gap-4 pt-2">
          <Button type="submit">Salvar Configurações</Button>
          <Button 
            type="button" 
            onClick={testApiConnection} 
            variant="outline"
            disabled={isTesting || !openAiConfigured}
          >
            {isTesting ? "Validando..." : "Validar Configuração"}
          </Button>
        </div>
      </OpenAiConfigForm>
      
      <TestResultDisplay testResult={testResult} />
      
      <Alert>
        <AlertTitle>Sobre o armazenamento seguro</AlertTitle>
        <AlertDescription>
          A chave da API OpenAI é armazenada de forma segura nos secrets do Supabase, não no navegador. 
          Isso garante maior segurança para suas credenciais.
        </AlertDescription>
      </Alert>
    </div>
  );
}
