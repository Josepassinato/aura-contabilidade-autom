
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
import { 
  FileText, 
  Download, 
  CheckCircle, 
  AlertCircle, 
  BarChart2,
  Share2,
  Printer
} from "lucide-react";
import { ResultadoApuracao } from "@/services/apuracao/apuracaoService";
import { toast } from "@/hooks/use-toast";

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

  return (
    <div className="overflow-x-auto">
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
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
