
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Mail, Send } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { sendEmail, sendTemplateEmail, EmailData } from "@/services/email/emailService";

interface EmailSenderProps {
  defaultTo?: string;
  defaultSubject?: string;
  defaultBody?: string;
  enableTemplates?: boolean;
  onSendComplete?: (success: boolean) => void;
  className?: string;
}

export function EmailSender({
  defaultTo = '',
  defaultSubject = '',
  defaultBody = '',
  enableTemplates = false,
  onSendComplete,
  className = ''
}: EmailSenderProps) {
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

  const updateTemplateData = (field: string, value: string) => {
    setTemplateData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Enviar Email
        </CardTitle>
        <CardDescription>
          Preencha os campos para enviar um email
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {enableTemplates && (
          <div className="space-y-2">
            <Label htmlFor="template">Modelo de Email</Label>
            <Select
              value={selectedTemplate}
              onValueChange={setSelectedTemplate}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um modelo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="welcome">Boas-vindas</SelectItem>
                <SelectItem value="relatorio">Relatório</SelectItem>
                <SelectItem value="alerta">Alerta</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="to">Para</Label>
          <Input 
            id="to" 
            placeholder="email@exemplo.com, outro@exemplo.com" 
            value={to} 
            onChange={e => setTo(e.target.value)} 
          />
        </div>
        
        {showCcBcc && (
          <>
            <div className="space-y-2">
              <Label htmlFor="cc">Cc</Label>
              <Input 
                id="cc" 
                placeholder="cc@exemplo.com" 
                value={cc} 
                onChange={e => setCc(e.target.value)} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bcc">Cco</Label>
              <Input 
                id="bcc" 
                placeholder="cco@exemplo.com" 
                value={bcc} 
                onChange={e => setBcc(e.target.value)} 
              />
            </div>
          </>
        )}
        
        <div className="flex justify-end">
          <Button 
            variant="link" 
            className="text-xs py-0 h-auto" 
            onClick={() => setShowCcBcc(!showCcBcc)}
          >
            {showCcBcc ? 'Ocultar Cc/Cco' : 'Mostrar Cc/Cco'}
          </Button>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="subject">Assunto</Label>
          <Input 
            id="subject" 
            placeholder="Assunto do email" 
            value={subject} 
            onChange={e => setSubject(e.target.value)} 
          />
        </div>
        
        {selectedTemplate && selectedTemplate !== 'custom' && enableTemplates ? (
          <div className="space-y-4 border rounded-md p-4 bg-muted/30">
            <h4 className="text-sm font-medium">Dados do Modelo</h4>
            
            {getTemplateFields().map(field => (
              <div key={field} className="space-y-2">
                <Label htmlFor={`template-${field}`} className="capitalize">
                  {field.replace(/([A-Z])/g, ' $1')
                    .replace(/^./, str => str.toUpperCase())}
                </Label>
                <Input 
                  id={`template-${field}`}
                  value={templateData[field] || ''}
                  onChange={e => updateTemplateData(field, e.target.value)}
                />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="body">Conteúdo</Label>
              <Textarea 
                id="body" 
                placeholder="Conteúdo do email" 
                value={body} 
                onChange={e => setBody(e.target.value)} 
                className="min-h-[150px]"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="html-format" 
                checked={isHtml} 
                onCheckedChange={(checked) => setIsHtml(!!checked)}
              />
              <Label htmlFor="html-format">Formato HTML</Label>
            </div>
          </>
        )}
      </CardContent>
      
      <Separator />
      
      <CardFooter className="pt-4">
        <Button 
          className="w-full" 
          onClick={handleSendEmail} 
          disabled={isLoading}
        >
          <Send className="w-4 h-4 mr-2" /> 
          {isLoading ? 'Enviando...' : 'Enviar Email'}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default EmailSender;
