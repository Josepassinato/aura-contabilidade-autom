
import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { CalculadoraFiscal } from "@/components/fiscal/CalculadoraFiscal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { ClientSelector } from "@/components/layout/ClientSelector";
import { useAuth } from '@/contexts/auth';
import { Navigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  calcularImpostosPorNotasFiscais, 
  calcularImpostosPorLancamentos,
  TipoImposto,
  ResultadoCalculo
} from "@/services/fiscal/calculoFiscal";
import { toast } from "@/hooks/use-toast";
import { 
  realizarPagamentoAvancado, 
  PagamentoResponse 
} from "@/services/bancario/openBankingService";

const CalculosFiscais = () => {
  const { isAuthenticated, isAccountant } = useAuth();
  const [activeTab, setActiveTab] = useState("calculadora");
  const [cnpj, setCnpj] = useState("");
  const [periodo, setPeriodo] = useState("");
  const [regimeTributario, setRegimeTributario] = useState<"Simples" | "LucroPresumido" | "LucroReal">("LucroPresumido");
  const [resultados, setResultados] = useState<Record<TipoImposto, ResultadoCalculo> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBanco, setSelectedBanco] = useState(localStorage.getItem("banco-selecionado") || "");
  const [pagamentoStatus, setPagamentoStatus] = useState<Record<string, PagamentoResponse | null>>({});

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Only accountants should access this page
  if (!isAccountant) {
    return <Navigate to="/" replace />;
  }

  const handleCalcularPorNotas = async () => {
    if (!cnpj || !periodo) {
      toast({
        title: "Dados incompletos",
        description: "Preencha o CNPJ e o período para calcular.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      const result = await calcularImpostosPorNotasFiscais(cnpj, periodo, regimeTributario);
      setResultados(result);
      toast({
        title: "Cálculo realizado",
        description: `Impostos calculados com base nas notas fiscais do período ${periodo}.`
      });
    } catch (error) {
      console.error("Erro ao calcular impostos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCalcularPorLancamentos = async () => {
    if (!cnpj || !periodo) {
      toast({
        title: "Dados incompletos",
        description: "Preencha o CNPJ e o período para calcular.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      const result = await calcularImpostosPorLancamentos(cnpj, periodo, regimeTributario);
      setResultados(result);
      toast({
        title: "Cálculo realizado",
        description: `Impostos calculados com base nos lançamentos contábeis do período ${periodo}.`
      });
    } catch (error) {
      console.error("Erro ao calcular impostos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePagamento = async (tipo: TipoImposto, resultado: ResultadoCalculo) => {
    if (!selectedBanco) {
      toast({
        title: "Banco não configurado",
        description: "Configure um banco nas configurações antes de pagar impostos.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Gerar código de barras simulado se não existir
      let codigoBarras = "";
      if (resultado.codigoReceita) {
        const randomCode = Math.floor(10000000000 + Math.random() * 90000000000);
        codigoBarras = `85810000${randomCode}-5 ${resultado.codigoReceita}0065${randomCode % 1000}-1 ${resultado.dataVencimento.replace(/-/g, "")}2-6 ${cnpj.substring(0,8)}55-9`;
      } else {
        codigoBarras = `846700000017 351501536598 430620226015 506181270322`;
      }
      
      // Configuração bancária simulada
      const bankCredentials = {
        banco: selectedBanco,
        agencia: localStorage.getItem(`banco-${selectedBanco}-agencia`) || "",
        conta: localStorage.getItem(`banco-${selectedBanco}-conta`) || "",
        tipoConta: "corrente" as const
      };
      
      // Requisição de pagamento
      const response = await realizarPagamentoAvancado({
        credentials: bankCredentials,
        codigoBarras,
        valor: resultado.valorFinal as number,
        dataVencimento: resultado.dataVencimento,
        dataPagamento: new Date().toISOString().split('T')[0],
        descricao: `Pagamento de ${tipo} - Período ${periodo}`,
        tipo: (resultado.codigoReceita === 'DAS' ? 'DAS' : 'DARF') as any
      });
      
      // Atualiza status do pagamento
      setPagamentoStatus(prev => ({
        ...prev,
        [tipo]: response
      }));
      
      if (response.sucesso) {
        toast({
          title: "Pagamento realizado",
          description: `${tipo} no valor de R$ ${resultado.valorFinal.toFixed(2)} pago com sucesso.`
        });
      } else {
        toast({
          title: "Problema no pagamento",
          description: response.mensagem || "Ocorreu um problema ao processar o pagamento.",
          variant: "destructive"
        });
      }
      
    } catch (error: any) {
      toast({
        title: "Erro no pagamento",
        description: error.message || "Ocorreu um erro ao processar o pagamento.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cálculos Fiscais</h1>
          <p className="text-muted-foreground">
            Ferramentas para cálculos fiscais automáticos e simulações tributárias
          </p>
        </div>
        <ClientSelector />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="mb-4">
          <TabsTrigger value="calculadora">Calculadora Fiscal</TabsTrigger>
          <TabsTrigger value="notas">Cálculo por Notas Fiscais</TabsTrigger>
          <TabsTrigger value="lancamentos">Cálculo por Lançamentos</TabsTrigger>
          <TabsTrigger value="simulacao">Simulação de Regimes</TabsTrigger>
          <TabsTrigger value="retencoes">Retenções</TabsTrigger>
        </TabsList>

        <TabsContent value="calculadora">
          <CalculadoraFiscal />
        </TabsContent>
        
        <TabsContent value="notas">
          <Card>
            <CardHeader>
              <CardTitle>Cálculo Automático por Notas Fiscais</CardTitle>
              <CardDescription>
                Calcula automaticamente todos os impostos aplicáveis com base nas notas fiscais emitidas e recebidas no período
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input 
                    id="cnpj" 
                    placeholder="00.000.000/0000-00" 
                    value={cnpj}
                    onChange={(e) => setCnpj(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="periodo">Período (YYYY-MM)</Label>
                  <Input 
                    id="periodo" 
                    placeholder="2025-05" 
                    value={periodo}
                    onChange={(e) => setPeriodo(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="regime">Regime Tributário</Label>
                  <Select 
                    value={regimeTributario} 
                    onValueChange={(v) => setRegimeTributario(v as any)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Simples">Simples Nacional</SelectItem>
                      <SelectItem value="LucroPresumido">Lucro Presumido</SelectItem>
                      <SelectItem value="LucroReal">Lucro Real</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleCalcularPorNotas}
                disabled={isLoading}
                className="ml-auto"
              >
                {isLoading ? "Calculando..." : "Calcular Impostos"}
              </Button>
            </CardFooter>
          </Card>
          
          {resultados && (
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
                          onClick={() => handlePagamento(tipo as TipoImposto, resultado)} 
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
          )}
        </TabsContent>
        
        <TabsContent value="lancamentos">
          <Card>
            <CardHeader>
              <CardTitle>Cálculo Automático por Lançamentos Contábeis</CardTitle>
              <CardDescription>
                Calcula automaticamente todos os impostos aplicáveis com base nos lançamentos contábeis do período
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cnpj_lanc">CNPJ</Label>
                  <Input 
                    id="cnpj_lanc" 
                    placeholder="00.000.000/0000-00" 
                    value={cnpj}
                    onChange={(e) => setCnpj(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="periodo_lanc">Período (YYYY-MM)</Label>
                  <Input 
                    id="periodo_lanc" 
                    placeholder="2025-05" 
                    value={periodo}
                    onChange={(e) => setPeriodo(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="regime_lanc">Regime Tributário</Label>
                  <Select 
                    value={regimeTributario} 
                    onValueChange={(v) => setRegimeTributario(v as any)}
                  >
                    <SelectTrigger id="regime_lanc">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Simples">Simples Nacional</SelectItem>
                      <SelectItem value="LucroPresumido">Lucro Presumido</SelectItem>
                      <SelectItem value="LucroReal">Lucro Real</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleCalcularPorLancamentos}
                disabled={isLoading}
                className="ml-auto"
              >
                {isLoading ? "Calculando..." : "Calcular Impostos"}
              </Button>
            </CardFooter>
          </Card>
          
          {resultados && (
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
                          onClick={() => handlePagamento(tipo as TipoImposto, resultado)} 
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
          )}
        </TabsContent>

        <TabsContent value="simulacao">
          <Card>
            <CardHeader>
              <CardTitle>Simulação de Regimes Tributários</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Funcionalidade de simulação entre regimes tributários em desenvolvimento.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="retencoes">
          <Card>
            <CardHeader>
              <CardTitle>Cálculo de Retenções</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Funcionalidade de cálculo de retenções em desenvolvimento.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default CalculosFiscais;
