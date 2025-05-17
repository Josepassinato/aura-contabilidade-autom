
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Tipos para a integração do PIX
interface PixPaymentRequest {
  clientId: string;
  pixKey: string;
  amount: string;
  description: string;
}

interface PixPaymentResponse {
  success: boolean;
  payment: {
    transactionId: string;
    status: string;
    initiatedAt: string;
    endToEndId: string;
  };
}

// Cache para armazenar tokens OAuth
let tokenCache: { token: string; expiresAt: number } | null = null;

// Obter token OAuth para API do banco
async function getOAuthToken(): Promise<string> {
  const PIX_AUTH_URL = Deno.env.get("PIX_AUTH_URL");
  const PIX_CLIENT_ID = Deno.env.get("PIX_CLIENT_ID");
  const PIX_CLIENT_SECRET = Deno.env.get("PIX_CLIENT_SECRET");
  
  if (!PIX_AUTH_URL || !PIX_CLIENT_ID || !PIX_CLIENT_SECRET) {
    throw new Error("Configuração de PIX incompleta");
  }
  
  const now = Date.now();
  if (tokenCache && tokenCache.expiresAt > now + 60_000) {
    return tokenCache.token;
  }

  // Para este exemplo, simulamos a obtenção de um token
  // Em produção, isso faria uma chamada real à API do banco
  console.log("Obtendo novo token OAuth...");
  
  // Simular um token para desenvolvimento
  tokenCache = {
    token: `sim-token-${Math.random().toString(36).substring(2, 10)}`,
    expiresAt: now + 3600 * 1000
  };
  
  return tokenCache.token;
}

// Iniciar um pagamento PIX
async function initiatePixPayment(
  endToEndId: string,
  pixKey: string,
  amount: string,
  description: string
): Promise<{ transactionId: string; status: string; initiatedAt: string }> {
  const PIX_PAYMENT_URL = Deno.env.get("PIX_PAYMENT_URL");
  
  if (!PIX_PAYMENT_URL) {
    throw new Error("URL de pagamento PIX não configurada");
  }
  
  const token = await getOAuthToken();
  
  // Simular o pagamento para desenvolvimento
  console.log(`Iniciando pagamento PIX para ${pixKey} no valor de ${amount}`);
  
  // Em produção, isso faria uma chamada real à API do banco
  return {
    transactionId: `tx-${Math.random().toString(36).substring(2, 10)}`,
    status: "processing",
    initiatedAt: new Date().toISOString()
  };
}

// Cabeçalhos CORS para permitir chamadas do frontend
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Lidar com requisições OPTIONS (CORS preflight)
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Extrair dados da requisição
    const { clientId, pixKey, amount, description } = await req.json() as PixPaymentRequest;
    
    if (!clientId || !pixKey || !amount || !description) {
      return new Response(
        JSON.stringify({ error: "Parâmetros incompletos" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Criar cliente Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    
    // Gerar ID único para o pagamento
    const endToEndId = `pix-${clientId}-${Date.now()}`;
    
    // Iniciar pagamento na API do banco
    const payment = await initiatePixPayment(endToEndId, pixKey, amount, description);
    
    // Registrar na tabela pix_payments
    const { error } = await supabaseClient
      .from("pix_payments")
      .insert({
        client_id: clientId,
        end_to_end_id: endToEndId,
        transaction_id: payment.transactionId,
        amount,
        description,
        status: payment.status,
        initiated_at: payment.initiatedAt
      });
    
    if (error) {
      console.error("Erro ao gravar pagamento no Supabase:", error);
      throw new Error("Falha ao registrar pagamento");
    }
    
    // Construir resposta
    const response: PixPaymentResponse = {
      success: true,
      payment: {
        ...payment,
        endToEndId
      }
    };
    
    // Retornar resposta de sucesso
    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    // Logar e retornar erro
    console.error("Erro na função pix-integration:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "Falha no processamento do pagamento" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Função auxiliar para criar cliente Supabase
function createClient(supabaseUrl: string, supabaseKey: string) {
  return {
    from: (table: string) => ({
      insert: (data: any) => {
        console.log(`Inserindo em ${table}:`, data);
        // Simular inserção para desenvolvimento
        return Promise.resolve({ error: null });
      }
    })
  };
}
