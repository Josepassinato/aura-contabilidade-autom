
import React, { useState } from "react";
import { TaxGuide, TaxGuideStatus } from "@/types/taxGuides";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { FileText, Printer, Receipt, Download } from "lucide-react";

interface GuiasFiscaisListProps {
  guias: TaxGuide[];
}

export function GuiasFiscaisList({ guias }: GuiasFiscaisListProps) {
  const [filteredGuias, setFilteredGuias] = useState<TaxGuide[]>(guias);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGuia, setSelectedGuia] = useState<TaxGuide | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  React.useEffect(() => {
    let result = [...guias];
    
    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter(guia => guia.status === statusFilter);
    }
    
    // Apply type filter
    if (typeFilter !== "all") {
      result = result.filter(guia => guia.type === typeFilter);
    }
    
    // Apply search
    if (searchTerm) {
      result = result.filter(
        guia => 
          guia.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          guia.reference.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredGuias(result);
  }, [guias, statusFilter, typeFilter, searchTerm]);

  const handleViewGuia = (guia: TaxGuide) => {
    setSelectedGuia(guia);
    setIsDialogOpen(true);
  };

  const handlePrintGuia = (guia: TaxGuide) => {
    toast({
      title: "Impressão solicitada",
      description: `Guia ${guia.type} - ${guia.reference} enviada para impressão.`,
    });
  };

  const handleMarkAsPaid = (guia: TaxGuide) => {
    toast({
      title: "Status atualizado",
      description: `Guia ${guia.type} - ${guia.reference} marcada como paga.`,
    });
  };

  const handleDownloadGuia = (guia: TaxGuide) => {
    toast({
      title: "Download iniciado",
      description: `Download da guia ${guia.type} - ${guia.reference} iniciado.`,
    });
  };

  const getStatusColor = (status: TaxGuideStatus) => {
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
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Buscar por cliente ou referência..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="pago">Pago</SelectItem>
              <SelectItem value="vencido">Vencido</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="DARF">DARF</SelectItem>
              <SelectItem value="GPS">GPS</SelectItem>
              <SelectItem value="DAS">DAS</SelectItem>
              <SelectItem value="ISS">ISS</SelectItem>
              <SelectItem value="ICMS">ICMS</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredGuias.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">Nenhuma guia fiscal encontrada.</p>
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Referência</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGuias.map((guia) => (
                <TableRow key={guia.id}>
                  <TableCell className="font-medium">{guia.clientName}</TableCell>
                  <TableCell>{guia.type}</TableCell>
                  <TableCell>{guia.reference}</TableCell>
                  <TableCell>{formatDate(guia.dueDate)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(guia.amount)}</TableCell>
                  <TableCell>
                    <Badge className={`${getStatusColor(guia.status)}`}>
                      {guia.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center space-x-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        title="Visualizar"
                        onClick={() => handleViewGuia(guia)}
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        title="Imprimir"
                        onClick={() => handlePrintGuia(guia)}
                      >
                        <Printer className="h-4 w-4" />
                      </Button>
                      {guia.status !== "pago" && (
                        <Button
                          size="icon"
                          variant="ghost"
                          title="Marcar como pago"
                          onClick={() => handleMarkAsPaid(guia)}
                        >
                          <Receipt className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        title="Download"
                        onClick={() => handleDownloadGuia(guia)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        {selectedGuia && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Detalhes da Guia Fiscal</DialogTitle>
              <DialogDescription>
                {selectedGuia.type} - {selectedGuia.reference}
              </DialogDescription>
            </DialogHeader>
            <div className="p-4 border rounded-lg space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-muted-foreground">Cliente:</p>
                  <p className="font-medium">{selectedGuia.clientName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tipo:</p>
                  <p className="font-medium">{selectedGuia.type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Referência:</p>
                  <p className="font-medium">{selectedGuia.reference}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data de Vencimento:</p>
                  <p className="font-medium">{formatDate(selectedGuia.dueDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Valor:</p>
                  <p className="font-medium">{formatCurrency(selectedGuia.amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status:</p>
                  <Badge className={`${getStatusColor(selectedGuia.status)}`}>
                    {selectedGuia.status}
                  </Badge>
                </div>
              </div>
              
              {selectedGuia.barCode && (
                <div>
                  <p className="text-sm text-muted-foreground">Código de Barras:</p>
                  <div className="p-2 bg-gray-50 border rounded font-mono text-sm break-all">
                    {selectedGuia.barCode}
                  </div>
                </div>
              )}
              
              <div className="mt-4 flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => handlePrintGuia(selectedGuia)}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimir
                </Button>
                <Button
                  onClick={() => handleDownloadGuia(selectedGuia)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
