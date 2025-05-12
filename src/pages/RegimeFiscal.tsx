
import React, { useState } from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Calculator } from "lucide-react";

const RegimeFiscal = () => {
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedClientName, setSelectedClientName] = useState<string>('');
  const [selectedRegime, setSelectedRegime] = useState<string>('');
  
  // Mock da função que seria chamada ao selecionar um cliente
  const handleClientSelect = (client: { id: string, name: string }) => {
    setSelectedClientId(client.id);
    setSelectedClientName(client.name);
    
    // Em uma implementação real, buscaríamos o regime atual do cliente
    // Aqui estamos apenas simulando
    const mockRegimes: Record<string, string> = {
      '1': 'simples_nacional',
      '2': 'lucro_presumido',
      '3': 'lucro_real',
    };
    
    setSelectedRegime(mockRegimes[client.id] || '');
  };
  
  const handleRegimeChange = (newRegime: string) => {
    setSelectedRegime(newRegime);
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Regimes Fiscais</h1>
            <p className="text-muted-foreground">
              Configure o regime fiscal e as alíquotas para cada cliente
            </p>
          </div>
          <div>
            {/* Placeholder para o ClientSelector */}
            <select 
              className="border rounded p-2"
              onChange={(e) => {
                const val = e.target.value;
                if (val) {
                  const [id, name] = val.split('|');
                  handleClientSelect({ id, name });
                }
              }}
            >
              <option value="">Selecione um cliente</option>
              <option value="1|Empresa A">Empresa A</option>
              <option value="2|Empresa B">Empresa B</option>
              <option value="3|Empresa C">Empresa C</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="md:col-span-2">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                <CardTitle>Configuração de Regime Fiscal</CardTitle>
              </div>
              <CardDescription>
                Selecione um cliente e defina seu regime fiscal e respectivas alíquotas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedClientId ? (
                <div className="p-8 text-center">
                  <Building2 className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-medium">Nenhum cliente selecionado</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Selecione um cliente para configurar seu regime fiscal
                  </p>
                </div>
              ) : (
                <div className="p-4 border rounded">
                  <h3 className="font-medium mb-2">Cliente: {selectedClientName}</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Regime Fiscal:</label>
                      <select 
                        className="w-full border rounded p-2"
                        value={selectedRegime}
                        onChange={(e) => handleRegimeChange(e.target.value)}
                      >
                        <option value="">Selecione um regime</option>
                        <option value="simples_nacional">Simples Nacional</option>
                        <option value="lucro_presumido">Lucro Presumido</option>
                        <option value="lucro_real">Lucro Real</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {selectedClientId && selectedRegime && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-primary" />
                <CardTitle>Simulação de Tributação</CardTitle>
              </div>
              <CardDescription>
                Visualize uma simulação da carga tributária com base no regime selecionado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-sm text-muted-foreground py-8">
                A funcionalidade de simulação estará disponível em breve.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default RegimeFiscal;
