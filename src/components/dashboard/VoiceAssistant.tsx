
import React, { useState, useEffect } from 'react';
import { Mic, MicOff, X, Send } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input"; 
import { useSupabaseClient } from "@/lib/supabase";
import { useNaturalLanguage } from '@/hooks/useNaturalLanguage';

interface VoiceAssistantProps {
  isActive: boolean;
  onToggle: () => void;
  clientInfo?: { id: string; name: string; cnpj: string } | null;
}

export function VoiceAssistant({ isActive, onToggle, clientInfo }: VoiceAssistantProps) {
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [conversations, setConversations] = useState<Array<{type: 'user' | 'bot', text: string}>>([]);
  const supabase = useSupabaseClient();
  
  // Usar o hook de processamento de linguagem natural
  const { processCommand, generateResponse, isProcessing: isNlpProcessing } = useNaturalLanguage();
  
  // Efeito para simular o reconhecimento de voz quando está ativo
  useEffect(() => {
    if (!isActive) {
      return;
    }

    // Exibir mensagem de boas-vindas quando o assistente é ativado
    if (conversations.length === 0) {
      const welcomeMessage = clientInfo 
        ? `Olá! Sou sua assistente contábil para ${clientInfo.name}. Como posso ajudar você hoje?`
        : 'Olá! Sou seu assistente de voz contábil. Como posso ajudar você hoje?';
      
      setConversations([{
        type: 'bot',
        text: welcomeMessage
      }]);
    }
  }, [isActive, conversations.length, clientInfo]);

  // Função para buscar dados contábeis do cliente
  const fetchClientData = async (clientId: string, dataType: string) => {
    if (!supabase) return null;
    
    try {
      switch (dataType) {
        case 'financial':
          // Buscar dados financeiros resumidos
          const { data: financialData } = await supabase
            .from('client_financial_data')
            .select('*')
            .eq('client_id', clientId)
            .order('period', { ascending: false })
            .limit(1)
            .single();
          return financialData;
          
        case 'taxes':
          // Buscar obrigações fiscais
          const { data: taxData } = await supabase
            .from('tax_obligations')
            .select('*')
            .eq('client_id', clientId)
            .order('due_date', { ascending: true });
          return taxData;
          
        case 'documents':
          // Buscar documentos
          const { data: documentsData } = await supabase
            .from('client_documents')
            .select('*')
            .eq('client_id', clientId)
            .order('created_at', { ascending: false })
            .limit(5);
          return documentsData;
          
        default:
          return null;
      }
    } catch (error) {
      console.error("Erro ao buscar dados do cliente:", error);
      return null;
    }
  };

  // Função para processar o comando de voz ou texto digitado usando NLP
  const handleProcessCommand = async (command: string) => {
    if (!command.trim()) return;
    
    // Adiciona o comando do usuário ao histórico de conversas
    setConversations(prev => [...prev, {type: 'user', text: command}]);
    setIsProcessing(true);
    setManualInput('');
    
    try {
      // Usar o processador de linguagem natural para identificar a intenção
      const nlpResult = await processCommand(command);
      console.log('Resultado NLP:', nlpResult);
      
      // Gerar resposta contextual baseada na intenção identificada e no cliente
      const responseText = generateResponse(nlpResult, clientInfo?.name);
      
      // Adiciona a resposta do bot ao histórico de conversas
      setConversations(prev => [...prev, {type: 'bot', text: responseText}]);
      
      // Notificar o usuário
      toast({
        title: "Assistente de IA",
        description: "Nova resposta disponível",
      });
    } catch (error) {
      console.error("Erro ao processar comando:", error);
      setConversations(prev => [...prev, {
        type: 'bot', 
        text: 'Desculpe, ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.'
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Função para lidar com a submissão do comando por texto
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleProcessCommand(manualInput);
  };

  // Função para simular o início do reconhecimento de voz
  const startVoiceRecognition = () => {
    toast({
      title: "Reconhecimento de Voz",
      description: "Ouvindo... Diga o que precisa.",
    });
    
    // Simular reconhecimento após 3 segundos
    setTimeout(() => {
      // Comandos contextuais baseados no cliente
      let simulatedCommands;
      
      if (clientInfo) {
        simulatedCommands = [
          "Quais são minhas obrigações fiscais deste mês?",
          "Qual foi meu faturamento no último trimestre?",
          "Mostre meus documentos contábeis recentes",
          "Qual a situação dos meus impostos?",
          "Detecte anomalias nos meus lançamentos contábeis",
          "Faça uma previsão do meu fluxo de caixa",
          "Simule o melhor regime tributário para minha empresa"
        ];
      } else {
        simulatedCommands = [
          "Quais são as obrigações fiscais deste mês?",
          "Qual foi o faturamento do último trimestre?",
          "Mostre a situação da folha de pagamento",
          "Quantos clientes estão com documentação pendente?",
          "Detecte anomalias contábeis",
          "Analise o fluxo de caixa projetado",
          "Simule cenários tributários"
        ];
      }
      
      // Escolher um comando aleatório
      const randomCommand = simulatedCommands[Math.floor(Math.random() * simulatedCommands.length)];
      setTranscript(randomCommand);
      handleProcessCommand(randomCommand);
    }, 3000);
  };

  if (!isActive) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-background rounded-lg border shadow-lg">
      <div className="p-4 flex justify-between items-center border-b">
        <div className="flex items-center gap-2">
          {isProcessing || isNlpProcessing ? (
            <div className="h-5 w-5 rounded-full bg-primary animate-pulse"></div>
          ) : (
            <Mic className="h-5 w-5 text-primary" />
          )}
          <span className="font-medium">
            {clientInfo ? `Assistente de ${clientInfo.name}` : "Assistente de Voz"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onToggle} className="p-1 rounded-full hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <div className="p-4 h-64 overflow-y-auto flex flex-col gap-4">
        {conversations.map((message, index) => (
          <div 
            key={index} 
            className={`p-3 rounded-lg max-w-[80%] ${
              message.type === 'user' 
                ? 'bg-muted self-end rounded-br-none' 
                : 'bg-primary/10 self-start rounded-bl-none'
            }`}
          >
            <p className="text-sm">{message.text}</p>
          </div>
        ))}
        
        {isProcessing && (
          <div className="flex gap-2 p-3 self-start">
            <div className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse"></div>
            <div className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse delay-150"></div>
            <div className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse delay-300"></div>
          </div>
        )}
        
        {transcript && (
          <div className="bg-muted p-3 rounded-lg rounded-br-none self-end max-w-[80%]">
            <p className="text-sm">{transcript}</p>
          </div>
        )}
      </div>
      
      <div className="p-4 border-t">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <Input
            type="text"
            placeholder="Digite ou use comando de voz..."
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            className="flex-1"
          />
          <button 
            type="button"
            onClick={startVoiceRecognition}
            className="p-2 rounded-full bg-primary text-primary-foreground"
            title="Ativar reconhecimento de voz"
            disabled={isProcessing}
          >
            <Mic className="h-4 w-4" />
          </button>
          <button 
            type="submit"
            className="p-2 rounded-full bg-primary text-primary-foreground"
            disabled={!manualInput.trim() || isProcessing}
            title="Enviar mensagem"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-muted-foreground">
            {isProcessing ? "Processando..." : "Pronto para ouvir comandos"}
          </span>
          <span className="text-xs text-muted-foreground">Powered by IA Contábil Avançada</span>
        </div>
      </div>
    </div>
  );
}

export default VoiceAssistant;
