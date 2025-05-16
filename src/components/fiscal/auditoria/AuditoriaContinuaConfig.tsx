
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { ProcessamentoContabilConfig, configurarProcessamentoAvancado } from "@/services/fiscal/classificacao/processamentoAvancado";
import { RotateCw, Activity } from "lucide-react";
import { AuditoriaHeader } from "./components/AuditoriaHeader";
import { FrequenciaSelector } from "./components/FrequenciaSelector";
import { NivelValidacaoSelector } from "./components/NivelValidacaoSelector";
import { LimiarConfiancaSlider } from "./components/LimiarConfiancaSlider";
import { ConfiguracoesAdicionais } from "./components/ConfiguracoesAdicionais";
import { AuditoriaActions } from "./components/AuditoriaActions";
import { CrossValidationConfigComponent } from "./components/CrossValidationConfig";
import { CrossValidationConfig, configureCrossValidation } from "@/services/fiscal/validation/crossValidationService";

export function AuditoriaContinuaConfig() {
  const [ativa, setAtiva] = useState<boolean>(true);
  const [frequencia, setFrequencia] = useState<string>("diario");
  const [nivelValidacao, setNivelValidacao] = useState<string>("inteligente");
  const [limiarConfianca, setLimiarConfianca] = useState<number>(0.85);
  const [usarContextoHistorico, setUsarContextoHistorico] = useState<boolean>(true);
  const [validacaoCruzada, setValidacaoCruzada] = useState<boolean>(true);
  const [gravarHistoricoDecisoes, setGravarHistoricoDecisoes] = useState<boolean>(true);
  const [tab, setTab] = useState<string>("geral");
  
  // Salvar configurações
  const handleSalvarConfig = () => {
    const config: ProcessamentoContabilConfig = {
      usarIA: true,
      limiarConfiancaAutomatica: limiarConfianca,
      usarContextoHistorico,
      validacaoCruzada,
      gravarHistoricoDecisoes,
    };
    
    configurarProcessamentoAvancado(config);
    
    toast({
      title: "Configuração salva",
      description: `Auditoria contínua ${ativa ? 'ativada' : 'desativada'} com sucesso`,
    });
  };

  // Handler para alteração da configuração de validação cruzada
  const handleCrossValidationConfigChange = (config: CrossValidationConfig) => {
    console.log("Cross-validation config updated:", config);
    // A configuração já é salva no handler interno
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <AuditoriaHeader ativa={ativa} />
      </CardHeader>
      
      <CardContent>
        <Tabs value={tab} onValueChange={setTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="geral" className="flex items-center gap-1">
              <RotateCw className="h-4 w-4" />
              Configurações Gerais
            </TabsTrigger>
            <TabsTrigger value="validacao-cruzada" className="flex items-center gap-1">
              <Activity className="h-4 w-4" />
              Validação Cruzada
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="geral" className="space-y-6">
            {/* Frequência de Verificação */}
            <FrequenciaSelector frequencia={frequencia} onChange={setFrequencia} />
            
            {/* Nível de Validação */}
            <NivelValidacaoSelector 
              nivelValidacao={nivelValidacao} 
              onChange={setNivelValidacao} 
            />
            
            {/* Limiar de Confiança */}
            <LimiarConfiancaSlider 
              limiarConfianca={limiarConfianca} 
              onChange={setLimiarConfianca} 
            />
            
            {/* Configurações Adicionais */}
            <ConfiguracoesAdicionais 
              usarContextoHistorico={usarContextoHistorico}
              setUsarContextoHistorico={setUsarContextoHistorico}
              validacaoCruzada={validacaoCruzada}
              setValidacaoCruzada={setValidacaoCruzada}
              gravarHistoricoDecisoes={gravarHistoricoDecisoes}
              setGravarHistoricoDecisoes={setGravarHistoricoDecisoes}
            />
          </TabsContent>
          
          <TabsContent value="validacao-cruzada">
            <CrossValidationConfigComponent 
              onConfigChange={handleCrossValidationConfigChange} 
            />
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="border-t pt-4">
        <AuditoriaActions 
          ativa={ativa} 
          onToggleActive={() => setAtiva(!ativa)} 
          onSave={handleSalvarConfig} 
        />
      </CardFooter>
    </Card>
  );
}
