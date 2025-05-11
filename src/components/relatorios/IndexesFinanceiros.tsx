
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from "recharts";

interface IndexesFinanceirosProps {
  data?: any;
}

export const IndexesFinanceiros: React.FC<IndexesFinanceirosProps> = ({ data }) => {
  // Dados dos índices financeiros
  const indices = {
    liquidez_corrente: 2.3,
    liquidez_seca: 1.87,
    liquidez_imediata: 0.98,
    endividamento_geral: 0.42,
    endividamento_longo_prazo: 0.22,
    margem_bruta: 0.45,
    margem_liquida: 0.18,
    retorno_sobre_ativo: 0.13,
    retorno_sobre_pl: 0.22,
    giro_do_ativo: 0.72,
  };

  // Dados para o radar chart
  const radarData = [
    { indice: "Liquidez Corrente", valor: indices.liquidez_corrente, referencia: 1.5 },
    { indice: "Liquidez Seca", valor: indices.liquidez_seca, referencia: 1.2 },
    { indice: "Liquidez Imediata", valor: indices.liquidez_imediata, referencia: 0.7 },
    { indice: "Margem Bruta", valor: indices.margem_bruta, referencia: 0.4 },
    { indice: "Margem Líquida", valor: indices.margem_liquida, referencia: 0.15 },
    { indice: "ROA", valor: indices.retorno_sobre_ativo, referencia: 0.1 },
    { indice: "ROE", valor: indices.retorno_sobre_pl, referencia: 0.18 },
    { indice: "Giro do Ativo", valor: indices.giro_do_ativo, referencia: 0.65 },
  ];

  const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="bg-blue-50 pb-2">
            <CardTitle className="text-sm text-blue-800">Índices de Liquidez</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Liquidez Corrente</span>
                  <span className="text-sm font-bold">{indices.liquidez_corrente.toFixed(2)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${Math.min(indices.liquidez_corrente / 3, 1) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Capacidade de pagamento de dívidas de curto prazo.
                </p>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Liquidez Seca</span>
                  <span className="text-sm font-bold">{indices.liquidez_seca.toFixed(2)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${Math.min(indices.liquidez_seca / 3, 1) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Liquidez sem considerar estoques.
                </p>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Liquidez Imediata</span>
                  <span className="text-sm font-bold">{indices.liquidez_imediata.toFixed(2)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${Math.min(indices.liquidez_imediata / 2, 1) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Disponibilidades em relação às dívidas de curto prazo.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-red-50 pb-2">
            <CardTitle className="text-sm text-red-800">Endividamento</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Endividamento Geral</span>
                  <span className="text-sm font-bold">{formatPercentage(indices.endividamento_geral)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-600 h-2 rounded-full"
                    style={{ width: `${indices.endividamento_geral * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Total de dívidas em relação ao ativo total.
                </p>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Endividamento LP</span>
                  <span className="text-sm font-bold">{formatPercentage(indices.endividamento_longo_prazo)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-600 h-2 rounded-full"
                    style={{ width: `${indices.endividamento_longo_prazo * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Dívidas de longo prazo em relação ao ativo total.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-green-50 pb-2">
            <CardTitle className="text-sm text-green-800">Rentabilidade</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Margem Bruta</span>
                  <span className="text-sm font-bold">{formatPercentage(indices.margem_bruta)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${indices.margem_bruta * 100}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Margem Líquida</span>
                  <span className="text-sm font-bold">{formatPercentage(indices.margem_liquida)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${indices.margem_liquida * 100}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">ROA</span>
                  <span className="text-sm font-bold">{formatPercentage(indices.retorno_sobre_ativo)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${Math.min(indices.retorno_sobre_ativo * 2, 1) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Retorno sobre Ativos
                </p>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">ROE</span>
                  <span className="text-sm font-bold">{formatPercentage(indices.retorno_sobre_pl)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${Math.min(indices.retorno_sobre_pl * 1.5, 1) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Retorno sobre Patrimônio Líquido
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Análise Comparativa de Índices</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart outerRadius="70%" data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="indice" />
                <PolarRadiusAxis angle={90} domain={[0, 2.5]} />
                <Radar
                  name="Empresa"
                  dataKey="valor"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.6}
                />
                <Radar
                  name="Referência do Setor"
                  dataKey="referencia"
                  stroke="#82ca9d"
                  fill="#82ca9d"
                  fillOpacity={0.6}
                />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            <p>
              O gráfico acima compara os índices da empresa com valores de referência do setor,
              permitindo uma análise visual rápida das áreas de força e fraqueza.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
