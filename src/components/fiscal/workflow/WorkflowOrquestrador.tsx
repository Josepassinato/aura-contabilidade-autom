
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, ListChecks, PlayCircle, Clock } from "lucide-react";
import { 
  agendarCalculoFiscal, 
  agendarCalculosTrimestrais,
  executarWorkflow,
  obterWorkflowsAgendados,
  WorkflowCalculo,
  WorkflowStatus
} from "@/services/fiscal/workflow/fiscalWorkflowService";
import { TipoImposto } from "@/services/fiscal/types";

// Status colors
const statusColors: Record<WorkflowStatus, string> = {
  agendado: "bg-blue-100 text-blue-800",
  em_execucao: "bg-yellow-100 text-yellow-800",
  concluido: "bg-green-100 text-green-800",
  erro: "bg-red-100 text-red-800"
};

export const WorkflowOrquestrador = () => {
  const [activeTab, setActiveTab] = useState("agendar");
  const [cnpj, setCnpj] = useState("");
  const [clienteId, setClienteId] = useState("");
  const [periodo, setPeriodo] = useState("");
  const [ano, setAno] = useState(new Date().getFullYear().toString());
  const [trimestre, setTrimestre] = useState<"1" | "2" | "3" | "4">("1");
  const [regimeTributario, setRegimeTributario] = useState<"Simples" | "LucroPresumido" | "LucroReal">("LucroPresumido");
  const [tiposImposto, setTiposImposto] = useState<TipoImposto[]>(["IRPJ", "CSLL"]);
  const [isLoading, setIsLoading] = useState(false);
  const [workflows, setWorkflows] = useState<WorkflowCalculo[]>([]);

  // Carregar workflows existentes
  useEffect(() => {
    setWorkflows(obterWorkflowsAgendados());
  }, []);

  // Toggle para seleção de impostos
  const toggleImposto = (imposto: TipoImposto) => {
    setTiposImposto(prevTipos => 
      prevTipos.includes(imposto) 
        ? prevTipos.filter(t => t !== imposto)
        : [...prevTipos, imposto]
    );
  };

  // Formatar CNPJ
  const formatarCNPJ = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  // Handler para CNPJ
  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCnpj(formatarCNPJ(e.target.value));
  };

  // Handler para período
  const handlePeriodoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d{4}-\d{0,2}$/.test(value) || /^\d{4}$/.test(value) || value === '') {
      setPeriodo(value);
    }
  };

  // Agendar cálculo único
  const handleAgendarCalculo = async () => {
    if (!cnpj || !periodo || !clienteId || tiposImposto.length === 0) {
      return;
    }

    setIsLoading(true);
    try {
      await agendarCalculoFiscal(
        clienteId,
        cnpj.replace(/\D/g, ''),
        periodo,
        tiposImposto,
        regimeTributario
      );
      
      setWorkflows(obterWorkflowsAgendados());
      setActiveTab("agendados");
    } catch (error) {
      console.error("Erro ao agendar cálculo:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Agendar cálculos trimestrais
  const handleAgendarCalculosTrimestrais = async () => {
    if (!cnpj || !clienteId || tiposImposto.length === 0) {
      return;
    }

    setIsLoading(true);
    try {
      await agendarCalculosTrimestrais(
        clienteId,
        cnpj.replace(/\D/g, ''),
        parseInt(ano),
        parseInt(trimestre) as 1 | 2 | 3 | 4,
        tiposImposto,
        regimeTributario
      );
      
      setWorkflows(obterWorkflowsAgendados());
      setActiveTab("agendados");
    } catch (error) {
      console.error("Erro ao agendar cálculos trimestrais:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Executar workflow
  const handleExecutarWorkflow = async (id: string) => {
    setIsLoading(true);
    try {
      await executarWorkflow(id);
      setWorkflows(obterWorkflowsAgendados());
    } catch (error) {
      console.error("Erro ao executar workflow:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">Orquestrador de Workflows Fiscais</CardTitle>
        <CardDescription>
          Agende e gerencie cálculos fiscais automáticos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="agendar" className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              Agendar Único
            </TabsTrigger>
            <TabsTrigger value="trimestral" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Agendar Trimestral
            </TabsTrigger>
            <TabsTrigger value="agendados" className="flex items-center gap-2">
              <ListChecks className="h-4 w-4" />
              Workflows Agendados
            </TabsTrigger>
          </TabsList>

          <TabsContent value="agendar" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clienteId">ID do Cliente</Label>
                <Input
                  id="clienteId"
                  placeholder="ID do cliente"
                  value={clienteId}
                  onChange={(e) => setClienteId(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input
                  id="cnpj"
                  placeholder="00.000.000/0000-00"
                  value={cnpj}
                  onChange={handleCNPJChange}
                  maxLength={18}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="periodo">Período (AAAA-MM)</Label>
                <Input
                  id="periodo"
                  placeholder="2025-05"
                  value={periodo}
                  onChange={handlePeriodoChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="regime">Regime Tributário</Label>
                <Select 
                  value={regimeTributario} 
                  onValueChange={(value: "Simples" | "LucroPresumido" | "LucroReal") => 
                    setRegimeTributario(value)
                  }
                >
                  <SelectTrigger id="regime">
                    <SelectValue placeholder="Selecione o regime" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Simples">Simples Nacional</SelectItem>
                    <SelectItem value="LucroPresumido">Lucro Presumido</SelectItem>
                    <SelectItem value="LucroReal">Lucro Real</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <Label>Impostos a calcular</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="irpj" 
                    checked={tiposImposto.includes("IRPJ")}
                    onCheckedChange={() => toggleImposto("IRPJ")}
                  />
                  <label htmlFor="irpj" className="cursor-pointer">IRPJ</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="csll" 
                    checked={tiposImposto.includes("CSLL")}
                    onCheckedChange={() => toggleImposto("CSLL")}
                  />
                  <label htmlFor="csll" className="cursor-pointer">CSLL</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="pis" 
                    checked={tiposImposto.includes("PIS")}
                    onCheckedChange={() => toggleImposto("PIS")}
                  />
                  <label htmlFor="pis" className="cursor-pointer">PIS</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="cofins" 
                    checked={tiposImposto.includes("COFINS")}
                    onCheckedChange={() => toggleImposto("COFINS")}
                  />
                  <label htmlFor="cofins" className="cursor-pointer">COFINS</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="simples" 
                    checked={tiposImposto.includes("Simples")}
                    onCheckedChange={() => toggleImposto("Simples")}
                  />
                  <label htmlFor="simples" className="cursor-pointer">Simples Nacional</label>
                </div>
              </div>
            </div>

            <Button 
              className="w-full mt-4"
              onClick={handleAgendarCalculo}
              disabled={isLoading || !cnpj || !periodo || !clienteId || tiposImposto.length === 0}
            >
              {isLoading ? "Agendando..." : "Agendar Cálculo"}
            </Button>
          </TabsContent>

          <TabsContent value="trimestral" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clienteId-tri">ID do Cliente</Label>
                <Input
                  id="clienteId-tri"
                  placeholder="ID do cliente"
                  value={clienteId}
                  onChange={(e) => setClienteId(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cnpj-tri">CNPJ</Label>
                <Input
                  id="cnpj-tri"
                  placeholder="00.000.000/0000-00"
                  value={cnpj}
                  onChange={handleCNPJChange}
                  maxLength={18}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ano">Ano Inicial</Label>
                <Input
                  id="ano"
                  placeholder="2025"
                  value={ano}
                  onChange={(e) => setAno(e.target.value.replace(/\D/g, ''))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="trimestre">Trimestre Inicial</Label>
                <Select 
                  value={trimestre} 
                  onValueChange={(value: "1" | "2" | "3" | "4") => setTrimestre(value)}
                >
                  <SelectTrigger id="trimestre">
                    <SelectValue placeholder="Selecione o trimestre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1º Trimestre</SelectItem>
                    <SelectItem value="2">2º Trimestre</SelectItem>
                    <SelectItem value="3">3º Trimestre</SelectItem>
                    <SelectItem value="4">4º Trimestre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="regime-tri">Regime Tributário</Label>
                <Select 
                  value={regimeTributario} 
                  onValueChange={(value: "Simples" | "LucroPresumido" | "LucroReal") => 
                    setRegimeTributario(value)
                  }
                >
                  <SelectTrigger id="regime-tri">
                    <SelectValue placeholder="Selecione o regime" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Simples">Simples Nacional</SelectItem>
                    <SelectItem value="LucroPresumido">Lucro Presumido</SelectItem>
                    <SelectItem value="LucroReal">Lucro Real</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <Label>Impostos a calcular</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="irpj-tri" 
                    checked={tiposImposto.includes("IRPJ")}
                    onCheckedChange={() => toggleImposto("IRPJ")}
                  />
                  <label htmlFor="irpj-tri" className="cursor-pointer">IRPJ</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="csll-tri" 
                    checked={tiposImposto.includes("CSLL")}
                    onCheckedChange={() => toggleImposto("CSLL")}
                  />
                  <label htmlFor="csll-tri" className="cursor-pointer">CSLL</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="pis-tri" 
                    checked={tiposImposto.includes("PIS")}
                    onCheckedChange={() => toggleImposto("PIS")}
                  />
                  <label htmlFor="pis-tri" className="cursor-pointer">PIS</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="cofins-tri" 
                    checked={tiposImposto.includes("COFINS")}
                    onCheckedChange={() => toggleImposto("COFINS")}
                  />
                  <label htmlFor="cofins-tri" className="cursor-pointer">COFINS</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="simples-tri" 
                    checked={tiposImposto.includes("Simples")}
                    onCheckedChange={() => toggleImposto("Simples")}
                  />
                  <label htmlFor="simples-tri" className="cursor-pointer">Simples Nacional</label>
                </div>
              </div>
            </div>

            <Alert className="mt-4">
              <AlertTitle>Agendamento Trimestral</AlertTitle>
              <AlertDescription>
                Esta ação agendará cálculos para 4 trimestres consecutivos a partir do trimestre selecionado.
              </AlertDescription>
            </Alert>

            <Button 
              className="w-full mt-4"
              onClick={handleAgendarCalculosTrimestrais}
              disabled={isLoading || !cnpj || !clienteId || tiposImposto.length === 0}
            >
              {isLoading ? "Agendando..." : "Agendar Cálculos Trimestrais"}
            </Button>
          </TabsContent>

          <TabsContent value="agendados">
            {workflows.length === 0 ? (
              <div className="text-center p-8 text-gray-500">
                Nenhum workflow fiscal agendado.
              </div>
            ) : (
              <div className="space-y-4">
                {workflows.map((workflow) => (
                  <div key={workflow.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium">Cliente: {workflow.clienteId}</h3>
                        <p className="text-sm text-gray-500">CNPJ: {workflow.cnpj}</p>
                        <p className="text-sm text-gray-500">Período: {workflow.periodo}</p>
                      </div>
                      <Badge className={statusColors[workflow.status]}>
                        {workflow.status === 'agendado' && 'Agendado'}
                        {workflow.status === 'em_execucao' && 'Em Execução'}
                        {workflow.status === 'concluido' && 'Concluído'}
                        {workflow.status === 'erro' && 'Erro'}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {workflow.tiposImposto.map((tipo) => (
                        <Badge key={tipo} variant="outline">{tipo}</Badge>
                      ))}
                    </div>
                    {workflow.status === 'agendado' && (
                      <Button 
                        size="sm" 
                        onClick={() => handleExecutarWorkflow(workflow.id)}
                        disabled={isLoading}
                        className="flex items-center gap-1"
                      >
                        <PlayCircle className="h-4 w-4" />
                        Executar
                      </Button>
                    )}
                    {workflow.status === 'concluido' && workflow.resultados && (
                      <div className="mt-2 space-y-1">
                        <p className="text-sm font-medium">Resultados:</p>
                        {Object.entries(workflow.resultados).map(([tipo, resultado]) => (
                          <p key={tipo} className="text-sm">
                            {tipo}: R$ {resultado.valorFinal.toFixed(2)} (Venc: {resultado.dataVencimento})
                          </p>
                        ))}
                      </div>
                    )}
                    {workflow.status === 'erro' && (
                      <p className="text-sm text-red-600 mt-2">{workflow.erro}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="text-sm text-gray-500">
        Este componente simula a integração com ferramentas como Temporal.io ou Apache Airflow.
      </CardFooter>
    </Card>
  );
};

export default WorkflowOrquestrador;
