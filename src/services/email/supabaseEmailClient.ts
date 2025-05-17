
import { supabase } from "@/lib/supabase/client";
import { EmailData, EmailResult } from './types';

// Create a client for interacting with the email Edge Function
export const createEmailFunctionClient = () => {
  return {
    sendEmail: async (emailData: EmailData): Promise<EmailResult> => {
      try {
        // Prepare the payload for the Edge Function
        const { to, subject, body, isHtml = false, cc, bcc } = emailData;
        
        const payload = {
          to: Array.isArray(to) ? to.join(', ') : to,
          subject,
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
        
        // Call the Edge Function
        const { data, error } = await supabase.functions.invoke('send-email', {
          body: payload
        });
        
        if (error) {
          throw error;
        }
        
        return { 
          success: true, 
          message: "Email sent successfully via Edge Function" 
        };
      } catch (error: any) {
        console.error("Error invoking email function:", error);
        return { 
          success: false, 
          error: error.message || "Failed to send email" 
        };
      }
    }
  };
};
