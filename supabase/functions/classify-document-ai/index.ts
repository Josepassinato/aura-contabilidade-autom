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
    const { documentUrl, documentName, documentType } = await req.json();

    // Chamar OpenAI para classificar o documento
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
            content: `Você é um assistente especializado em classificação de documentos contábeis. 
            Analise o documento e retorne a classificação em formato JSON com:
            - category: categoria do documento (ex: "Nota Fiscal", "Recibo", "Contrato", "Relatório Financeiro")
            - confidence: nível de confiança (0.0 a 1.0)
            - tags: array de tags descritivas
            - suggested_actions: array de ações sugeridas
            
            Baseie sua análise no nome do arquivo e tipo. Para análise mais precisa, seria necessário o conteúdo do documento.`
          },
          {
            role: 'user',
            content: `Classifique este documento:
            Nome: ${documentName}
            Tipo: ${documentType}
            URL: ${documentUrl}`
          }
        ],
        temperature: 0.3,
      }),
    });

    const aiResponse = await response.json();
    
    let classification;
    try {
      // Tentar parsear a resposta como JSON
      classification = JSON.parse(aiResponse.choices[0].message.content);
    } catch {
      // Se não conseguir parsear, usar classificação padrão baseada no nome
      classification = getDefaultClassification(documentName, documentType);
    }

    return new Response(JSON.stringify({ classification }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in classify-document-ai function:', error);
    
    // Retornar classificação padrão em caso de erro
    const { documentName, documentType } = await req.json().catch(() => ({ documentName: '', documentType: '' }));
    const classification = getDefaultClassification(documentName, documentType);
    
    return new Response(JSON.stringify({ classification }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

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