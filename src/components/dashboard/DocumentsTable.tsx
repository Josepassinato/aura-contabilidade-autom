
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Document {
  id: string;
  name: string;
  client: string;
  type: string;
  status: 'pendente' | 'recebido' | 'processado' | 'arquivado';
  date: string;
}

interface DocumentsTableProps {
  documents: Document[];
}

export function DocumentsTable({ documents }: DocumentsTableProps) {
  const statusClasses = {
    pendente: 'bg-yellow-100 text-yellow-800',
    recebido: 'bg-blue-100 text-blue-800',
    processado: 'bg-green-100 text-green-800',
    arquivado: 'bg-gray-100 text-gray-800'
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Documentos Recentes</CardTitle>
        <FileText className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Documento</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Nenhum documento encontrado
                </TableCell>
              </TableRow>
            ) : (
              documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">{doc.name}</TableCell>
                  <TableCell>{doc.client}</TableCell>
                  <TableCell>{doc.type}</TableCell>
                  <TableCell>{doc.date}</TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-1 rounded-full ${statusClasses[doc.status]}`}>
                      {doc.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default DocumentsTable;
