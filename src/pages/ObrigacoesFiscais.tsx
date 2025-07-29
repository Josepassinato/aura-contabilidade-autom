
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, FileText, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClientSelector } from "@/components/layout/ClientSelector";
import { ObrigacoesCalendario } from "@/components/obrigacoes/ObrigacoesCalendario";
import { ObrigacoesList } from "@/components/obrigacoes/ObrigacoesList";
import { ObrigacoesSummaryCards } from "@/components/obrigacoes/ObrigacoesSummaryCards";
import { ObrigacoesDateSelector } from "@/components/obrigacoes/ObrigacoesDateSelector";
import { fetchObrigacoesFiscais } from "@/services/supabase/obrigacoesService";
import { Obrigacao } from "@/types/obrigacoes";
import { marcarObrigacoesAtrasadas } from "@/utils/obrigacoesUtils";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { BackButton } from "@/components/navigation/BackButton";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";

const ObrigacoesFiscais = () => {
  const [activeTab, setActiveTab] = useState("calendario");
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [ano, setAno] = useState(new Date().getFullYear());
  const [obrigacoes, setObrigacoes] = useState<Obrigacao[]>([]);
  const [clienteId, setClienteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { enhancedLogout } = useAuth();
  const { toast } = useToast();

  // Buscar obrigações fiscais quando a página carregar ou quando o cliente mudar
  useEffect(() => {
    const carregarObrigacoes = async () => {
      setLoading(true);
      try {
        const data = await fetchObrigacoesFiscais(clienteId || undefined);
        
        // Verificar e marcar obrigações atrasadas
        const obrigacoesAtualizadas = await marcarObrigacoesAtrasadas(data);
        setObrigacoes(obrigacoesAtualizadas);
      } catch (error) {
        console.error("Erro ao carregar obrigações:", error);
        toast({
          title: "Erro ao carregar obrigações",
          description: "Não foi possível carregar as obrigações fiscais",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    carregarObrigacoes();
  }, [clienteId, toast]);

  // Função para tratar a seleção do cliente
  const handleClientSelect = (client: { id: string; name: string }) => {
    setClienteId(client.id || null);
  };

  // Calcular estatísticas para o resumo
  const pendentes = obrigacoes.filter(o => o.status === "pendente").length;
  const atrasadas = obrigacoes.filter(o => o.status === "atrasado").length;
  const concluidas = obrigacoes.filter(o => o.status === "concluido").length;
  
  // Próximos 7 dias
  const hoje = new Date();
  const umaSemanaDepois = new Date();
  umaSemanaDepois.setDate(hoje.getDate() + 7);
  
  const proximaSemana = obrigacoes.filter(o => {
    const [dia, mes, ano] = o.prazo.split('/').map(Number);
    const dataPrazo = new Date(ano, mes - 1, dia);
    return dataPrazo >= hoje && dataPrazo <= umaSemanaDepois && o.status !== "concluido";
  }).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <BackButton />
              <Button 
                variant="destructive" 
                size="sm" 
                className="flex items-center"
                onClick={enhancedLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Obrigações Fiscais</h1>
            <p className="text-muted-foreground">
              Acompanhamento e gestão de obrigações fiscais e acessórias
            </p>
          </div>
          <ClientSelector onClientSelect={handleClientSelect} />
        </div>

        <ObrigacoesSummaryCards 
          pendentes={pendentes}
          atrasadas={atrasadas}
          concluidas={concluidas}
          proximaSemana={proximaSemana}
        />

        <ObrigacoesDateSelector
          mes={mes}
          setMes={setMes}
          ano={ano}
          setAno={setAno}
        />

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <p>Carregando obrigações fiscais...</p>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="calendario" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Calendário
              </TabsTrigger>
              <TabsTrigger value="lista" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Lista
              </TabsTrigger>
            </TabsList>

            <TabsContent value="calendario">
              <Card>
                <CardHeader>
                  <CardTitle>Calendário de Obrigações Fiscais</CardTitle>
                </CardHeader>
                <CardContent>
                  <ObrigacoesCalendario 
                    mes={mes} 
                    ano={ano} 
                    obrigacoes={obrigacoes}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="lista">
              <Card>
                <CardHeader>
                  <CardTitle>Lista de Obrigações Fiscais</CardTitle>
                </CardHeader>
                <CardContent>
                  <ObrigacoesList obrigacoes={obrigacoes} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ObrigacoesFiscais;
