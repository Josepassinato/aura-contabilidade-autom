
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
import { EnhancedObrigacoesFiscais } from "@/components/obrigacoes/EnhancedObrigacoesFiscais";
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

  // Função para atualizar status das obrigações
  const handleObrigacaoUpdate = (id: string, status: string) => {
    setObrigacoes(prev => 
      prev.map(o => 
        o.id.toString() === id ? { ...o, status: status as "pendente" | "atrasado" | "concluido" } : o
      )
    );
    toast({
      title: "Obrigação atualizada",
      description: `Status alterado para: ${status}`,
    });
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
        <div className="flex items-center gap-2 mb-4">
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

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="flex items-center gap-3">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-r-transparent" />
              <p>Carregando obrigações fiscais...</p>
            </div>
          </div>
        ) : (
          <EnhancedObrigacoesFiscais
            obrigacoes={obrigacoes}
            onObrigacaoUpdate={handleObrigacaoUpdate}
            clienteId={clienteId}
            onClientSelect={handleClientSelect}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default ObrigacoesFiscais;
