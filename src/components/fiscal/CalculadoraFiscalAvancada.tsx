
import React, { useState, useEffect } from 'react';
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  calcularImpostoPorDadosContabeis,
  calcularImpostoPorNotasFiscais,
  gerarDARF,
  ResultadoCalculo,
  TipoImposto,
} from "@/services/fiscal/calculoFiscal";
import { 
  buscarDadosContabeis, 
  buscarNotasFiscais,
  DadosFaturamento, 
  NotaFiscalMetadata 
} from "@/services/fiscal/integration";
import { 
  Calculator, 
  FileSpreadsheet, 
  Receipt, 
  FileBarChart, 
  Save, 
  Download, 
  FileText, 
  ChevronRight,
  ArrowRight,
  BarChart3
} from "lucide-react";

export function CalculadoraFiscalAvancada() {
  const [cnpj, setCnpj] = useState("");
  const [periodo, setPeriodo] = useState(new Date().toISOString().substring(0, 7)); // YYYY-MM
  const [regimeTributario, setRegimeTributario] = useState<'Simples' | 'LucroPresumido' | 'LucroReal'>('LucroPresumido');
  const [tipoImposto, setTipoImposto] = useState<TipoImposto>("IRPJ");
  const [fonteCalculo, setFonteCalculo] = useState<"notasFiscais" | "contabilidade">("notasFiscais");
  
  // Dados carregados
  const [notasFiscais, setNotasFiscais] = useState<NotaFiscalMetadata[]>([]);
  const [dadosContabeis, setDadosContabeis] = useState<DadosFaturamento | null>(null);
  
  // Estado do cálculo
  const [resultado, setResultado] = useState<ResultadoCalculo | null>(null);
  const [codigoBarras, setCodigoBarras] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(false);
  
  // Estado para visualização de detalhes
  const [visualizandoNota, setVisualizandoNota] = useState<NotaFiscalMetadata | null>(null);
  
  // Formata CNPJ enquanto digita
  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length <= 14) {
      // Formata como XX.XXX.XXX/XXXX-XX
      value = value
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3/$4')
        .replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, '$1.$2.$3/$4-$5');
    }
    
    setCnpj(value);
  };

  // Buscar dados quando CNPJ e período mudarem
  useEffect(() => {
    const fetchData = async () => {
      if (!cnpj || cnpj.replace(/\D/g, '').length !== 14) return;
      
      try {
        setIsDataLoading(true);
        
        // Busca dados de acordo com a fonte selecionada
        if (fonteCalculo === "notasFiscais") {
          const notas = await buscarNotasFiscais(cnpj.replace(/\D/g, ''), periodo);
          setNotasFiscais(notas);
          
          // Limpa qualquer cálculo anterior
          setResultado(null);
          setCodigoBarras(null);
        } else {
          const dados = await buscarDadosContabeis(cnpj.replace(/\D/g, ''), periodo);
          setDadosContabeis(dados);
          setNotasFiscais(dados.notasFiscais);
          
          // Limpa qualquer cálculo anterior
          setResultado(null);
          setCodigoBarras(null);
        }
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        toast({
          title: "Erro ao carregar dados",
          description: error instanceof Error ? error.message : "Ocorreu um erro ao carregar os dados para cálculo",
          variant: "destructive",
        });
      } finally {
        setIsDataLoading(false);
      }
    };
    
    if (cnpj && periodo) {
      fetchData();
    }
  }, [cnpj, periodo, fonteCalculo]);

  // Calcula o imposto com base nos dados coletados
  const handleCalcular = async () => {
    try {
      if (!cnpj || cnpj.replace(/\D/g, '').length !== 14) {
        toast({
          title: "CNPJ inválido",
          description: "Informe um CNPJ válido para prosseguir",
          variant: "destructive",
        });
        return;
      }

      setIsLoading(true);
      setCodigoBarras(null);
      
      const cnpjLimpo = cnpj.replace(/\D/g, '');
      
      // Calcula de acordo com a fonte de dados selecionada
      let resultadoCalculo: ResultadoCalculo;
      
      if (fonteCalculo === "notasFiscais") {
        resultadoCalculo = await calcularImpostoPorNotasFiscais(
          cnpjLimpo, 
          periodo, 
          tipoImposto, 
          regimeTributario
        );
      } else {
        resultadoCalculo = await calcularImpostoPorDadosContabeis(
          cnpjLimpo, 
          periodo, 
          tipoImposto, 
          regimeTributario
        );
      }
      
      setResultado(resultadoCalculo);

      toast({
        title: "Cálculo realizado",
        description: `O valor calculado de ${tipoImposto} é ${formatCurrency(resultadoCalculo.valorFinal)}`,
      });
    } catch (error) {
      console.error("Erro ao calcular imposto:", error);
      toast({
        title: "Erro no cálculo",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao calcular o imposto",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Gera DARF para o resultado do cálculo
  const handleGerarDARF = async () => {
    try {
      if (!resultado) {
        toast({
          title: "Realize o cálculo primeiro",
          description: "É necessário calcular o imposto antes de gerar o DARF",
          variant: "destructive",
        });
        return;
      }

      setIsLoading(true);

      const barCode = await gerarDARF(tipoImposto, resultado, cnpj.replace(/\D/g, ''));
      setCodigoBarras(barCode);

      toast({
        title: "DARF gerado com sucesso",
        description: "O código de barras para pagamento foi gerado",
      });
    } catch (error) {
      console.error("Erro ao gerar DARF:", error);
      toast({
        title: "Erro ao gerar DARF",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao gerar o DARF",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Formatar valor como moeda
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Formatar data
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };
  
  // Função para abrir detalhes de uma nota fiscal
  const handleVerDetalhesNota = (nota: NotaFiscalMetadata) => {
    setVisualizandoNota(nota);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Calculadora Fiscal Avançada</CardTitle>
        <CardDescription>
          Cálculos fiscais automáticos com base em dados reais integrados
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Seção de Configuração */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cnpj">CNPJ</Label>
            <Input
              id="cnpj"
              placeholder="00.000.000/0000-00"
              value={cnpj}
              onChange={handleCnpjChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="periodo">Período de Apuração</Label>
            <Input
              id="periodo"
              type="month"
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tipoImposto">Tipo de Imposto</Label>
            <Select
              value={tipoImposto}
              onValueChange={(value) => setTipoImposto(value as TipoImposto)}
            >
              <SelectTrigger id="tipoImposto">
                <SelectValue placeholder="Selecione o imposto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IRPJ">IRPJ</SelectItem>
                <SelectItem value="CSLL">CSLL</SelectItem>
                <SelectItem value="PIS">PIS</SelectItem>
                <SelectItem value="COFINS">COFINS</SelectItem>
                <SelectItem value="ICMS">ICMS</SelectItem>
                <SelectItem value="ISS">ISS</SelectItem>
                <SelectItem value="Simples">Simples Nacional</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="regimeTributario">Regime Tributário</Label>
            <Select
              value={regimeTributario}
              onValueChange={(value) => setRegimeTributario(value as 'Simples' | 'LucroPresumido' | 'LucroReal')}
            >
              <SelectTrigger id="regimeTributario">
                <SelectValue placeholder="Selecione o regime" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Simples">Simples Nacional</SelectItem>
                <SelectItem value="LucroPresumido">Lucro Presumido</SelectItem>
                <SelectItem value="LucroReal">Lucro Real</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="fonteDados">Fonte de Dados</Label>
            <Select
              value={fonteCalculo}
              onValueChange={(value) => setFonteCalculo(value as "notasFiscais" | "contabilidade")}
            >
              <SelectTrigger id="fonteDados">
                <SelectValue placeholder="Selecione a fonte" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="notasFiscais">Notas Fiscais</SelectItem>
                <SelectItem value="contabilidade">Dados Contábeis</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Exibição de dados carregados */}
        <div className="border rounded-md">
          <Tabs defaultValue="dados" className="w-full">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="dados" className="flex items-center gap-1">
                <FileSpreadsheet className="w-4 h-4" />
                Dados para Cálculo
              </TabsTrigger>
              <TabsTrigger value="notas" className="flex items-center gap-1">
                <Receipt className="w-4 h-4" />
                Notas Fiscais
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="dados" className="p-4">
              {isDataLoading ? (
                <div className="py-8 text-center">Carregando dados fiscais...</div>
              ) : dadosContabeis ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="text-2xl font-bold">{formatCurrency(dadosContabeis.totalReceitas)}</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-medium">Despesas Totais</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="text-2xl font-bold">{formatCurrency(dadosContabeis.totalDespesas)}</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-medium">Resultado</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="text-2xl font-bold">
                          {formatCurrency(dadosContabeis.totalReceitas - dadosContabeis.totalDespesas)}
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-medium">Notas Fiscais</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="text-2xl font-bold">{notasFiscais.length}</p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-2">Detalhamento Receitas</h4>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Categoria</TableHead>
                            <TableHead className="text-right">Valor</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {Object.entries(dadosContabeis.receitas).map(([categoria, valor]) => (
                            <TableRow key={categoria}>
                              <TableCell>{categoria}</TableCell>
                              <TableCell className="text-right">{formatCurrency(valor)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Detalhamento Despesas</h4>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Categoria</TableHead>
                            <TableHead className="text-right">Valor</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {Object.entries(dadosContabeis.despesas).map(([categoria, valor]) => (
                            <TableRow key={categoria}>
                              <TableCell>{categoria}</TableCell>
                              <TableCell className="text-right">{formatCurrency(valor as number)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              ) : notasFiscais.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Notas</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="text-2xl font-bold">{notasFiscais.length}</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="text-2xl font-bold">
                          {formatCurrency(notasFiscais.reduce((sum, nota) => sum + nota.valorTotal, 0))}
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-medium">Período</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="text-lg font-semibold">
                          {new Date(periodo).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  Informe um CNPJ e período para carregar os dados
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="notas" className="p-4">
              <div className="rounded-md">
                {isDataLoading ? (
                  <div className="py-8 text-center">Carregando notas fiscais...</div>
                ) : notasFiscais.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nº Nota</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {notasFiscais.map((nota) => (
                        <TableRow key={`${nota.numero}-${nota.serie}`}>
                          <TableCell>
                            {nota.numero}/{nota.serie}
                          </TableCell>
                          <TableCell>{formatDate(nota.dataEmissao)}</TableCell>
                          <TableCell>{nota.cliente.nome}</TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(nota.valorTotal)}
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleVerDetalhesNota(nota)}
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    Nenhuma nota fiscal encontrada para o período selecionado
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="flex justify-center">
          <Button 
            className="gap-2" 
            onClick={handleCalcular} 
            disabled={isDataLoading || isLoading || !cnpj || notasFiscais.length === 0}
          >
            <Calculator className="w-4 h-4" />
            {isLoading ? "Calculando..." : "Calcular Imposto"}
          </Button>
        </div>
        
        {/* Resultado do cálculo */}
        {resultado && (
          <div className="space-y-4 mt-6">
            <div className="flex items-center gap-2">
              <FileBarChart className="text-primary h-5 w-5" />
              <h3 className="text-lg font-semibold">Resultado do Cálculo</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-muted-foreground">Tipo de Imposto:</span>
                      <span className="font-semibold">{tipoImposto}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-muted-foreground">Regime Tributário:</span>
                      <span>{regimeTributario}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-muted-foreground">Fonte dos Dados:</span>
                      <span>{resultado.dadosOrigem?.fonte === 'notasFiscais' ? 'Notas Fiscais' : 'Contabilidade'}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-muted-foreground">Período:</span>
                      <span>{new Date(periodo).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</span>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-muted-foreground">Base de Cálculo:</span>
                      <span className="font-medium">{formatCurrency(resultado.valorBase)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-muted-foreground">Alíquota Efetiva:</span>
                      <span>{(resultado.aliquotaEfetiva * 100).toFixed(2)}%</span>
                    </div>
                    
                    {resultado.deducoes > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-muted-foreground">Deduções:</span>
                        <span>{formatCurrency(resultado.deducoes)}</span>
                      </div>
                    )}
                    
                    <Separator />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Valor do Imposto:</span>
                      <span className="text-xl font-bold">{formatCurrency(resultado.valorFinal)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-muted-foreground">Data de Vencimento:</span>
                      <span className="font-medium">{formatDate(resultado.dataVencimento)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      DARF / Guia de Pagamento
                    </h4>
                    
                    {!codigoBarras ? (
                      <div className="text-center py-6 space-y-4">
                        <p className="text-muted-foreground">
                          Gere o DARF para pagamento do imposto calculado
                        </p>
                        
                        <Button 
                          onClick={handleGerarDARF}
                          disabled={isLoading || !resultado}
                          className="gap-2"
                        >
                          <Save className="w-4 h-4" />
                          {isLoading ? "Gerando..." : "Gerar DARF"}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="p-3 bg-muted rounded-md">
                          <p className="text-xs font-mono break-all">{codigoBarras}</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-xs text-muted-foreground">Código da Receita</p>
                            <p className="font-medium">{resultado.codigoReceita || "-"}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Vencimento</p>
                            <p className="font-medium">{formatDate(resultado.dataVencimento)}</p>
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div className="flex justify-between gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-1"
                            onClick={() => {
                              navigator.clipboard.writeText(codigoBarras);
                              toast({
                                title: "Código copiado",
                                description: "O código de barras foi copiado para a área de transferência"
                              });
                            }}
                          >
                            Copiar Código
                          </Button>
                          
                          <Button size="sm" className="gap-1">
                            <Download className="h-4 w-4" />
                            Baixar DARF
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    <div className="pt-4">
                      <Button 
                        variant="outline" 
                        className="w-full flex justify-between items-center" 
                        asChild
                      >
                        <a href="#" target="_blank" rel="noopener noreferrer">
                          <div className="flex items-center gap-1">
                            <BarChart3 className="h-4 w-4" />
                            Visualizar Relatório Completo
                          </div>
                          <ArrowRight className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </CardContent>
      
      {/* Modal de Detalhes da Nota Fiscal */}
      <Dialog open={!!visualizandoNota} onOpenChange={(open) => !open && setVisualizandoNota(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Nota Fiscal</DialogTitle>
            <DialogDescription>
              Nota Fiscal {visualizandoNota?.numero}/{visualizandoNota?.serie} - {formatDate(visualizandoNota?.dataEmissao || '')}
            </DialogDescription>
          </DialogHeader>
          
          {visualizandoNota && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Informações da Nota</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Nota Fiscal:</div>
                    <div className="font-medium">{visualizandoNota.numero}/{visualizandoNota.serie}</div>
                    
                    <div>Data de Emissão:</div>
                    <div className="font-medium">{formatDate(visualizandoNota.dataEmissao)}</div>
                    
                    <div>Valor Total:</div>
                    <div className="font-medium">{formatCurrency(visualizandoNota.valorTotal)}</div>
                    
                    <div>Chave de Acesso:</div>
                    <div className="font-medium text-xs truncate">{visualizandoNota.chaveAcesso}</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Cliente</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Nome:</div>
                    <div className="font-medium">{visualizandoNota.cliente.nome}</div>
                    
                    <div>CNPJ:</div>
                    <div className="font-medium">{visualizandoNota.cliente.cnpj}</div>
                    
                    <div>UF:</div>
                    <div className="font-medium">{visualizandoNota.cliente.uf}</div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Itens</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead className="text-right">Qtde</TableHead>
                      <TableHead className="text-right">Valor Unit.</TableHead>
                      <TableHead className="text-right">Valor Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visualizandoNota.itens.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.codigo}</TableCell>
                        <TableCell>{item.descricao}</TableCell>
                        <TableCell className="text-right">{item.quantidade}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.valorUnitario)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.valorTotal)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Impostos</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {Object.entries(visualizandoNota.impostos).map(([imposto, valor]) => (
                    <div key={imposto} className="bg-muted rounded-md p-3">
                      <div className="text-xs text-muted-foreground">{imposto}</div>
                      <div className="font-semibold">{formatCurrency(valor as number)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setVisualizandoNota(null)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
