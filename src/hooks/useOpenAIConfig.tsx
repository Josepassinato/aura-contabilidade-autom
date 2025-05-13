
import { useState, useEffect } from "react";
import { getOpenAiConfig } from "@/components/settings/openai/openAiService";

export function useOpenAIConfig() {
  const [isConfigured, setIsConfigured] = useState(false);
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    // Check if OpenAI is configured
    const isOpenAIConfigured = () => {
      return localStorage.getItem("openai-api-key") !== null &&
             localStorage.getItem("openai-api-key") !== "";
    };

    setIsConfigured(isOpenAIConfigured());

    // Get current config
    if (isOpenAIConfigured()) {
      const currentConfig = getOpenAiConfig();
      setConfig(currentConfig);
    }

    // Listen for config updates
    const handleConfigUpdate = () => {
      setIsConfigured(isOpenAIConfigured());
      if (isOpenAIConfigured()) {
        const updatedConfig = getOpenAiConfig();
        setConfig(updatedConfig);
      }
    };

    window.addEventListener('openai-config-updated', handleConfigUpdate);

    return () => {
      window.removeEventListener('openai-config-updated', handleConfigUpdate);
    };
  }, []);

  return { isConfigured, config };
}
