
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { logger } from "@/utils/logger";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Clock, AlertCircle, RefreshCcw, Play, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

import {
  obterTodosJobs,
  verificarPagamentosAgendados,
  reprocessarJob,
  removerJob,
  iniciarCronJob,
  JobPagamento
} from "@/services/bancario/pagamentoAutomatico";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

import {
  simularEvento
} from "@/services/fiscal/mensageria/eventoProcessor";

import {
  processarEventoFiscal
} from "@/services/bancario/pagamentoAutomatico";

export function PagamentosAutomaticos() {
  const [jobsAgendados, setJobsAgendados] = useState<JobPagamento[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cronAtivo, setCronAtivo] = useState(false);
  const [intervalo, setIntervalo] = useState(5);
  const [stopCron, setStopCron] = useState<(() => void) | null>(null);

  // Carregar jobs ao iniciar
  useEffect(() => {
    carregarJobs();
  }, []);

  // Parar cron job ao desmontar o componente
  useEffect(() => {
    return () => {
      if (stopCron) {
        stopCron();
      }
    };
  }, [stopCron]);

  // Alternar status do cron job
  const toggleCronJob = () => {
    if (cronAtivo) {
      if (stopCron) {
        stopCron();
        setStopCron(null);
      }
      setCronAtivo(false);
      toast({
        title: "Job automatizado desativado",
        description: "A verificação automática de pagamentos foi desativada."
      });
    } else {
      const stopFn = iniciarCronJob(intervalo);
      setStopCron(() => stopFn);
      setCronAtivo(true);
      toast({
        title: "Job automatizado ativado",
        description: `Pagamentos serão verificados a cada ${intervalo} minutos.`
      });
    }
  };

  // Carregar lista de jobs
  const carregarJobs = () => {
    const jobs = obterTodosJobs();
    setJobsAgendados(jobs);
  };

  // Reprocessar job manualmente
  const handleReprocessar = async (jobId: string) => {
    setIsLoading(true);
    try {
      await reprocessarJob(jobId);
      carregarJobs();
    } catch (error) {
      logger.error("Erro ao reprocessar job de pagamento", error, "PagamentosAutomaticos");
    } finally {
      setIsLoading(false);
    }
  };

  // Remover job
  const handleRemover = (jobId: string) => {
    const jobRemovido = removerJob(jobId);
    if (jobRemovido) {
      toast({
        title: "Job removido",
        description: "O job de pagamento foi removido com sucesso."
      });
      carregarJobs();
    } else {
      toast({
        title: "Erro ao remover job",
        description: "Não foi possível remover o job especificado.",
        variant: "destructive"
      });
    }
  };

  // Simular um pagamento
  const simularPagamento = async () => {
    setIsLoading(true);
    try {
      // Simular evento fiscal
      const evento = await simularEvento('guia.generated');
      
      // Processar evento para criar job de pagamento
      await processarEventoFiscal(evento);
      
      // Atualizar lista de jobs
      carregarJobs();
    } catch (error) {
      logger.error("Erro ao simular pagamento automático", error, "PagamentosAutomaticos");
    } finally {
      setIsLoading(false);
    }
  };

  // Executar verificação manual de jobs pendentes
  const executarVerificacaoManual = async () => {
    setIsLoading(true);
    try {
      const processados = await verificarPagamentosAgendados();
      toast({
        title: "Verificação concluída",
        description: `${processados} pagamentos foram processados.`
      });
      carregarJobs();
    } catch (error) {
      logger.error("Erro na verificação manual de pagamentos", error, "PagamentosAutomaticos");
    } finally {
      setIsLoading(false);
    }
  };

  // Função para obter cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendado': return 'bg-blue-100 text-blue-800';
      case 'em_processamento': return 'bg-yellow-100 text-yellow-800';
      case 'concluido': return 'bg-green-100 text-green-800';
      case 'falha': return 'bg-red-100 text-red-800';
      case 'retry': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Função para formatar data
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Pagamentos Automáticos</CardTitle>
          <CardDescription>
            Configure a execução automática de pagamentos de tributos e obrigações fiscais
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="jobs" className="space-y-4">
            <TabsList>
              <TabsTrigger value="jobs">Jobs de Pagamento</TabsTrigger>
              <TabsTrigger value="config">Configurações</TabsTrigger>
            </TabsList>
            
            <TabsContent value="jobs" className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-lg font-medium">Jobs Agendados</h3>
                  <p className="text-sm text-muted-foreground">
                    {jobsAgendados.length} jobs de pagamento no sistema
                  </p>
                </div>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    onClick={carregarJobs}
                    disabled={isLoading}
                  >
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    Atualizar
                  </Button>
                  <Button 
                    onClick={simularPagamento}
                    disabled={isLoading}
                  >
                    + Simular Pagamento
                  </Button>
                </div>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Agendado para</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tentativas</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobsAgendados.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-6">
                        Nenhum job de pagamento encontrado. Simule um pagamento para criar um job.
                      </TableCell>
                    </TableRow>
                  ) : (
                    jobsAgendados.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell className="font-mono text-xs">
                          {job.id.substring(0, 8)}...
                        </TableCell>
                        <TableCell>
                          {job.detalhes.tipoImposto || 'Tributo'}
                        </TableCell>
                        <TableCell>
                          R$ {job.detalhes.valor.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {new Date(job.detalhes.dataVencimento).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {new Date(job.scheduledFor).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(job.status)}>
                            {job.status === 'agendado' && <Clock className="mr-1 h-3 w-3" />}
                            {job.status === 'concluido' && <Check className="mr-1 h-3 w-3" />}
                            {job.status === 'falha' && <AlertCircle className="mr-1 h-3 w-3" />}
                            {job.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {job.tentativas} / {job.maxTentativas}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleReprocessar(job.id)}
                              disabled={isLoading || job.status === 'em_processamento'}
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemover(job.id)}
                              disabled={isLoading}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              
              <div className="flex justify-end">
                <Button
                  onClick={executarVerificacaoManual}
                  disabled={isLoading || jobsAgendados.length === 0}
                >
                  Executar Verificação Manual
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="config">
              <div className="space-y-6">
                <div className="flex items-center justify-between space-x-4">
                  <div>
                    <h3 className="text-lg font-medium">Cronograma Automático</h3>
                    <p className="text-sm text-muted-foreground">
                      Ativar verificação periódica de pagamentos pendentes
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="cron-status"
                      checked={cronAtivo}
                      onCheckedChange={toggleCronJob}
                    />
                    <Label htmlFor="cron-status">
                      {cronAtivo ? 'Ativo' : 'Inativo'}
                    </Label>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="intervalo">Intervalo de verificação (minutos)</Label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="range"
                      id="intervalo"
                      min="1"
                      max="60"
                      step="1"
                      value={intervalo}
                      onChange={(e) => setIntervalo(Number(e.target.value))}
                      className="w-full"
                      disabled={cronAtivo}
                    />
                    <span className="w-12 text-center">{intervalo}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Configurações Avançadas</h4>
                  <div className="rounded-md bg-muted p-4">
                    <p className="text-sm">
                      Quando um pagamento falha, o sistema tentará novamente até 3 vezes com
                      intervalo de 1 hora entre as tentativas.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
