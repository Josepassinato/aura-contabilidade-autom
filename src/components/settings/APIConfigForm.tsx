
import React, { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth";
import { OpenAiConfigForm } from "./openai/OpenAiConfigForm";
import { TestResultDisplay } from "./openai/TestResultDisplay";
import { AccessRestriction } from "./AccessRestriction";
import { OpenAiConfigFormValues } from "./openai/schema";
import { getOpenAiStoredValues, saveOpenAiConfig, testOpenAiConnection } from "./openai/openAiService";

export function APIConfigForm() {
  const { isAdmin } = useAuth();
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{success: boolean; message: string} | null>(null);

  // Get stored values
  const storedValues = getOpenAiStoredValues();

  // Redirect non-admin users
  if (!isAdmin) {
    return <AccessRestriction />;
  }

  async function onSubmit(data: OpenAiConfigFormValues) {
    try {
      await saveOpenAiConfig(data);

      toast({
        title: "Configuração salva",
        description: "As configurações da API OpenAI foram atualizadas com sucesso no armazenamento local.",
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

  // Função para testar a configuração da API da OpenAI
  const testApiConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const result = await testOpenAiConnection(
        storedValues.apiKey,
        storedValues.model
      );
      
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Configuração da API OpenAI (Local)</h2>
        <p className="text-sm text-muted-foreground">
          Configure os parâmetros de conexão com a API da OpenAI para utilização do assistente de voz
          e análise de dados contábeis. Estes dados serão armazenados localmente.
        </p>
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
            disabled={isTesting}
          >
            {isTesting ? "Validando..." : "Validar Configuração"}
          </Button>
        </div>
      </OpenAiConfigForm>
      
      <TestResultDisplay testResult={testResult} />
    </div>
  );
}
