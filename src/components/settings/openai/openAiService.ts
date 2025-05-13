
import { supabase } from "@/integrations/supabase/client";
import { OpenAiConfigFormValues } from "./schema";

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
  // Store values in Supabase if available
  const { error } = await supabase.functions.invoke("save-openai-config", {
    body: {
      apiKey: data.apiKey,
      config: {
        model: data.model,
        temperature: data.temperature,
        maxTokens: data.maxTokens,
      }
    }
  });

  if (error) {
    throw new Error("Erro ao salvar configuração no Supabase");
  }

  // Armazenar apenas configurações não sensíveis no localStorage para uso temporário
  localStorage.setItem("openai-model", data.model);
  localStorage.setItem("openai-temperature", data.temperature.toString());
  localStorage.setItem("openai-max-tokens", data.maxTokens.toString());
};

export const testOpenAiConnection = async (apiKey: string, model: string): Promise<{ success: boolean; message: string }> => {
  // Chamar uma Edge Function do Supabase que testa a conexão com a OpenAI
  const { data, error } = await supabase.functions.invoke("test-openai-connection", {
    body: { apiKey, model }
  });

  if (error) {
    return { 
      success: false, 
      message: `Erro na conexão: ${error.message}` 
    };
  }

  if (data.success) {
    return {
      success: true,
      message: "Conexão estabelecida com sucesso via Supabase! A API da OpenAI está respondendo corretamente."
    };
  } else {
    return {
      success: false,
      message: `Erro na conexão: ${data.message || "Erro desconhecido"}`
    };
  }
};
