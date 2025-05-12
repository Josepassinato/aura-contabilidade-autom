
import React, { useState, useEffect } from 'react';
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
import { Building2, AlertCircle, Plus } from "lucide-react";
import { fetchAllClients } from '@/services/supabase/clientsService';
import { AccountingClient } from '@/lib/supabase';
import { Link } from 'react-router-dom';

interface ClientListProps {
  refreshKey?: number;
}

export function ClientList({ refreshKey = 0 }: ClientListProps) {
  const [clients, setClients] = useState<AccountingClient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, profile } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchClients = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await fetchAllClients();
        setClients(data);
      } catch (error: any) {
        console.error("Erro ao carregar clientes:", error);
        setError("Não foi possível carregar a lista de clientes.");
        toast({
          title: "Erro",
          description: "Não foi possível carregar a lista de clientes.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchClients();
  }, [refreshKey]);
  
  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="text-center py-6">
          <p>Carregando clientes...</p>
        </div>
      ) : (
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
              <Button asChild>
                <Link to="/gerenciar-clientes?tab=cadastrar">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Cliente
                </Link>
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
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/clientes/${client.id}`}>Ver detalhes</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ClientList;
