import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Settings2, Play, Clock, Shield, Zap, RotateCcw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { 
  AuditoriaConfig, 
  configurarAuditoriaContinua, 
  iniciarAuditoriaContinua 
} from "@/services/fiscal/auditoria/auditoriaContinua";

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
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Settings2 className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Configuração de Auditoria Contínua</CardTitle>
              <CardDescription>
                Configure o sistema de auditoria contínua com IA para seus lançamentos
              </CardDescription>
            </div>
          </div>
          
          <Badge 
            variant={ativa ? "default" : "outline"}
            className={ativa ? "bg-green-500 hover:bg-green-600" : ""}
          >
            {ativa ? "Ativo" : "Inativo"}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label>Frequência de Verificação</Label>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
            <RadioGroup 
              value={config.frequencia} 
              onValueChange={(value) => handleChangeConfig('frequencia', value)}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioItem value="tempo-real" id="tempo-real" />
                <Label htmlFor="tempo-real">Tempo Real</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioItem value="diaria" id="diaria" />
                <Label htmlFor="diaria">Diária</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioItem value="semanal" id="semanal" />
                <Label htmlFor="semanal">Semanal</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label>Nível de Validação</Label>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </div>
            <Select 
              value={config.nivelValidacao}
              onValueChange={(value) => handleChangeConfig('nivelValidacao', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o nível de validação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basico">Básico - Verificações Essenciais</SelectItem>
                <SelectItem value="completo">Completo - Verificações Detalhadas</SelectItem>
                <SelectItem value="avancado">Avançado - Verificações Aprofundadas</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label>Limiar de Confiança ({Math.round(config.limiarConfianca * 100)}%)</Label>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </div>
            <Slider
              value={[config.limiarConfianca * 100]}
              min={50}
              max={99}
              step={1}
              onValueChange={(value) => handleChangeConfig('limiarConfianca', value[0] / 100)}
              className="py-4"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>50%</span>
              <span>75%</span>
              <span>99%</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center mb-2">
              <Label>Configurações Adicionais</Label>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="usar-ia" className="flex items-center space-x-2">
                  <span>Usar Inteligência Artificial</span>
                </Label>
                <Switch 
                  id="usar-ia"
                  checked={config.usarIA}
                  onCheckedChange={(value) => handleChangeConfig('usarIA', value)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="notificar" className="flex items-center space-x-2">
                  <span>Notificar Inconsistências</span>
                </Label>
                <Switch 
                  id="notificar"
                  checked={config.notificarInconsistencias}
                  onCheckedChange={(value) => handleChangeConfig('notificarInconsistencias', value)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="corrigir" className="flex items-center space-x-2">
                  <span>Aplicar Correções Automáticas</span>
                </Label>
                <Switch 
                  id="corrigir"
                  checked={config.aplicarCorrecoes}
                  onCheckedChange={(value) => handleChangeConfig('aplicarCorrecoes', value)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="salvar-historico" className="flex items-center space-x-2">
                  <span>Salvar Histórico de Verificações</span>
                </Label>
                <Switch 
                  id="salvar-historico"
                  checked={config.salvarHistorico}
                  onCheckedChange={(value) => handleChangeConfig('salvarHistorico', value)}
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between pt-4 border-t">
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={handleResetConfig}
            className="flex items-center space-x-2"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset</span>
          </Button>
          <Button 
            variant="outline" 
            onClick={handleSalvarConfig}
            className="flex items-center space-x-2"
          >
            <Settings2 className="h-4 w-4" />
            <span>Salvar Configurações</span>
          </Button>
        </div>
        
        {ativa ? (
          <Button 
            variant="destructive" 
            onClick={handlePararAuditoria}
          >
            Pausar Auditoria
          </Button>
        ) : (
          <Button 
            onClick={handleIniciarAuditoria}
            className="flex items-center space-x-2"
          >
            <Play className="h-4 w-4" />
            <span>Iniciar Auditoria Contínua</span>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
