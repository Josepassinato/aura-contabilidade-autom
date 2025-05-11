
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, FileBarChart, FileText, ArrowDownToLine } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { BalancoPatrimonial } from "@/components/relatorios/BalancoPatrimonial";
import { DRE } from "@/components/relatorios/DRE";
import { FluxoCaixa } from "@/components/relatorios/FluxoCaixa";
import { IndexesFinanceiros } from "@/components/relatorios/IndexesFinanceiros";

type FormValues = {
  periodo: Date;
  cliente: string;
  tipoRelatorio: string;
};

const RelatoriosFinanceiros = () => {
  const [activeTab, setActiveTab] = useState("balanco");
  const [reportGenerated, setReportGenerated] = useState(false);

  const form = useForm<FormValues>({
    defaultValues: {
      periodo: new Date(),
      cliente: "",
      tipoRelatorio: "mensal",
    },
  });

  const onSubmit = (data: FormValues) => {
    console.log("Gerando relatório com os dados:", data);
    setReportGenerated(true);
  };

  // Lista de clientes para o exemplo
  const clientes = [
    { id: "1", nome: "Empresa ABC Ltda" },
    { id: "2", nome: "XYZ Comércio S.A." },
    { id: "3", nome: "Tech Solutions" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Relatórios Financeiros</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Gerar Relatório</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="cliente"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cliente</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um cliente" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {clientes.map((cliente) => (
                              <SelectItem key={cliente.id} value={cliente.id}>
                                {cliente.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="periodo"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Período</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className="w-full pl-3 text-left font-normal"
                              >
                                {field.value ? (
                                  format(field.value, "MMMM yyyy", { locale: ptBR })
                                ) : (
                                  <span>Selecione o período</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                              locale={ptBR}
                            />
                          </PopoverContent>
                        </Popover>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tipoRelatorio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Relatório</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="mensal">Mensal</SelectItem>
                            <SelectItem value="trimestral">Trimestral</SelectItem>
                            <SelectItem value="anual">Anual</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>

                <Button type="submit">
                  <FileBarChart className="mr-2 h-4 w-4" />
                  Gerar Relatório
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {reportGenerated && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Resultados do Relatório</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <FileText className="mr-2 h-4 w-4" />
                  Imprimir
                </Button>
                <Button variant="outline" size="sm">
                  <ArrowDownToLine className="mr-2 h-4 w-4" />
                  Exportar PDF
                </Button>
              </div>
            </div>

            <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList>
                <TabsTrigger value="balanco">Balanço Patrimonial</TabsTrigger>
                <TabsTrigger value="dre">DRE</TabsTrigger>
                <TabsTrigger value="fluxo">Fluxo de Caixa</TabsTrigger>
                <TabsTrigger value="indices">Índices Financeiros</TabsTrigger>
              </TabsList>
              <div className="p-4 border rounded-lg mt-4">
                <TabsContent value="balanco">
                  <BalancoPatrimonial />
                </TabsContent>
                <TabsContent value="dre">
                  <DRE />
                </TabsContent>
                <TabsContent value="fluxo">
                  <FluxoCaixa />
                </TabsContent>
                <TabsContent value="indices">
                  <IndexesFinanceiros />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default RelatoriosFinanceiros;
