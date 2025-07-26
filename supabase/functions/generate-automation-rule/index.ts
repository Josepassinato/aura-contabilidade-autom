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
    const { naturalLanguageInput, context } = await req.json();

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
            content: `Você é um especialista em automação contábil. Converta descrições em linguagem natural 
            em regras de automação estruturadas. Retorne sempre um JSON válido com:
            {
              "rule": {
                "name": "nome da regra",
                "description": "descrição detalhada",
                "conditions": [
                  {
                    "field": "campo a verificar",
                    "operator": "operador (equals, contains, greater_than, etc)",
                    "value": "valor de comparação",
                    "description": "descrição da condição"
                  }
                ],
                "actions": [
                  {
                    "type": "tipo da ação (classify, notify, approve, etc)",
                    "description": "descrição da ação",
                    "parameters": {}
                  }
                ],
                "confidence": 0.8,
                "explanation": "explicação de como a regra funciona"
              }
            }`
          },
          {
            role: 'user',
            content: `Contexto: ${context}
            Descrição da regra: ${naturalLanguageInput}
            
            Crie uma regra de automação estruturada baseada nesta descrição.`
          }
        ],
        temperature: 0.3,
      }),
    });

    const aiResponse = await response.json();
    
    let result;
    try {
      result = JSON.parse(aiResponse.choices[0].message.content);
    } catch {
      // Fallback para regra padrão
      result = generateFallbackRule(naturalLanguageInput);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-automation-rule function:', error);
    
    const { naturalLanguageInput } = await req.json().catch(() => ({ naturalLanguageInput: '' }));
    const result = generateFallbackRule(naturalLanguageInput);
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateFallbackRule(input: string) {
  const inputLower = input.toLowerCase();
  
  let rule = {
    name: 'Regra Personalizada',
    description: 'Regra criada baseada na descrição fornecida',
    conditions: [
      {
        field: 'document_type',
        operator: 'contains',
        value: 'fiscal',
        description: 'Verificar se é documento fiscal'
      }
    ],
    actions: [
      {
        type: 'classify',
        description: 'Classificar documento automaticamente',
        parameters: { category: 'fiscal' }
      }
    ],
    confidence: 0.6,
    explanation: 'Regra básica gerada automaticamente'
  };

  // Personalizar baseado no input
  if (inputLower.includes('nota fiscal')) {
    rule.name = 'Processamento de Nota Fiscal';
    rule.description = 'Processa automaticamente notas fiscais';
    rule.conditions[0].value = 'nota_fiscal';
    rule.actions.push({
      type: 'notify',
      description: 'Notificar contador',
      parameters: { email: true, priority: 'medium' }
    });
  } else if (inputLower.includes('valor') && inputLower.includes('maior')) {
    rule.name = 'Validação por Valor';
    rule.description = 'Verifica transações de alto valor';
    rule.conditions = [
      {
        field: 'amount',
        operator: 'greater_than',
        value: '10000',
        description: 'Valor maior que R$ 10.000'
      }
    ];
    rule.actions = [
      {
        type: 'flag_for_review',
        description: 'Marcar para revisão manual',
        parameters: { priority: 'high' }
      }
    ];
  }

  return { rule };
}