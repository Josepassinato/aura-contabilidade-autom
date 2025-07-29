
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell
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
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ClientAccessToken, fetchTokensByClient, deactivateToken, deleteToken } from "@/services/supabase/clientAccessService";
import { Trash2, XCircle } from "lucide-react";

interface TokensListProps {
  clientId: string;
  refreshKey?: number;
}

export function TokensList({ clientId, refreshKey = 0 }: TokensListProps) {
  const [tokens, setTokens] = useState<ClientAccessToken[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tokenToDelete, setTokenToDelete] = useState<string | null>(null);
  const [tokenToRevoke, setTokenToRevoke] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadTokens = async () => {
      setIsLoading(true);
      try {
        const data = await fetchTokensByClient(clientId);
        setTokens(data);
      } catch (error) {
        console.error("Erro ao carregar tokens:", error);
        toast({
          title: "Erro ao carregar tokens",
          description: "Não foi possível carregar os tokens do cliente.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (clientId) {
      loadTokens();
    }
  }, [clientId, refreshKey]);

  const handleRevoke = async () => {
    if (tokenToRevoke) {
      try {
        const success = await deactivateToken(tokenToRevoke);
        if (success) {
          toast({
            title: "Token revogado",
            description: "O token foi revogado com sucesso.",
          });
          // Atualizar a lista
          setTokens(tokens.map(token => 
            token.id === tokenToRevoke ? { ...token, is_active: false } : token
          ));
        } else {
          toast({
            title: "Erro ao revogar token",
            description: "Não foi possível revogar o token.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Erro ao revogar token:", error);
        toast({
          title: "Erro ao revogar token",
          description: "Ocorreu um erro ao revogar o token.",
          variant: "destructive",
        });
      } finally {
        setTokenToRevoke(null);
      }
    }
  };

  const handleDelete = async () => {
    if (tokenToDelete) {
      try {
        const success = await deleteToken(tokenToDelete);
        if (success) {
          toast({
            title: "Token excluído",
            description: "O token foi excluído com sucesso.",
          });
          // Atualizar a lista
          setTokens(tokens.filter(token => token.id !== tokenToDelete));
        } else {
          toast({
            title: "Erro ao excluir token",
            description: "Não foi possível excluir o token.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Erro ao excluir token:", error);
        toast({
          title: "Erro ao excluir token",
          description: "Ocorreu um erro ao excluir o token.",
          variant: "destructive",
        });
      } finally {
        setTokenToDelete(null);
      }
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "Sem expiração";
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  if (isLoading) {
    return <div className="text-center py-4">Carregando tokens...</div>;
  }

  return (
    <>
      {tokens.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Nenhum token de acesso encontrado para este cliente.
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Token</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead>Expiração</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tokens.map((token) => (
                <TableRow key={token.id}>
                  <TableCell className="font-mono">{token.token}</TableCell>
                  <TableCell>{token.description || "-"}</TableCell>
                  <TableCell>{new Date(token.created_at).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>{formatDate(token.expires_at)}</TableCell>
                  <TableCell>
                    <Badge className={token.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                      {token.is_active ? "Ativo" : "Revogado"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {token.is_active && (
                      <Button variant="outline" size="sm" onClick={() => setTokenToRevoke(token.id)}>
                        <XCircle className="h-4 w-4 mr-1" /> Revogar
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => setTokenToDelete(token.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Dialogo de confirmação para revogar token */}
      <AlertDialog open={!!tokenToRevoke} onOpenChange={() => setTokenToRevoke(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revogar token de acesso</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja revogar este token? O cliente não poderá mais usá-lo para acessar o portal.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleRevoke}>Revogar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialogo de confirmação para excluir token */}
      <AlertDialog open={!!tokenToDelete} onOpenChange={() => setTokenToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir token de acesso</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este token? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
