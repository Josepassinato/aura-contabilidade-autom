import { useState, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';

type NLPIntent = 'fiscal_query' | 'financial_report' | 'anomaly_detection' | 'tax_calculation' | 'payment' | 'unknown';

interface NLPResult {
  intent: NLPIntent;
  confidence: number;
  entities: Record<string, any>;
  originalText: string;
}

export function useNaturalLanguage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<NLPResult | null>(null);

  // Processar comando de voz/texto e identificar intenção
  const processCommand = useCallback(async (text: string): Promise<NLPResult> => {
    setIsProcessing(true);
    
    try {
      // Verificar se a API OpenAI está configurada
      const apiKey = localStorage.getItem("openai-api-key");
      if (!apiKey) {
        throw new Error("API OpenAI não configurada");
      }
      
      // Simular latência de rede/processamento 
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Análise simples baseada em palavras-chave
      const textLower = text.toLowerCase();
      let intent: NLPIntent = 'unknown';
      let confidence = 0.7;
      let entities: Record<string, any> = {};
      
      // Verificar intenções baseadas em palavras-chave (em produção, usaria um modelo real)
      if (textLower.includes('obrigação') || textLower.includes('fiscal') || textLower.includes('tribut') || textLower.includes('imposto')) {
        intent = 'fiscal_query';
        confidence = 0.85;
        
        // Extrair possíveis entidades (ex: período)
        if (textLower.includes('mês') || textLower.includes('mes')) {
          entities.period = 'month';
        } else if (textLower.includes('ano')) {
          entities.period = 'year';
        }
      } 
      else if (textLower.includes('relatório') || textLower.includes('balanço') || textLower.includes('dre') || 
               textLower.includes('demonstração') || textLower.includes('financeiro')) {
        intent = 'financial_report';
        confidence = 0.9;
        
        // Identificar tipo de relatório
        if (textLower.includes('balanço')) {
          entities.reportType = 'balance_sheet';
        } else if (textLower.includes('dre') || textLower.includes('resultado')) {
          entities.reportType = 'income_statement';
        } else if (textLower.includes('fluxo') && textLower.includes('caixa')) {
          entities.reportType = 'cash_flow';
        }
      }
      else if (textLower.includes('anomalia') || textLower.includes('inconsistência') || 
               textLower.includes('irregular') || textLower.includes('estranho') || 
               textLower.includes('suspeito')) {
        intent = 'anomaly_detection';
        confidence = 0.82;
      }
      else if (textLower.includes('calcular') || textLower.includes('cálculo') || 
               textLower.includes('simular') || textLower.includes('simulação')) {
        intent = 'tax_calculation';
        confidence = 0.88;
        
        // Identificar tipo de imposto
        if (textLower.includes('irpj') || textLower.includes('imposto de renda')) {
          entities.taxType = 'irpj';
        } else if (textLower.includes('csll')) {
          entities.taxType = 'csll';
        } else if (textLower.includes('pis') || textLower.includes('cofins')) {
          entities.taxType = 'pis_cofins';
        } else if (textLower.includes('icms')) {
          entities.taxType = 'icms';
        } else if (textLower.includes('iss')) {
          entities.taxType = 'iss';
        }
      }
      else if (textLower.includes('pagar') || textLower.includes('pagamento') || 
               textLower.includes('transferência') || textLower.includes('transferir')) {
        intent = 'payment';
        confidence = 0.8;
        
        // Verificar se menciona valor
        const valueMatch = text.match(/R\$\s*(\d+[.,]\d+)/);
        if (valueMatch) {
          entities.amount = parseFloat(valueMatch[1].replace(',', '.'));
        }
      }
      
      const result: NLPResult = {
        intent,
        confidence,
        entities,
        originalText: text
      };
      
      setLastResult(result);
      return result;
      
    } catch (error) {
      console.error('Erro ao processar comando:', error);
      toast({
        title: "Erro de processamento",
        description: "Não foi possível processar o comando. Tente novamente.",
        variant: "destructive"
      });
      
      return {
        intent: 'unknown',
        confidence: 0,
        entities: {},
        originalText: text
      };
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Função para gerar respostas naturais baseadas na intenção identificada
  const generateResponse = useCallback((result: NLPResult, clientName?: string): string => {
    const clientPrefix = clientName ? `${clientName}, ` : '';
    
    switch (result.intent) {
      case 'fiscal_query':
        return `${clientPrefix}encontrei as seguintes obrigações fiscais ${
          result.entities.period === 'month' ? 'para este mês' : 
          result.entities.period === 'year' ? 'para este ano' : 'pendentes'
        }: DARF PIS/COFINS com vencimento em 25/05, DARF IRPJ com vencimento em 30/05, e GFIP com vencimento em 20/05.`;
        
      case 'financial_report':
        if (result.entities.reportType === 'balance_sheet') {
          return `${clientPrefix}aqui está o balanço patrimonial atualizado. O total de ativos é R$ 1.452.780,45 e o patrimônio líquido é de R$ 876.320,18.`;
        } else if (result.entities.reportType === 'income_statement') {
          return `${clientPrefix}a demonstração de resultado apresenta receita total de R$ 564.890,32, com lucro líquido de R$ 98.745,61, representando crescimento de 12% em relação ao período anterior.`;
        } else if (result.entities.reportType === 'cash_flow') {
          return `${clientPrefix}o fluxo de caixa operacional está em R$ 125.780,43, com previsão de aumento de 8% para o próximo trimestre segundo nossa análise preditiva.`;
        }
        return `${clientPrefix}estou preparando o relatório financeiro solicitado. Posso detalhar alguma informação específica?`;
        
      case 'anomaly_detection':
        return `${clientPrefix}nossa análise detectou 3 possíveis anomalias nas transações recentes: (1) despesa com consultoria 184% acima da média histórica; (2) recebimento duplicado de cliente Empresa XYZ; (3) possível erro de classificação em lançamento de R$ 45.780,00 como despesa operacional.`;
        
      case 'tax_calculation':
        if (result.entities.taxType) {
          return `${clientPrefix}realizei o cálculo de ${result.entities.taxType.toUpperCase()}. Considerando a base de cálculo atual e projeções, o valor estimado é R$ 37.892,46, o que representa uma economia de 8.2% em relação ao regime atual.`;
        }
        return `${clientPrefix}posso simular diferentes cenários de tributação baseados nos dados financeiros atuais. Qual simulação específica você deseja?`;
        
      case 'payment':
        if (result.entities.amount) {
          return `${clientPrefix}preparei a ordem de pagamento no valor de R$ ${result.entities.amount.toFixed(2)}. Precisamos da sua autorização para prosseguir com a transação.`;
        }
        return `${clientPrefix}posso ajudar a preparar o pagamento. Por favor, confirme o valor e o destinatário.`;
        
      case 'unknown':
      default:
        return `${clientPrefix}não entendi completamente sua solicitação. Posso ajudar com informações fiscais, relatórios financeiros, detecção de anomalias, cálculos tributários ou pagamentos. Como posso ajudar?`;
    }
  }, []);
  
  return {
    processCommand,
    generateResponse,
    isProcessing,
    lastResult
  };
}
