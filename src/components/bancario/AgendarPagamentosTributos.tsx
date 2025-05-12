
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard } from "lucide-react";
import { ImportacaoDados } from "./pagamentos-lote/ImportacaoDados";
import { ItemPagamento } from "./pagamentos-lote/ItemPagamento";
import { ResultadoAgendamento } from "./pagamentos-lote/ResultadoAgendamento";
import { usePagamentosLote } from "./pagamentos-lote/usePagamentosLote";

interface AgendarPagamentosTributosProps {
  bancoSelecionado: string;
}

export function AgendarPagamentosTributos({ bancoSelecionado }: AgendarPagamentosTributosProps) {
  const {
    isLoading,
    pagamentos,
    resultado,
    loteImportado,
    setLoteImportado,
    handleAddPagamento,
    handleRemovePagamento,
    handleChangePagamento,
    handleAgendar,
    handleImportarLote
  } = usePagamentosLote(bancoSelecionado);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Agendamento em Lote de Tributos e Boletos
          </CardTitle>
          <CardDescription>
            Configure múltiplos pagamentos para serem processados em lote
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ImportacaoDados 
            loteImportado={loteImportado}
            setLoteImportado={setLoteImportado}
            handleImportarLote={handleImportarLote}
          />
          
          <div>
            <h3 className="font-medium mb-2">Pagamentos</h3>
            <div className="space-y-6">
              {pagamentos.map((pagamento, index) => (
                <ItemPagamento
                  key={index}
                  pagamento={pagamento}
                  index={index}
                  onChange={handleChangePagamento}
                  onRemove={handleRemovePagamento}
                  resultado={resultado?.detalhes.find(d => d.index === index)}
                />
              ))}
            </div>
            
            <Button
              type="button"
              variant="outline"
              className="mt-4 w-full"
              onClick={handleAddPagamento}
            >
              Adicionar Pagamento
            </Button>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            onClick={handleAgendar}
            disabled={isLoading || !bancoSelecionado}
          >
            {isLoading ? "Processando..." : "Agendar Pagamentos"}
          </Button>
        </CardFooter>
      </Card>
      
      {resultado && (
        <ResultadoAgendamento 
          resultado={resultado} 
          totalPagamentos={pagamentos.length}
        />
      )}
    </div>
  );
}
