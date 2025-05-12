
import { toast } from '@/hooks/use-toast';

/**
 * Interface for email options
 */
export interface EmailOptions {
  to: string | string[];
  subject: string;
  body: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    name: string;
    content: Blob | string;
    contentType?: string;
  }>;
  isHtml?: boolean;
}

/**
 * Interface for email template data
 */
export interface EmailTemplateData {
  [key: string]: any;
}

/**
 * Interface for email service response
 */
export interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send an email using the provided options
 * Note: In a real application, this would connect to an email service API
 */
export const sendEmail = async (options: EmailOptions): Promise<EmailResponse> => {
  try {
    console.log('Sending email:', options);
    
    // In a production environment, this would call an actual email service API
    // like SendGrid, AWS SES, or a backend API endpoint
    
    // Simulate API call with a delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate successful response
    const response: EmailResponse = {
      success: true,
      messageId: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`
    };
    
    toast({
      title: "Email enviado",
      description: `Email enviado com sucesso para ${Array.isArray(options.to) ? options.to.join(', ') : options.to}`,
    });
    
    return response;
    
  } catch (error: any) {
    console.error('Erro ao enviar email:', error);
    
    const errorResponse: EmailResponse = {
      success: false,
      error: error.message || 'Erro ao enviar email'
    };
    
    toast({
      title: "Falha no envio",
      description: errorResponse.error,
      variant: "destructive"
    });
    
    return errorResponse;
  }
};

/**
 * Format a simple text email template with variable substitution
 */
export const formatEmailTemplate = (
  template: string, 
  data: EmailTemplateData
): string => {
  let formattedTemplate = template;
  
  // Replace all variables in the template
  Object.entries(data).forEach(([key, value]) => {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    formattedTemplate = formattedTemplate.replace(regex, value?.toString() || '');
  });
  
  return formattedTemplate;
};

/**
 * Send an email using a template
 */
export const sendTemplateEmail = async (
  templateId: string, 
  data: EmailTemplateData, 
  options: Omit<EmailOptions, 'body'>
): Promise<EmailResponse> => {
  try {
    // In a real implementation, you would fetch the template from a database
    // or a template storage service based on the templateId
    
    // For this example, we'll use a simple switch statement with hardcoded templates
    let templateContent = '';
    
    switch (templateId) {
      case 'welcome':
        templateContent = `
          <h1>Bem-vindo(a), {{nome}}!</h1>
          <p>É com grande satisfação que recebemos você em nosso sistema de contabilidade digital.</p>
          <p>Seus dados de acesso:</p>
          <ul>
            <li>Usuário: {{email}}</li>
            <li>Data de registro: {{dataRegistro}}</li>
          </ul>
          <p>Se tiver qualquer dúvida, estamos à disposição.</p>
          <p>Atenciosamente,<br>Equipe Contaflix</p>
        `;
        break;
        
      case 'relatorio':
        templateContent = `
          <h1>Relatório {{tipoRelatorio}}</h1>
          <p>Prezado(a) {{nome}},</p>
          <p>Segue em anexo o relatório {{tipoRelatorio}} conforme solicitado.</p>
          <p>Período: {{periodoInicio}} a {{periodoFim}}</p>
          <p>Atenciosamente,<br>Equipe Contaflix</p>
        `;
        break;
        
      case 'alerta':
        templateContent = `
          <h1>Alerta: {{tipoAlerta}}</h1>
          <p>Prezado(a) {{nome}},</p>
          <p>Informamos que {{mensagemAlerta}}</p>
          <p>Data limite: {{dataLimite}}</p>
          <p>Atenciosamente,<br>Equipe Contaflix</p>
        `;
        break;
        
      default:
        throw new Error(`Template de email '${templateId}' não encontrado`);
    }
    
    // Format the template with the provided data
    const formattedBody = formatEmailTemplate(templateContent, data);
    
    // Send the email with the formatted template
    return await sendEmail({
      ...options,
      body: formattedBody,
      isHtml: true
    });
    
  } catch (error: any) {
    console.error('Erro ao enviar email com template:', error);
    
    return {
      success: false,
      error: error.message || 'Erro ao enviar email com template'
    };
  }
};

/**
 * Schedule an email to be sent at a specific date/time
 */
export const scheduleEmail = async (
  options: EmailOptions, 
  scheduledDate: Date
): Promise<EmailResponse> => {
  try {
    const now = new Date();
    
    if (scheduledDate <= now) {
      // If scheduled date is in the past or now, send immediately
      return await sendEmail(options);
    }
    
    // In a real implementation, you would store this in a database
    // and use a job scheduler (like cron, bull, etc.) to send at the right time
    
    // For demonstration purposes, we'll log the scheduled email and simulate success
    console.log('Email agendado para:', scheduledDate.toLocaleString());
    console.log('Detalhes do email:', options);
    
    // Calculate time difference for demonstration
    const timeUntilSend = scheduledDate.getTime() - now.getTime();
    const minutesUntilSend = Math.round(timeUntilSend / (1000 * 60));
    
    toast({
      title: "Email agendado",
      description: `Email agendado para envio em aproximadamente ${minutesUntilSend} minutos`,
    });
    
    return {
      success: true,
      messageId: `scheduled-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`
    };
    
  } catch (error: any) {
    console.error('Erro ao agendar email:', error);
    
    return {
      success: false,
      error: error.message || 'Erro ao agendar email'
    };
  }
};

/**
 * Send a batch of emails
 */
export const sendBatchEmails = async (
  batchOptions: EmailOptions[]
): Promise<{success: boolean, results: EmailResponse[]}> => {
  try {
    if (!batchOptions.length) {
      throw new Error('Lista de emails vazia');
    }
    
    const results: EmailResponse[] = [];
    
    // In a real implementation, you might use Promise.all() or a queue system
    // to send emails in parallel or with rate limiting
    
    // For this example, we'll send them sequentially
    for (const options of batchOptions) {
      const result = await sendEmail(options);
      results.push(result);
    }
    
    const successCount = results.filter(r => r.success).length;
    
    toast({
      title: "Emails em lote processados",
      description: `${successCount} de ${results.length} emails enviados com sucesso`,
      variant: successCount === results.length ? "default" : "destructive"
    });
    
    return {
      success: successCount > 0,
      results
    };
    
  } catch (error: any) {
    console.error('Erro ao enviar emails em lote:', error);
    
    toast({
      title: "Falha no envio em lote",
      description: error.message || 'Erro ao processar emails em lote',
      variant: "destructive"
    });
    
    return {
      success: false,
      results: []
    };
  }
};

/**
 * Helper function to send a notification email
 */
export const sendNotificationEmail = async (
  to: string | string[], 
  subject: string, 
  message: string
): Promise<EmailResponse> => {
  return await sendEmail({
    to,
    subject,
    body: `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">${subject}</h2>
        <p>${message}</p>
        <hr style="border: 1px solid #e5e7eb; margin: 20px 0;" />
        <p style="color: #6b7280; font-size: 14px;">
          Esta é uma notificação automática do sistema Contaflix.
        </p>
      </div>
    `,
    isHtml: true
  });
};
