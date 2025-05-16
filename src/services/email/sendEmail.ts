
import { EmailData, EmailResult } from './types';
import { toast } from "@/hooks/use-toast";

// Função base para enviar emails
// Esta seria substituída pela integração com Supabase Edge Function
export async function sendEmail(emailData: EmailData): Promise<EmailResult> {
  try {
    console.log("Enviando email:", emailData);
    
    // Simular envio de email
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log("Email enviado com sucesso");
    
    return { success: true, message: "Email enviado com sucesso" };
  } catch (error) {
    console.error("Erro ao enviar email:", error);
    throw error;
  }
}

// Função para enviar notificações simples
export async function sendNotificationEmail(
  to: string | string[],
  subject: string,
  message: string
): Promise<EmailResult> {
  try {
    const emailData: EmailData = {
      to,
      subject,
      body: message,
      isHtml: false
    };
    
    return await sendEmail(emailData);
  } catch (error: any) {
    console.error("Erro ao enviar notificação por email:", error);
    
    toast({
      title: "Erro ao enviar notificação",
      description: error.message || "Não foi possível enviar a notificação por email",
      variant: "destructive"
    });
    
    return { success: false, error };
  }
}
