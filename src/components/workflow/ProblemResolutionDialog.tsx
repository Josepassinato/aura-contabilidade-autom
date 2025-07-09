import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Brain, FileX, Clock } from 'lucide-react';
import { WorkflowProblem } from '@/hooks/useWorkflowMonitoring';
import { toast } from '@/hooks/use-toast';

interface ProblemResolutionDialogProps {
  problem: WorkflowProblem;
  open: boolean;
  onClose: () => void;
  onResolve: (errorId: string, correctedClassification: string, notes?: string) => Promise<void>;
}

const documentTypeOptions = [
  { value: 'nota_fiscal', label: 'Nota Fiscal' },
  { value: 'recibo', label: 'Recibo' },
  { value: 'comprovante_pagamento', label: 'Comprovante de Pagamento' },
  { value: 'extrato_bancario', label: 'Extrato Bancário' },
  { value: 'balancete', label: 'Balancete' },
  { value: 'declaracao', label: 'Declaração' },
  { value: 'contrato', label: 'Contrato' },
  { value: 'outros', label: 'Outros' }
];

export function ProblemResolutionDialog({ problem, open, onClose, onResolve }: ProblemResolutionDialogProps) {
  const [correctedClassification, setCorrectedClassification] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const getTypeIcon = (type: WorkflowProblem['type']) => {
    switch (type) {
      case 'classification_error':
        return <Brain className="h-5 w-5" />;
      case 'processing_failure':
        return <FileX className="h-5 w-5" />;
      case 'low_confidence':
        return <AlertTriangle className="h-5 w-5" />;
      case 'manual_review_needed':
        return <Clock className="h-5 w-5" />;
      default:
        return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const handleResolve = async () => {
    if (!correctedClassification && problem.type === 'classification_error') {
      toast({
        title: "Erro",
        description: "Selecione a classificação correta.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await onResolve(problem.id, correctedClassification, notes);
      toast({
        title: "Problema resolvido",
        description: "O problema foi marcado como resolvido.",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao resolver o problema.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCorrectedClassification('');
    setNotes('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getTypeIcon(problem.type)}
            Resolver Problema
          </DialogTitle>
          <DialogDescription>
            Analise e resolva o problema identificado no workflow automatizado.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações do Problema */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{problem.title}</CardTitle>
              <CardDescription>{problem.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                <div className="flex justify-between">
                  <span className="font-medium">Severidade:</span>
                  <Badge variant="outline">
                    {problem.severity === 'high' ? 'Alta' : 
                     problem.severity === 'medium' ? 'Média' : 'Baixa'}
                  </Badge>
                </div>
                
                {problem.client_name && (
                  <div className="flex justify-between">
                    <span className="font-medium">Cliente:</span>
                    <span>{problem.client_name}</span>
                  </div>
                )}
                
                {problem.document_name && (
                  <div className="flex justify-between">
                    <span className="font-medium">Documento:</span>
                    <span>{problem.document_name}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="font-medium">Data:</span>
                  <span>{new Date(problem.created_at).toLocaleString('pt-BR')}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ações de Resolução */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Ações de Resolução</h3>
            
            {problem.type === 'classification_error' && (
              <div className="space-y-2">
                <Label htmlFor="corrected-classification">
                  Classificação Correta
                </Label>
                <Select
                  value={correctedClassification}
                  onValueChange={setCorrectedClassification}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a classificação correta" />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {problem.type === 'low_confidence' && (
              <div className="space-y-2">
                <Label htmlFor="manual-classification">
                  Confirmar ou Corrigir Classificação
                </Label>
                <Select
                  value={correctedClassification}
                  onValueChange={setCorrectedClassification}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Confirme ou selecione nova classificação" />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="resolution-notes">
                Notas da Resolução (opcional)
              </Label>
              <Textarea
                id="resolution-notes"
                placeholder="Adicione notas sobre como o problema foi resolvido..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* Detalhes Técnicos */}
          {problem.metadata && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Detalhes Técnicos</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-sm bg-muted p-3 rounded-md overflow-x-auto">
                  {JSON.stringify(problem.metadata, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={handleClose}
            variant="outline"
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleResolve}
            disabled={loading}
          >
            {loading ? 'Resolvendo...' : 'Resolver Problema'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}