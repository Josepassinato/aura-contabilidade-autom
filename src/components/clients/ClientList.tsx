
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
import { Building2, AlertCircle, Plus, RefreshCw } from "lucide-react";
import { fetchAllClients } from '@/services/supabase/clientsService';
import { AccountingClient } from '@/lib/supabase';
import { Link } from 'react-router-dom';
import { ClientInviteForm } from './ClientInviteForm';

interface ClientListProps {
  refreshKey?: number;
}

export function ClientList({ refreshKey = 0 }: ClientListProps) {
  const [clients, setClients] = useState<AccountingClient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, profile } = useAuth();
  const { toast } = useToast();
  
  const fetchClients = async () => {
    console.log("=== CARREGANDO LISTA DE CLIENTES ===");
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await fetchAllClients();
      console.log(`Lista atualizada: ${data.length} clientes encontrados`);
      setClients(data);
      
      if (data.length === 0) {
        console.log("ℹ️ Nenhum cliente encontrado no banco de dados");
      } else {
        console.log("Clientes carregados:", data.map(c => ({ id: c.id, name: c.name, status: c.status })));
      }
    } catch (error: any) {
      console.error("❌ Erro ao carregar clientes:", error);
      setError("Não foi possível carregar a lista de clientes.");
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de clientes.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      console.log("=== FIM DO CARREGAMENTO ===");
    }
  };

  useEffect(() => {
    console.log(`Efeito disparado - refreshKey: ${refreshKey}`);
    fetchClients();
  }, [refreshKey]);

  const handleInviteSent = () => {
    toast({
      title: "Convite enviado",
      description: "O convite foi gerado com sucesso!",
    });
  };

  const handleRefresh = () => {
    console.log("🔄 Atualizando lista manualmente...");
    fetchClients();
  };
  
  if (isLoading) {
    return (
      <div className="text-center py-6">
        <div className="flex items-center justify-center gap-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <p>Carregando clientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-muted-foreground">
            {clients.length} cliente(s) encontrado(s)
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Atualizar
        </Button>
      </div>

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
                <TableHead>Regime</TableHead>
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
                    <Badge variant="outline">
                      {client.regime === "lucro_presumido" && "Lucro Presumido"}
                      {client.regime === "simples_nacional" && "Simples Nacional"}
                      {client.regime === "lucro_real" && "Lucro Real"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={client.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                      {client.status === "active" ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <ClientInviteForm 
                        client={client} 
                        onInviteSent={handleInviteSent}
                      />
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/clientes/${client.id}`}>Ver detalhes</Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

export default ClientList;
