import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, CheckCircle, FileX, Brain, Settings, RefreshCw } from 'lucide-react';
import { useWorkflowMonitoring, WorkflowProblem } from '@/hooks/useWorkflowMonitoring';
import { ProblemResolutionDialog } from './ProblemResolutionDialog';
import { WorkflowMetricsCard } from './WorkflowMetricsCard';
import { toast } from '@/hooks/use-toast';

export function ProblemsDashboard() {
  const { problems, metrics, loading, refetch, resolveErrorClassification, retryAutomationProcess } = useWorkflowMonitoring();
  const [selectedProblem, setSelectedProblem] = useState<WorkflowProblem | null>(null);
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  const getTypeIcon = (type: WorkflowProblem['type']) => {
    switch (type) {
      case 'classification_error':
        return <Brain className="h-4 w-4" />;
      case 'processing_failure':
        return <FileX className="h-4 w-4" />;
      case 'low_confidence':
        return <AlertTriangle className="h-4 w-4" />;
      case 'manual_review_needed':
        return <Clock className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: WorkflowProblem['severity']) => {
    switch (severity) {
      case 'high':
        return 'bg-destructive text-destructive-foreground';
      case 'medium':
        return 'bg-warning text-warning-foreground';
      case 'low':
        return 'bg-secondary text-secondary-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const getStatusColor = (status: WorkflowProblem['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-destructive text-destructive-foreground';
      case 'in_progress':
        return 'bg-warning text-warning-foreground';
      case 'resolved':
        return 'bg-success text-success-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const filteredProblems = problems.filter(problem => 
    filter === 'all' || problem.severity === filter
  );

  const handleRetryProcess = async (problemId: string) => {
    try {
      await retryAutomationProcess(problemId);
      toast({
        title: "Processo reinitiado",
        description: "O processo foi reinitiado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao reiniciar o processo.",
        variant: "destructive",
      });
    }
  };

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard de Problemas</h1>
          <p className="text-muted-foreground">
            Monitore e resolva problemas no workflow automatizado
          </p>
        </div>
        <Button onClick={refetch} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Métricas */}
      {metrics && <WorkflowMetricsCard metrics={metrics} />}

      {/* Filtros */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
          size="sm"
        >
          Todos ({problems.length})
        </Button>
        <Button
          variant={filter === 'high' ? 'default' : 'outline'}
          onClick={() => setFilter('high')}
          size="sm"
        >
          Alta ({problems.filter(p => p.severity === 'high').length})
        </Button>
        <Button
          variant={filter === 'medium' ? 'default' : 'outline'}
          onClick={() => setFilter('medium')}
          size="sm"
        >
          Média ({problems.filter(p => p.severity === 'medium').length})
        </Button>
        <Button
          variant={filter === 'low' ? 'default' : 'outline'}
          onClick={() => setFilter('low')}
          size="sm"
        >
          Baixa ({problems.filter(p => p.severity === 'low').length})
        </Button>
      </div>

      {/* Lista de Problemas */}
      <div className="grid gap-4">
        {filteredProblems.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {filter === 'all' ? 'Nenhum problema encontrado' : `Nenhum problema de severidade ${filter}`}
                </h3>
                <p className="text-muted-foreground">
                  O sistema está funcionando sem problemas no momento.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredProblems.map((problem) => (
            <Card key={problem.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="mt-1">
                      {getTypeIcon(problem.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-lg">{problem.title}</CardTitle>
                        <Badge className={getSeverityColor(problem.severity)}>
                          {problem.severity === 'high' ? 'Alta' : 
                           problem.severity === 'medium' ? 'Média' : 'Baixa'}
                        </Badge>
                        <Badge className={getStatusColor(problem.status)}>
                          {problem.status === 'pending' ? 'Pendente' : 
                           problem.status === 'in_progress' ? 'Em Progresso' : 'Resolvido'}
                        </Badge>
                      </div>
                      <CardDescription className="text-sm">
                        {problem.description}
                      </CardDescription>
                      {problem.client_name && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Cliente: {problem.client_name}
                        </p>
                      )}
                      {problem.document_name && (
                        <p className="text-sm text-muted-foreground">
                          Documento: {problem.document_name}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {problem.type === 'processing_failure' && (
                      <Button
                        onClick={() => handleRetryProcess(problem.id)}
                        variant="outline"
                        size="sm"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Tentar Novamente
                      </Button>
                    )}
                    <Button
                      onClick={() => setSelectedProblem(problem)}
                      variant="default"
                      size="sm"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Resolver
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>
                    Criado: {new Date(problem.created_at).toLocaleString('pt-BR')}
                  </span>
                  <span>
                    Tipo: {problem.type.replace('_', ' ')}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Dialog de Resolução */}
      {selectedProblem && (
        <ProblemResolutionDialog
          problem={selectedProblem}
          open={!!selectedProblem}
          onClose={() => setSelectedProblem(null)}
          onResolve={resolveErrorClassification}
        />
      )}
    </div>
  );
}