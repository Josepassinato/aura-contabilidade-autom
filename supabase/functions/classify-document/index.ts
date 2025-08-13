import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "OPENAI_API_KEY não configurada" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const authHeader = req.headers.get("Authorization") || "";
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id || null;

    const body = await req.json();
    const {
      documentId,
      text,
      topK = 5,
      minSimilarity = 0.5,
      feedback, // { correctedLabel?: string, notes?: string }
    } = body || {};

    if (!documentId || !text) {
      return new Response(
        JSON.stringify({ error: "documentId e text são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1) Gerar embedding com OpenAI
    const embedRes = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "text-embedding-3-small",
        input: text,
      }),
    });

    if (!embedRes.ok) {
      const errText = await embedRes.text();
      console.error("Embedding error:", errText);
      return new Response(JSON.stringify({ error: "Falha ao gerar embeddings" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const embedJson = await embedRes.json();
    const embedding: number[] = embedJson?.data?.[0]?.embedding;
    if (!embedding || !Array.isArray(embedding)) {
      return new Response(JSON.stringify({ error: "Embedding inválido" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2) Buscar vizinhos no banco via RPC
    const { data: neighbors, error: neighborsError } = await supabase.rpc(
      "match_classification_examples",
      {
        query_embedding: embedding,
        match_count: topK,
        min_similarity: minSimilarity,
      }
    );

    if (neighborsError) {
      console.error("match_classification_examples error:", neighborsError);
      return new Response(JSON.stringify({ error: "Falha ao consultar exemplos" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const matches: Array<{ id: string; label: string; text_content: string; similarity: number }>
      = neighbors || [];

    // 3) Predição simples por voto ponderado
    const labelScores = new Map<string, number>();
    for (const m of matches) {
      labelScores.set(m.label, (labelScores.get(m.label) || 0) + (m.similarity || 0));
    }
    let predictedLabel = "desconhecido";
    let bestScore = 0;
    let totalScore = 0;
    for (const [label, score] of labelScores.entries()) {
      totalScore += score;
      if (score > bestScore) {
        bestScore = score;
        predictedLabel = label;
      }
    }
    const confidence = totalScore > 0 ? bestScore / totalScore : 0;

    // 4) Registrar em document_classifications
    const { data: classificationRow, error: insertClsErr } = await supabase
      .from("document_classifications")
      .insert([
        {
          document_id: documentId,
          category: predictedLabel,
          confidence,
          metadata: {
            strategy: "knn-embeddings-v1",
            topK,
            minSimilarity,
            neighbors: matches,
          },
        },
      ])
      .select()
      .single();

    if (insertClsErr) {
      console.error("insert document_classifications error:", insertClsErr);
      return new Response(JSON.stringify({ error: "Falha ao salvar classificação" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const classificationId = classificationRow?.id || null;

    // 5) Feedback supervisionado: gravar exemplo + histórico de correção
    let feedbackApplied = false;
    if (feedback?.correctedLabel) {
      try {
        // Inserir exemplo rotulado
        const { error: exErr } = await supabase.rpc("insert_classification_example", {
          p_text: text,
          p_label: feedback.correctedLabel,
          p_embedding: embedding,
        });
        if (exErr) throw exErr;

        // Registrar correção
        const { error: corrErr } = await supabase.from("correction_history").insert([
          {
            error_classification_id: classificationId,
            corrected_by: userId,
            action_taken: "reclassified",
            old_value: predictedLabel,
            new_value: feedback.correctedLabel,
            correction_notes: feedback?.notes || null,
            metadata: { source: "feedback", applied_at: new Date().toISOString() },
          },
        ]);
        if (corrErr) throw corrErr;
        feedbackApplied = true;
      } catch (e) {
        console.error("feedback apply error:", e);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        prediction: {
          label: predictedLabel,
          confidence,
        },
        neighbors: matches,
        classificationId,
        feedbackApplied,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("classify-document error:", error);
    return new Response(JSON.stringify({ error: "Erro interno" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
