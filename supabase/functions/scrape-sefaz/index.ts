import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const start = Date.now();
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { clientId, uf = "SP" } = await req.json();
    if (!clientId) {
      return new Response(JSON.stringify({ error: "clientId obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verificar se o cliente existe
    const { data: client, error: clientErr } = await admin
      .from("accounting_clients")
      .select("id, name, cnpj")
      .eq("id", clientId)
      .single();
    if (clientErr || !client) {
      return new Response(JSON.stringify({ error: "Cliente não encontrado" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Criar log de automação (início)
    const { data: logRow, error: logErr } = await admin
      .from("automation_logs")
      .insert({
        process_type: "sefaz_scrape",
        client_id: clientId,
        status: "running",
        metadata: { uf },
        started_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (logErr) throw logErr;

    // Simular coleta para demonstração (substituir por integração real quando disponível)
    const now = new Date();
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    const recordsCount = Math.max(1, Math.floor(Math.random() * 3) + 1);
    const items = Array.from({ length: recordsCount }).map((_, i) => {
      const venc = new Date(now.getTime() + (i + 1) * 86400000);
      return {
        client_id: clientId,
        competencia: `${pad(now.getMonth() + 1)}/${now.getFullYear()}`,
        numero_guia: `${uf}-${now.getTime()}-${i + 1}`,
        valor: (Math.random() * 1000 + 100).toFixed(2),
        data_vencimento: `${pad(venc.getDate())}/${pad(venc.getMonth() + 1)}/${venc.getFullYear()}`,
        status: "pendente",
      };
    });

    const { error: insertErr } = await admin.from("sefaz_sp_scrapes").insert(items);
    if (insertErr) throw insertErr;

    const duration = Math.round((Date.now() - start) / 1000);
    await admin
      .from("automation_logs")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        duration_seconds: duration,
        records_processed: recordsCount,
        metadata: { uf, recordsCount },
      })
      .eq("id", logRow.id);

    return new Response(
      JSON.stringify({ success: true, recordsInserted: recordsCount }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("scrape-sefaz error:", error);
    const duration = Math.round((Date.now() - start) / 1000);

    try {
      await admin
        .from("automation_logs")
        .insert({
          process_type: "sefaz_scrape",
          status: "failed",
          error_details: { message: String(error) },
          duration_seconds: duration,
          metadata: { retry_suggested_in_minutes: 15 },
        });
    } catch (_) {}

    return new Response(JSON.stringify({ error: "Falha na coleta SEFAZ" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
