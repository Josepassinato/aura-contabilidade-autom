
import React, { useState, useEffect } from 'react';
import { AccountingClient, useSupabaseClient } from "@/lib/supabase";
import { useAuth } from '@/contexts/auth';
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Building2, AlertCircle, Search, Plus } from "lucide-react";

export function ClientList() {
  const [clients, setClients] = useState<AccountingClient[]>([
    {
      id: "1",
      name: "Empresa ABC Ltda",
      cnpj: "12.345.678/0001-99",
      email: "contato@empresaabc.com",
      phone: "(11) 3456-7890",
      address: "Av. Paulista, 1000",
      status: "active",
      // Remove accounting_firm_id as it's not in the interface
    },
    {
      id: "2",
      name: "XYZ Comércio S.A.",
      cnpj: "98.765.432/0001-10",
      email: "financeiro@xyzcomercio.com.br",
      phone: "(11) 2345-6789",
      address: "Rua Augusta, 500",
      status: "active",
      // Remove accounting_firm_id as it's not in the interface
    },
    {
      id: "3",
      name: "Tech Solutions",
      cnpj: "45.678.901/0001-23",
      email: "contato@techsolutions.com.br",
      phone: "(11) 9876-5432",
      address: "Alameda Santos, 200",
      status: "inactive",
      // Remove accounting_firm_id as it's not in the interface
    }
  ]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, profile, userProfile } = useAuth();
  const supabase = useSupabaseClient();
  const { toast } = useToast();
  
  // Rest of the component can remain unchanged
  return (
    <div className="space-y-6">
      {/* Keep the rest of the component */}
      <div className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {clients.length === 0 ? (
          <div className="text-center py-6">
            <Building2 className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-3" />
            <h3 className="text-lg font-medium mb-2">Nenhum cliente encontrado</h3>
            <p className="text-muted-foreground mb-4">
              Você ainda não possui clientes cadastrados ou a busca não retornou resultados.
            </p>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Cliente
            </Button>
          </div>
        ) : (
          <div className="border rounded-md">
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
                      <Badge className={client.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                        {client.status === "active" ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">Ver detalhes</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}

export default ClientList;
