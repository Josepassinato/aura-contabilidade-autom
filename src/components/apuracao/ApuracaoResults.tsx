
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
import { FileText, Download, CheckCircle, AlertCircle } from "lucide-react";

interface ApuracaoResultsProps {
  resultados: any[];
}

export function ApuracaoResults({ resultados }: ApuracaoResultsProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Empresa</TableHead>
            <TableHead>Período</TableHead>
            <TableHead className="text-right">Receita</TableHead>
            <TableHead className="text-right">Base de Cálculo</TableHead>
            <TableHead className="text-right">Imposto</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-center">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {resultados.map((resultado, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">
                <div>
                  <div>{resultado.cliente.nome}</div>
                  <div className="text-xs text-muted-foreground">{resultado.cliente.cnpj}</div>
                </div>
              </TableCell>
              <TableCell>{resultado.trimestre}</TableCell>
              <TableCell className="text-right">R$ {Number(resultado.receita).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
              <TableCell className="text-right">R$ {Number(resultado.baseCalculo).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
              <TableCell className="text-right">R$ {Number(resultado.imposto).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
              <TableCell>
                <Badge variant={resultado.status === "Processado" ? "default" : "outline"}>
                  <span className="flex items-center gap-1">
                    {resultado.status === "Processado" ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      <AlertCircle className="h-3 w-3" />
                    )}
                    {resultado.status}
                  </span>
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex justify-center space-x-2">
                  <Button size="icon" variant="ghost" title="Visualizar relatório">
                    <FileText className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" title="Baixar dados">
                    <Download className="h-4 w-4" />
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
