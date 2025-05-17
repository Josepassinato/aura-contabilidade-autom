
import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { EmailSender } from "@/components/email/EmailSender";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Send, Download, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { 
  sendTemplateEmail, 
  sendNotificationEmail, 
  scheduleEmail 
} from "@/services/email/emailService";

const EmailService = () => {
  const handleSendWelcomeEmail = async () => {
    const result = await sendTemplateEmail(
      'welcome',
      {
        nome: 'Cliente Novo',
        email: 'cliente@exemplo.com',
        dataRegistro: new Date().toLocaleDateString()
      },
      {
        to: 'cliente@exemplo.com',
        subject: 'Bem-vindo ao Contaflix',
        body: '' // Fix: Added empty body to satisfy the EmailOptions type
      }
    );
    
    if (result.success) {
      toast({
        title: "Email de boas-vindas enviado",
        description: "O email de boas-vindas foi enviado com sucesso"
      });
    }
  };
  
  const handleSendAlert = async () => {
    const today = new Date();
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + 5);
    
    const result = await sendNotificationEmail(
      'contato@empresa.com',
      'Alerta: Obrigação fiscal próxima',
      `Você tem uma obrigação fiscal que vence em ${dueDate.toLocaleDateString()}. Por favor, verifique e tome as providências necessárias.`
    );
    
    if (result.success) {
      toast({
        title: "Alerta enviado",
        description: "O email de alerta foi enviado com sucesso"
      });
    }
  };
  
  const handleScheduleEmail = async () => {
    const scheduledDate = new Date();
    scheduledDate.setMinutes(scheduledDate.getMinutes() + 30); // Agendar para 30 minutos no futuro
    
    const result = await scheduleEmail(
      {
        to: 'agendamento@exemplo.com',
        subject: 'Email Agendado de Teste',
        body: `Este é um email agendado para ser enviado em ${scheduledDate.toLocaleTimeString()}.`,
        isHtml: false
      },
      scheduledDate
    );
    
    if (result.success) {
      toast({
        title: "Email agendado",
        description: `Email agendado para ${scheduledDate.toLocaleTimeString()}`
      });
    }
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Serviço de Email</h1>
          <p className="text-muted-foreground">
            Envie emails e notificações automáticas para clientes e colaboradores.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <EmailSender 
              enableTemplates={true}
              defaultSubject="Notificação do Sistema" 
              className="h-full"
            />
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Emails Rápidos
                </CardTitle>
                <CardDescription>
                  Envie emails pré-configurados com um clique
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleSendWelcomeEmail}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Enviar Boas-vindas
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleSendAlert}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Enviar Alerta
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleScheduleEmail}
                >
                  <Clock className="mr-2 h-4 w-4" />
                  Agendar Email (30min)
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Modelos Disponíveis
                </CardTitle>
                <CardDescription>
                  Modelos pré-configurados para diferentes cenários
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-2">
                  <li className="text-sm">• Boas-vindas</li>
                  <li className="text-sm">• Notificação de relatório</li>
                  <li className="text-sm">• Alertas fiscais</li>
                  <li className="text-sm">• Comunicações gerais</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EmailService;
