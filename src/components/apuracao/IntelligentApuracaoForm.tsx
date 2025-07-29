
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { logger } from "@/utils/logger";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useNLPProcessor } from "@/hooks/nlp/useNLPProcessor";
import { Mic, SparklesIcon, Settings, BarChart2, Loader2 } from "lucide-react";
import { 
  ConfiguracaoApuracao,
  ParametrosApuracao, 
  processarApuracao, 
  extrairParametrosApuracaoDeNLP 
} from "@/services/apuracao/apuracaoService";

interface IntelligentApuracaoFormProps {
  onApuracaoProcessada: (resultado: any) => void;
  clienteId?: string;
}

export const IntelligentApuracaoForm: React.FC<IntelligentApuracaoFormProps> = ({
  onApuracaoProcessada,
  clienteId = ""
}) => {
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceCommand, setVoiceCommand] = useState("");
  const [isVoiceInputActive, setIsVoiceInputActive] = useState(false);
  
  // Estado do formulário
  const [formState, setFormState] = useState<ParametrosApuracao>({
    clienteId: clienteId,
    periodo: new Date().toISOString().substring(0, 7), // YYYY-MM
    regimeTributario: "Simples Nacional",
    configuracao: {
      integrarNFe: true,
      integrarBancos: true,
      analisarInconsistencias: true,
      calcularImpostos: true,
      categorizacaoAutomatica: true,
      alertarAnomalia: true,
    }
  });
  
  // Hook do processador de linguagem natural
  const { 
    processCommand, 
    isProcessing: isNlpProcessing 
  } = useNLPProcessor();
  
  // Atualizar campo do estado
  const handleChange = (field: keyof ParametrosApuracao, value: any) => {
    setFormState(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Atualizar campo de configuração
  const handleConfigChange = (field: keyof ConfiguracaoApuracao, value: any) => {
    setFormState(prev => ({
      ...prev,
      configuracao: {
        ...prev.configuracao,
        [field]: value
      }
    }));
  };
  
  // Processar apuração a partir do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await processarApuracaoSubmit();
  };
  
  // Processar apuração utilizando o estado atual do formulário
  const processarApuracaoSubmit = async () => {
    if (!formState.clienteId) {
      toast({
        title: "Cliente não selecionado",
        description: "Por favor, selecione um cliente para prosseguir.",
        variant: "destructive"
      });
      return;
    }
    
    if (!formState.periodo) {
      toast({
        title: "Período não selecionado",
        description: "Por favor, selecione um período para a apuração.",
        variant: "destructive"
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const resultado = await processarApuracao({
        clienteId: formState.clienteId,
        periodo: formState.periodo,
        regimeTributario: formState.regimeTributario,
        configuracao: formState.configuracao
      });
      
      toast({
        title: "Apuração processada",
        description: `Processamento para ${resultado.cliente.nome} concluído com sucesso.`,
      });
      
      onApuracaoProcessada(resultado);
    } catch (error) {
      logger.error("Erro ao processar apuração contábil", error, "IntelligentApuracaoForm");
      toast({
        title: "Falha no processamento",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao processar a apuração",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Processar comando de voz usando NLP
  const processarComandoVoz = async () => {
    if (!voiceCommand.trim()) {
      toast({
        title: "Comando vazio",
        description: "Por favor, diga um comando para processar a apuração.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Processar texto com o NLP para extrair entidades e intenção
      const nlpResult = await processCommand(voiceCommand);
      logger.debug("Resultado NLP processado", nlpResult, "IntelligentApuracaoForm");
      
      // Extrair parâmetros do comando processado
      const parametros = extrairParametrosApuracaoDeNLP(nlpResult);
      logger.debug("Parâmetros extraídos do comando", parametros, "IntelligentApuracaoForm");
      
      // Atualizar o estado do formulário com os parâmetros extraídos
      setFormState(prev => ({
        ...prev,
        ...parametros
      }));
      
      // Se o comando parece ser uma solicitação de apuração, processar automaticamente
      if (nlpResult.intent === 'fiscal_query' || 
          nlpResult.intent === 'tax_calculation' ||
          nlpResult.intent === 'financial_report' ||
          nlpResult.originalText.toLowerCase().includes('apuração') ||
          nlpResult.originalText.toLowerCase().includes('processar') ||
          nlpResult.originalText.toLowerCase().includes('calcular')) {
        
        toast({
          title: "Processando solicitação",
          description: "Iniciando apuração contábil com base no comando.",
        });
        
        // Aguardar um pouco para permitir que o usuário veja os parâmetros atualizados
        setTimeout(() => {
          processarApuracaoSubmit();
        }, 1000);
      } else {
        toast({
          title: "Parâmetros atualizados",
          description: "Os campos do formulário foram atualizados de acordo com o comando.",
        });
      }
      
      // Limpar o comando de voz após processamento
      setVoiceCommand("");
      
    } catch (error) {
      logger.error("Erro ao processar comando de voz", error, "IntelligentApuracaoForm");
      toast({
        title: "Erro no processamento",
        description: error instanceof Error 
          ? error.message 
          : "Não foi possível interpretar o comando",
        variant: "destructive"
      });
    }
  };
  
  // Simulação de reconhecimento de voz
  const iniciarReconhecimentoVoz = () => {
    setIsVoiceInputActive(true);
    toast({
      title: "Reconhecimento de voz",
      description: "Estou ouvindo... Diga seu comando de apuração.",
    });
    
    // Exemplos de comandos que poderiam ser reconhecidos
    const exemploComandos = [
      "Processar apuração para o cliente atual no mês de maio",
      "Calcular impostos do último trimestre no regime do Simples Nacional",
      "Analisar inconsistências na contabilidade de abril",
      "Fazer apuração fiscal do mês atual com detecção de anomalias",
      "Gerar apuração contábil deste mês para Lucro Presumido"
    ];
    
    // Simular reconhecimento após 3 segundos
    setTimeout(() => {
      const comandoAleatorio = exemploComandos[Math.floor(Math.random() * exemploComandos.length)];
      setVoiceCommand(comandoAleatorio);
      setIsVoiceInputActive(false);
      
      toast({
        title: "Comando reconhecido",
        description: comandoAleatorio,
      });
      
      // Processar o comando automaticamente
      processarComandoVoz();
    }, 3000);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl flex items-center gap-2">
              <SparklesIcon className="h-5 w-5 text-primary" />
              Apuração Contábil Inteligente
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <Settings className="h-4 w-4 mr-1" />
              {isExpanded ? "Menos opções" : "Mais opções"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Campo Cliente */}
              <div className="space-y-2">
                <Label htmlFor="cliente">Cliente</Label>
                {clienteId ? (
                  <Input 
                    id="cliente" 
                    value={clienteId} 
                    disabled 
                    className="bg-muted" 
                  />
                ) : (
                  <Input
                    id="cliente"
                    placeholder="Selecione ou digite o ID do cliente"
                    value={formState.clienteId}
                    onChange={(e) => handleChange('clienteId', e.target.value)}
                  />
                )}
              </div>

              {/* Campo Período */}
              <div className="space-y-2">
                <Label htmlFor="periodo">Período</Label>
                <Input
                  id="periodo"
                  type="month"
                  value={formState.periodo}
                  onChange={(e) => handleChange('periodo', e.target.value)}
                />
              </div>
            </div>

            {/* Regime Tributário */}
            <div className="space-y-2">
              <Label htmlFor="regimeTributario">Regime Tributário</Label>
              <Select 
                value={formState.regimeTributario} 
                onValueChange={(value) => handleChange('regimeTributario', value)}
              >
                <SelectTrigger id="regimeTributario">
                  <SelectValue placeholder="Selecione o regime tributário" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Simples Nacional">Simples Nacional</SelectItem>
                  <SelectItem value="Lucro Presumido">Lucro Presumido</SelectItem>
                  <SelectItem value="Lucro Real">Lucro Real</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Opções avançadas - visible when expanded */}
            {isExpanded && (
              <div className="space-y-4 mt-4 border rounded-md p-4">
                <h3 className="font-medium mb-3">Configurações avançadas</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Integração com Notas Fiscais */}
                  <div className="flex items-center justify-between">
                    <Label htmlFor="integrarNFe">Integrar Notas Fiscais</Label>
                    <Switch
                      id="integrarNFe"
                      checked={formState.configuracao?.integrarNFe}
                      onCheckedChange={(checked) => handleConfigChange('integrarNFe', checked)}
                    />
                  </div>

                  {/* Integração com Bancos */}
                  <div className="flex items-center justify-between">
                    <Label htmlFor="integrarBancos">Integrar Bancos</Label>
                    <Switch
                      id="integrarBancos"
                      checked={formState.configuracao?.integrarBancos}
                      onCheckedChange={(checked) => handleConfigChange('integrarBancos', checked)}
                    />
                  </div>

                  {/* Análise de Inconsistências */}
                  <div className="flex items-center justify-between">
                    <Label htmlFor="analisarInconsistencias">Analisar Inconsistências</Label>
                    <Switch
                      id="analisarInconsistencias"
                      checked={formState.configuracao?.analisarInconsistencias}
                      onCheckedChange={(checked) => handleConfigChange('analisarInconsistencias', checked)}
                    />
                  </div>

                  {/* Calcular Impostos */}
                  <div className="flex items-center justify-between">
                    <Label htmlFor="calcularImpostos">Calcular Impostos</Label>
                    <Switch
                      id="calcularImpostos"
                      checked={formState.configuracao?.calcularImpostos}
                      onCheckedChange={(checked) => handleConfigChange('calcularImpostos', checked)}
                    />
                  </div>

                  {/* Categorização Automática */}
                  <div className="flex items-center justify-between">
                    <Label htmlFor="categorizacaoAutomatica">Categorização Automática</Label>
                    <Switch
                      id="categorizacaoAutomatica"
                      checked={formState.configuracao?.categorizacaoAutomatica}
                      onCheckedChange={(checked) => handleConfigChange('categorizacaoAutomatica', checked)}
                    />
                  </div>

                  {/* Alertar Anomalias */}
                  <div className="flex items-center justify-between">
                    <Label htmlFor="alertarAnomalia">Alertar Anomalias</Label>
                    <Switch
                      id="alertarAnomalia"
                      checked={formState.configuracao?.alertarAnomalia}
                      onCheckedChange={(checked) => handleConfigChange('alertarAnomalia', checked)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Entrada por voz e processamento */}
            <div className="pt-4 border-t">
              <div className="flex flex-col gap-4">
                {/* Campo para comando de voz */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Digite um comando ou use o assistente de voz"
                    value={voiceCommand}
                    onChange={(e) => setVoiceCommand(e.target.value)}
                    className="flex-grow"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={iniciarReconhecimentoVoz}
                    disabled={isVoiceInputActive || isNlpProcessing}
                  >
                    {isVoiceInputActive ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* Dicas para comandos de voz */}
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium">Exemplos de comandos:</span> "Processar apuração para maio", 
                  "Calcular impostos do último trimestre", "Analisar inconsistências na contabilidade de abril"
                </div>

                {/* Botões de ação */}
                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="secondary"
                    disabled={!voiceCommand.trim() || isNlpProcessing}
                    onClick={processarComandoVoz}
                    className="flex-grow"
                  >
                    {isNlpProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <SparklesIcon className="h-4 w-4 mr-2" />
                        Processar Comando
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    type="submit" 
                    disabled={isProcessing || !formState.clienteId || !formState.periodo}
                    className="flex-grow"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <BarChart2 className="h-4 w-4 mr-2" />
                        Iniciar Apuração
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
