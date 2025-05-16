
import { useState, useCallback } from 'react';
import { processNaturalLanguage, generateNLPResponse } from './nlpProcessingService';
import { NLPResult, ClientSpecificContext } from './types';
import { registerTokenUsage } from '@/components/settings/openai/openAiService';
import { useClientDataFetcher } from '../useClientDataFetcher';

export function useNLPProcessor() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<NLPResult | null>(null);
  const { fetchClientData, isLoading: isDataLoading } = useClientDataFetcher();

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

  // Função para gerar respostas naturais baseadas na intenção identificada e contexto do cliente
  const generateResponse = useCallback(async (
    result: NLPResult, 
    clientContext?: ClientSpecificContext
  ): Promise<string> => {
    if (!clientContext || !clientContext.clientId) {
      return generateNLPResponse(result); // Resposta genérica sem contexto de cliente
    }
    
    // Determinar quais dados precisamos buscar com base na intenção
    let clientData = {};
    
    try {
      // Buscar dados do cliente com base na intenção identificada
      if (result.intent === 'fiscal_query' || result.intent === 'tax_calculation') {
        const fiscalData = await fetchClientData(clientContext.clientId, 'fiscal');
        const obligations = await fetchClientData(clientContext.clientId, 'obligations');
        clientData = { ...clientData, fiscalData, obligations };
      } 
      
      if (result.intent === 'financial_report') {
        const financialData = await fetchClientData(clientContext.clientId, 'financial');
        clientData = { ...clientData, financialData };
      }
      
      if (result.intent === 'document_request') {
        const documents = await fetchClientData(clientContext.clientId, 'documents');
        clientData = { ...clientData, documents };
      }

      // Para qualquer intenção, é bom ter os dados básicos fiscais
      if (Object.keys(clientData).length === 0) {
        const fiscalData = await fetchClientData(clientContext.clientId, 'fiscal');
        clientData = { ...clientData, fiscalData };
      }

      // Criar contexto de cliente enriquecido com os dados
      const enrichedContext: ClientSpecificContext = {
        ...clientContext,
        clientData
      };

      // Gerar resposta com base no contexto enriquecido do cliente
      return generateNLPResponse(result, enrichedContext);
      
    } catch (error) {
      console.error('Erro ao buscar dados do cliente:', error);
      // Em caso de erro, retorna resposta genérica
      return generateNLPResponse(result, { 
        clientId: clientContext.clientId, 
        clientName: clientContext.clientName 
      });
    }
  }, [fetchClientData]);
  
  return {
    processCommand,
    generateResponse,
    isProcessing: isProcessing || isDataLoading,
    lastResult
  };
}
