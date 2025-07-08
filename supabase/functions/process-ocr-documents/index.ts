import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image_url, document_id, client_id } = await req.json();

    if (!image_url) {
      throw new Error('Image URL is required');
    }

    console.log('Processing OCR for image:', image_url);

    // Call OpenAI Vision API for OCR
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analise este documento fiscal/contábil e extraia TODAS as informações relevantes de forma estruturada. 
                
                Retorne um JSON com:
                {
                  "tipo_documento": "string (NFe, Recibo, Balancete, etc)",
                  "numero_documento": "string",
                  "data_emissao": "YYYY-MM-DD",
                  "valor_total": "number",
                  "fornecedor": {
                    "nome": "string",
                    "cnpj": "string"
                  },
                  "cliente": {
                    "nome": "string", 
                    "cnpj": "string"
                  },
                  "itens": [
                    {
                      "descricao": "string",
                      "quantidade": "number",
                      "valor_unitario": "number",
                      "valor_total": "number"
                    }
                  ],
                  "impostos": {
                    "icms": "number",
                    "ipi": "number",
                    "pis": "number",
                    "cofins": "number"
                  },
                  "observacoes": "string",
                  "confianca": "number (0-1)"
                }`
              },
              {
                type: 'image_url',
                image_url: {
                  url: image_url
                }
              }
            ]
          }
        ],
        max_tokens: 2000,
        temperature: 0.1
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${errorText}`);
    }

    const openaiResult = await openaiResponse.json();
    const extractedText = openaiResult.choices[0].message.content;
    
    console.log('OCR extracted text:', extractedText);

    // Try to parse JSON from the response
    let parsedData;
    try {
      // Clean up the response to extract JSON
      const jsonMatch = extractedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      } else {
        parsedData = { raw_text: extractedText, confianca: 0.8 };
      }
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      parsedData = { raw_text: extractedText, confianca: 0.6 };
    }

    // Save OCR results to database if document_id provided
    if (document_id) {
      const { error: updateError } = await supabase
        .from('client_documents')
        .update({
          status: 'processado',
          updated_at: new Date().toISOString()
        })
        .eq('id', document_id);

      if (updateError) {
        console.error('Error updating document:', updateError);
      }
    }

    // Log processing for analytics
    const { error: logError } = await supabase
      .from('automation_logs')
      .insert({
        process_type: 'ocr_processing',
        client_id: client_id || null,
        status: 'completed',
        records_processed: 1,
        metadata: {
          document_id,
          confidence: parsedData.confianca || 0.8,
          extracted_fields: Object.keys(parsedData).length
        }
      });

    if (logError) {
      console.error('Error logging process:', logError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        extracted_data: parsedData,
        confidence: parsedData.confianca || 0.8,
        processing_time: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('OCR processing error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        details: 'Erro no processamento OCR'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});