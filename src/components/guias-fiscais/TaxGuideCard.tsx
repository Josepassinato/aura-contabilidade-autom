
import React from "react";
import { TaxGuide } from "@/types/taxGuides";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Printer, Receipt } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface TaxGuideCardProps {
  guia: TaxGuide;
}

export function TaxGuideCard({ guia }: TaxGuideCardProps) {
  const handlePrintGuia = () => {
    toast({
      title: "Impressão solicitada",
      description: `Guia ${guia.type} - ${guia.reference} enviada para impressão.`,
    });
  };

  const handleMarkAsPaid = () => {
    toast({
      title: "Status atualizado",
      description: `Guia ${guia.type} - ${guia.reference} marcada como paga.`,
    });
  };

  const handleDownloadGuia = () => {
    toast({
      title: "Download iniciado",
      description: `Download da guia ${guia.type} - ${guia.reference} iniciado.`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pendente":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      case "pago":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "vencido":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <Badge className={getStatusColor(guia.status)}>
              {guia.status}
            </Badge>
            <h3 className="text-lg font-semibold mt-2">{guia.type} - {guia.reference}</h3>
            <p className="text-sm text-muted-foreground">{guia.clientName}</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold">{formatCurrency(guia.amount)}</p>
            <p className="text-sm text-muted-foreground">Vencimento: {formatDate(guia.dueDate)}</p>
          </div>
        </div>
        
        {guia.barCode && (
          <div className="mt-4">
            <p className="text-xs text-muted-foreground mb-1">Código de Barras:</p>
            <div className="p-2 bg-gray-50 border rounded font-mono text-xs break-all">
              {guia.barCode}
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="bg-gray-50 p-4 flex justify-end space-x-2">
        <Button
          size="sm"
          variant="outline"
          onClick={handlePrintGuia}
        >
          <Printer className="h-4 w-4 mr-2" />
          Imprimir
        </Button>
        
        {guia.status !== "pago" && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleMarkAsPaid}
          >
            <Receipt className="h-4 w-4 mr-2" />
            Marcar como Pago
          </Button>
        )}
        
        <Button
          size="sm"
          onClick={handleDownloadGuia}
        >
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
      </CardFooter>
    </Card>
  );
}
