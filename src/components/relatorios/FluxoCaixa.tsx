
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, ResponsiveContainer, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

interface FluxoCaixaProps {
  data?: any;
}

export const FluxoCaixa: React.FC<FluxoCaixaProps> = ({ data }) => {
  // Dados de exemplo para o fluxo de caixa
  const fluxoCaixaData = {
    saldo_inicial: 120000,
    atividades_operacionais: {
      recebimento_vendas: 387000,
      pagamento_fornecedores: -185000,
      pagamento_funcionarios: -92000,
      pagamento_impostos: -58000,
      outras_entradas: 12000,
      outras_saidas: -24000,
    },
    atividades_investimento: {
      aquisicao_equipamentos: -45000,
      venda_ativos: 8000,
    },
    atividades_financiamento: {
      captacao_emprestimos: 60000,
      pagamento_emprestimos: -72000,
      pagamento_dividendos: -20000,
    },
    saldo_final: 101000,
  };

  // Cálculo dos subtotais
  const totalOperacional =
    fluxoCaixaData.atividades_operacionais.recebimento_vendas +
    fluxoCaixaData.atividades_operacionais.pagamento_fornecedores +
    fluxoCaixaData.atividades_operacionais.pagamento_funcionarios +
    fluxoCaixaData.atividades_operacionais.pagamento_impostos +
    fluxoCaixaData.atividades_operacionais.outras_entradas +
    fluxoCaixaData.atividades_operacionais.outras_saidas;

  const totalInvestimento =
    fluxoCaixaData.atividades_investimento.aquisicao_equipamentos +
    fluxoCaixaData.atividades_investimento.venda_ativos;

  const totalFinanciamento =
    fluxoCaixaData.atividades_financiamento.captacao_emprestimos +
    fluxoCaixaData.atividades_financiamento.pagamento_emprestimos +
    fluxoCaixaData.atividades_financiamento.pagamento_dividendos;

  const variacao = totalOperacional + totalInvestimento + totalFinanciamento;

  // Dados para o gráfico
  const chartData = [
    { mes: "Jan", saldo: 120000 },
    { mes: "Fev", saldo: 125000 },
    { mes: "Mar", saldo: 128000 },
    { mes: "Abr", saldo: 115000 },
    { mes: "Mai", saldo: 109000 },
    { mes: "Jun", saldo: 112000 },
    { mes: "Jul", saldo: 118000 },
    { mes: "Ago", saldo: 107000 },
    { mes: "Set", saldo: 112000 },
    { mes: "Out", saldo: 101000 },
    { mes: "Nov", saldo: 97000 },
    { mes: "Dez", saldo: 101000 },
  ];

  const formatValue = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Demonstração de Fluxo de Caixa</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80%]">Descrição</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="bg-muted/50 font-medium">
                <TableCell>Saldo Inicial de Caixa</TableCell>
                <TableCell className="text-right">{formatValue(fluxoCaixaData.saldo_inicial)}</TableCell>
              </TableRow>

              <TableRow className="font-medium">
                <TableCell>Fluxo das Atividades Operacionais</TableCell>
                <TableCell className="text-right">{formatValue(totalOperacional)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-6">(+) Recebimento de Clientes</TableCell>
                <TableCell className="text-right">{formatValue(fluxoCaixaData.atividades_operacionais.recebimento_vendas)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-6">(-) Pagamento a Fornecedores</TableCell>
                <TableCell className="text-right text-red-600">{formatValue(fluxoCaixaData.atividades_operacionais.pagamento_fornecedores)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-6">(-) Pagamento de Salários</TableCell>
                <TableCell className="text-right text-red-600">{formatValue(fluxoCaixaData.atividades_operacionais.pagamento_funcionarios)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-6">(-) Pagamento de Impostos</TableCell>
                <TableCell className="text-right text-red-600">{formatValue(fluxoCaixaData.atividades_operacionais.pagamento_impostos)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-6">(+) Outras Entradas</TableCell>
                <TableCell className="text-right">{formatValue(fluxoCaixaData.atividades_operacionais.outras_entradas)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-6">(-) Outras Saídas</TableCell>
                <TableCell className="text-right text-red-600">{formatValue(fluxoCaixaData.atividades_operacionais.outras_saidas)}</TableCell>
              </TableRow>

              <TableRow className="font-medium">
                <TableCell>Fluxo das Atividades de Investimento</TableCell>
                <TableCell className="text-right">{formatValue(totalInvestimento)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-6">(-) Aquisição de Equipamentos</TableCell>
                <TableCell className="text-right text-red-600">{formatValue(fluxoCaixaData.atividades_investimento.aquisicao_equipamentos)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-6">(+) Venda de Ativos</TableCell>
                <TableCell className="text-right">{formatValue(fluxoCaixaData.atividades_investimento.venda_ativos)}</TableCell>
              </TableRow>

              <TableRow className="font-medium">
                <TableCell>Fluxo das Atividades de Financiamento</TableCell>
                <TableCell className="text-right">{formatValue(totalFinanciamento)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-6">(+) Captação de Empréstimos</TableCell>
                <TableCell className="text-right">{formatValue(fluxoCaixaData.atividades_financiamento.captacao_emprestimos)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-6">(-) Pagamento de Empréstimos</TableCell>
                <TableCell className="text-right text-red-600">{formatValue(fluxoCaixaData.atividades_financiamento.pagamento_emprestimos)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-6">(-) Pagamento de Dividendos</TableCell>
                <TableCell className="text-right text-red-600">{formatValue(fluxoCaixaData.atividades_financiamento.pagamento_dividendos)}</TableCell>
              </TableRow>

              <TableRow className="bg-muted/50 font-medium">
                <TableCell>Variação de Caixa no Período</TableCell>
                <TableCell className={`text-right ${variacao >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatValue(variacao)}
                </TableCell>
              </TableRow>

              <TableRow className="bg-blue-50 font-bold">
                <TableCell>Saldo Final de Caixa</TableCell>
                <TableCell className="text-right">{formatValue(fluxoCaixaData.saldo_final)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Evolução do Saldo de Caixa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => formatValue(Number(value))}
                  labelFormatter={(name) => `Mês: ${name}`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="saldo"
                  name="Saldo de Caixa"
                  stroke="#8884d8"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
