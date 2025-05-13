
import { OpenAiConfigFormValues } from "./schema";

// Store and retrieve OpenAI configuration from local storage
export const getOpenAiStoredValues = (): OpenAiConfigFormValues => {
  return typeof window !== "undefined" 
    ? {
        apiKey: localStorage.getItem("openai-api-key") || "",
        model: localStorage.getItem("openai-model") || "gpt-4o-mini",
        temperature: parseFloat(localStorage.getItem("openai-temperature") || "0.7"),
        maxTokens: parseInt(localStorage.getItem("openai-max-tokens") || "4000"),
      }
    : {
        apiKey: "",
        model: "gpt-4o-mini",
        temperature: 0.7,
        maxTokens: 4000,
      };
};

export const saveOpenAiConfig = async (data: OpenAiConfigFormValues): Promise<void> => {
  // Store all values in localStorage
  localStorage.setItem("openai-api-key", data.apiKey);
  localStorage.setItem("openai-model", data.model);
  localStorage.setItem("openai-temperature", data.temperature.toString());
  localStorage.setItem("openai-max-tokens", data.maxTokens.toString());
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
      message: "Configuração validada com sucesso. Nota: Esta é apenas uma validação básica, a conexão real com a API será testada quando utilizada."
    };
  } catch (error) {
    return {
      success: false,
      message: `Erro na validação: ${error instanceof Error ? error.message : "Erro desconhecido"}`
    };
  }
};
