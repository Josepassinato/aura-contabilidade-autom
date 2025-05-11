
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
import { CheckCircle, AlertTriangle, Clock, FileText, Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Obrigacao {
  id: number;
  nome: string;
  tipo: string;
  prazo: string;
  empresa: string;
  status: "pendente" | "atrasado" | "concluido";
  prioridade: "baixa" | "media" | "alta";
}

interface ObrigacoesListProps {
  obrigacoes: Obrigacao[];
}

export function ObrigacoesList({ obrigacoes }: ObrigacoesListProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pendente":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "atrasado":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "concluido":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return null;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "pendente":
        return "bg-yellow-100 text-yellow-800";
      case "atrasado":
        return "bg-red-100 text-red-800";
      case "concluido":
        return "bg-green-100 text-green-800";
      default:
        return "";
    }
  };

  const getPrioridadeBadgeColor = (prioridade: string) => {
    switch (prioridade) {
      case "baixa":
        return "bg-blue-100 text-blue-800";
      case "media":
        return "bg-yellow-100 text-yellow-800";
      case "alta":
        return "bg-red-100 text-red-800";
      default:
        return "";
    }
  };

  const marcarComoConcluida = (id: number) => {
    toast({
      title: "Obrigação concluída",
      description: "A obrigação foi marcada como concluída com sucesso."
    });
  };

  const gerarDocumento = (id: number) => {
    toast({
      title: "Documento gerado",
      description: "O documento foi gerado com sucesso e está disponível para download."
    });
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Prazo</TableHead>
            <TableHead>Empresa</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Prioridade</TableHead>
            <TableHead className="text-center">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {obrigacoes.map((obrigacao) => (
            <TableRow key={obrigacao.id}>
              <TableCell className="font-medium">{obrigacao.nome}</TableCell>
              <TableCell>{obrigacao.tipo}</TableCell>
              <TableCell>{obrigacao.prazo}</TableCell>
              <TableCell>{obrigacao.empresa}</TableCell>
              <TableCell>
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getStatusBadgeColor(obrigacao.status)}`}>
                  {getStatusIcon(obrigacao.status)}
                  <span className="ml-1 capitalize">
                    {obrigacao.status === "concluido" ? "Concluído" : 
                     obrigacao.status === "atrasado" ? "Atrasado" : "Pendente"}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getPrioridadeBadgeColor(obrigacao.prioridade)}`}>
                  {obrigacao.prioridade === "alta" ? "Alta" : 
                   obrigacao.prioridade === "media" ? "Média" : "Baixa"}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex justify-center space-x-2">
                  {obrigacao.status !== "concluido" && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      title="Marcar como concluída"
                      onClick={() => marcarComoConcluida(obrigacao.id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Concluir
                    </Button>
                  )}
                  <Button 
                    size="sm" 
                    variant="outline"
                    title="Gerar documento"
                    onClick={() => gerarDocumento(obrigacao.id)}
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    Gerar
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
