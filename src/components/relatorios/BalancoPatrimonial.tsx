
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
import { Separator } from "@/components/ui/separator";

interface BalancoPatrimonialProps {
  data?: any;
}

export const BalancoPatrimonial: React.FC<BalancoPatrimonialProps> = ({ data }) => {
  // Dados de exemplo do balanço patrimonial
  const balanco = {
    ativo: {
      circulante: {
        caixa_equivalentes: 125000,
        contas_receber: 87500,
        estoques: 43200,
        outros_ativos_circulantes: 12300,
      },
      naoCirculante: {
        realizavel_longo_prazo: 54000,
        investimentos: 120000,
        imobilizado: 230000,
        intangivel: 75000,
      },
    },
    passivo: {
      circulante: {
        fornecedores: 67800,
        emprestimos: 45000,
        obrigacoes_fiscais: 28700,
        outras_obrigacoes: 15600,
      },
      naoCirculante: {
        emprestimos_longo_prazo: 120000,
        provisoes: 18000,
        outras_obrigacoes_lp: 9500,
      },
      patrimonio_liquido: {
        capital_social: 250000,
        reservas: 80000,
        lucros_acumulados: 112400,
      },
    },
  };

  // Cálculo dos totais
  const totalAtivoCirculante =
    balanco.ativo.circulante.caixa_equivalentes +
    balanco.ativo.circulante.contas_receber +
    balanco.ativo.circulante.estoques +
    balanco.ativo.circulante.outros_ativos_circulantes;

  const totalAtivoNaoCirculante =
    balanco.ativo.naoCirculante.realizavel_longo_prazo +
    balanco.ativo.naoCirculante.investimentos +
    balanco.ativo.naoCirculante.imobilizado +
    balanco.ativo.naoCirculante.intangivel;

  const totalAtivo = totalAtivoCirculante + totalAtivoNaoCirculante;

  const totalPassivoCirculante =
    balanco.passivo.circulante.fornecedores +
    balanco.passivo.circulante.emprestimos +
    balanco.passivo.circulante.obrigacoes_fiscais +
    balanco.passivo.circulante.outras_obrigacoes;

  const totalPassivoNaoCirculante =
    balanco.passivo.naoCirculante.emprestimos_longo_prazo +
    balanco.passivo.naoCirculante.provisoes +
    balanco.passivo.naoCirculante.outras_obrigacoes_lp;

  const totalPatrimonioLiquido =
    balanco.passivo.patrimonio_liquido.capital_social +
    balanco.passivo.patrimonio_liquido.reservas +
    balanco.passivo.patrimonio_liquido.lucros_acumulados;

  const totalPassivo = totalPassivoCirculante + totalPassivoNaoCirculante + totalPatrimonioLiquido;

  const formatValue = (value: number) => 
    new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ativo */}
        <Card>
          <CardHeader className="bg-green-50">
            <CardTitle className="text-lg text-green-800">Ativo</CardTitle>
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
                <TableRow className="font-medium bg-muted/50">
                  <TableCell>Ativo Circulante</TableCell>
                  <TableCell className="text-right">{formatValue(totalAtivoCirculante)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="pl-8">Caixa e Equivalentes</TableCell>
                  <TableCell className="text-right">{formatValue(balanco.ativo.circulante.caixa_equivalentes)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="pl-8">Contas a Receber</TableCell>
                  <TableCell className="text-right">{formatValue(balanco.ativo.circulante.contas_receber)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="pl-8">Estoques</TableCell>
                  <TableCell className="text-right">{formatValue(balanco.ativo.circulante.estoques)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="pl-8">Outros Ativos Circulantes</TableCell>
                  <TableCell className="text-right">{formatValue(balanco.ativo.circulante.outros_ativos_circulantes)}</TableCell>
                </TableRow>

                <TableRow className="font-medium bg-muted/50">
                  <TableCell>Ativo Não Circulante</TableCell>
                  <TableCell className="text-right">{formatValue(totalAtivoNaoCirculante)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="pl-8">Realizável a Longo Prazo</TableCell>
                  <TableCell className="text-right">{formatValue(balanco.ativo.naoCirculante.realizavel_longo_prazo)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="pl-8">Investimentos</TableCell>
                  <TableCell className="text-right">{formatValue(balanco.ativo.naoCirculante.investimentos)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="pl-8">Imobilizado</TableCell>
                  <TableCell className="text-right">{formatValue(balanco.ativo.naoCirculante.imobilizado)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="pl-8">Intangível</TableCell>
                  <TableCell className="text-right">{formatValue(balanco.ativo.naoCirculante.intangivel)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <div className="pt-4 flex justify-between items-center font-bold text-green-800">
              <span>Total do Ativo</span>
              <span>{formatValue(totalAtivo)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Passivo */}
        <Card>
          <CardHeader className="bg-blue-50">
            <CardTitle className="text-lg text-blue-800">Passivo e Patrimônio Líquido</CardTitle>
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
                <TableRow className="font-medium bg-muted/50">
                  <TableCell>Passivo Circulante</TableCell>
                  <TableCell className="text-right">{formatValue(totalPassivoCirculante)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="pl-8">Fornecedores</TableCell>
                  <TableCell className="text-right">{formatValue(balanco.passivo.circulante.fornecedores)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="pl-8">Empréstimos</TableCell>
                  <TableCell className="text-right">{formatValue(balanco.passivo.circulante.emprestimos)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="pl-8">Obrigações Fiscais</TableCell>
                  <TableCell className="text-right">{formatValue(balanco.passivo.circulante.obrigacoes_fiscais)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="pl-8">Outras Obrigações</TableCell>
                  <TableCell className="text-right">{formatValue(balanco.passivo.circulante.outras_obrigacoes)}</TableCell>
                </TableRow>

                <TableRow className="font-medium bg-muted/50">
                  <TableCell>Passivo Não Circulante</TableCell>
                  <TableCell className="text-right">{formatValue(totalPassivoNaoCirculante)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="pl-8">Empréstimos a Longo Prazo</TableCell>
                  <TableCell className="text-right">{formatValue(balanco.passivo.naoCirculante.emprestimos_longo_prazo)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="pl-8">Provisões</TableCell>
                  <TableCell className="text-right">{formatValue(balanco.passivo.naoCirculante.provisoes)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="pl-8">Outras Obrigações LP</TableCell>
                  <TableCell className="text-right">{formatValue(balanco.passivo.naoCirculante.outras_obrigacoes_lp)}</TableCell>
                </TableRow>

                <TableRow className="font-medium bg-muted/50">
                  <TableCell>Patrimônio Líquido</TableCell>
                  <TableCell className="text-right">{formatValue(totalPatrimonioLiquido)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="pl-8">Capital Social</TableCell>
                  <TableCell className="text-right">{formatValue(balanco.passivo.patrimonio_liquido.capital_social)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="pl-8">Reservas</TableCell>
                  <TableCell className="text-right">{formatValue(balanco.passivo.patrimonio_liquido.reservas)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="pl-8">Lucros Acumulados</TableCell>
                  <TableCell className="text-right">{formatValue(balanco.passivo.patrimonio_liquido.lucros_acumulados)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <div className="pt-4 flex justify-between items-center font-bold text-blue-800">
              <span>Total do Passivo e PL</span>
              <span>{formatValue(totalPassivo)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
