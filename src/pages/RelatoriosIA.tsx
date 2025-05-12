
import React, { useState } from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileBarChart, Mic } from "lucide-react";

const RelatoriosIA = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [relatorioGerado, setRelatorioGerado] = useState(false);
  
  const handleGerarRelatorio = () => {
    setIsProcessing(true);
    
    // Simulação de processamento
    setTimeout(() => {
      setIsProcessing(false);
      setRelatorioGerado(true);
    }, 2000);
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Relatórios por Inteligência Artificial</h2>
          <p className="text-muted-foreground mt-2">
            Gere relatórios personalizados usando nosso assistente de IA
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileBarChart className="h-5 w-5 text-primary" />
                <CardTitle>Relatórios Personalizados por IA</CardTitle>
              </div>
              <CardDescription>
                Use nosso assistente por voz ou texto para criar relatórios específicos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center gap-4 p-6 border rounded-lg">
                <div className="text-center max-w-md">
                  <h3 className="text-lg font-medium mb-2">Solicite um relatório personalizado</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Use linguagem natural para solicitar relatórios detalhados sobre o desempenho financeiro, 
                    comparativos de períodos ou análise de indicadores específicos.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    className="flex gap-2" 
                    onClick={handleGerarRelatorio} 
                    disabled={isProcessing}
                  >
                    <FileBarChart className="h-4 w-4" />
                    {isProcessing ? "Gerando..." : "Gerar Relatório de Exemplo"}
                  </Button>
                  
                  <Button variant="outline" className="flex gap-2">
                    <Mic className="h-4 w-4" />
                    Usar Assistente de Voz
                  </Button>
                </div>
              </div>
              
              {relatorioGerado && (
                <div className="p-6 border rounded-lg">
                  <h3 className="font-medium mb-3">Relatório Gerado</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Este é um exemplo de relatório gerado pela IA. Em uma implementação completa, 
                    aqui seria exibido um relatório detalhado com gráficos e análises.
                  </p>
                  <div className="bg-muted p-4 rounded text-sm">
                    <p className="font-medium">Análise de Desempenho Financeiro - 2024</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>Faturamento total do período: R$ 1.250.000,00</li>
                      <li>Crescimento de 15% em relação ao mesmo período do ano anterior</li>
                      <li>Principais categorias de despesas: Pessoal (45%), Infraestrutura (20%), Marketing (15%)</li>
                      <li>Margem de lucro atual: 22% (aumento de 3% em relação ao período anterior)</li>
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RelatoriosIA;
