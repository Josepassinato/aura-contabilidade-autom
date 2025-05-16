
import { TemplateParams, EmailResult } from './types';
import { getEmailTemplate, processTemplate } from './templateService';
import { sendEmail } from './sendEmail';
import { toast } from "@/hooks/use-toast";

// Função para enviar email usando template
export async function sendTemplateEmail(
  templateName: string,
  params: TemplateParams,
  emailConfig: {
    to: string | string[];
    subject?: string;
    cc?: string | string[];
    bcc?: string | string[];
  }
): Promise<EmailResult> {
  try {
    // Buscar o template do banco de dados
    const template = await getEmailTemplate(templateName);
    
    if (!template) {
      throw new Error(`Template '${templateName}' não encontrado`);
    }
    
    // Aplicar parâmetros ao template
    const processedContent = processTemplate(template, params);
    
    // Configurar email
    const emailData = {
      to: emailConfig.to,
      subject: emailConfig.subject || template.subject,
      body: processedContent,
      isHtml: true,
      cc: emailConfig.cc,
      bcc: emailConfig.bcc
    };
    
    // Enviar o email
    return await sendEmail(emailData);
  } catch (error: any) {
    console.error("Erro ao enviar email com template:", error);
    
    toast({
      title: "Erro ao enviar email",
      description: error.message || "Não foi possível enviar o email com template",
      variant: "destructive"
    });
    
    return { success: false, error };
  }
}
