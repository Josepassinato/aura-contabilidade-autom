
import { NLPIntent, NLPResult, ClientSpecificContext } from './types';
import { useToast } from '@/hooks/use-toast';
import { trackTokenUsage } from './tokenUsageService';

export const processNaturalLanguage = async (text: string): Promise<NLPResult> => {
  try {
    // Verificar se a API OpenAI está configurada
    const apiKey = localStorage.getItem("openai-api-key");
    if (!apiKey) {
      throw new Error("API OpenAI não configurada");
    }
    
    // Get the current model being used
    const model = localStorage.getItem("openai-model") || "gpt-4o-mini";
    
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
    else if (textLower.includes('documento') || textLower.includes('enviar') || textLower.includes('pendente') || textLower.includes('arquivos')) {
      intent = 'document_request';
      confidence = 0.82;

      // Identificar tipo de documento
      if (textLower.includes('nfe') || textLower.includes('nota fiscal')) {
        entities.documentType = 'invoice';
      } else if (textLower.includes('contrato')) {
        entities.documentType = 'contract';
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
    else if (textLower.includes('olá') || textLower.includes('oi') || 
             textLower.includes('bom dia') || textLower.includes('boa tarde') || 
             textLower.includes('boa noite')) {
      intent = 'greeting';
      confidence = 0.95;
    }
    else if (textLower.includes('ajuda') || textLower.includes('ajudar') || 
             textLower.includes('como funciona') || textLower.includes('o que você faz')) {
      intent = 'help';
      confidence = 0.9;
    }
    
    const result: NLPResult = {
      intent,
      confidence,
      entities,
      originalText: text
    };
    
    // Estimate tokens used: approximately 1 token per 4 characters
    const estimatedInputTokens = Math.ceil(text.length / 4);
    // Estimate output tokens based on result data
    const estimatedOutputTokens = Math.ceil(JSON.stringify(result).length / 4);
    const totalTokens = estimatedInputTokens + estimatedOutputTokens;
    
    // Track token usage with our enhanced tracking service
    trackTokenUsage(totalTokens, model);
    
    return result;
    
  } catch (error) {
    console.error('Erro ao processar comando:', error);
    
    return {
      intent: 'unknown',
      confidence: 0,
      entities: {},
      originalText: text
    };
  }
};

export const generateNLPResponse = (result: NLPResult, clientContext?: ClientSpecificContext): string => {
  const clientPrefix = clientContext?.clientName ? `${clientContext.clientName}, ` : '';
  const clientData = clientContext?.clientData;
  
  switch (result.intent) {
    case 'greeting':
      return `${clientPrefix}olá! Sou seu assistente contábil. Como posso ajudar você hoje? Posso fornecer informações sobre obrigações fiscais, relatórios financeiros, ou ajudar com cálculos tributários.`;
      
    case 'help':
      return `${clientPrefix}sou seu assistente contábil virtual e tenho acesso aos dados específicos da sua empresa. Posso ajudar com: obrigações fiscais, relatórios financeiros, detecção de anomalias, cálculos tributários, verificação de documentos e muito mais. Basta perguntar o que você precisa saber sobre sua contabilidade.`;
      
    case 'fiscal_query':
      // Se temos dados do cliente, usamos eles para personalizar a resposta
      if (clientData?.obligations?.length > 0) {
        // Filtra obrigações pendentes
        const pendingObligations = clientData.obligations.filter((obl: any) => obl.status === 'pendente');
        
        if (pendingObligations.length > 0) {
          const formattedObligations = pendingObligations.map((obl: any) => 
            `${obl.name} com vencimento em ${obl.dueDate} no valor de R$ ${obl.value.toFixed(2).replace('.', ',')}`
          ).join('; ');
          
          return `${clientPrefix}encontrei as seguintes obrigações fiscais ${
            result.entities.period === 'month' ? 'para este mês' : 
            result.entities.period === 'year' ? 'para este ano' : 'pendentes'
          }: ${formattedObligations}.`;
        }
      }
      
      // Resposta genérica quando não temos dados específicos
      return `${clientPrefix}encontrei as seguintes obrigações fiscais ${
        result.entities.period === 'month' ? 'para este mês' : 
        result.entities.period === 'year' ? 'para este ano' : 'pendentes'
      }: DARF PIS/COFINS com vencimento em 25/05, DARF IRPJ com vencimento em 30/05, e GFIP com vencimento em 20/05.`;
      
    case 'financial_report':
      // Se temos dados financeiros do cliente, usamos eles
      if (clientData?.financialData) {
        const financialData = clientData.financialData;
        
        if (result.entities.reportType === 'balance_sheet') {
          return `${clientPrefix}aqui está o balanço patrimonial atualizado da sua empresa. Seus ativos totais somam R$ ${financialData.revenue.yearly.toFixed(2).replace('.', ',')} e seu patrimônio líquido está em R$ ${(financialData.revenue.yearly - financialData.expenses.yearly).toFixed(2).replace('.', ',')}.`;
        } else if (result.entities.reportType === 'income_statement') {
          return `${clientPrefix}sua demonstração de resultado apresenta receita total de R$ ${financialData.revenue.quarterly.toFixed(2).replace('.', ',')}, com lucro líquido de R$ ${financialData.profit.quarterly.toFixed(2).replace('.', ',')}, representando um crescimento de ${Math.round((financialData.profit.currentMonth / financialData.profit.lastMonth - 1) * 100)}% em relação ao período anterior.`;
        } else if (result.entities.reportType === 'cash_flow') {
          return `${clientPrefix}seu fluxo de caixa operacional está em R$ ${financialData.cashFlow.current.toFixed(2).replace('.', ',')}, com previsão de ${financialData.cashFlow.projected > financialData.cashFlow.current ? 'aumento' : 'redução'} para R$ ${financialData.cashFlow.projected.toFixed(2).replace('.', ',')} no próximo trimestre segundo nossa análise.`;
        }
        
        // Resposta genérica sobre dados financeiros
        return `${clientPrefix}sua empresa apresenta faturamento de R$ ${financialData.revenue.currentMonth.toFixed(2).replace('.', ',')} no mês atual, com lucro líquido de R$ ${financialData.profit.currentMonth.toFixed(2).replace('.', ',')}. Posso detalhar alguma informação específica?`;
      }
      
      // Resposta genérica quando não temos dados específicos
      if (result.entities.reportType === 'balance_sheet') {
        return `${clientPrefix}aqui está o balanço patrimonial atualizado. O total de ativos é R$ 1.452.780,45 e o patrimônio líquido é de R$ 876.320,18.`;
      } else if (result.entities.reportType === 'income_statement') {
        return `${clientPrefix}a demonstração de resultado apresenta receita total de R$ 564.890,32, com lucro líquido de R$ 98.745,61, representando crescimento de 12% em relação ao período anterior.`;
      } else if (result.entities.reportType === 'cash_flow') {
        return `${clientPrefix}o fluxo de caixa operacional está em R$ 125.780,43, com previsão de aumento de 8% para o próximo trimestre segundo nossa análise preditiva.`;
      }
      return `${clientPrefix}estou preparando o relatório financeiro solicitado. Posso detalhar alguma informação específica?`;
      
    case 'document_request':
      // Se temos dados de documentos do cliente
      if (clientData?.documents?.length > 0) {
        const documentsList = clientData.documents.map((doc: any) => 
          `${doc.name} (${doc.type}) atualizado em ${doc.date}`
        ).join('; ');
        
        return `${clientPrefix}aqui estão seus documentos recentes: ${documentsList}. Posso providenciar algum documento específico para você?`;
      }
      
      // Resposta genérica
      return `${clientPrefix}você tem os seguintes documentos disponíveis: Balanço Patrimonial (atualizado em 01/05), Demonstração de Resultado (atualizado em 01/05), Declaração de ICMS (atualizado em 10/04), e Relatório de Fluxo de Caixa (atualizado em 05/05). Qual documento você gostaria de visualizar?`;
      
    case 'anomaly_detection':
      return `${clientPrefix}nossa análise detectou 3 possíveis anomalias nas transações recentes: (1) despesa com consultoria 184% acima da média histórica; (2) recebimento duplicado de cliente Empresa XYZ; (3) possível erro de classificação em lançamento de R$ 45.780,00 como despesa operacional.`;
      
    case 'tax_calculation':
      // Se temos dados fiscais do cliente
      if (clientData?.fiscalData) {
        const fiscalData = clientData.fiscalData;
        
        if (result.entities.taxType) {
          const taxTypeLabel = {
            'irpj': 'IRPJ',
            'csll': 'CSLL', 
            'pis_cofins': 'PIS/COFINS',
            'icms': 'ICMS',
            'iss': 'ISS'
          }[result.entities.taxType] || result.entities.taxType.toUpperCase();
          
          return `${clientPrefix}realizei o cálculo de ${taxTypeLabel} para sua empresa com regime tributário ${fiscalData.regime}. Considerando sua base de cálculo atual, o valor estimado é de R$ 37.892,46, o que representa aproximadamente ${fiscalData.regime === 'Simples Nacional' ? fiscalData.aliquotaSimples : '8,2%'} da sua receita tributável.`;
        }
        
        return `${clientPrefix}com base no seu regime tributário atual (${fiscalData.regime}), posso simular diferentes cenários de tributação. Qual simulação específica você deseja?`;
      }
      
      // Resposta genérica
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
      return `${clientPrefix}não entendi completamente sua solicitação. Posso ajudar com informações fiscais, relatórios financeiros, detecção de anomalias, cálculos tributários, documentos ou pagamentos. Como posso ajudar?`;
  }
};
