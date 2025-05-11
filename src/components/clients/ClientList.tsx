
import React, { useState } from "react";
import { Building, Edit, Trash2, Calendar, Calculator } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { useSupabaseClient, AccountingClient } from "@/lib/supabase";

export function ClientList() {
  const [clients, setClients] = useState<AccountingClient[]>([
    {
      id: "1",
      name: "Empresa ABC Ltda",
      cnpj: "12.345.678/0001-90",
      email: "contato@empresaabc.com.br",
      phone: "(11) 1234-5678",
      address: "Av. Paulista, 1000, São Paulo, SP",
      created_at: "2023-01-15",
      accounting_firm_id: "1",
    },
    {
      id: "2",
      name: "XYZ Comércio S.A.",
      cnpj: "98.765.432/0001-10",
      email: "financeiro@xyzcomercio.com.br",
      phone: "(11) 8765-4321",
      address: "Rua Augusta, 500, São Paulo, SP",
      created_at: "2023-03-22",
      accounting_firm_id: "1",
    },
    {
      id: "3",
      name: "Tech Solutions",
      cnpj: "45.678.901/0001-23",
      email: "contato@techsolutions.com.br",
      phone: "(11) 4567-8901",
      address: "Rua Vergueiro, 200, São Paulo, SP",
      created_at: "2023-05-10",
      accounting_firm_id: "1",
    },
  ]);

  const handleDelete = (id: string) => {
    setClients(clients.filter(client => client.id !== id));
    toast({
      title: "Cliente removido",
      description: "O cliente foi removido com sucesso."
    });
  };

  const handleProcessar = (clientId: string) => {
    // Aqui iniciaria o processamento automático para o cliente
    toast({
      title: "Processamento iniciado",
      description: "O processamento contábil foi iniciado para este cliente."
    });
  };

  return (
    <div>
      {clients.length === 0 ? (
        <div className="text-center py-10">
          <h3 className="text-lg font-medium">Nenhum cliente cadastrado</h3>
          <p className="text-muted-foreground mt-2">
            Adicione clientes para começar a automatizar a contabilidade.
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>CNPJ</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell className="font-medium">{client.name}</TableCell>
                <TableCell>{client.cnpj}</TableCell>
                <TableCell>{client.email}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Configurado
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="icon" title="Editar">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="icon" title="Excluir">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmação de exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir o cliente {client.name}? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(client.id)}>
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  
                  <Button 
                    variant="outline" 
                    size="icon" 
                    title="Processar Contabilidade"
                    onClick={() => handleProcessar(client.id)}
                  >
                    <Calculator className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
