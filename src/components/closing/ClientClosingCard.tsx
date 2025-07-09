import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Pause, 
  Play, 
  Eye,
  FileText,
  TrendingUp,
  Settings
} from 'lucide-react';
import { ClosingStatus } from '@/hooks/useMonthlyClosing';

interface ClientClosingCardProps {
  closing: ClosingStatus;
  isSelected: boolean;
  onToggleSelection: () => void;
  onUpdateStatus: (status: ClosingStatus['status']) => void;
}

export function ClientClosingCard({ 
  closing, 
  isSelected, 
  onToggleSelection, 
  onUpdateStatus 
}: ClientClosingCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusIcon = (status: ClosingStatus['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-success" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-warning" />;
      case 'blocked':
        return <AlertTriangle className="h-5 w-5 text-destructive" />;
      case 'review':
        return <Pause className="h-5 w-5 text-info" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
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

  const progress = closing.validations_total > 0 
    ? (closing.validations_passed / closing.validations_total) * 100 
    : 0;

  const getProgressColor = () => {
    if (closing.status === 'blocked') return 'bg-destructive';
    if (closing.status === 'completed') return 'bg-success';
    if (progress >= 75) return 'bg-success';
    if (progress >= 50) return 'bg-warning';
    return 'bg-primary';
  };

  const canStart = closing.status === 'pending';
  const canComplete = closing.status === 'in_progress' && progress >= 80;

  return (
    <Card className={`transition-all duration-200 ${isSelected ? 'ring-2 ring-primary shadow-md' : 'hover:shadow-sm'}`}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <Checkbox
              checked={isSelected}
              onCheckedChange={onToggleSelection}
              disabled={closing.status === 'completed'}
              className="mt-1"
            />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                {getStatusIcon(closing.status)}
                <CardTitle className="text-lg truncate">{closing.client_name}</CardTitle>
                <Badge className={getStatusColor(closing.status)}>
                  {getStatusLabel(closing.status)}
                </Badge>
                {closing.confidence_score < 0.9 && (
                  <Badge variant="outline" className="text-warning border-warning">
                    Baixa Confiança
                  </Badge>
                )}
              </div>
              
              <CardDescription>
                {closing.documents_total > 0 && (
                  <span>
                    {closing.documents_processed}/{closing.documents_total} documentos • 
                  </span>
                )} 
                {closing.validations_passed}/{closing.validations_total} validações • 
                Última atividade: {new Date(closing.last_activity).toLocaleString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <Eye className="h-4 w-4 mr-2" />
              {isExpanded ? 'Ocultar' : 'Detalhes'}
            </Button>

            {canStart && (
              <Button
                size="sm"
                onClick={() => onUpdateStatus('in_progress')}
              >
                <Play className="h-4 w-4 mr-2" />
                Iniciar
              </Button>
            )}

            {canComplete && (
              <Button
                size="sm"
                variant="default"
                onClick={() => onUpdateStatus('completed')}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Finalizar
              </Button>
            )}

            {closing.status === 'blocked' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onUpdateStatus('in_progress')}
              >
                <Settings className="h-4 w-4 mr-2" />
                Resolver
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Progresso */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium">Progresso Geral</span>
            <span className="text-muted-foreground">{progress.toFixed(0)}%</span>
          </div>
          <div className="relative">
            <Progress value={progress} className="h-2" />
            <div 
              className={`absolute top-0 left-0 h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Métricas Rápidas */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-lg font-semibold text-primary">
              {Math.round(closing.confidence_score * 100)}%
            </div>
            <div className="text-xs text-muted-foreground">Confiança</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-warning">
              {closing.manual_adjustments_count}
            </div>
            <div className="text-xs text-muted-foreground">Ajustes Manuais</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-info">
              {closing.estimated_completion || '--'}
            </div>
            <div className="text-xs text-muted-foreground">Previsão</div>
          </div>
        </div>

        {/* Problemas/Bloqueios */}
        {closing.blocking_issues && closing.blocking_issues.length > 0 && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span className="text-sm font-medium text-destructive">
                Problemas Identificados
              </span>
            </div>
            <ul className="text-sm text-destructive space-y-1">
              {closing.blocking_issues.slice(0, 2).map((issue, index) => (
                <li key={index} className="text-xs">• {issue.description || issue}</li>
              ))}
              {closing.blocking_issues.length > 2 && (
                <li className="text-xs opacity-75">
                  e mais {closing.blocking_issues.length - 2} problema(s)...
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Detalhes Expandidos */}
        {isExpanded && (
          <div className="space-y-4 pt-4 border-t">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Documentos Processados:</span>
                <div className="text-muted-foreground">
                  {closing.documents_processed} de {closing.documents_total}
                </div>
              </div>
              <div>
                <span className="font-medium">Validações Concluídas:</span>
                <div className="text-muted-foreground">
                  {closing.validations_passed} de {closing.validations_total}
                </div>
              </div>
              {closing.started_at && (
                <div>
                  <span className="font-medium">Iniciado em:</span>
                  <div className="text-muted-foreground">
                    {new Date(closing.started_at).toLocaleString('pt-BR')}
                  </div>
                </div>
              )}
              {closing.completed_at && (
                <div>
                  <span className="font-medium">Concluído em:</span>
                  <div className="text-muted-foreground">
                    {new Date(closing.completed_at).toLocaleString('pt-BR')}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Ver Relatórios
              </Button>
              <Button variant="outline" size="sm">
                <TrendingUp className="h-4 w-4 mr-2" />
                Métricas Detalhadas
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}