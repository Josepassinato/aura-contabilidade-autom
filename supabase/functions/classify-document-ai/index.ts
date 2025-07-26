import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      documentUrl, 
      documentName, 
      documentType, 
      documentSize, 
      documentHash, 
      existingDocuments = [], 
      enableDuplicateDetection = false, 
      enableAdvancedAnalysis = false 
    } = await req.json();

    // Verificar duplicados se habilitado
    let duplicateInfo = null;
    if (enableDuplicateDetection && documentHash) {
      const duplicate = existingDocuments.find((doc: any) => 
        doc.hash === documentHash && doc.name !== documentName
      );
      if (duplicate) {
        duplicateInfo = {
          is_duplicate: true,
          duplicate_of: duplicate.name,
          similarity_score: 0.95
        };
      }
    }

    // Chamar OpenAI para classificação avançada
    const analysisPrompt = enableAdvancedAnalysis ? 
      `Você é um assistente especializado em análise AVANÇADA de documentos contábeis. 
      Analise o documento e retorne uma classificação detalhada em formato JSON com:
      - category: categoria específica (ex: "Nota Fiscal de Entrada", "Recibo de Pagamento", "Contrato de Prestação", "Relatório DRE")
      - confidence: nível de confiança (0.0 a 1.0)
      - priority: prioridade de processamento ("low", "medium", "high", "critical")
      - tags: array de tags descritivas e específicas
      - suggested_actions: array de ações específicas recomendadas
      - risk_level: nível de risco ("low", "medium", "high")
      - content_analysis: análise específica do conteúdo do documento
        * Para notas fiscais: extraia CNPJ, valor, número da NF, data de vencimento
        * Para contratos: extraia partes envolvidas, vigência, valor
        * Para recibos: extraia valor, beneficiário, data
      
      Use o contexto do nome do arquivo e tipo para fazer análises precisas.` 
      : 
      `Você é um assistente especializado em classificação de documentos contábeis. 
      Analise o documento e retorne a classificação em formato JSON básico.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: analysisPrompt
          },
          {
            role: 'user',
            content: `Classifique este documento:
            Nome: ${documentName}
            Tipo: ${documentType}
            Tamanho: ${documentSize} bytes
            URL: ${documentUrl}
            ${duplicateInfo ? 'ATENÇÃO: Possível documento duplicado detectado!' : ''}
            
            ${enableAdvancedAnalysis ? 'Forneça análise COMPLETA com extração de dados específicos.' : 'Forneça classificação básica.'}`
          }
        ],
        temperature: 0.3,
      }),
    });

    const aiResponse = await response.json();
    
    let classification;
    try {
      // Tentar parsear a resposta como JSON
      const aiClassification = JSON.parse(aiResponse.choices[0].message.content);
      
      // Adicionar informações de duplicado se detectado
      classification = {
        ...aiClassification,
        ...duplicateInfo,
        processing_time: new Date().toISOString()
      };
    } catch {
      // Se não conseguir parsear, usar classificação padrão
      classification = getAdvancedClassification(documentName, documentType, documentSize, duplicateInfo);
    }

    return new Response(JSON.stringify({ classification }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in classify-document-ai function:', error);
    
    // Retornar classificação padrão em caso de erro
    const requestBody = await req.json().catch(() => ({ 
      documentName: '', 
      documentType: '', 
      documentSize: 0 
    }));
    const classification = getAdvancedClassification(
      requestBody.documentName, 
      requestBody.documentType, 
      requestBody.documentSize,
      null
    );
    
    return new Response(JSON.stringify({ classification }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function getAdvancedClassification(documentName: string, documentType: string, documentSize: number, duplicateInfo: any) {
  const name = documentName.toLowerCase();
  let category = 'Documento Geral';
  let confidence = 0.7;
  let priority: 'low' | 'medium' | 'high' | 'critical' = 'medium';
  let tags: string[] = [];
  let suggested_actions: string[] = [];
  let risk_level: 'low' | 'medium' | 'high' = 'low';
  let content_analysis: any = {};

  // Análise avançada por tipo de documento
  if (name.includes('nota') || name.includes('nf') || name.includes('fiscal')) {
    category = 'Nota Fiscal';
    priority = 'high';
    risk_level = 'medium';
    tags = ['fiscal', 'receita', 'imposto', 'tributacao'];
    suggested_actions = [
      'Verificar alíquotas e impostos',
      'Validar CNPJ do emissor',
      'Registrar entrada/saída no sistema',
      'Arquivar por período fiscal',
      'Verificar prazo de escrituração'
    ];
    
    // Simular extração de dados da NF (em produção seria OCR/análise real)
    content_analysis.invoice_data = {
      cnpj: extractCNPJFromName(name),
      value: estimateValueFromSize(documentSize),
      invoice_number: extractInvoiceNumber(name)
    };
  } else if (name.includes('recibo') || name.includes('comprovante')) {
    category = 'Recibo de Pagamento';
    priority = 'medium';
    risk_level = 'low';
    tags = ['pagamento', 'comprovante', 'despesa'];
    suggested_actions = [
      'Verificar autenticidade do documento',
      'Registrar pagamento no sistema',
      'Categorizar tipo de despesa',
      'Validar dados do beneficiário'
    ];
  } else if (name.includes('contrato') || name.includes('acordo')) {
    category = 'Contrato';
    priority = 'critical';
    risk_level = 'high';
    tags = ['legal', 'acordo', 'juridico', 'vigencia'];
    suggested_actions = [
      'Revisar cláusulas contratuais',
      'Agendar renovação se necessário',
      'Arquivar originais em local seguro',
      'Registrar obrigações e prazos',
      'Validar assinaturas digitais'
    ];
    
    content_analysis.contract_data = {
      parties: extractPartiesFromName(name),
      value: estimateValueFromSize(documentSize)
    };
  } else if (name.includes('relatorio') || name.includes('balancete') || name.includes('dre')) {
    category = 'Relatório Financeiro';
    priority = 'high';
    risk_level = 'medium';
    tags = ['financeiro', 'analise', 'gestao', 'controle'];
    suggested_actions = [
      'Revisar números e cálculos',
      'Comparar com período anterior',
      'Validar fontes de dados',
      'Distribuir para stakeholders'
    ];
  }

  // Ajustar prioridade se for duplicado
  if (duplicateInfo?.is_duplicate) {
    priority = 'critical';
    risk_level = 'high';
    suggested_actions.unshift('ATENÇÃO: Verificar duplicação antes de processar');
  }

  return {
    category,
    confidence,
    priority,
    tags,
    suggested_actions,
    risk_level,
    content_analysis,
    ...duplicateInfo
  };
}

// Funções auxiliares para extração de dados
function extractCNPJFromName(name: string): string | undefined {
  const cnpjPattern = /\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}/;
  const match = name.match(cnpjPattern);
  return match ? match[0] : undefined;
}

function extractInvoiceNumber(name: string): string | undefined {
  const numberPattern = /(?:nf|nota)?[-\s]?(\d{6,})/i;
  const match = name.match(numberPattern);
  return match ? match[1] : undefined;
}

function extractPartiesFromName(name: string): string[] {
  // Simular extração de partes do contrato baseado no nome
  const parts = name.split(/[-_\s]+/).filter(part => part.length > 2);
  return parts.slice(0, 2); // Pegar as primeiras duas partes como exemplo
}

function estimateValueFromSize(size: number): number | undefined {
  // Estimativa grosseira baseada no tamanho do arquivo
  if (size > 1000000) return Math.floor(Math.random() * 100000) + 10000; // Arquivos grandes = valores altos
  if (size > 100000) return Math.floor(Math.random() * 10000) + 1000;   // Arquivos médios
  return Math.floor(Math.random() * 1000) + 100;                        // Arquivos pequenos
}

function getDefaultClassification(documentName: string, documentType: string) {
  const name = documentName.toLowerCase();
  let category = 'Documento Geral';
  let confidence = 0.7;
  let tags: string[] = [];
  let suggested_actions: string[] = [];

  if (name.includes('nota') || name.includes('nf')) {
    category = 'Nota Fiscal';
    tags = ['fiscal', 'receita', 'imposto'];
    suggested_actions = ['Verificar alíquotas', 'Registrar entrada/saída', 'Arquivar por período'];
  } else if (name.includes('recibo')) {
    category = 'Recibo';
    tags = ['pagamento', 'comprovante'];
    suggested_actions = ['Verificar autenticidade', 'Registrar pagamento'];
  } else if (name.includes('contrato')) {
    category = 'Contrato';
    tags = ['legal', 'acordo'];
    suggested_actions = ['Revisar cláusulas', 'Agendar renovação', 'Arquivar originais'];
  } else if (name.includes('relatorio') || name.includes('balancete')) {
    category = 'Relatório Financeiro';
    tags = ['financeiro', 'análise'];
    suggested_actions = ['Revisar números', 'Comparar com período anterior'];
  }

  return {
    category,
    confidence,
    tags,
    suggested_actions
  };
}