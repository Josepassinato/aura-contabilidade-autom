
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { 
  AuditoriaConfig, 
  configurarAuditoriaContinua, 
  iniciarAuditoriaContinua 
} from "@/services/fiscal/auditoria/auditoriaContinua";

// Import our extracted components
import { FrequenciaSelector } from "./components/FrequenciaSelector";
import { NivelValidacaoSelector } from "./components/NivelValidacaoSelector";
import { LimiarConfiancaSlider } from "./components/LimiarConfiancaSlider";
import { ConfiguracoesAdicionais } from "./components/ConfiguracoesAdicionais";
import { AuditoriaActions } from "./components/AuditoriaActions";
import { AuditoriaHeader } from "./components/AuditoriaHeader";

export function AuditoriaContinuaConfig() {
  const [config, setConfig] = useState<AuditoriaConfig>({
    frequencia: 'tempo-real',
    nivelValidacao: 'basico',
    aplicarCorrecoes: false,
    notificarInconsistencias: true,
    limiarConfianca: 0.85,
    salvarHistorico: true,
    usarIA: true
  });

  const [ativa, setAtiva] = useState<boolean>(false);

  const handleChangeConfig = (key: keyof AuditoriaConfig, value: any) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSalvarConfig = () => {
    const configAtualizada = configurarAuditoriaContinua(config);
    toast({
      title: "Configuração salva",
      description: "As configurações de auditoria contínua foram atualizadas.",
    });
  };

  const handleIniciarAuditoria = () => {
    iniciarAuditoriaContinua();
    setAtiva(true);
    toast({
      title: "Auditoria contínua iniciada",
      description: `Sistema de auditoria iniciado com monitoramento ${config.frequencia === 'tempo-real' ? 'em tempo real' : 'periódico'}.`,
    });
  };

  const handlePararAuditoria = () => {
    // Aqui implementaria a lógica para parar a auditoria
    setAtiva(false);
    toast({
      title: "Auditoria contínua pausada",
      description: "O sistema de auditoria contínua foi pausado.",
    });
  };

  const handleResetConfig = () => {
    setConfig({
      frequencia: 'tempo-real',
      nivelValidacao: 'basico',
      aplicarCorrecoes: false,
      notificarInconsistencias: true,
      limiarConfianca: 0.85,
      salvarHistorico: true,
      usarIA: true
    });
    
    toast({
      title: "Configuração resetada",
      description: "As configurações de auditoria contínua foram restauradas para o padrão.",
    });
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <AuditoriaHeader ativa={ativa} />
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <FrequenciaSelector 
            frequencia={config.frequencia} 
            onChange={(value) => handleChangeConfig('frequencia', value)} 
          />
          
          <NivelValidacaoSelector 
            nivelValidacao={config.nivelValidacao} 
            onChange={(value) => handleChangeConfig('nivelValidacao', value)} 
          />
          
          <LimiarConfiancaSlider 
            limiarConfianca={config.limiarConfianca} 
            onChange={(value) => handleChangeConfig('limiarConfianca', value)} 
          />
          
          <ConfiguracoesAdicionais 
            usarIA={config.usarIA}
            notificarInconsistencias={config.notificarInconsistencias}
            aplicarCorrecoes={config.aplicarCorrecoes}
            salvarHistorico={config.salvarHistorico}
            onChangeConfig={handleChangeConfig}
          />
        </div>
      </CardContent>
      
      <CardFooter>
        <AuditoriaActions 
          ativa={ativa}
          onReset={handleResetConfig}
          onSalvar={handleSalvarConfig}
          onIniciar={handleIniciarAuditoria}
          onParar={handlePararAuditoria}
        />
      </CardFooter>
    </Card>
  );
}
