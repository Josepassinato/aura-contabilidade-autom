
import { useState, useCallback } from 'react';
import { processNaturalLanguage, generateNLPResponse } from './nlpProcessingService';
import { NLPResult } from './types';
import { registerTokenUsage } from '@/components/settings/openai/openAiService';

export function useNLPProcessor() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<NLPResult | null>(null);

  // Processar comando de voz/texto e identificar intenção
  const processCommand = useCallback(async (text: string): Promise<NLPResult> => {
    setIsProcessing(true);
    
    try {
      // Process the text using the NLP service
      const result = await processNaturalLanguage(text);
      
      // Simular uso de tokens para rastreamento
      // Em uma implementação real, isso viria da resposta da API
      const estimatedTokens = text.length / 3; // Estimativa simples: 1 token a cada 3 caracteres
      registerTokenUsage(estimatedTokens);
      
      setLastResult(result);
      return result;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Função para gerar respostas naturais baseadas na intenção identificada
  const generateResponse = useCallback((result: NLPResult, clientName?: string): string => {
    return generateNLPResponse(result, clientName);
  }, []);
  
  return {
    processCommand,
    generateResponse,
    isProcessing,
    lastResult
  };
}
