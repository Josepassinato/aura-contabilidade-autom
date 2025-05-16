
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  FileText, 
  Download, 
  CheckCircle, 
  AlertCircle, 
  BarChart2,
  Share2,
  Printer,
  Database,
  CreditCard,
  Receipt,
  Info
} from "lucide-react";
import { ResultadoApuracao } from "@/services/apuracao/apuracaoService";
import { toast } from "@/hooks/use-toast";
import { obterTodasFontesDados } from "@/services/apuracao/fontesDadosService";

interface ApuracaoResultsProps {
  resultados: ResultadoApuracao[];
}

export function ApuracaoResults({ resultados }: ApuracaoResultsProps) {
  // Formatar valores para exibição
  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };
  
  // Gerar relatório em PDF
  const gerarPDF = (resultado: ResultadoApuracao) => {
    toast({
      title: "Relatório gerado",
      description: `O relatório de ${resultado.cliente.nome} foi gerado com sucesso.`
    });
  };
  
  // Compartilhar relatório
  const compartilharRelatorio = (resultado: ResultadoApuracao) => {
    toast({
      title: "Relatório compartilhado",
      description: `Um link para acesso foi enviado para o cliente.`
    });
  };

  // Verificar se há fontes de dados configuradas
  const fontesDadosConfiguradas = obterTodasFontesDados();
  const temFontesConfiguradas = fontesDadosConfiguradas.length > 0;

  // Obter ícone para origem de dados
  const getOrigemIcon = (resultado: ResultadoApuracao) => {
    if (resultado.origemDados?.includes('ocr')) {
      return <Receipt className="h-3 w-3" />;
    } else if (resultado.origemDados?.includes('openbanking')) {
      return <CreditCard className="h-3 w-3" />;
    } else if (resultado.origemDados?.includes('api')) {
      return <Database className="h-3 w-3" />;
    }
    return null;
  };

  return (
    <div className="overflow-x-auto">
      {temFontesConfiguradas && (
        <div className="p-2 mb-4 bg-green-50 border border-green-200 rounded-md flex items-center text-sm text-green-700">
          <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
          <span>
            Dados sendo processados automaticamente de {fontesDadosConfiguradas.length} fonte{fontesDadosConfiguradas.length > 1 ? 's' : ''} configurada{fontesDadosConfiguradas.length > 1 ? 's' : ''}.
          </span>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Empresa</TableHead>
            <TableHead>Período</TableHead>
            <TableHead className="text-right">Receita</TableHead>
            <TableHead className="text-right">Resultado</TableHead>
            <TableHead>Regime</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-center">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {resultados.map((resultado, index) => (
            <TableRow key={index} className="group hover:bg-muted/50">
              <TableCell className="font-medium">
                <div>
                  <div>{resultado.cliente.nome}</div>
                  <div className="text-xs text-muted-foreground">{resultado.cliente.cnpj}</div>
                  {resultado.origemDados && (
                    <div className="mt-1 flex items-center">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge variant="outline" className="text-[10px] flex items-center gap-1 px-1">
                              {getOrigemIcon(resultado)}
                              <span>Auto</span>
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">Processado automaticamente via {resultado.origemDados}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>{resultado.periodo}</TableCell>
              <TableCell className="text-right">
                {formatarMoeda(resultado.resumoFinanceiro.receitas)}
              </TableCell>
              <TableCell className={`text-right ${resultado.resumoFinanceiro.resultado >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatarMoeda(resultado.resumoFinanceiro.resultado)}
              </TableCell>
              <TableCell>
                <span className="text-xs px-2 py-1 bg-muted rounded-full">
                  {resultado.regimeTributario}
                </span>
              </TableCell>
              <TableCell>
                <Badge variant={resultado.status === "processado" ? "default" : "outline"}>
                  <span className="flex items-center gap-1">
                    {resultado.status === "processado" ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      <AlertCircle className="h-3 w-3" />
                    )}
                    {resultado.status === "processado" ? "Processado" : "Inconsistências"}
                  </span>
                </Badge>
                {resultado.lancamentos.anomalias > 0 && (
                  <div className="mt-1">
                    <Badge variant="destructive" className="text-[10px]">
                      {resultado.lancamentos.anomalias} anomalias
                    </Badge>
                  </div>
                )}
                {resultado.processamento_automatico && (
                  <div className="mt-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="secondary" className="text-[10px]">
                            <Database className="h-2 w-2 mr-1" />
                            Auto
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">Processado automaticamente</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )}
              </TableCell>
              <TableCell>
                <div className="flex justify-center space-x-1 opacity-70 group-hover:opacity-100">
                  <Button size="icon" variant="ghost" title="Visualizar relatório" onClick={() => gerarPDF(resultado)}>
                    <FileText className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" title="Baixar dados" onClick={() => gerarPDF(resultado)}>
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" title="Ver gráficos">
                    <BarChart2 className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" title="Compartilhar" onClick={() => compartilharRelatorio(resultado)}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" title="Imprimir" onClick={() => gerarPDF(resultado)}>
                    <Printer className="h-4 w-4" />
                  </Button>
                  {resultado.detalhesProcessamento && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button size="icon" variant="ghost">
                            <Info className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="text-xs space-y-1">
                            <p><strong>Processado por:</strong> {resultado.detalhesProcessamento.processador}</p>
                            <p><strong>Data:</strong> {resultado.detalhesProcessamento.data}</p>
                            <p><strong>Tempo:</strong> {resultado.detalhesProcessamento.tempoProcessamento}s</p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
