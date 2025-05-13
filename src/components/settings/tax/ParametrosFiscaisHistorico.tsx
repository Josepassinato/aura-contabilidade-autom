
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from '@/lib/supabase/client';
import { toast } from "@/hooks/use-toast";
import { History, Clock, RefreshCw, Check } from "lucide-react";

// Interface para o tipo de parâmetro fiscal
interface ParametroFiscalHistorico {
  id: string;
  tipo: string;
  versao: string;
  data_atualizacao: string;
  parametros: any;
  consultoria_id: string | null;
  consultoria_nome?: string;
  ativo: boolean;
  aplicado_em: string | null;
}

export function ParametrosFiscaisHistorico() {
  const [historico, setHistorico] = useState<Record<string, ParametroFiscalHistorico[]>>({});
  const [activeTab, setActiveTab] = useState("irpj");
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<string | null>(null);
  
  const tiposImpostos = [
    { id: "irpj", nome: "IRPJ" },
    { id: "csll", nome: "CSLL" },
    { id: "piscofins", nome: "PIS/COFINS" },
    { id: "inssfgts", nome: "INSS/FGTS" },
    { id: "simples", nome: "Simples Nacional" }
  ];

  // Função para carregar o histórico de parâmetros
  useEffect(() => {
    const carregarHistorico = async () => {
      setLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('parametros_fiscais')
          .select(`
            id, 
            tipo, 
            versao, 
            data_atualizacao, 
            parametros, 
            consultoria_id, 
            consultorias_fiscais(nome), 
            ativo, 
            aplicado_em
          `)
          .order('data_atualizacao', { ascending: false });
        
        if (error) throw error;
        
        // Agrupar histórico por tipo de imposto
        const historicoAgrupado: Record<string, ParametroFiscalHistorico[]> = {};
        
        data?.forEach(item => {
          const paramFiscal: ParametroFiscalHistorico = {
            id: item.id,
            tipo: item.tipo,
            versao: item.versao,
            data_atualizacao: item.data_atualizacao,
            parametros: item.parametros,
            consultoria_id: item.consultoria_id,
            consultoria_nome: item.consultorias_fiscais?.nome,
            ativo: item.ativo,
            aplicado_em: item.aplicado_em
          };
          
          if (!historicoAgrupado[item.tipo]) {
            historicoAgrupado[item.tipo] = [];
          }
          
          historicoAgrupado[item.tipo].push(paramFiscal);
        });
        
        setHistorico(historicoAgrupado);
      } catch (error: any) {
        console.error('Erro ao carregar histórico de parâmetros:', error);
        toast({
          title: "Erro",
          description: `Não foi possível carregar o histórico: ${error.message}`,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    carregarHistorico();
  }, []);
  
  // Aplicar versão anterior
  const aplicarVersao = async (parametro: ParametroFiscalHistorico) => {
    setApplying(parametro.id);
    
    try {
      // Atualizar parâmetro para ativo e registrar data de aplicação
      const { error } = await supabase
        .from('parametros_fiscais')
        .update({
          ativo: true,
          aplicado_em: new Date().toISOString()
        })
        .eq('id', parametro.id);
      
      if (error) throw error;
      
      // Desativar outras versões do mesmo tipo
      const { error: errorDesativar } = await supabase
        .from('parametros_fiscais')
        .update({ ativo: false })
        .eq('tipo', parametro.tipo)
        .neq('id', parametro.id);
      
      if (errorDesativar) throw errorDesativar;
      
      // Atualizar o estado local
      setHistorico(prevHistorico => {
        const novoHistorico = { ...prevHistorico };
        
        if (novoHistorico[parametro.tipo]) {
          novoHistorico[parametro.tipo] = novoHistorico[parametro.tipo].map(p => ({
            ...p,
            ativo: p.id === parametro.id,
            aplicado_em: p.id === parametro.id ? new Date().toISOString() : p.aplicado_em
          }));
        }
        
        return novoHistorico;
      });
      
      toast({
        title: "Versão Aplicada",
        description: `A versão ${parametro.versao} dos parâmetros de ${parametro.tipo.toUpperCase()} foi aplicada com sucesso.`,
      });
    } catch (error: any) {
      console.error('Erro ao aplicar versão:', error);
      toast({
        title: "Erro",
        description: `Não foi possível aplicar a versão: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setApplying(null);
    }
  };
  
  // Formatar data e hora
  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Histórico de Versões de Parâmetros Fiscais
        </CardTitle>
        <CardDescription>
          Visualize e gerencie o histórico de todas as versões dos parâmetros fiscais, permitindo aplicar versões anteriores quando necessário.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 mb-6">
            {tiposImpostos.map(tipo => (
              <TabsTrigger key={tipo.id} value={tipo.id}>{tipo.nome}</TabsTrigger>
            ))}
          </TabsList>
          
          {tiposImpostos.map(tipo => (
            <TabsContent key={tipo.id} value={tipo.id} className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin mx-auto" />
                  <p className="mt-2 text-muted-foreground">Carregando histórico...</p>
                </div>
              ) : (
                <>
                  {(!historico[tipo.id] || historico[tipo.id].length === 0) ? (
                    <div className="text-center py-8 border rounded-lg">
                      <p className="text-muted-foreground">Nenhum histórico de parâmetros encontrado para {tipo.nome}.</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Versão</TableHead>
                          <TableHead>Data Atualização</TableHead>
                          <TableHead>Origem</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Aplicado em</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {historico[tipo.id]?.map((parametro) => (
                          <TableRow key={parametro.id}>
                            <TableCell className="font-medium">{parametro.versao}</TableCell>
                            <TableCell>{formatarData(parametro.data_atualizacao)}</TableCell>
                            <TableCell>
                              {parametro.consultoria_nome || "Atualização Manual"}
                            </TableCell>
                            <TableCell>
                              {parametro.ativo ? (
                                <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Ativo</Badge>
                              ) : (
                                <Badge variant="outline">Inativo</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {parametro.aplicado_em ? (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{formatarData(parametro.aplicado_em)}</span>
                                </div>
                              ) : (
                                "-"
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={parametro.ativo || applying === parametro.id}
                                onClick={() => aplicarVersao(parametro)}
                              >
                                {applying === parametro.id ? (
                                  <>Aplicando...</>
                                ) : parametro.ativo ? (
                                  <>
                                    <Check className="mr-1 h-4 w-4" />
                                    Aplicado
                                  </>
                                ) : (
                                  <>Aplicar esta versão</>
                                )}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
