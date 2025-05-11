
import React, { useState, useEffect } from 'react';
import { Mic, MicOff, X, Send } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input"; 

interface VoiceAssistantProps {
  isActive: boolean;
  onToggle: () => void;
}

export function VoiceAssistant({ isActive, onToggle }: VoiceAssistantProps) {
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState('');
  const [conversations, setConversations] = useState<Array<{type: 'user' | 'bot', text: string}>>([]);

  // Efeito para simular o reconhecimento de voz quando está ativo
  useEffect(() => {
    if (!isActive) {
      return;
    }

    // Exibir mensagem de boas-vindas quando o assistente é ativado
    if (conversations.length === 0) {
      setConversations([{
        type: 'bot',
        text: 'Olá! Sou seu assistente de voz contábil. Como posso ajudar você hoje?'
      }]);
    }
  }, [isActive, conversations.length]);

  // Função para simular o processamento do comando de voz ou texto digitado
  const processCommand = (command: string) => {
    if (!command.trim()) return;
    
    // Adiciona o comando do usuário ao histórico de conversas
    setConversations(prev => [...prev, {type: 'user', text: command}]);
    setIsProcessing(true);
    setManualInput('');
    
    // Simulação de processamento do comando
    setTimeout(() => {
      let responseText = '';
      
      // Lógica baseada em palavras-chave para simular respostas inteligentes
      if (command.toLowerCase().includes('obrigações') || command.toLowerCase().includes('fiscal')) {
        responseText = 'A empresa ABC Ltda possui as seguintes obrigações fiscais para este mês: DARF PIS/COFINS com vencimento em 25/05, DARF IRPJ com vencimento em 30/05, e GFIP com vencimento em 20/05.';
      } else if (command.toLowerCase().includes('faturamento') || command.toLowerCase().includes('receita')) {
        responseText = 'O faturamento da empresa ABC no último mês foi de R$ 152.789,45, representando um aumento de 12% em relação ao mês anterior.';
      } else if (command.toLowerCase().includes('folha') || command.toLowerCase().includes('pagamento')) {
        responseText = 'A folha de pagamento da empresa XYZ para este mês está em R$ 67.890,32. Há 3 admissões pendentes de processamento.';
      } else if (command.toLowerCase().includes('cliente') || command.toLowerCase().includes('empresa')) {
        responseText = 'Você tem 42 clientes ativos no momento. Destes, 5 estão com documentações pendentes e 3 com obrigações fiscais atrasadas.';
      } else {
        responseText = 'Desculpe, não consegui entender completamente sua solicitação. Poderia reformular ou ser mais específico sobre qual informação contábil você precisa?';
      }
      
      // Adiciona a resposta do bot ao histórico de conversas
      setConversations(prev => [...prev, {type: 'bot', text: responseText}]);
      setIsProcessing(false);
      
      // Notificar o usuário
      toast({
        title: "Assistente de Voz",
        description: "Nova resposta disponível",
      });
    }, 2000);
  };

  // Função para lidar com a submissão do comando por texto
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processCommand(manualInput);
  };

  // Função para simular o início do reconhecimento de voz
  const startVoiceRecognition = () => {
    toast({
      title: "Reconhecimento de Voz",
      description: "Ouvindo... Diga o que precisa.",
    });
    
    // Simular reconhecimento após 3 segundos
    setTimeout(() => {
      const simulatedCommands = [
        "Quais são as obrigações fiscais deste mês?",
        "Qual foi o faturamento do último trimestre?",
        "Mostre a situação da folha de pagamento",
        "Quantos clientes estão com documentação pendente?"
      ];
      
      // Escolher um comando aleatório
      const randomCommand = simulatedCommands[Math.floor(Math.random() * simulatedCommands.length)];
      setTranscript(randomCommand);
      processCommand(randomCommand);
    }, 3000);
  };

  if (!isActive) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-background rounded-lg border shadow-lg">
      <div className="p-4 flex justify-between items-center border-b">
        <div className="flex items-center gap-2">
          {isProcessing ? (
            <div className="h-5 w-5 rounded-full bg-primary animate-pulse"></div>
          ) : (
            <Mic className="h-5 w-5 text-primary" />
          )}
          <span className="font-medium">Assistente de Voz</span>
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
          >
            <Mic className="h-4 w-4" />
          </button>
          <button 
            type="submit"
            className="p-2 rounded-full bg-primary text-primary-foreground"
            disabled={!manualInput.trim()}
            title="Enviar mensagem"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-muted-foreground">
            {isProcessing ? "Processando..." : "Pronto para ouvir comandos"}
          </span>
          <span className="text-xs text-muted-foreground">Powered by ContaFácil AI</span>
        </div>
      </div>
    </div>
  );
}

export default VoiceAssistant;
