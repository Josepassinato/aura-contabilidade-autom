
import React, { useState } from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Calculator } from "lucide-react";
import { ClientSelector } from "@/components/layout/ClientSelector";
import { AccountingClient } from '@/lib/supabase';
import { fetchClientById } from "@/services/supabase/clientsService";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { updateClient } from '@/services/supabase/clientsService';

const RegimeFiscal = () => {
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedClientName, setSelectedClientName] = useState<string>('');
  const [selectedRegime, setSelectedRegime] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();
  
  const handleClientSelect = async (client: { id: string; name: string }) => {
    setSelectedClientId(client.id);
    setSelectedClientName(client.name);
    
    // Only fetch client details if we have a valid ID
    if (client.id) {
      setIsLoading(true);
      try {
        const clientData = await fetchClientById(client.id);
        if (clientData) {
          setSelectedRegime(clientData.regime || '');
        }
      } catch (error) {
        console.error('Erro ao buscar detalhes do cliente:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os detalhes do cliente',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      // Reset state if no client selected
      setSelectedRegime('');
    }
  };
  
  const handleRegimeChange = async (newRegime: string) => {
    setSelectedRegime(newRegime);
    
    if (selectedClientId) {
      setIsLoading(true);
      try {
        const success = await updateClient(selectedClientId, { regime: newRegime });
        if (success) {
          toast({
            title: 'Sucesso',
            description: 'Regime fiscal atualizado com sucesso',
          });
        } else {
          throw new Error('Falha ao atualizar o regime fiscal');
        }
      } catch (error) {
        console.error('Erro ao atualizar o regime fiscal:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível atualizar o regime fiscal',
          variant: 'destructive'
        });
        // Revert UI if update fails
        const clientData = await fetchClientById(selectedClientId);
        if (clientData) {
          setSelectedRegime(clientData.regime || '');
        }
      } finally {
        setIsLoading(false);
      }
    }
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
          <ClientSelector 
            onClientSelect={handleClientSelect}
          />
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
                      <div className="flex gap-2">
                        <Select 
                          value={selectedRegime}
                          onValueChange={handleRegimeChange}
                          disabled={isLoading}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecione um regime" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="simples_nacional">Simples Nacional</SelectItem>
                            <SelectItem value="lucro_presumido">Lucro Presumido</SelectItem>
                            <SelectItem value="lucro_real">Lucro Real</SelectItem>
                          </SelectContent>
                        </Select>
                        {isLoading && <div className="animate-spin">⏳</div>}
                      </div>
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
              <div className="space-y-4">
                <div className="border rounded p-4">
                  <h3 className="font-medium mb-3">
                    {selectedRegime === "simples_nacional" && "Simples Nacional"}
                    {selectedRegime === "lucro_presumido" && "Lucro Presumido"}
                    {selectedRegime === "lucro_real" && "Lucro Real"}
                  </h3>
                  
                  {selectedRegime === "simples_nacional" && (
                    <p className="text-sm">
                      O Simples Nacional é um regime tributário simplificado para micro e pequenas empresas
                      com faturamento anual de até R$ 4,8 milhões. Unifica oito impostos em uma única guia.
                    </p>
                  )}
                  
                  {selectedRegime === "lucro_presumido" && (
                    <p className="text-sm">
                      O Lucro Presumido é uma forma simplificada de tributação onde o lucro é estimado
                      a partir de percentuais aplicados sobre o faturamento, variando de acordo com a atividade.
                    </p>
                  )}
                  
                  {selectedRegime === "lucro_real" && (
                    <p className="text-sm">
                      O Lucro Real é o regime tributário em que o imposto é calculado com base no lucro
                      efetivamente apurado pela empresa, considerando todas as receitas, custos e despesas.
                    </p>
                  )}
                </div>
                
                <div className="text-right">
                  <Button disabled size="sm">
                    Ver simulação detalhada
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default RegimeFiscal;
