
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getClientPixPayments } from "@/services/bancario/pixService";

interface PixPayment {
  id: string;
  transaction_id: string;
  amount: string;
  description: string;
  status: string;
  initiated_at: string;
  completed_at: string | null;
  error_message: string | null;
}

interface PixPaymentHistoryProps {
  clientId: string;
  refreshTrigger?: number;
}

export function PixPaymentHistory({ clientId, refreshTrigger = 0 }: PixPaymentHistoryProps) {
  const [payments, setPayments] = useState<PixPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPayments() {
      if (!clientId) return;
      
      setLoading(true);
      
      try {
        const data = await getClientPixPayments(clientId);
        setPayments(data);
        setError(null);
      } catch (err: any) {
        console.error("Erro ao carregar pagamentos:", err);
        setError(err.message || "Falha ao carregar histórico de pagamentos");
      } finally {
        setLoading(false);
      }
    }
    
    loadPayments();
  }, [clientId, refreshTrigger]);

  // Função para formatar data
  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR") + " " + date.toLocaleTimeString("pt-BR");
  };

  // Função para estilizar o badge de status
  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "confirmado":
        return "default";
      case "processing":
      case "processando":
        return "secondary";
      case "failed":
      case "falha":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Pagamentos Pix</CardTitle>
        <CardDescription>
          Histórico de pagamentos via Pix realizados para este cliente
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="text-center py-4 text-red-500">{error}</div>
        ) : loading ? (
          <div className="text-center py-4">Carregando histórico...</div>
        ) : payments.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Transação</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{formatDate(payment.initiated_at)}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {payment.transaction_id}
                  </TableCell>
                  <TableCell>R$ {payment.amount}</TableCell>
                  <TableCell>{payment.description}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(payment.status)}>
                      {payment.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-4 text-gray-500">
            Nenhum pagamento Pix encontrado para este cliente.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
