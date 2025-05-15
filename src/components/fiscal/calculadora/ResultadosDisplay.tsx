
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TipoImposto, ResultadoCalculo } from "@/services/fiscal/types";
import { PagamentoResponse } from "@/services/bancario/openBankingService";

interface ResultadosDisplayProps {
  resultados: Record<TipoImposto, ResultadoCalculo>;
  cnpj: string;
  periodo: string;
  isLoading: boolean;
  selectedBanco: string;
  pagamentoStatus: Record<string, PagamentoResponse | null>;
  onPagamento: (tipo: TipoImposto, resultado: ResultadoCalculo) => void;
}

export const ResultadosDisplay: React.FC<ResultadosDisplayProps> = ({
  resultados,
  cnpj,
  periodo,
  isLoading,
  selectedBanco,
  pagamentoStatus,
  onPagamento
}) => {
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Resultados do Cálculo</CardTitle>
        <CardDescription>
          Impostos calculados para {cnpj} no período {periodo}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(resultados).map(([tipo, resultado]) => (
            <Card key={tipo} className="overflow-hidden">
              <CardHeader className="bg-muted py-3">
                <CardTitle className="text-lg">{tipo}</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Base de cálculo:</dt>
                    <dd className="font-medium">R$ {resultado.valorBase.toFixed(2)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Alíquota efetiva:</dt>
                    <dd className="font-medium">{(resultado.aliquotaEfetiva * 100).toFixed(2)}%</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Valor a pagar:</dt>
                    <dd className="font-medium text-lg">R$ {resultado.valorFinal.toFixed(2)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Vencimento:</dt>
                    <dd className="font-medium">{new Date(resultado.dataVencimento).toLocaleDateString()}</dd>
                  </div>
                  {resultado.codigoReceita && (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Código da receita:</dt>
                      <dd className="font-medium">{resultado.codigoReceita}</dd>
                    </div>
                  )}
                </dl>
                
                {/* Status do pagamento */}
                {pagamentoStatus[tipo as TipoImposto] && (
                  <div className={`mt-4 p-2 rounded text-sm ${
                    pagamentoStatus[tipo as TipoImposto]?.sucesso ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    <p><strong>Status:</strong> {pagamentoStatus[tipo as TipoImposto]?.mensagem}</p>
                    {pagamentoStatus[tipo as TipoImposto]?.comprovante && (
                      <a 
                        href={pagamentoStatus[tipo as TipoImposto]?.comprovante} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        Ver comprovante
                      </a>
                    )}
                  </div>
                )}
              </CardContent>
              <CardFooter className="bg-muted py-3">
                <Button 
                  onClick={() => onPagamento(tipo as TipoImposto, resultado)} 
                  className="w-full"
                  disabled={isLoading || !!pagamentoStatus[tipo as TipoImposto]?.sucesso}
                  variant={pagamentoStatus[tipo as TipoImposto]?.sucesso ? "outline" : "default"}
                >
                  {isLoading ? "Processando..." : 
                   pagamentoStatus[tipo as TipoImposto]?.sucesso ? "Pago" : "Pagar Agora"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
