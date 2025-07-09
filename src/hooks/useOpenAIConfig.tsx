
import { useState, useEffect } from "react";
import { getOpenAiConfig, checkSupabaseOpenAISecret } from "@/components/settings/openai/supabaseOpenAiService";

export function useOpenAIConfig() {
  const [isConfigured, setIsConfigured] = useState(false);
  const [config, setConfig] = useState<any>(null);
  const [supabaseConfigured, setSupabaseConfigured] = useState(false);

  useEffect(() => {
    // Check if OpenAI is configured locally
    const isLocallyConfigured = () => {
      return localStorage.getItem("openai-configured") === "true";
    };

    // Check Supabase configuration
    const checkSupabaseConfig = async () => {
      try {
        const result = await checkSupabaseOpenAISecret();
        setSupabaseConfigured(result.isConfigured);
        
        // Consider configured if either local or Supabase has the config
        const totalConfigured = isLocallyConfigured() || result.isConfigured;
        setIsConfigured(totalConfigured);
        
        // Get current config if any is configured
        if (totalConfigured) {
          const currentConfig = getOpenAiConfig();
          setConfig({
            ...currentConfig,
            supabaseConfigured: result.isConfigured,
            message: result.message
          });
        }
      } catch (error) {
        console.error("Erro ao verificar configuração do Supabase:", error);
        setIsConfigured(isLocallyConfigured());
        if (isLocallyConfigured()) {
          const currentConfig = getOpenAiConfig();
          setConfig(currentConfig);
        }
      }
    };

    // Initial check
    checkSupabaseConfig();

    // Listen for config updates
    const handleConfigUpdate = () => {
      checkSupabaseConfig();
    };

    window.addEventListener('openai-config-updated', handleConfigUpdate);

    return () => {
      window.removeEventListener('openai-config-updated', handleConfigUpdate);
    };
  }, []);

  return { isConfigured, config, supabaseConfigured };
}
