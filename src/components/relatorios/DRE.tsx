
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
import { BarChart, ResponsiveContainer, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

interface DREProps {
  data?: any;
}

export const DRE: React.FC<DREProps> = ({ data }) => {
  // Dados de exemplo para a DRE
  const dreData = {
    receita_bruta: 450000,
    deducoes: -63000,
    receita_liquida: 387000,
    custo_produtos: -185000,
    lucro_bruto: 202000,
    despesas_operacionais: {
      administrativas: -45000,
      vendas: -38000,
      financeiras: -12000,
    },
    outras_receitas: 8000,
    lucro_operacional: 115000,
    impostos_sobre_lucro: -34500,
    lucro_liquido: 80500,
  };

  const totalDespesasOperacionais =
    dreData.despesas_operacionais.administrativas +
    dreData.despesas_operacionais.vendas +
    dreData.despesas_operacionais.financeiras;

  // Dados para o gráfico
  const chartData = [
    {
      name: "Receita Bruta",
      valor: dreData.receita_bruta,
    },
    {
      name: "Receita Líquida",
      valor: dreData.receita_liquida,
    },
    {
      name: "Lucro Bruto",
      valor: dreData.lucro_bruto,
    },
    {
      name: "Lucro Operacional",
      valor: dreData.lucro_operacional,
    },
    {
      name: "Lucro Líquido",
      valor: dreData.lucro_liquido,
    },
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
          <CardTitle className="text-lg">Demonstração do Resultado do Exercício</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[70%]">Descrição</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="text-right">%</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Receita Bruta de Vendas</TableCell>
                <TableCell className="text-right">{formatValue(dreData.receita_bruta)}</TableCell>
                <TableCell className="text-right">100%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-6">(-) Deduções da Receita</TableCell>
                <TableCell className="text-right text-red-600">{formatValue(dreData.deducoes)}</TableCell>
                <TableCell className="text-right">{Math.round((dreData.deducoes / dreData.receita_bruta) * 100)}%</TableCell>
              </TableRow>
              <TableRow className="bg-muted/50">
                <TableCell className="font-medium">Receita Líquida</TableCell>
                <TableCell className="text-right">{formatValue(dreData.receita_liquida)}</TableCell>
                <TableCell className="text-right">{Math.round((dreData.receita_liquida / dreData.receita_bruta) * 100)}%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-6">(-) Custo dos Produtos Vendidos</TableCell>
                <TableCell className="text-right text-red-600">{formatValue(dreData.custo_produtos)}</TableCell>
                <TableCell className="text-right">{Math.round((dreData.custo_produtos / dreData.receita_bruta) * 100)}%</TableCell>
              </TableRow>
              <TableRow className="bg-muted/50">
                <TableCell className="font-medium">Lucro Bruto</TableCell>
                <TableCell className="text-right">{formatValue(dreData.lucro_bruto)}</TableCell>
                <TableCell className="text-right">{Math.round((dreData.lucro_bruto / dreData.receita_bruta) * 100)}%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium pl-4">(-) Despesas Operacionais</TableCell>
                <TableCell className="text-right text-red-600">{formatValue(totalDespesasOperacionais)}</TableCell>
                <TableCell className="text-right">{Math.round((totalDespesasOperacionais / dreData.receita_bruta) * 100)}%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8">Despesas Administrativas</TableCell>
                <TableCell className="text-right text-red-600">{formatValue(dreData.despesas_operacionais.administrativas)}</TableCell>
                <TableCell className="text-right">{Math.round((dreData.despesas_operacionais.administrativas / dreData.receita_bruta) * 100)}%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8">Despesas com Vendas</TableCell>
                <TableCell className="text-right text-red-600">{formatValue(dreData.despesas_operacionais.vendas)}</TableCell>
                <TableCell className="text-right">{Math.round((dreData.despesas_operacionais.vendas / dreData.receita_bruta) * 100)}%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8">Despesas Financeiras</TableCell>
                <TableCell className="text-right text-red-600">{formatValue(dreData.despesas_operacionais.financeiras)}</TableCell>
                <TableCell className="text-right">{Math.round((dreData.despesas_operacionais.financeiras / dreData.receita_bruta) * 100)}%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-4">(+) Outras Receitas</TableCell>
                <TableCell className="text-right">{formatValue(dreData.outras_receitas)}</TableCell>
                <TableCell className="text-right">{Math.round((dreData.outras_receitas / dreData.receita_bruta) * 100)}%</TableCell>
              </TableRow>
              <TableRow className="bg-muted/50">
                <TableCell className="font-medium">Lucro Operacional</TableCell>
                <TableCell className="text-right">{formatValue(dreData.lucro_operacional)}</TableCell>
                <TableCell className="text-right">{Math.round((dreData.lucro_operacional / dreData.receita_bruta) * 100)}%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-4">(-) Impostos sobre o Lucro</TableCell>
                <TableCell className="text-right text-red-600">{formatValue(dreData.impostos_sobre_lucro)}</TableCell>
                <TableCell className="text-right">{Math.round((dreData.impostos_sobre_lucro / dreData.receita_bruta) * 100)}%</TableCell>
              </TableRow>
              <TableRow className="bg-green-50">
                <TableCell className="font-bold">Lucro Líquido do Exercício</TableCell>
                <TableCell className="text-right font-bold">{formatValue(dreData.lucro_liquido)}</TableCell>
                <TableCell className="text-right font-bold">{Math.round((dreData.lucro_liquido / dreData.receita_bruta) * 100)}%</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Análise Gráfica</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => formatValue(Number(value))}
                  labelFormatter={(name) => `${name}`}
                />
                <Legend />
                <Bar
                  dataKey="valor"
                  name="Valor"
                  fill="#8884d8"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
