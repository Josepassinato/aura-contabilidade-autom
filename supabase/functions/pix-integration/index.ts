
// Edge Function para integração Pix
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// Inicialização do cliente Supabase
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Configurações do PSP Pix
const pixAuthUrl = Deno.env.get("PIX_AUTH_URL") || "";
const pixClientId = Deno.env.get("PIX_CLIENT_ID") || "";
const pixClientSecret = Deno.env.get("PIX_CLIENT_SECRET") || "";
const pixPaymentUrl = Deno.env.get("PIX_PAYMENT_URL") || "";

let tokenCache: { token: string; expiresAt: number } | null = null;

async function getOAuthToken(): Promise<string> {
  const now = Date.now();
  if (tokenCache && tokenCache.expiresAt > now + 60_000) {
    return tokenCache.token;
  }

  // Em um ambiente de produção real, essa chamada iria para o provedor de Pix
  // Para fins de simulação, vamos criar um token fictício
  console.log("Obtendo novo token OAuth para Pix");
  
  // Simule um atraso de rede
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  // Crie um token simulado
  const simulatedToken = `pix-${crypto.randomUUID().substring(0, 8)}`;
  tokenCache = {
    token: simulatedToken,
    expiresAt: now + 3600 * 1000
  };
  
  return simulatedToken;
}

interface PixPaymentRequest {
  clientId: string;
  pixKey: string;
  amount: string;
  description: string;
}

async function initiatePixPayment(req: PixPaymentRequest) {
  try {
    const token = await getOAuthToken();
    const endToEndId = `pix-${req.clientId}-${Date.now()}`;
    
    console.log(`Iniciando pagamento Pix: chave=${req.pixKey}, valor=${req.amount}`);
    
    // Em um ambiente real, faríamos uma chamada para o provedor Pix
    // Simulação para desenvolvimento
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const transactionId = `tx-${crypto.randomUUID().substring(0, 10)}`;
    const status = "processing";
    const initiatedAt = new Date().toISOString();
    
    // Registrar no Supabase
    const { error } = await supabase
      .from("pix_payments")
      .insert({
        client_id: req.clientId,
        end_to_end_id: endToEndId,
        transaction_id: transactionId,
        amount: req.amount,
        description: req.description,
        status: status,
        initiated_at: initiatedAt
      });

    if (error) {
      console.error("Erro ao gravar Pix no Supabase:", error);
      throw new Error("Falha ao salvar pagamento");
    }

    return {
      success: true,
      payment: {
        transactionId,
        status,
        initiatedAt,
        endToEndId
      }
    };
  } catch (err) {
    console.error("Erro ao iniciar pagamento Pix:", err);
    throw err;
  }
}

serve(async (req) => {
  try {
    // Habilitar CORS
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }
      });
    }
    
    // Verificar método
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Método não permitido" }),
        {
          status: 405,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        }
      );
    }
    
    // Processar solicitação
    const { clientId, pixKey, amount, description } = await req.json();
    
    if (!clientId || !pixKey || !amount || !description) {
      return new Response(
        JSON.stringify({ error: "Parâmetros incompletos" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        }
      );
    }
    
    const result = await initiatePixPayment({ clientId, pixKey, amount, description });
    
    return new Response(
      JSON.stringify(result),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      }
    );
    
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
    console.error("Erro na função Edge:", errorMessage);
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      }
    );
  }
});
