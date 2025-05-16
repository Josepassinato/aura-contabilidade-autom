
import { useState } from 'react';
import { toast } from "@/hooks/use-toast";
import { sendEmail, sendTemplateEmail, EmailData } from "@/services/email/emailService";

interface EmailSenderHookProps {
  defaultTo?: string;
  defaultSubject?: string;
  defaultBody?: string;
  enableTemplates?: boolean;
  onSendComplete?: (success: boolean) => void;
}

export function useEmailSender({
  defaultTo = '',
  defaultSubject = '',
  defaultBody = '',
  enableTemplates = false,
  onSendComplete
}: EmailSenderHookProps) {
  const [to, setTo] = useState(defaultTo);
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody] = useState(defaultBody);
  const [isHtml, setIsHtml] = useState(true);
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | undefined>(
    enableTemplates ? 'welcome' : undefined
  );
  
  // Template data state
  const [templateData, setTemplateData] = useState<{[key: string]: string}>({
    nome: '',
    email: '',
    dataRegistro: new Date().toLocaleDateString(),
    tipoRelatorio: 'Mensal',
    periodoInicio: '01/01/2025',
    periodoFim: '31/01/2025',
    tipoAlerta: 'Obrigação Fiscal',
    mensagemAlerta: 'há uma obrigação fiscal que vence em breve',
    dataLimite: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
  });
  
  // Template fields based on selected template
  const getTemplateFields = () => {
    switch (selectedTemplate) {
      case 'welcome':
        return ['nome', 'email', 'dataRegistro'];
      case 'relatorio':
        return ['nome', 'tipoRelatorio', 'periodoInicio', 'periodoFim'];
      case 'alerta':
        return ['nome', 'tipoAlerta', 'mensagemAlerta', 'dataLimite'];
      default:
        return [];
    }
  };

  const updateTemplateData = (field: string, value: string) => {
    setTemplateData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSendEmail = async () => {
    // Validation
    if (!to) {
      toast({
        title: "Campo obrigatório",
        description: "Informe pelo menos um destinatário",
        variant: "destructive"
      });
      return;
    }

    if (!subject) {
      toast({
        title: "Campo obrigatório",
        description: "Informe o assunto do email",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      
      let success = false;
      
      if (selectedTemplate && enableTemplates) {
        // Send using template
        const requiredFields = getTemplateFields();
        const missingFields = requiredFields.filter(field => !templateData[field]);
        
        if (missingFields.length > 0) {
          toast({
            title: "Campos incompletos",
            description: `Preencha os seguintes campos: ${missingFields.join(', ')}`,
            variant: "destructive"
          });
          return;
        }
        
        const result = await sendTemplateEmail(
          selectedTemplate,
          templateData,
          {
            to: to.split(',').map(email => email.trim()),
            subject,
            cc: cc ? cc.split(',').map(email => email.trim()) : undefined,
            bcc: bcc ? bcc.split(',').map(email => email.trim()) : undefined,
          }
        );
        
        success = result.success;
      } else {
        // Send regular email
        if (!body) {
          toast({
            title: "Campo obrigatório",
            description: "Informe o conteúdo do email",
            variant: "destructive"
          });
          return;
        }
        
        // Prepare email options
        const emailData: EmailData = {
          to: to.split(',').map(email => email.trim()),
          subject,
          body,
          isHtml
        };
        
        if (cc) emailData.cc = cc.split(',').map(email => email.trim());
        if (bcc) emailData.bcc = bcc.split(',').map(email => email.trim());
        
        const result = await sendEmail(emailData);
        success = result.success;
      }
      
      if (onSendComplete) {
        onSendComplete(success);
      }
      
    } catch (error: any) {
      console.error('Erro ao enviar email:', error);
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao enviar o email",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    to,
    setTo,
    cc,
    setCc,
    bcc,
    setBcc,
    subject,
    setSubject,
    body,
    setBody,
    isHtml,
    setIsHtml,
    showCcBcc,
    setShowCcBcc,
    isLoading,
    selectedTemplate,
    setSelectedTemplate,
    templateData,
    updateTemplateData,
    getTemplateFields,
    handleSendEmail
  };
}
