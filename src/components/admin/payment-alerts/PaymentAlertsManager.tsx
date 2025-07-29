
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, Mail, Clock, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { logger } from "@/utils/logger";

interface PaymentAlert {
  alert_id: string;
  client_id: string;
  client_name: string;
  client_email: string;
  alert_type: string;
  payment_due_date: string;
  days_until_due: number;
  alert_sent_date: string;
}

export function PaymentAlertsManager() {
  const [alerts, setAlerts] = useState<PaymentAlert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingEmails, setIsSendingEmails] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadPendingAlerts();
  }, []);

  const loadPendingAlerts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_pending_payment_alerts');
      
      if (error) throw error;
      
      setAlerts(data || []);
    } catch (error: any) {
      logger.error('Erro ao carregar alertas:', error, 'PaymentAlertsManager');
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os alertas de pagamento.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkOverduePayments = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.rpc('check_overdue_payments');
      
      if (error) throw error;
      
      toast({
        title: 'Verificação concluída',
        description: 'Verificação de pagamentos em atraso executada com sucesso.',
      });
      
      // Recarregar alertas
      await loadPendingAlerts();
    } catch (error: any) {
      logger.error('Erro ao verificar pagamentos:', error, 'PaymentAlertsManager');
      toast({
        title: 'Erro',
        description: 'Erro ao executar verificação de pagamentos.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendPaymentAlertEmails = async () => {
    setIsSendingEmails(true);
    try {
      let emailsSent = 0;
      
      for (const alert of alerts) {
        const emailContent = getEmailContentForAlert(alert);
        
        // Enviar email usando a função edge existente
        const { error: emailError } = await supabase.functions.invoke('send-email', {
          body: {
            to: alert.client_email,
            subject: emailContent.subject,
            html: emailContent.html,
          },
        });
        
        if (!emailError) {
          // Marcar email como enviado
          await supabase
            .from('payment_alerts')
            .update({ email_sent: true })
            .eq('id', alert.alert_id);
          
          emailsSent++;
        }
      }
      
      toast({
        title: 'Emails enviados',
        description: `${emailsSent} emails de alerta foram enviados com sucesso.`,
      });
      
      // Recarregar alertas
      await loadPendingAlerts();
    } catch (error: any) {
      logger.error('Erro ao enviar emails:', error, 'PaymentAlertsManager');
      toast({
        title: 'Erro',
        description: 'Erro ao enviar emails de alerta.',
        variant: 'destructive',
      });
    } finally {
      setIsSendingEmails(false);
    }
  };

  const getEmailContentForAlert = (alert: PaymentAlert) => {
    const alertTypeLabels = {
      'warning_10_days': {
        subject: `Lembrete: Pagamento vence em ${alert.days_until_due} dias`,
        title: 'Pagamento Próximo do Vencimento',
        urgency: 'informativo',
      },
      'warning_5_days': {
        subject: `Urgente: Pagamento vence em ${alert.days_until_due} dias`,
        title: 'Pagamento Vence em Breve',
        urgency: 'atenção',
      },
      'final_notice': {
        subject: `FINAL: Pagamento vence amanhã - Acesso será bloqueado`,
        title: 'Aviso Final - Pagamento Urgente',
        urgency: 'crítico',
      },
    };

    const config = alertTypeLabels[alert.alert_type as keyof typeof alertTypeLabels];
    const dueDate = format(new Date(alert.payment_due_date), 'dd/MM/yyyy', { locale: ptBR });

    return {
      subject: config.subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; text-align: center;">${config.title}</h2>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Prezado(a) ${alert.client_name},</strong></p>
            
            <p>Este é um lembrete sobre o vencimento da sua mensalidade do ContaFlix.</p>
            
            <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <p><strong>Data de Vencimento:</strong> ${dueDate}</p>
              <p><strong>Dias restantes:</strong> ${alert.days_until_due} dia(s)</p>
            </div>
            
            ${alert.alert_type === 'final_notice' ? `
              <div style="background-color: #fee; border: 1px solid #fcc; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <p style="color: #c33; margin: 0;"><strong>⚠️ ATENÇÃO:</strong> Caso o pagamento não seja efetuado até amanhã, seu acesso ao sistema será temporariamente bloqueado.</p>
              </div>
            ` : ''}
            
            <p>Para manter seu acesso ativo, por favor efetue o pagamento até a data de vencimento.</p>
            
            <p>Em caso de dúvidas, entre em contato conosco.</p>
            
            <p>Atenciosamente,<br>Equipe ContaFlix</p>
          </div>
        </div>
      `,
    };
  };

  const getAlertBadge = (alertType: string) => {
    const badgeConfig = {
      'warning_10_days': { label: '10 dias', variant: 'secondary' as const },
      'warning_5_days': { label: '5 dias', variant: 'default' as const },
      'final_notice': { label: 'Final', variant: 'destructive' as const },
    };

    const config = badgeConfig[alertType as keyof typeof badgeConfig];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Alertas de Pagamento</h2>
          <p className="text-muted-foreground">
            Gerencie alertas automáticos para pagamentos em atraso
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={checkOverduePayments}
            disabled={isLoading}
            variant="outline"
          >
            <Clock className="mr-2 h-4 w-4" />
            Verificar Pagamentos
          </Button>
          
          <Button
            onClick={sendPaymentAlertEmails}
            disabled={isSendingEmails || alerts.length === 0}
          >
            <Mail className="mr-2 h-4 w-4" />
            Enviar Emails ({alerts.length})
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Alertas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alerts.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Críticos (1 dia)</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {alerts.filter(a => a.alert_type === 'final_notice').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes Email</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alerts.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Alertas Pendentes</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-6">
              <p>Carregando alertas...</p>
            </div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-6">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-3" />
              <p className="text-muted-foreground">Nenhum alerta pendente</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Dias Restantes</TableHead>
                  <TableHead>Criado em</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alerts.map((alert) => (
                  <TableRow key={alert.alert_id}>
                    <TableCell className="font-medium">{alert.client_name}</TableCell>
                    <TableCell>{alert.client_email}</TableCell>
                    <TableCell>{getAlertBadge(alert.alert_type)}</TableCell>
                    <TableCell>
                      {format(new Date(alert.payment_due_date), 'dd/MM/yyyy', { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <span className={alert.days_until_due <= 1 ? 'text-red-500 font-semibold' : ''}>
                        {alert.days_until_due} dia(s)
                      </span>
                    </TableCell>
                    <TableCell>
                      {format(new Date(alert.alert_sent_date), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
