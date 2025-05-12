
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, CheckCircle } from "lucide-react";

export interface PagamentoItem {
  codigoBarras: string;
  valor: string;
  dataVencimento: string;
  dataPagamento: string;
  descricao: string;
  tipo: 'DARF' | 'GPS' | 'DAS' | 'FGTS' | 'IPTU' | 'IPVA' | 'Boleto';
}

interface ResultadoDetalhe {
  sucesso: boolean; 
  idTransacao?: string; 
  mensagem?: string;
  index: number;
}

interface ItemPagamentoProps {
  pagamento: PagamentoItem;
  index: number;
  onChange: (index: number, campo: string, valor: string) => void;
  onRemove: (index: number) => void;
  resultado?: ResultadoDetalhe;
}

export function ItemPagamento({ pagamento, index, onChange, onRemove, resultado }: ItemPagamentoProps) {
  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-medium">Pagamento #{index + 1}</h4>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onRemove(index)}
        >
          Remover
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`tipo-${index}`}>Tipo</Label>
          <Select 
            value={pagamento.tipo}
            onValueChange={(valor) => onChange(index, 'tipo', valor)}
          >
            <SelectTrigger id={`tipo-${index}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DARF">DARF</SelectItem>
              <SelectItem value="GPS">GPS</SelectItem>
              <SelectItem value="DAS">DAS</SelectItem>
              <SelectItem value="FGTS">FGTS</SelectItem>
              <SelectItem value="IPTU">IPTU</SelectItem>
              <SelectItem value="IPVA">IPVA</SelectItem>
              <SelectItem value="Boleto">Boleto</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor={`valor-${index}`}>Valor (R$)</Label>
          <Input
            id={`valor-${index}`}
            type="text"
            placeholder="0,00"
            value={pagamento.valor}
            onChange={(e) => onChange(index, 'valor', e.target.value)}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor={`codigo-${index}`}>Código de Barras</Label>
        <Input
          id={`codigo-${index}`}
          type="text"
          placeholder="Insira o código de barras"
          value={pagamento.codigoBarras}
          onChange={(e) => onChange(index, 'codigoBarras', e.target.value)}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`vencimento-${index}`}>Data de Vencimento</Label>
          <Input
            id={`vencimento-${index}`}
            type="date"
            value={pagamento.dataVencimento}
            onChange={(e) => onChange(index, 'dataVencimento', e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor={`pagamento-${index}`}>Data de Pagamento</Label>
          <Input
            id={`pagamento-${index}`}
            type="date"
            value={pagamento.dataPagamento}
            onChange={(e) => onChange(index, 'dataPagamento', e.target.value)}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor={`descricao-${index}`}>Descrição (opcional)</Label>
        <Input
          id={`descricao-${index}`}
          type="text"
          placeholder="Identificação do pagamento"
          value={pagamento.descricao}
          onChange={(e) => onChange(index, 'descricao', e.target.value)}
        />
      </div>
      
      {resultado && (
        <div className={`p-3 rounded-md text-sm ${
          resultado.sucesso
            ? 'bg-green-100 text-green-800'
            : 'bg-amber-100 text-amber-800'
        }`}>
          <div className="flex items-center gap-2">
            {resultado.sucesso ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <span>{resultado.mensagem}</span>
          </div>
          {resultado.idTransacao && (
            <div className="mt-1 text-xs">
              ID: {resultado.idTransacao}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
