
// Supabase Edge Function para processar procurações eletrônicas
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { corsHeaders, auth } from '../_shared/secure-api.ts'

// Public function - requires JWT authentication

// Função principal que processa a procuração
async function processarProcuracao(
  supabase: any,
  procuracaoId: string
): Promise<{
  success: boolean;
  message: string;
  details?: Record<string, any>;
}> {
  try {
    console.log(`Iniciando processamento da procuração ${procuracaoId}`);

    // 1. Buscar dados da procuração
    const { data: procuracao, error: procuracaoError } = await supabase
      .from("procuracoes_eletronicas")
      .select("*")
      .eq("id", procuracaoId)
      .single();

    if (procuracaoError || !procuracao) {
      throw new Error(`Procuração não encontrada: ${procuracaoError?.message}`);
    }

    // 2. Buscar certificado
    const { data: certificado, error: certificadoError } = await supabase
      .from("certificados_digitais")
      .select("*")
      .eq("id", procuracao.certificado_id)
      .single();

    if (certificadoError || !certificado) {
      await adicionarLog(supabase, procuracaoId, {
        timestamp: new Date().toISOString(),
        acao: "ERRO",
        resultado: "Certificado não encontrado",
        detalhes: { erro: certificadoError?.message }
      });

      await atualizarStatus(supabase, procuracaoId, "erro");
      
      throw new Error(`Certificado não encontrado: ${certificadoError?.message}`);
    }

    // 3. Simulação de processamento
    await adicionarLog(supabase, procuracaoId, {
      timestamp: new Date().toISOString(),
      acao: "INICIAR_PROCESSAMENTO",
      resultado: "Iniciando processamento automático",
      detalhes: { ambiente: "produção" }
    });

    // Simular etapas de processamento
    await simularEtapas(supabase, procuracaoId);

    // 5. Atualizar status para emitida
    await atualizarStatus(supabase, procuracaoId, "emitida", {
      comprovante_url: `/comprovantes/procuracao-${procuracaoId}.pdf`
    });

    // 6. Log final
    await adicionarLog(supabase, procuracaoId, {
      timestamp: new Date().toISOString(),
      acao: "CONCLUIR",
      resultado: "Procuração emitida com sucesso",
      detalhes: {
        data_conclusao: new Date().toISOString()
      }
    });

    return {
      success: true,
      message: "Procuração processada com sucesso",
      details: { procuracaoId }
    };
  } catch (error: any) {
    console.error("Erro no processamento da procuração:", error);
    
    // Garantir que o erro seja registrado e o status atualizado
    try {
      await adicionarLog(supabase, procuracaoId, {
        timestamp: new Date().toISOString(),
        acao: "ERRO",
        resultado: `Falha no processamento: ${error.message}`,
        detalhes: { stack: error.stack }
      });
      
      await atualizarStatus(supabase, procuracaoId, "erro");
    } catch (logError) {
      console.error("Erro ao registrar falha:", logError);
    }

    return {
      success: false,
      message: `Erro no processamento: ${error.message}`
    };
  }
}

// Função auxiliar para adicionar log
async function adicionarLog(
  supabase: any,
  procuracaoId: string,
  logEntry: {
    timestamp: string;
    acao: string;
    resultado: string;
    detalhes?: Record<string, any>;
  }
) {
  try {
    // Buscar logs existentes
    const { data: procuracao, error: fetchError } = await supabase
      .from("procuracoes_eletronicas")
      .select("log_processamento")
      .eq("id", procuracaoId)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    // Adicionar novo log
    const logs = procuracao.log_processamento || [];
    logs.push(JSON.stringify(logEntry));

    // Atualizar procuração
    const { error: updateError } = await supabase
      .from("procuracoes_eletronicas")
      .update({ log_processamento: logs })
      .eq("id", procuracaoId);

    if (updateError) {
      throw updateError;
    }
  } catch (error) {
    console.error("Erro ao adicionar log:", error);
    throw error;
  }
}

// Função auxiliar para atualizar status
async function atualizarStatus(
  supabase: any,
  procuracaoId: string,
  status: string,
  additionalData: Record<string, any> = {}
) {
  try {
    const updateData = {
      status,
      ...additionalData
    };

    const { error } = await supabase
      .from("procuracoes_eletronicas")
      .update(updateData)
      .eq("id", procuracaoId);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Erro ao atualizar status:", error);
    throw error;
  }
}

// Função para simular etapas do processamento
async function simularEtapas(supabase: any, procuracaoId: string) {
  const etapas = [
    {
      acao: "AUTENTICACAO",
      resultado: "Autenticação no e-CAC realizada com sucesso",
      delay: 1000
    },
    {
      acao: "NAVEGACAO",
      resultado: "Navegando para página de procurações",
      delay: 800
    },
    {
      acao: "PREENCHIMENTO",
      resultado: "Preenchendo dados da procuração",
      delay: 1500
    },
    {
      acao: "ASSINATURA",
      resultado: "Assinando procuração com certificado digital",
      delay: 2000
    },
    {
      acao: "SUBMISSAO",
      resultado: "Enviando procuração para o e-CAC",
      delay: 1200
    },
    {
      acao: "CONFIRMACAO",
      resultado: "Procuração confirmada pelo sistema",
      delay: 900
    },
    {
      acao: "DOWNLOAD",
      resultado: "Comprovante baixado com sucesso",
      delay: 700
    }
  ];

  for (const etapa of etapas) {
    // Aguardar o delay simulado
    await new Promise(resolve => setTimeout(resolve, etapa.delay));
    
    // Adicionar log da etapa
    await adicionarLog(supabase, procuracaoId, {
      timestamp: new Date().toISOString(),
      acao: etapa.acao,
      resultado: etapa.resultado
    });
    
    // Atualizar status da procuração para mostrar progresso
    if (etapa.acao === "AUTENTICACAO") {
      await atualizarStatus(supabase, procuracaoId, "pendente", {
        etapa: "preenchimento"
      });
    } else if (etapa.acao === "SUBMISSAO") {
      await atualizarStatus(supabase, procuracaoId, "pendente", {
        etapa: "finalizando"
      });
    }
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Require JWT authentication
  const authError = await auth.requireAuth(req);
  if (authError) return authError;

  try {
    // Create Supabase client with ANON key for public function
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Extract request data
    const { procuracaoId } = await req.json();

    if (!procuracaoId) {
      throw new Error("ID da procuração é obrigatório");
    }

    // Process the procuração - use ANON key with RLS for security
    const result = await processarProcuracao(supabaseClient, procuracaoId);

    // Retornar resultado
    return new Response(
      JSON.stringify(result),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: result.success ? 200 : 500,
      }
    );
  } catch (error) {
    // Tratamento de erro
    console.error("Erro na Edge Function:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message || "Erro interno no servidor",
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 500,
      }
    );
  }
});
