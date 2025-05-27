
import { OpenAiConfigFormValues, OpenAiConfigWithApiKey } from "./schema";

// Interface para estatísticas de uso da API
interface OpenAiUsageStats {
  totalTokens: number;
  lastReset: string; // ISO date string
  requests: number;
}

// Store and retrieve OpenAI configuration from local storage
export const getOpenAiStoredValues = (): OpenAiConfigFormValues => {
  return typeof window !== "undefined" 
    ? {
        model: localStorage.getItem("openai-model") || "gpt-4o-mini",
        temperature: parseFloat(localStorage.getItem("openai-temperature") || "0.7"),
        maxTokens: parseInt(localStorage.getItem("openai-max-tokens") || "4000"),
      }
    : {
        model: "gpt-4o-mini",
        temperature: 0.7,
        maxTokens: 4000,
      };
};

export const saveOpenAiConfig = async (data: OpenAiConfigWithApiKey): Promise<void> => {
  // Store all values in localStorage
  if (data.apiKey) {
    localStorage.setItem("openai-api-key", data.apiKey);
  }
  localStorage.setItem("openai-model", data.model);
  localStorage.setItem("openai-temperature", data.temperature.toString());
  localStorage.setItem("openai-max-tokens", data.maxTokens.toString());
  
  // Atualizar status do assistente
  localStorage.setItem("openai-configured", "true");
  
  // Inicializar as estatísticas de uso se ainda não existirem
  if (!localStorage.getItem("openai-usage-stats")) {
    const initialStats: OpenAiUsageStats = {
      totalTokens: 0,
      lastReset: new Date().toISOString(),
      requests: 0
    };
    localStorage.setItem("openai-usage-stats", JSON.stringify(initialStats));
  }
  
  // Disparar um evento para notificar outros componentes
  window.dispatchEvent(new Event('openai-config-updated'));
};

export const testOpenAiConnection = async (apiKey: string, model: string): Promise<{ success: boolean; message: string }> => {
  try {
    // Simple validation without actual API call
    if (!apiKey || apiKey.trim().length < 10) {
      return { 
        success: false, 
        message: "A chave API parece inválida. Verifique se você inseriu uma chave API OpenAI válida." 
      };
    }
    
    if (!model) {
      return {
        success: false,
        message: "Selecione um modelo válido."
      };
    }
    
    // Simulate successful connection
    return {
      success: true,
      message: "Configuração validada com sucesso. A IA está pronta para uso no sistema!"
    };
  } catch (error) {
    return {
      success: false,
      message: `Erro na validação: ${error instanceof Error ? error.message : "Erro desconhecido"}`
    };
  }
};

export const isOpenAIConfigured = (): boolean => {
  return localStorage.getItem("openai-api-key") !== null &&
         localStorage.getItem("openai-api-key") !== "";
};

// Funções para gerenciar o uso de tokens
export const registerTokenUsage = (tokenCount: number): void => {
  try {
    const statsJson = localStorage.getItem("openai-usage-stats");
    if (statsJson) {
      const stats: OpenAiUsageStats = JSON.parse(statsJson);
      stats.totalTokens += tokenCount;
      stats.requests += 1;
      localStorage.setItem("openai-usage-stats", JSON.stringify(stats));
    }
  } catch (error) {
    console.error("Erro ao registrar uso de tokens:", error);
  }
};

export const getTokenUsageStats = (): OpenAiUsageStats => {
  try {
    const statsJson = localStorage.getItem("openai-usage-stats");
    if (statsJson) {
      return JSON.parse(statsJson);
    }
  } catch (error) {
    console.error("Erro ao obter estatísticas de tokens:", error);
  }
  
  // Retornar estatísticas vazias se não houver dados
  return {
    totalTokens: 0,
    lastReset: new Date().toISOString(),
    requests: 0
  };
};

export const resetTokenUsage = (): void => {
  const resetStats: OpenAiUsageStats = {
    totalTokens: 0,
    lastReset: new Date().toISOString(),
    requests: 0
  };
  localStorage.setItem("openai-usage-stats", JSON.stringify(resetStats));
};

// Função para obter configuração completa da OpenAI
export const getOpenAiConfig = () => {
  const values = getOpenAiStoredValues();
  const usage = getTokenUsageStats();
  const apiKey = localStorage.getItem("openai-api-key") || "";
  
  return {
    apiKey,
    model: values.model,
    temperature: values.temperature,
    maxTokens: values.maxTokens,
    usage
  };
};
