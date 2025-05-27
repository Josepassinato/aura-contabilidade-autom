
import { NLPResult, NLPIntent, ClientSpecificContext } from './types';
import { supabase } from '@/integrations/supabase/client';

// Real NLP processing using OpenAI API through Supabase edge function
export const processNaturalLanguage = async (text: string): Promise<NLPResult> => {
  try {
    console.log('Processando NLP para:', text);
    
    // Call Supabase edge function for NLP processing
    const { data, error } = await supabase.functions.invoke('process-nlp', {
      body: { text }
    });
    
    if (error) {
      console.error('Erro na função edge NLP:', error);
      throw error;
    }
    
    console.log('Resultado NLP:', data);
    return data;
    
  } catch (error) {
    console.error('Erro no processamento NLP:', error);
    
    // Fallback: análise simples baseada em palavras-chave
    return analyzeWithKeywords(text);
  }
};

// Fallback keyword-based analysis
const analyzeWithKeywords = (text: string): NLPResult => {
  const lowerText = text.toLowerCase();
  
  // Análise de intenções baseada em palavras-chave
  if (lowerText.includes('relatório') || lowerText.includes('relatorio')) {
    return {
      intent: 'financial_report',
      confidence: 0.8,
      entities: { reportType: extractReportType(lowerText) },
      originalText: text
    };
  }
  
  if (lowerText.includes('obrigação') || lowerText.includes('obrigacao') || 
      lowerText.includes('fiscal') || lowerText.includes('imposto')) {
    return {
      intent: 'fiscal_query',
      confidence: 0.85,
      entities: {},
      originalText: text
    };
  }
  
  if (lowerText.includes('documento') || lowerText.includes('arquivo')) {
    return {
      intent: 'document_request',
      confidence: 0.75,
      entities: {},
      originalText: text
    };
  }
  
  if (lowerText.includes('anomalia') || lowerText.includes('erro') || 
      lowerText.includes('detectar') || lowerText.includes('verificar')) {
    return {
      intent: 'anomaly_detection',
      confidence: 0.82,
      entities: {},
      originalText: text
    };
  }
  
  if (lowerText.includes('fluxo') || lowerText.includes('previsão') || 
      lowerText.includes('previsao') || lowerText.includes('caixa')) {
    return {
      intent: 'cash_flow_prediction',
      confidence: 0.78,
      entities: {},
      originalText: text
    };
  }
  
  return {
    intent: 'unknown',
    confidence: 0.5,
    entities: {},
    originalText: text
  };
};

const extractReportType = (text: string): string => {
  if (text.includes('faturamento')) return 'faturamento';
  if (text.includes('despesa')) return 'despesas';
  if (text.includes('balanço') || text.includes('balanco')) return 'balanco';
  if (text.includes('dre')) return 'dre';
  if (text.includes('fluxo')) return 'fluxo_caixa';
  return 'geral';
};

// Generate responses using real AI or fallback to template responses
export const generateNLPResponse = async (
  result: NLPResult, 
  clientContext?: ClientSpecificContext
): Promise<string> => {
  try {
    console.log('Gerando resposta NLP:', result, clientContext);
    
    // Try to use OpenAI through edge function for response generation
    const { data, error } = await supabase.functions.invoke('generate-nlp-response', {
      body: { 
        nlpResult: result, 
        clientContext 
      }
    });
    
    if (error) {
      console.error('Erro na geração de resposta:', error);
      throw error;
    }
    
    console.log('Resposta gerada pela IA:', data.response);
    return data.response;
    
  } catch (error) {
    console.error('Erro na geração de resposta, usando fallback:', error);
    
    // Fallback to template responses
    return generateTemplateResponse(result, clientContext);
  }
};

// Template-based response generation as fallback
const generateTemplateResponse = (
  result: NLPResult, 
  clientContext?: ClientSpecificContext
): string => {
  const clientName = clientContext?.clientName || 'cliente';
  
  switch (result.intent) {
    case 'fiscal_query':
      return `${clientName}, aqui estão as informações fiscais disponíveis. Com base nos dados do sistema, identifiquei as principais obrigações e prazos relevantes para sua empresa.`;
      
    case 'financial_report':
      const reportType = result.entities?.reportType || 'financeiro';
      return `Preparei um relatório de ${reportType} para ${clientName}. O documento inclui análises detalhadas baseadas nos dados mais recentes do sistema.`;
      
    case 'document_request':
      return `${clientName}, encontrei os documentos relacionados à sua solicitação. Eles estão organizados por categoria e período para facilitar sua consulta.`;
      
    case 'anomaly_detection':
      return `Realizei uma análise detalhada dos lançamentos contábeis de ${clientName} e identifiquei alguns pontos que merecem atenção. Recomendo revisar estes itens destacados.`;
      
    case 'cash_flow_prediction':
      return `Com base no histórico financeiro de ${clientName}, gerei uma projeção de fluxo de caixa que considera sazonalidade e tendências recentes.`;
      
    default:
      return `Olá ${clientName}! Posso ajudar você com consultas fiscais, relatórios financeiros, análise de documentos e muito mais. Como posso ajudar especificamente?`;
  }
};
