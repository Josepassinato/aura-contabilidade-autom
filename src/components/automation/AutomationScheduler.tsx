import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { logger } from '@/utils/logger';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Calendar,
  Clock,
  Plus,
  Edit,
  Trash2,
  Play,
  Pause,
  AlertCircle
} from 'lucide-react';

interface ScheduledJob {
  id: string;
  name: string;
  description?: string;
  cron_expression: string;
  function_name: string;
  parameters: any;
  enabled: boolean;
  last_run?: string;
  next_run?: string;
  success_count: number;
  error_count: number;
  created_at: string;
}

const AutomationScheduler = () => {
  const [jobs, setJobs] = useState<ScheduledJob[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { toast } = useToast();

  const [newJob, setNewJob] = useState({
    name: '',
    description: '',
    cron_expression: '0 2 * * *', // Daily at 2 AM
    function_name: 'automation-trigger-engine',
    parameters: {},
    enabled: true
  });

  const loadScheduledJobs = async () => {
    setIsLoading(true);
    try {
      // Load from real scheduled_jobs table
      const { data: jobsData, error: jobsError } = await supabase
        .from('scheduled_jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (jobsError) throw jobsError;

      // Calculate next run times for jobs that don't have one
      const jobsWithNextRun = await Promise.all(
        (jobsData || []).map(async (job) => {
          if (!job.next_run && job.enabled) {
            const { data: nextRunData } = await supabase.rpc('calculate_next_cron_run', {
              cron_expression: job.cron_expression
            });
            
            if (nextRunData) {
              // Update the job with calculated next run time
              await supabase
                .from('scheduled_jobs')
                .update({ next_run: nextRunData })
                .eq('id', job.id);
              
              return { ...job, next_run: nextRunData };
            }
          }
          return job;
        })
      );
      
      setJobs(jobsWithNextRun);
    } catch (error: any) {
      logger.error('Erro ao carregar tarefas agendadas', error, 'AutomationScheduler');
      toast({
        title: "Erro",
        description: "Falha ao carregar tarefas agendadas",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createScheduledJob = async () => {
    try {
      if (!newJob.name || !newJob.cron_expression || !newJob.function_name) {
        toast({
          title: "Erro",
          description: "Preencha todos os campos obrigatórios",
          variant: "destructive"
        });
        return;
      }

      // Calculate next run time
      const { data: nextRunTime } = await supabase.rpc('calculate_next_cron_run', {
        cron_expression: newJob.cron_expression
      });

      // Insert into real database
      const { data: createdJob, error: insertError } = await supabase
        .from('scheduled_jobs')
        .insert({
          name: newJob.name,
          description: newJob.description || null,
          cron_expression: newJob.cron_expression,
          function_name: newJob.function_name,
          parameters: newJob.parameters,
          enabled: newJob.enabled,
          next_run: nextRunTime
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Add to local state
      setJobs(prev => [...prev, createdJob]);
      
      toast({
        title: "Tarefa Agendada",
        description: "Nova tarefa agendada criada com sucesso"
      });

      setShowCreateForm(false);
      setNewJob({
        name: '',
        description: '',
        cron_expression: '0 2 * * *',
        function_name: 'automation-trigger-engine',
        parameters: {},
        enabled: true
      });

    } catch (error: any) {
      logger.error('Erro ao criar tarefa agendada', error, 'AutomationScheduler');
      toast({
        title: "Erro",
        description: "Falha ao criar tarefa agendada",
        variant: "destructive"
      });
    }
  };

  const toggleJob = async (jobId: string, enabled: boolean) => {
    try {
      // Update in database
      const { error } = await supabase
        .from('scheduled_jobs')
        .update({ enabled })
        .eq('id', jobId);

      if (error) throw error;

      // Update local state
      setJobs(prev => prev.map(job => 
        job.id === jobId ? { ...job, enabled } : job
      ));

      toast({
        title: enabled ? "Tarefa Ativada" : "Tarefa Desativada",
        description: `A tarefa foi ${enabled ? 'ativada' : 'desativada'} com sucesso`
      });
    } catch (error: any) {
      logger.error('Erro ao alterar status da tarefa', error, 'AutomationScheduler');
      toast({
        title: "Erro",
        description: "Falha ao alterar status da tarefa",
        variant: "destructive"
      });
    }
  };

  const executeJobNow = async (job: ScheduledJob) => {
    try {
      // Execute the function directly
      const { data, error } = await supabase.functions.invoke(job.function_name, {
        body: job.parameters
      });

      if (error) throw error;

      toast({
        title: "Tarefa Executada",
        description: `A tarefa "${job.name}" foi executada com sucesso`
      });

      // Update last run time
      setJobs(prev => prev.map(j => 
        j.id === job.id 
          ? { 
              ...j, 
              last_run: new Date().toISOString(),
              success_count: j.success_count + 1
            }
          : j
      ));

    } catch (error: any) {
      logger.error('Erro ao executar tarefa agendada', error, 'AutomationScheduler');
      
      // Update error count
      setJobs(prev => prev.map(j => 
        j.id === job.id 
          ? { ...j, error_count: j.error_count + 1 }
          : j
      ));

      toast({
        title: "Erro na Execução",
        description: error.message || "Falha ao executar tarefa",
        variant: "destructive"
      });
    }
  };

  const deleteJob = async (jobId: string) => {
    try {
      // Delete from database
      const { error } = await supabase
        .from('scheduled_jobs')
        .delete()
        .eq('id', jobId);

      if (error) throw error;

      // Update local state
      setJobs(prev => prev.filter(job => job.id !== jobId));
      
      toast({
        title: "Tarefa Removida",
        description: "Tarefa agendada removida com sucesso"
      });
    } catch (error: any) {
      logger.error('Erro ao deletar tarefa agendada', error, 'AutomationScheduler');
      toast({
        title: "Erro",
        description: "Falha ao remover tarefa",
        variant: "destructive"
      });
    }
  };

  const calculateNextRun = (cronExpression: string): string => {
    // Simplified next run calculation
    // In a real implementation, use a proper cron parser
    const now = new Date();
    
    if (cronExpression === '0 * * * *') { // Every hour
      const nextRun = new Date(now);
      nextRun.setHours(nextRun.getHours() + 1, 0, 0, 0);
      return nextRun.toISOString();
    } else if (cronExpression === '*/5 * * * *') { // Every 5 minutes
      const nextRun = new Date(now);
      nextRun.setMinutes(Math.ceil(nextRun.getMinutes() / 5) * 5, 0, 0);
      return nextRun.toISOString();
    } else if (cronExpression === '0 2 * * *') { // Daily at 2 AM
      const nextRun = new Date(now);
      nextRun.setHours(2, 0, 0, 0);
      if (nextRun <= now) {
        nextRun.setDate(nextRun.getDate() + 1);
      }
      return nextRun.toISOString();
    }
    
    return new Date(now.getTime() + 60 * 60 * 1000).toISOString();
  };

  const parseCronDescription = (cronExpression: string): string => {
    switch (cronExpression) {
      case '0 * * * *': return 'A cada hora';
      case '*/5 * * * *': return 'A cada 5 minutos';
      case '0 2 * * *': return 'Diariamente às 2:00';
      case '0 6 * * *': return 'Diariamente às 6:00';
      case '0 0 * * 0': return 'Semanalmente aos domingos';
      case '0 0 1 * *': return 'Mensalmente no dia 1';
      default: return cronExpression;
    }
  };

  const getJobStatusBadge = (job: ScheduledJob) => {
    if (!job.enabled) {
      return <Badge variant="outline">Inativo</Badge>;
    }
    
    const errorRate = job.success_count + job.error_count > 0 
      ? (job.error_count / (job.success_count + job.error_count)) * 100 
      : 0;
    
    if (errorRate > 20) {
      return <Badge variant="destructive">Com Problemas</Badge>;
    } else if (errorRate > 10) {
      return <Badge variant="secondary">Atenção</Badge>;
    } else {
      return <Badge className="bg-green-100 text-green-800">Ativo</Badge>;
    }
  };

  useEffect(() => {
    loadScheduledJobs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            Agendador de Automação
          </h2>
          <p className="text-muted-foreground">
            Configure e gerencie execuções automáticas programadas
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Tarefa Agendada
        </Button>
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Criar Nova Tarefa Agendada</CardTitle>
            <CardDescription>
              Configure uma nova tarefa para execução automática
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="job-name">Nome</Label>
                <Input
                  id="job-name"
                  value={newJob.name}
                  onChange={(e) => setNewJob(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nome da tarefa"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="job-function">Função</Label>
                <Select
                  value={newJob.function_name}
                  onValueChange={(value) => setNewJob(prev => ({ ...prev, function_name: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="automation-trigger-engine">Trigger Engine</SelectItem>
                    <SelectItem value="automation-worker">Worker</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="job-description">Descrição</Label>
              <Input
                id="job-description"
                value={newJob.description}
                onChange={(e) => setNewJob(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrição da tarefa"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="job-cron">Expressão Cron</Label>
              <Select
                value={newJob.cron_expression}
                onValueChange={(value) => setNewJob(prev => ({ ...prev, cron_expression: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="*/5 * * * *">A cada 5 minutos</SelectItem>
                  <SelectItem value="0 * * * *">A cada hora</SelectItem>
                  <SelectItem value="0 2 * * *">Diariamente às 2:00</SelectItem>
                  <SelectItem value="0 6 * * *">Diariamente às 6:00</SelectItem>
                  <SelectItem value="0 0 * * 0">Semanalmente aos domingos</SelectItem>
                  <SelectItem value="0 0 1 * *">Mensalmente no dia 1</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="job-enabled"
                checked={newJob.enabled}
                onCheckedChange={(enabled) => setNewJob(prev => ({ ...prev, enabled }))}
              />
              <Label htmlFor="job-enabled">Ativar imediatamente</Label>
            </div>

            <div className="flex gap-2">
              <Button onClick={createScheduledJob}>
                Criar Tarefa
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowCreateForm(false)}
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Tarefas Agendadas</CardTitle>
          <CardDescription>
            Gerencie suas tarefas de automação programadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Função</TableHead>
                <TableHead>Cronograma</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Última Execução</TableHead>
                <TableHead>Próxima Execução</TableHead>
                <TableHead>Sucessos/Erros</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{job.name}</div>
                      {job.description && (
                        <div className="text-sm text-muted-foreground">{job.description}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{job.function_name}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span className="text-sm">{parseCronDescription(job.cron_expression)}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getJobStatusBadge(job)}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {job.last_run 
                        ? new Date(job.last_run).toLocaleString('pt-BR')
                        : 'Nunca executada'
                      }
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {job.next_run 
                        ? new Date(job.next_run).toLocaleString('pt-BR')
                        : 'N/A'
                      }
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <span className="text-green-600">{job.success_count}</span>
                      {' / '}
                      <span className="text-red-600">{job.error_count}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Switch
                        checked={job.enabled}
                        onCheckedChange={(enabled) => toggleJob(job.id, enabled)}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => executeJobNow(job)}
                        disabled={!job.enabled}
                      >
                        <Play className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteJob(job.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AutomationScheduler;