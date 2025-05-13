
import React, { useEffect, useState } from 'react';
import { X, FileText, Send, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { useVoiceAssistant } from '@/hooks/useVoiceAssistant';
import { ConversationContainer } from './voice-assistant/ConversationContainer';
import { ChatInput } from './voice-assistant/ChatInput';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth';

interface VoiceAssistantProps {
  isActive: boolean;
  onToggle: () => void;
  clientInfo?: { id: string; name: string; cnpj: string } | null;
}

export function VoiceAssistant({ isActive, onToggle, clientInfo }: VoiceAssistantProps) {
  const { isAdmin } = useAuth();
  const [config, setConfig] = useState<any>(null);
  const [reportGenerating, setReportGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<{
    title: string;
    url: string;
    type: string;
  } | null>(null);
  
  const [openAIConfigured, setOpenAIConfigured] = useState(false);

  const {
    transcript,
    isProcessing,
    isNlpProcessing,
    conversations,
    manualInput,
    setManualInput,
    handleProcessCommand,
    startVoiceRecognition,
    addBotResponse
  } = useVoiceAssistant(isActive, clientInfo);

  useEffect(() => {
    // Carregar configuração do assistente
    const savedConfig = localStorage.getItem("voice-assistant-config");
    if (savedConfig) {
      try {
        setConfig(JSON.parse(savedConfig));
      } catch (error) {
        console.error("Erro ao carregar configuração do assistente:", error);
      }
    }

    // Verificar se OpenAI está configurada
    const apiKey = localStorage.getItem("openai-api-key");
    setOpenAIConfigured(!!apiKey && apiKey.length > 0);
  }, []);

  // Modificação da função de processamento para detectar comandos de relatórios
  const processWithReportDetection = (input: string) => {
    // Se OpenAI não estiver configurada e usuário não for admin, mostrar mensagem
    if (!openAIConfigured && !isAdmin) {
      addBotResponse("O assistente de voz não está configurado. Por favor, entre em contato com um administrador.");
      return;
    }
    
    // Se OpenAI não estiver configurada mas é admin, sugere configurar
    if (!openAIConfigured && isAdmin) {
      addBotResponse("O assistente de voz não está configurado. Por favor, configure a API OpenAI nas configurações do sistema.");
      return;
    }

    // Detectar solicitações de relatórios
    const reportKeywords = [
      'relatório',
      'relatorio',
      'gerar relatório',
      'enviar relatório',
      'me envie o relatório',
      'preciso do relatório',
      'gerar um pdf'
    ];

    const reportTypes = [
      'faturamento',
      'despesas',
      'balanço',
      'balanco',
      'dre',
      'fluxo de caixa',
      'obrigações fiscais',
      'obrigacoes fiscais',
      'folha de pagamento',
      'impostos'
    ];

    // Verificar se é uma solicitação de relatório
    const isReportRequest = reportKeywords.some(keyword => 
      input.toLowerCase().includes(keyword.toLowerCase())
    );
    
    // Identificar o tipo de relatório
    let reportType = '';
    if (isReportRequest) {
      for (const type of reportTypes) {
        if (input.toLowerCase().includes(type.toLowerCase())) {
          reportType = type;
          break;
        }
      }
    }

    // Se for uma solicitação de relatório e tivermos um tipo identificado
    if (isReportRequest && reportType && config?.permitirRelatorios) {
      handleReportRequest(reportType, input);
      return;
    }

    // Caso não seja um relatório, processamos normalmente
    handleProcessCommand(input);
  };

  // Função para lidar com solicitações de relatórios
  const handleReportRequest = (reportType: string, originalCommand: string) => {
    setReportGenerating(true);
    
    // Informar que o relatório está sendo gerado
    addBotResponse(`Estou gerando o relatório de ${reportType} para você. Aguarde um momento...`);
    
    // Simular o tempo de geração do relatório
    setTimeout(() => {
      // Gerar um "relatório" simulado
      const reportUrl = `#report-${reportType.replace(/\s+/g, '-')}-${Date.now()}.pdf`;
      
      // Definir o relatório gerado
      setGeneratedReport({
        title: `Relatório de ${reportType.charAt(0).toUpperCase() + reportType.slice(1)}`,
        url: reportUrl,
        type: reportType
      });
      
      // Verificar se precisa enviar por e-mail
      const shouldSendEmail = originalCommand.toLowerCase().includes('enviar') || 
                             originalCommand.toLowerCase().includes('e-mail') ||
                             originalCommand.toLowerCase().includes('email');
      
      if (shouldSendEmail && config?.emailDestinoRelatorios) {
        // Simular envio do relatório por e-mail
        setTimeout(() => {
          addBotResponse(`Pronto! O relatório de ${reportType} foi gerado com sucesso e enviado para ${config.emailDestinoRelatorios}.`);
          
          toast({
            title: `Relatório enviado`,
            description: `O relatório foi enviado para ${config.emailDestinoRelatorios}`,
          });
        }, 1000);
      } else {
        // Se não for para enviar por e-mail, apenas informar que o relatório está pronto
        addBotResponse(`Pronto! O relatório de ${reportType} foi gerado com sucesso. Você pode baixá-lo clicando no botão abaixo.`);
      }
      
      setReportGenerating(false);
    }, 3000);
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processWithReportDetection(manualInput);
    setManualInput('');
  };

  // Função para baixar o relatório simulado
  const downloadReport = () => {
    if (!generatedReport) return;
    
    toast({
      title: "Download iniciado",
      description: `O relatório de ${generatedReport.type} está sendo baixado.`,
    });
    
    // Em uma implementação real, aqui seria feito o download de um arquivo real
    setTimeout(() => {
      setGeneratedReport(null);
      
      toast({
        title: "Download concluído",
        description: "O relatório foi baixado com sucesso.",
      });
    }, 1500);
  };

  if (!isActive) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-background rounded-lg border shadow-lg">
      <div className="p-4 flex justify-between items-center border-b">
        <div className="flex items-center gap-2">
          {isProcessing || isNlpProcessing || reportGenerating ? (
            <div className="h-5 w-5 rounded-full bg-primary animate-pulse"></div>
          ) : (
            <div className="h-5 w-5 text-primary">🎙️</div>
          )}
          <span className="font-medium">
            {config?.name || (clientInfo ? `${clientInfo.name} Assistant` : "Voice Assistant")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onToggle} className="p-1 rounded-full hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {!openAIConfigured && (
        <div className="p-3 bg-yellow-50 border-b text-sm">
          {isAdmin ? (
            <p>O assistente de voz precisa de configuração. Por favor, configure a API OpenAI nas <Link to="/settings" className="text-primary underline">configurações</Link>.</p>
          ) : (
            <p>O assistente de voz não está configurado. Por favor, entre em contato com um administrador.</p>
          )}
        </div>
      )}
      
      <ConversationContainer 
        messages={conversations}
        isProcessing={isProcessing || reportGenerating}
        transcript={transcript}
      />
      
      {generatedReport && (
        <div className="p-3 bg-muted/30 border-t border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium truncate">{generatedReport.title}</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-8 px-2 flex items-center gap-1"
            onClick={downloadReport}
          >
            <Download className="h-3 w-3" />
            <span className="text-xs">Baixar</span>
          </Button>
        </div>
      )}
      
      <div className="p-4 border-t">
        <ChatInput
          value={manualInput}
          onChange={(e) => setManualInput(e.target.value)}
          onSubmit={(e) => {
            e.preventDefault();
            processWithReportDetection(manualInput);
            setManualInput('');
          }}
          onVoiceRecognition={startVoiceRecognition}
          isProcessing={isProcessing || reportGenerating}
          disabled={!openAIConfigured}
        />
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-muted-foreground">
            {!openAIConfigured ? "Assistente não configurado" :
              isProcessing ? "Processando..." : 
              reportGenerating ? "Gerando relatório..." : 
              "Pronto para ouvir"}
          </span>
          <span className="text-xs text-muted-foreground">Powered by Advanced AI</span>
        </div>
      </div>
    </div>
  );
}

export default VoiceAssistant;
