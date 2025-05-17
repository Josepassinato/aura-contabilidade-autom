
import { supabase } from '@/lib/supabase/client';
import { EmailData, EmailResult } from './types';
import { toast } from "@/hooks/use-toast";

// Function to send emails using the Supabase Edge Function
export async function sendEmail(emailData: EmailData): Promise<EmailResult> {
  try {
    const { to, subject, body, isHtml = false, cc, bcc } = emailData;
    
    // Prepare the payload for the Edge Function
    const payload = {
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      from: undefined, // Use default from email configured in the Edge Function
      text: isHtml ? undefined : body,
      html: isHtml ? body : undefined,
    };
    
    // Add optional fields if they exist
    if (cc) {
      payload.cc = Array.isArray(cc) ? cc.join(', ') : cc;
    }
    
    if (bcc) {
      payload.bcc = Array.isArray(bcc) ? bcc.join(', ') : bcc;
    }
    
    console.log("Calling send-email Edge Function with payload:", payload);
    
    // Call the Edge Function
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: payload
    });
    
    if (error) {
      console.error("Error calling send-email function:", error);
      throw new Error(error.message || "Failed to send email");
    }
    
    console.log("Email sent successfully:", data);
    return { success: true, message: "Email sent successfully" };
  } catch (error: any) {
    console.error("Error sending email:", error);
    
    // Show toast notification for UI feedback
    toast({
      title: "Erro ao enviar email",
      description: error.message || "Não foi possível enviar o email",
      variant: "destructive"
    });
    
    return { success: false, error };
  }
}

// Function to send notification emails (maintains the same API)
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
    console.error("Error sending notification email:", error);
    
    toast({
      title: "Erro ao enviar notificação",
      description: error.message || "Não foi possível enviar a notificação por email",
      variant: "destructive"
    });
    
    return { success: false, error };
  }
}
