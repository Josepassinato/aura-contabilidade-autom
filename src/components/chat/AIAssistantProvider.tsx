import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AIAssistantContextType {
  isOpenAIConfigured: boolean;
  checkOpenAIConfiguration: () => Promise<void>;
}

const AIAssistantContext = createContext<AIAssistantContextType | undefined>(undefined);

export function AIAssistantProvider({ children }: { children: React.ReactNode }) {
  const [isOpenAIConfigured, setIsOpenAIConfigured] = useState(false);

  const checkOpenAIConfiguration = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('check-openai-secret');
      
      if (error) {
        console.error('Error checking OpenAI configuration:', error);
        setIsOpenAIConfigured(false);
        return;
      }

      setIsOpenAIConfigured(data?.isConfigured || false);
    } catch (error) {
      console.error('Error checking OpenAI configuration:', error);
      setIsOpenAIConfigured(false);
    }
  };

  useEffect(() => {
    checkOpenAIConfiguration();
  }, []);

  return (
    <AIAssistantContext.Provider value={{
      isOpenAIConfigured,
      checkOpenAIConfiguration
    }}>
      {children}
    </AIAssistantContext.Provider>
  );
}

export function useAIAssistant() {
  const context = useContext(AIAssistantContext);
  if (context === undefined) {
    throw new Error('useAIAssistant must be used within an AIAssistantProvider');
  }
  return context;
}