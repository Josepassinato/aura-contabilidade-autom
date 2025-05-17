
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getClientPixPayments } from "@/services/bancario/pixService";
import type { PixPayment } from "@/services/bancario/pixTypes";
import { Skeleton } from "@/components/ui/skeleton";

interface PixPaymentHistoryProps {
  clientId: string;
  refreshTrigger?: number;
}

export function PixPaymentHistory({ clientId, refreshTrigger = 0 }: PixPaymentHistoryProps) {
  const [payments, setPayments] = useState<PixPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Função para carregar pagamentos
  const loadPayments = async () => {
    if (!clientId) return;
    
    setIsLoading(true);
    try {
      const data = await getClientPixPayments(clientId);
      setPayments(data);
    } catch (error) {
      console.error("Erro ao carregar histórico de Pix:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar quando o componente montar ou quando refreshTrigger mudar
  useEffect(() => {
    loadPayments();
  }, [clientId, refreshTrigger]);

  // Função para renderizar o status do pagamento
  const renderStatus = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="default" className="bg-green-500">Concluído</Badge>;
      case "processing":
        return <Badge variant="outline" className="text-amber-500 border-amber-500">Processando</Badge>;
      case "initiated":
        return <Badge variant="outline" className="text-blue-500 border-blue-500">Iniciado</Badge>;
      case "failed":
        return <Badge variant="destructive">Falhou</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Função para formatar o timestamp
  const formatTimestamp = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true, locale: ptBR });
    } catch (e) {
      return "Data inválida";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Pagamentos</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          // Skeleton loader
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-full" />
              </div>
            ))}
          </div>
        ) : payments.length === 0 ? (
          // Mensagem quando não há pagamentos
          <div className="text-center py-6 text-muted-foreground">
            Nenhum pagamento Pix encontrado para este cliente.
          </div>
        ) : (
          // Tabela de pagamentos
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="whitespace-nowrap">
                      {formatTimestamp(payment.initiated_at)}
                    </TableCell>
                    <TableCell>{payment.description}</TableCell>
                    <TableCell>
                      R$ {Number(payment.amount).toFixed(2).replace(".", ",")}
                    </TableCell>
                    <TableCell>{renderStatus(payment.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
