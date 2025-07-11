import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Play, 
  Pause, 
  BarChart3,
  RefreshCw,
  Filter,
  Users
} from 'lucide-react';
import { useMonthlyClosing, ClosingStatus } from '@/hooks/useMonthlyClosing';
import { ClosingMetricsCard } from './ClosingMetricsCard';
import { ClosingTimelineCard } from './ClosingTimelineCard';
import { ClientClosingCard } from './ClientClosingCard';
import { ClientSelector } from '@/components/layout/ClientSelector';
import { toast } from '@/hooks/use-toast';

export function MonthlyClosingDashboard() {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [statusFilter, setStatusFilter] = useState<'all' | ClosingStatus['status']>('all');
  const [selectedClients, setSelectedClients] = useState<string[]>([]);

  const { 
    closingStatuses, 
    metrics, 
    loading, 
    currentPeriod,
    refetch, 
    updateClosingStatus,
    startBatchClosing 
  } = useMonthlyClosing(selectedMonth, selectedYear);

  const getStatusIcon = (status: ClosingStatus['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-warning" />;
      case 'blocked':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'review':
        return <Pause className="h-4 w-4 text-info" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: ClosingStatus['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-success text-success-foreground';
      case 'in_progress':
        return 'bg-warning text-warning-foreground';
      case 'blocked':
        return 'bg-destructive text-destructive-foreground';
      case 'review':
        return 'bg-info text-info-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusLabel = (status: ClosingStatus['status']) => {
    switch (status) {
      case 'completed':
        return 'Concluído';
      case 'in_progress':
        return 'Em Progresso';
      case 'blocked':
        return 'Bloqueado';
      case 'review':
        return 'Em Revisão';
      default:
        return 'Pendente';
    }
  };

  const filteredClosings = closingStatuses.filter(closing => 
    statusFilter === 'all' || closing.status === statusFilter
  );

  const handleStartBatchClosing = async () => {
    if (selectedClients.length === 0) {
      toast({
        title: "Seleção necessária",
        description: "Selecione pelo menos um cliente para iniciar o fechamento em lote.",
        variant: "destructive",
      });
      return;
    }

    try {
      await startBatchClosing(selectedClients);
      setSelectedClients([]);
      toast({
        title: "Fechamento iniciado",
        description: `Fechamento em lote iniciado para ${selectedClients.length} cliente(s).`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao iniciar fechamento em lote.",
        variant: "destructive",
      });
    }
  };

  const toggleClientSelection = (clientId: string) => {
    setSelectedClients(prev => 
      prev.includes(clientId) 
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  const selectAllPending = () => {
    const pendingClients = closingStatuses
      .filter(c => c.status === 'pending')
      .map(c => c.client_id);
    setSelectedClients(pendingClients);
  };

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard de Fechamento</h1>
          <p className="text-muted-foreground">
            Controle e monitore o fechamento mensal de todos os clientes
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ClientSelector />
        </div>
      </div>

      {/* Period Selection */}
      <div className="flex items-center gap-3 justify-end">
        <div className="flex items-center gap-3">
          <Select
            value={selectedMonth.toString()}
            onValueChange={(value) => setSelectedMonth(parseInt(value))}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {monthNames.map((month, index) => (
                <SelectItem key={index + 1} value={(index + 1).toString()}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select
            value={selectedYear.toString()}
            onValueChange={(value) => setSelectedYear(parseInt(value))}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[2024, 2025, 2026].map(year => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={refetch} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Período Atual */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <CardTitle className="text-xl">
                {monthNames[currentPeriod.month - 1]} {currentPeriod.year}
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={selectAllPending}
                variant="outline"
                size="sm"
                disabled={!closingStatuses.some(c => c.status === 'pending')}
              >
                <Users className="h-4 w-4 mr-2" />
                Selecionar Pendentes
              </Button>
              <Button
                onClick={handleStartBatchClosing}
                disabled={selectedClients.length === 0}
                size="sm"
              >
                <Play className="h-4 w-4 mr-2" />
                Iniciar Lote ({selectedClients.length})
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Métricas */}
      {metrics && <ClosingMetricsCard metrics={metrics} />}

      {/* Timeline */}
      <ClosingTimelineCard closings={closingStatuses} />

      {/* Filtros */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros e Ações
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select
                value={statusFilter}
                onValueChange={(value: any) => setStatusFilter(value)}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Status</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                  <SelectItem value="in_progress">Em Progresso</SelectItem>
                  <SelectItem value="review">Em Revisão</SelectItem>
                  <SelectItem value="completed">Concluídos</SelectItem>
                  <SelectItem value="blocked">Bloqueados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Lista de Clientes */}
      <div className="grid gap-4">
        {filteredClosings.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Nenhum cliente encontrado
                </h3>
                <p className="text-muted-foreground">
                  {statusFilter === 'all' 
                    ? 'Não há dados de fechamento para este período.'
                    : `Não há clientes com status "${getStatusLabel(statusFilter as ClosingStatus['status'])}".`
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredClosings.map((closing) => (
            <ClientClosingCard
              key={closing.id}
              closing={closing}
              isSelected={selectedClients.includes(closing.client_id)}
              onToggleSelection={() => toggleClientSelection(closing.client_id)}
              onUpdateStatus={(status) => updateClosingStatus(closing.id, status)}
            />
          ))
        )}
      </div>
    </div>
  );
}