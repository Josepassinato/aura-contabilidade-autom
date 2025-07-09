
import { supabase } from "@/integrations/supabase/client";

// Interface para estatísticas de uso da API
interface OpenAiUsageStats {
  totalTokens: number;
  lastReset: string; // ISO date string
  requests: number;
}

// Store and retrieve OpenAI configuration from Supabase secrets and local storage for non-sensitive data
export const getOpenAiStoredValues = () => {
  return {
    apiKey: "", // Will be loaded from Supabase secrets
    model: localStorage.getItem("openai-model") || "gpt-4o-mini",
    temperature: parseFloat(localStorage.getItem("openai-temperature") || "0.7"),
    maxTokens: parseInt(localStorage.getItem("openai-max-tokens") || "4000"),
  };
};

export const saveOpenAiConfig = async (data: { apiKey: string; model: string; temperature: number; maxTokens: number }) => {
  try {
    console.log("Salvando configurações OpenAI...");
    
    // Store non-sensitive values in localStorage
    localStorage.setItem("openai-model", data.model);
    localStorage.setItem("openai-temperature", data.temperature.toString());
    localStorage.setItem("openai-max-tokens", data.maxTokens.toString());
    
    // Mark as configured if API key is provided
    if (data.apiKey) {
      localStorage.setItem("openai-configured", "true");
    }
    
    // Initialize usage stats if they don't exist
    if (!localStorage.getItem("openai-usage-stats")) {
      const initialStats: OpenAiUsageStats = {
        totalTokens: 0,
        lastReset: new Date().toISOString(),
        requests: 0
      };
      localStorage.setItem("openai-usage-stats", JSON.stringify(initialStats));
    }
    
    console.log("Configurações salvas com sucesso");
    
    // Dispatch event to notify other components
    window.dispatchEvent(new Event('openai-config-updated'));
    
    return { success: true };
  } catch (error) {
    console.error("Erro ao salvar configurações:", error);
    throw error;
  }
};

export const testOpenAiConnection = async (model: string): Promise<{ success: boolean; message: string }> => {
  try {
    console.log("Testando conexão OpenAI...");
    
    // Check if OpenAI is configured first
    const configured = isOpenAIConfigured();
    if (!configured) {
      return {
        success: false,
        message: "Chave da API OpenAI não configurada. Configure a chave nas configurações do sistema."
      };
    }
    
    // Call edge function to test the connection using the stored secret
    const { data, error } = await supabase.functions.invoke('test-openai-connection', {
      body: { model }
    });
    
    if (error) {
      console.error("Erro na validação:", error);
      return {
        success: false,
        message: `Erro na validação: ${error.message}`
      };
    }
    
    console.log("Teste de conexão concluído:", data);
    
    return data || {
      success: true,
      message: "Configuração validada com sucesso. A IA está pronta para uso no sistema!"
    };
  } catch (error) {
    console.error("Erro na validação:", error);
    return {
      success: false,
      message: `Erro na validação: ${error instanceof Error ? error.message : "Erro desconhecido"}`
    };
  }
};

export const isOpenAIConfigured = (): boolean => {
  // Check if OpenAI is configured via localStorage
  return localStorage.getItem("openai-configured") === "true";
};

// Check if OpenAI API key is configured in Supabase secrets
export const checkSupabaseOpenAISecret = async (): Promise<{ isConfigured: boolean; message: string }> => {
  try {
    const { data, error } = await supabase.functions.invoke('check-openai-secret');
    
    if (error) {
      console.error("Erro ao verificar secret do Supabase:", error);
      return {
        isConfigured: false,
        message: `Erro ao verificar configuração: ${error.message}`
      };
    }
    
    return data || { isConfigured: false, message: "Resposta inválida" };
  } catch (error) {
    console.error("Erro ao verificar secret do Supabase:", error);
    return {
      isConfigured: false,
      message: `Erro na verificação: ${error instanceof Error ? error.message : "Erro desconhecido"}`
    };
  }
};

// Token usage functions remain the same as they use localStorage
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

export const getOpenAiConfig = () => {
  const values = getOpenAiStoredValues();
  const usage = getTokenUsageStats();
  
  return {
    apiKey: "", // API key is stored securely in Supabase
    model: values.model,
    temperature: values.temperature,
    maxTokens: values.maxTokens,
    usage
  };
};
