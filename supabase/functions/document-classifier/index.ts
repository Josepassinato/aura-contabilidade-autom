
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.20.0";

// Define CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Define document categories
const CATEGORIES = [
  "Receita",
  "Despesa", 
  "Folha de Pagamento",
  "Investimento",
  "Empréstimo",
  "Tributária",
  "Outros"
];

// Initialize OpenAI client
async function classifyDocumentWithAI(text: string): Promise<{ category: string; confidence: number }> {
  const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
  if (!openaiApiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const prompt = `
Classifique o texto abaixo em uma das categorias pré-definidas.
Categorias: ${CATEGORIES.join(", ")}.

Texto:
"""${text}"""

Retorne apenas o nome exato da categoria e a confiança (de 0 a 1) no formato JSON: 
{
  "category": "Nome da Categoria",
  "confidence": 0.95
}`;

  console.log("Sending document text to OpenAI for classification");
  
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Using a more efficient model
        messages: [
          { role: "system", content: "You are a document classification assistant that returns JSON only." },
          { role: "user", content: prompt }
        ],
        temperature: 0,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const resultContent = data.choices[0]?.message?.content;
    
    // Parse the JSON response from OpenAI
    let result;
    try {
      result = JSON.parse(resultContent);
    } catch (e) {
      // Fallback if the response isn't valid JSON
      const category = CATEGORIES.find(cat => 
        resultContent.toLowerCase().includes(cat.toLowerCase())
      ) || "Outros";
      result = { category, confidence: 0.7 };
    }

    // Validate category is in our list
    if (!CATEGORIES.includes(result.category)) {
      result.category = "Outros";
      result.confidence = 0.5;
    }

    console.log("Classification result:", result);
    return result;
  } catch (error) {
    console.error("Error classifying document:", error);
    throw error;
  }
}

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the request data
    const { documentId, content } = await req.json();

    if (!documentId || !content) {
      return new Response(
        JSON.stringify({ error: "documentId e content são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Classify the document
    console.log(`Classifying document ${documentId}`);
    const { category, confidence } = await classifyDocumentWithAI(content);

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || '';
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Save classification to database
    console.log(`Saving classification for document ${documentId}: ${category}`);
    const { error } = await supabase
      .from("document_classifications")
      .insert({
        document_id: documentId,
        category,
        confidence,
        metadata: { ai_model: "gpt-4o-mini" },
        classified_at: new Date().toISOString()
      });

    if (error) {
      console.error("Error saving classification:", error);
      throw new Error(`Failed to save classification: ${error.message}`);
    }

    // Update the document status in client_documents table
    await supabase
      .from("client_documents")
      .update({ 
        status: 'processado',
        type: category.toLowerCase().replace(' ', '-')
      })
      .eq("id", documentId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        category, 
        confidence 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in document-classifier function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Erro ao classificar documento" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
