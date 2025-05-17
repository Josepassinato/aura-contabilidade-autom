
import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getSefazScrapedData } from "@/services/governamental/sefazScraperService";
import { Badge } from "@/components/ui/badge";
import { SefazScraperButton } from "./SefazScraperButton";
import { UF } from "@/services/governamental/estadualIntegration";
import { Info } from "lucide-react";

interface SefazScrapedData {
  id: string;
  competencia: string;
  numero_guia: string;
  valor: string;
  data_vencimento: string;
  status: string;
  scraped_at: string;
}

interface SefazScrapedDataTableProps {
  clientId: string;
  clientName: string;
  uf: UF;
}

export function SefazScrapedDataTable({ 
  clientId, 
  clientName,
  uf = "SP"
}: SefazScrapedDataTableProps) {
  const [data, setData] = useState<SefazScrapedData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getSefazScrapedData(clientId);
      
      if (result.success) {
        setData(result.data || []);
      } else {
        setError("Não foi possível carregar os dados");
      }
    } catch (err: any) {
      console.error("Erro ao carregar dados:", err);
      setError(err.message || "Ocorreu um erro ao carregar os dados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (clientId) {
      fetchData();
    }
  }, [clientId]);

  // Fix: Updated to use only valid Badge variant values
  const getStatusBadgeVariant = (status: string) => {
    status = status.toLowerCase();
    if (status.includes("pendente")) return "outline";
    if (status.includes("pago")) return "default";
    return "secondary";
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Obrigações SEFAZ-{uf}</CardTitle>
          <CardDescription className="flex items-center mt-1 text-sm text-muted-foreground">
            <Info className="h-4 w-4 mr-1" />
            Atualização automática diária às 3:00 UTC
          </CardDescription>
        </div>
        <SefazScraperButton
          clientId={clientId}
          clientName={clientName}
          uf={uf}
          onSuccess={fetchData}
        />
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="text-center py-4 text-red-500">{error}</div>
        ) : loading ? (
          <div className="text-center py-4">Carregando dados...</div>
        ) : data.length > 0 ? (
          <Table>
            <TableCaption>
              Última atualização: {new Date(data[0]?.scraped_at).toLocaleString()}
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Competência</TableHead>
                <TableHead>Número da Guia</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.competencia}</TableCell>
                  <TableCell>{item.numero_guia}</TableCell>
                  <TableCell>{item.valor}</TableCell>
                  <TableCell>{item.data_vencimento}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(item.status)}>
                      {item.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-4 text-gray-500">
            Nenhum dado encontrado. Clique no botão para coletar dados da SEFAZ ou aguarde a coleta automática diária.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
