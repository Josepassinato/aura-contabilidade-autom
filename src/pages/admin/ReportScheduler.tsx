import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Calendar, Clock, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ScheduledReport {
  id: string;
  client_id: string;
  template_id: string;
  schedule_cron: string;
  email_recipients: string[];
  is_active: boolean;
  last_run: string | null;
  next_run: string | null;
  created_at: string;
  template_name?: string;
  client_name?: string;
}

interface ReportTemplate {
  id: string;
  name: string;
  template_type: string;
}

interface Client {
  id: string;
  name: string;
}

export default function ReportScheduler() {
  const [schedules, setSchedules] = useState<ScheduledReport[]>([]);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSchedule, setEditingSchedule] = useState<ScheduledReport | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    client_id: '',
    template_id: '',
    schedule_cron: '0 9 1 * *', // Todo dia 1 às 9h
    email_recipients: '',
    is_active: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [schedulesRes, templatesRes, clientsRes] = await Promise.all([
        supabase
          .from('scheduled_reports')
          .select(`
            *,
            report_templates(name),
            accounting_clients(name)
          `)
          .order('created_at', { ascending: false }),
        
        supabase
          .from('report_templates')
          .select('id, name, template_type')
          .eq('is_active', true),
        
        supabase
          .from('accounting_clients')
          .select('id, name')
          .eq('status', 'active')
      ]);

      if (schedulesRes.error) throw schedulesRes.error;
      if (templatesRes.error) throw templatesRes.error;
      if (clientsRes.error) throw clientsRes.error;

      setSchedules(schedulesRes.data?.map(s => ({
        ...s,
        template_name: s.report_templates?.name,
        client_name: s.accounting_clients?.name
      })) || []);
      
      setTemplates(templatesRes.data || []);
      setClients(clientsRes.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar dados',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSchedule = async () => {
    try {
      const scheduleData = {
        client_id: formData.client_id,
        template_id: formData.template_id,
        schedule_cron: formData.schedule_cron,
        email_recipients: formData.email_recipients.split(',').map(e => e.trim()).filter(Boolean),
        is_active: formData.is_active,
        next_run: calculateNextRun(formData.schedule_cron)
      };

      if (editingSchedule) {
        const { error } = await supabase
          .from('scheduled_reports')
          .update(scheduleData)
          .eq('id', editingSchedule.id);

        if (error) throw error;
        
        toast({
          title: 'Sucesso',
          description: 'Agendamento atualizado com sucesso'
        });
      } else {
        const { error } = await supabase
          .from('scheduled_reports')
          .insert(scheduleData);

        if (error) throw error;
        
        toast({
          title: 'Sucesso',
          description: 'Agendamento criado com sucesso'
        });
      }

      setIsDialogOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao salvar agendamento',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este agendamento?')) return;

    try {
      const { error } = await supabase
        .from('scheduled_reports')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: 'Sucesso',
        description: 'Agendamento excluído com sucesso'
      });
      
      loadData();
    } catch (error) {
      console.error('Erro ao excluir agendamento:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao excluir agendamento',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      client_id: '',
      template_id: '',
      schedule_cron: '0 9 1 * *',
      email_recipients: '',
      is_active: true
    });
    setEditingSchedule(null);
  };

  const openEditDialog = (schedule: ScheduledReport) => {
    setEditingSchedule(schedule);
    setFormData({
      client_id: schedule.client_id,
      template_id: schedule.template_id,
      schedule_cron: schedule.schedule_cron,
      email_recipients: schedule.email_recipients.join(', '),
      is_active: schedule.is_active
    });
    setIsDialogOpen(true);
  };

  const calculateNextRun = (cron: string): string => {
    // Simplificado - em produção usaria uma lib como node-cron
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1, 9, 0, 0);
    return nextMonth.toISOString();
  };

  const formatCronDescription = (cron: string): string => {
    const descriptions: Record<string, string> = {
      '0 9 1 * *': 'Todo dia 1 do mês às 9h',
      '0 9 * * 1': 'Toda segunda-feira às 9h',
      '0 9 * * *': 'Todos os dias às 9h',
      '0 18 * * 5': 'Toda sexta-feira às 18h'
    };
    return descriptions[cron] || cron;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Carregando agendamentos...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Agendamento de Relatórios</h1>
          <p className="text-muted-foreground">Configure a geração automática de relatórios</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Agendamento
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingSchedule ? 'Editar Agendamento' : 'Novo Agendamento'}
              </DialogTitle>
              <DialogDescription>
                Configure quando e como os relatórios serão gerados automaticamente
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="client">Cliente</Label>
                <Select
                  value={formData.client_id}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, client_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map(client => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="template">Template</Label>
                <Select
                  value={formData.template_id}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, template_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name} ({template.template_type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="schedule">Frequência</Label>
                <Select
                  value={formData.schedule_cron}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, schedule_cron: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a frequência" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0 9 1 * *">Mensal (dia 1 às 9h)</SelectItem>
                    <SelectItem value="0 9 * * 1">Semanal (segunda às 9h)</SelectItem>
                    <SelectItem value="0 9 * * *">Diário (9h)</SelectItem>
                    <SelectItem value="0 18 * * 5">Semanal (sexta às 18h)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="emails">E-mails para envio (separados por vírgula)</Label>
                <Input
                  id="emails"
                  value={formData.email_recipients}
                  onChange={(e) => setFormData(prev => ({ ...prev, email_recipients: e.target.value }))}
                  placeholder="email1@exemplo.com, email2@exemplo.com"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                />
                <Label htmlFor="is_active">Ativo</Label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveSchedule}>
                {editingSchedule ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {schedules.map((schedule) => (
          <Card key={schedule.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    {schedule.client_name} - {schedule.template_name}
                    {!schedule.is_active && (
                      <Badge variant="secondary">Inativo</Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {formatCronDescription(schedule.schedule_cron)}
                  </CardDescription>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(schedule)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteSchedule(schedule.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Última execução: {schedule.last_run ? 
                      new Date(schedule.last_run).toLocaleString('pt-BR') : 
                      'Nunca'
                    }
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Próxima execução: {schedule.next_run ? 
                      new Date(schedule.next_run).toLocaleString('pt-BR') : 
                      'Não agendada'
                    }
                  </span>
                </div>
                
                <div className="flex items-center space-x-2 col-span-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Destinatários: {schedule.email_recipients.join(', ') || 'Nenhum'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {schedules.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum agendamento encontrado</h3>
              <p className="text-muted-foreground mb-4">Configure seu primeiro agendamento automático</p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Agendamento
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}