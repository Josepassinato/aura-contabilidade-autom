import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ClientSelector } from "@/components/layout/ClientSelector";
import { dataProcessingService } from "@/services/contabil/dataProcessingService";
import { 
  Play, 
  FileText, 
  Calculator, 
  CheckCircle, 
  AlertCircle,
  Clock,
  TrendingUp
} from "lucide-react";

export function ProcessamentoAutomatico() {
  const [selectedClient, setSelectedClient] = useState<{id: string, name: string} | null>(null);
  const [period, setPeriod] = useState(new Date().toISOString().substring(0, 7));
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [progress, setProgress] = useState(0);
  const [lastResult, setLastResult] = useState<any>(null);
  const { toast } = useToast();

  const handleProcessClient = async () => {
    if (!selectedClient) {
      toast({
        title: "Selecione um cliente",
        description: "É necessário selecionar um cliente para processar os dados contábeis.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setLastResult(null);

    try {
      // Passo 1: Buscar documentos
      setProcessingStep("Buscando documentos do cliente...");
      setProgress(20);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Passo 2: Processar dados contábeis
      setProcessingStep("Processando dados contábeis...");
      setProgress(40);
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Passo 3: Calcular impostos
      setProcessingStep("Calculando impostos...");
      setProgress(60);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Passo 4: Gerar relatórios
      setProcessingStep("Gerando relatórios automáticos...");
      setProgress(80);

      const result = await dataProcessingService.processClientAccountingData(
        selectedClient.id, 
        period
      );

      // Passo 5: Finalizar
      setProcessingStep("Finalizando processamento...");
      setProgress(100);
      await new Promise(resolve => setTimeout(resolve, 500));

      setLastResult(result);

      toast({
        title: "Processamento concluído",
        description: `Dados contábeis processados e relatórios gerados para ${selectedClient.name}`,
      });

    } catch (error) {
      console.error('Erro no processamento:', error);
      toast({
        title: "Erro no processamento",
        description: "Não foi possível processar os dados contábeis. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
      setProgress(0);
    }
  };

  const handleProcessAllClients = async () => {
    setIsProcessing(true);
    setProgress(0);

    try {
      setProcessingStep("Processando todos os clientes ativos...");
      setProgress(50);

      const results = await dataProcessingService.processAllActiveClients(period);
      
      setProgress(100);
      
      toast({
        title: "Processamento em lote concluído",
        description: `${results.length} clientes processados com sucesso.`,
      });

    } catch (error) {
      console.error('Erro no processamento em lote:', error);
      toast({
        title: "Erro no processamento em lote",
        description: "Alguns clientes podem não ter sido processados.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
      setProgress(0);
    }
  };

  const handleClientSelect = (client: {id: string, name: string}) => {
    setSelectedClient(client);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Processamento Automático de Dados Contábeis
          </CardTitle>
          <CardDescription>
            Processe automaticamente os dados contábeis, calcule impostos e gere relatórios para seus clientes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Cliente</Label>
              <ClientSelector onClientChange={handleClientSelect} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="period">Período de Apuração</Label>
              <Input
                id="period"
                type="month"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              />
            </div>
          </div>

          {isProcessing && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 animate-spin" />
                <span className="text-sm">{processingStep}</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          <div className="flex gap-4">
            <Button 
              onClick={handleProcessClient}
              disabled={isProcessing || !selectedClient}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              {isProcessing ? "Processando..." : "Processar Cliente Selecionado"}
            </Button>
            
            <Button 
              variant="outline"
              onClick={handleProcessAllClients}
              disabled={isProcessing}
              className="flex items-center gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              Processar Todos os Clientes
            </Button>
          </div>
        </CardContent>
      </Card>

      {lastResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Resultado do Processamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="text-sm font-medium text-muted-foreground">Receita Bruta</div>
                <div className="text-2xl font-bold text-green-600">
                  R$ {lastResult.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>
              
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="text-sm font-medium text-muted-foreground">Lucro Líquido</div>
                <div className="text-2xl font-bold text-blue-600">
                  R$ {lastResult.netIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>
              
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="text-sm font-medium text-muted-foreground">Total de Impostos</div>
                <div className="text-2xl font-bold text-orange-600">
                  R$ {Object.values(lastResult.taxes as Record<string, number>).reduce((sum, tax) => sum + tax, 0).toLocaleString('pt-BR')}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Impostos Calculados:</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(lastResult.taxes).map(([tax, value]: [string, any]) => (
                  <Badge key={tax} variant="outline">
                    {tax.toUpperCase()}: R$ {(value as number).toLocaleString('pt-BR')}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Documentos Processados:</h4>
              <div className="flex gap-4 text-sm">
                <span><FileText className="inline h-4 w-4 mr-1" />NFe: {lastResult.documents.nfe}</span>
                <span><FileText className="inline h-4 w-4 mr-1" />Faturas: {lastResult.documents.invoices}</span>
                <span><FileText className="inline h-4 w-4 mr-1" />Recibos: {lastResult.documents.receipts}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span>3 relatórios automáticos foram gerados e estão disponíveis na seção de relatórios</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            Como Funciona o Processamento Automático
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">1</div>
              <div>
                <h4 className="font-medium">Coleta de Documentos</h4>
                <p className="text-sm text-muted-foreground">Sistema busca todos os documentos contábeis do cliente no período</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">2</div>
              <div>
                <h4 className="font-medium">Processamento de Dados</h4>
                <p className="text-sm text-muted-foreground">Extrai informações de NFe, faturas e lançamentos contábeis</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">3</div>
              <div>
                <h4 className="font-medium">Cálculo de Impostos</h4>
                <p className="text-sm text-muted-foreground">Calcula automaticamente todos os impostos conforme o regime tributário</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">4</div>
              <div>
                <h4 className="font-medium">Geração de Relatórios</h4>
                <p className="text-sm text-muted-foreground">Cria automaticamente relatórios de apuração, DRE e movimentação</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}