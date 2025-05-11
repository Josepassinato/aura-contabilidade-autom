
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Obrigacao } from "@/types/obrigacoes";
import { ObrigacaoStatusBadge } from "./ObrigacaoStatusBadge";
import { ObrigacaoPrioridadeBadge } from "./ObrigacaoPrioridadeBadge";
import { ObrigacaoActions } from "./ObrigacaoActions";

interface ObrigacoesListProps {
  obrigacoes: Obrigacao[];
}

export function ObrigacoesList({ obrigacoes }: ObrigacoesListProps) {
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
                <ObrigacaoStatusBadge status={obrigacao.status} />
              </TableCell>
              <TableCell>
                <ObrigacaoPrioridadeBadge prioridade={obrigacao.prioridade} />
              </TableCell>
              <TableCell>
                <ObrigacaoActions id={obrigacao.id} status={obrigacao.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
