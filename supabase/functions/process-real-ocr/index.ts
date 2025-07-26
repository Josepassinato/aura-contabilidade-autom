import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image_url, document_id, client_id, ocr_provider = 'openai' } = await req.json();

    if (!image_url) {
      return new Response(
        JSON.stringify({ error: 'URL da imagem é obrigatória' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Iniciando OCR real para documento ${document_id} usando ${ocr_provider}`);

    let extractedData;
    let confidence = 0;

    if (ocr_provider === 'openai' && openaiApiKey) {
      extractedData = await processWithOpenAI(image_url);
      confidence = 0.9; // OpenAI Vision tem alta confiabilidade
    } else {
      // Fallback para método local ou erro
      return new Response(
        JSON.stringify({ error: 'Provedor OCR não configurado' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Salvar dados extraídos
    if (document_id) {
      const { error: updateError } = await supabase
        .from('client_documents')
        .update({
          status: 'processado',
          processed_data: extractedData,
          confidence_score: confidence,
          processed_at: new Date().toISOString()
        })
        .eq('id', document_id);

      if (updateError) {
        console.error('Erro ao atualizar documento:', updateError);
      }
    }

    // Log da operação
    await supabase.from('automation_logs').insert({
      client_id,
      process_type: 'real_ocr_processing',
      status: 'completed',
      metadata: {
        document_id,
        provider: ocr_provider,
        confidence,
        extracted_fields: Object.keys(extractedData).length
      },
      completed_at: new Date().toISOString()
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: extractedData,
        confidence,
        provider: ocr_provider
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro no OCR real:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function processWithOpenAI(imageUrl: string) {
  const prompt = `
Analise esta imagem de documento fiscal/contábil brasileiro e extraia as seguintes informações em formato JSON estruturado:

{
  "tipo_documento": "string (nota fiscal, recibo, fatura, etc.)",
  "numero_documento": "string",
  "data_emissao": "YYYY-MM-DD",
  "data_vencimento": "YYYY-MM-DD",
  "emissor": {
    "nome": "string",
    "cnpj": "string",
    "endereco": "string"
  },
  "destinatario": {
    "nome": "string",
    "cnpj": "string",
    "endereco": "string"
  },
  "valores": {
    "valor_total": "number",
    "valor_liquido": "number",
    "base_calculo_icms": "number",
    "valor_icms": "number",
    "base_calculo_ipi": "number",
    "valor_ipi": "number",
    "valor_pis": "number",
    "valor_cofins": "number",
    "valor_iss": "number"
  },
  "itens": [
    {
      "descricao": "string",
      "quantidade": "number",
      "valor_unitario": "number",
      "valor_total": "number",
      "ncm": "string",
      "cfop": "string"
    }
  ],
  "observacoes": "string",
  "chave_acesso": "string"
}

Seja preciso na extração dos valores numéricos e datas. Se algum campo não estiver visível, use null.
`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: imageUrl } }
          ]
        }
      ],
      max_tokens: 2000,
      temperature: 0.1
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const result = await response.json();
  const content = result.choices[0].message.content;
  
  try {
    // Extrair JSON do conteúdo
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('JSON não encontrado na resposta');
  } catch (parseError) {
    console.error('Erro ao fazer parse do JSON:', parseError);
    // Retornar estrutura básica com o texto bruto
    return {
      tipo_documento: "documento_fiscal",
      raw_text: content,
      valores: { valor_total: null },
      observacoes: "Erro no parsing automático - texto bruto disponível"
    };
  }
}