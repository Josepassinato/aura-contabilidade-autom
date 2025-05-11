
import React, { useState, useEffect } from 'react';
import { Mic, MicOff, X } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface VoiceAssistantProps {
  isActive: boolean;
  onToggle: () => void;
}

export function VoiceAssistant({ isActive, onToggle }: VoiceAssistantProps) {
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [response, setResponse] = useState<string | null>(null);

  // Efeito para simular o reconhecimento de voz quando está ativo
  useEffect(() => {
    if (!isActive) {
      setTranscript('');
      setResponse(null);
      return;
    }

    // Simulação do reconhecimento de voz
    const timer = setTimeout(() => {
      // Exemplo: exibir texto simulando o reconhecimento
      setTranscript('Quais são as obrigações fiscais da empresa ABC para este mês?');
      setIsProcessing(true);
      
      // Simular o processamento da IA
      const processingTimer = setTimeout(() => {
        setIsProcessing(false);
        setResponse('A empresa ABC Ltda possui as seguintes obrigações fiscais para este mês: DARF PIS/COFINS com vencimento em 25/05, DARF IRPJ com vencimento em 30/05, e GFIP com vencimento em 20/05.');
        
        // Notificar o usuário
        toast({
          title: "Assistente de Voz",
          description: "Resposta do assistente está pronta",
        });
      }, 3000);
      
      return () => clearTimeout(processingTimer);
    }, 1500);

    return () => clearTimeout(timer);
  }, [isActive]);

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
        {transcript && (
          <div className="bg-muted p-3 rounded-lg rounded-br-none self-end max-w-[80%]">
            <p className="text-sm">{transcript}</p>
          </div>
        )}
        
        {isProcessing && (
          <div className="flex gap-2 p-3 self-start">
            <div className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse"></div>
            <div className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse delay-150"></div>
            <div className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse delay-300"></div>
          </div>
        )}
        
        {response && (
          <div className="bg-primary/10 p-3 rounded-lg rounded-bl-none self-start max-w-[80%]">
            <p className="text-sm">{response}</p>
          </div>
        )}
      </div>
      
      <div className="p-4 border-t">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {isProcessing ? "Processando..." : "Pronto para ouvir comandos"}
          </span>
          <button 
            onClick={onToggle}
            className="p-2 rounded-full bg-primary text-primary-foreground"
          >
            <MicOff className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default VoiceAssistant;
