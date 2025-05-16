
import React from 'react';
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { FileText, Download, Trash2, RefreshCw, MoreVertical, Eye } from "lucide-react";
import { Document } from "@/lib/supabase";

export interface DocumentListProps {
  documents: Document[];
  onViewDocument: (document: Document) => Promise<void>;
  onDeleteDocument: (documentId: string) => Promise<void>;
  onRefreshDocuments: () => void;
  isLoading?: boolean;
}

export const DocumentList = ({ 
  documents, 
  onViewDocument,
  onDeleteDocument,
  onRefreshDocuments,
  isLoading = false 
}: DocumentListProps) => {
  const { toast } = useToast();
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  const handleView = async (document: Document) => {
    try {
      await onViewDocument(document);
    } catch (error) {
      console.error('Error viewing document:', error);
      toast({
        title: "Erro ao visualizar documento",
        description: "Não foi possível visualizar o documento.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      await onDeleteDocument(deleteId);
      toast({
        title: "Documento excluído",
        description: "O documento foi excluído com sucesso.",
      });
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: "Erro ao excluir documento",
        description: "Não foi possível excluir o documento.",
        variant: "destructive",
      });
    } finally {
      setDeleteId(null);
    }
  };

  const renderStatus = (status: string) => {
    switch (status) {
      case 'processado':
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Processado</span>;
      case 'rejeitado':
        return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">Rejeitado</span>;
      default:
        return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">Pendente</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-10 border rounded-lg">
        <FileText className="h-10 w-10 mx-auto text-muted-foreground" />
        <p className="mt-2 text-muted-foreground">Nenhum documento encontrado</p>
        <Button variant="outline" className="mt-4" onClick={onRefreshDocuments}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-end mb-2">
        <Button variant="outline" size="sm" onClick={onRefreshDocuments}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableCaption>Lista de documentos do cliente</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="hidden md:table-cell">Tamanho</TableHead>
              <TableHead className="hidden md:table-cell">Data</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell>{doc.name}</TableCell>
                <TableCell>{doc.type}</TableCell>
                <TableCell className="hidden md:table-cell">{doc.size}</TableCell>
                <TableCell className="hidden md:table-cell">{doc.created_at}</TableCell>
                <TableCell>{renderStatus(doc.status)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menu</span>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleView(doc)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Visualizar
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-600" 
                        onClick={() => setDeleteId(doc.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este documento? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
