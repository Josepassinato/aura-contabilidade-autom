
import { toast } from '@/hooks/use-toast';

// Interface para solicitação de pagamento Pix
export interface PixPaymentRequest {
  clientId: string;
  pixKey: string;
  amount: string;
  description: string;
}

// Interface para resposta do pagamento Pix
export interface PixPaymentResponse {
  success: boolean;
  payment: {
    transactionId: string;
    status: string;
    initiatedAt: string;
    endToEndId: string;
  };
}

/**
 * Inicia um pagamento Pix
 */
export async function triggerPixPayment(params: PixPaymentRequest): Promise<PixPaymentResponse> {
  try {
    const res = await fetch(
      "https://watophocqlcyimirzrpe.supabase.co/functions/v1/pix-integration",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      }
    );
    
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Falha ao processar pagamento Pix");
    }
    
    const data = await res.json();
    return data as PixPaymentResponse;
  } catch (error: any) {
    console.error("Erro ao realizar pagamento Pix:", error);
    toast({
      title: "Erro no pagamento Pix",
      description: error.message || "Não foi possível processar o pagamento",
      variant: "destructive",
    });
    throw error;
  }
}

/**
 * Obtém o histórico de pagamentos Pix de um cliente
 */
export async function getClientPixPayments(clientId: string) {
  try {
    const response = await fetch(
      `https://watophocqlcyimirzrpe.supabase.co/rest/v1/pix_payments?client_id=eq.${clientId}&order=initiated_at.desc`,
      {
        headers: {
          "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhdG9waG9jcWxjeWltaXJ6cnBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5OTUyNjQsImV4cCI6MjA2MjU3MTI2NH0.aTF2XWWUhxtrrp4V08BvM5WAGQULlppgkIhXnCSLXrg",
          "Content-Type": "application/json"
        }
      }
    );
    
    if (!response.ok) {
      throw new Error("Falha ao obter histórico de pagamentos");
    }
    
    return await response.json();
  } catch (error: any) {
    console.error("Erro ao obter histórico de pagamentos Pix:", error);
    toast({
      title: "Erro ao carregar histórico",
      description: error.message || "Não foi possível carregar o histórico de pagamentos",
      variant: "destructive",
    });
    return [];
  }
}
