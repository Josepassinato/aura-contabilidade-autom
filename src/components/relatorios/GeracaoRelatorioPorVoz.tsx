
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, PlusCircle, FileText, FilePlus2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { ConversationContainer } from "@/components/dashboard/voice-assistant/ConversationContainer";
import { ChatInput } from "@/components/dashboard/voice-assistant/ChatInput";

type Message = {
  type: 'user' | 'bot';
  text: string;
};

interface GeracaoRelatorioPorVozProps {
  clientId?: string;
  clientName?: string;
}

export function GeracaoRelatorioPorVoz({ clientId, clientName }: GeracaoRelatorioPorVozProps) {
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { 
      type: 'bot', 
      text: `Olá${clientName ? `, ${clientName}` : ''}! Como posso ajudar você hoje? Você pode solicitar relatórios contábeis ou fiscais com comandos como "Gere um relatório de faturamento do mês passado" ou "Preciso do DRE do último trimestre".` 
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  
  const suggestions = [
    "Gerar relatório de faturamento do último mês",
    "Envie-me o demonstrativo de resultados do último trimestre",
    "Preciso do balanço patrimonial atualizado",
    "Mostre os impostos pendentes para este mês"
  ];
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    
    processMessage(inputText);
    setInputText('');
  };
  
  const handleVoiceRecognition = () => {
    setIsListening(true);
    setTranscript("Ouvindo...");
    
    // Simular reconhecimento de voz após 2 segundos
    setTimeout(() => {
      const mockCommand = "Gerar relatório de faturamento do último mês";
      setTranscript(mockCommand);
      
      // Processar comando após mais 1 segundo
      setTimeout(() => {
        setIsListening(false);
        setTranscript("");
        processMessage(mockCommand);
      }, 1000);
    }, 2000);
  };
  
  const processMessage = (text: string) => {
    // Adicionar mensagem do usuário
    setMessages(prev => [...prev, { type: 'user', text }]);
    setShowSuggestions(false);
    setIsProcessing(true);
    
    // Simular processamento
    setTimeout(() => {
      const isReportRequest = text.toLowerCase().includes('relatório') ||
                             text.toLowerCase().includes('demonstrativo') ||
                             text.toLowerCase().includes('balanço') ||
                             text.toLowerCase().includes('dre') ||
                             text.toLowerCase().includes('imposto');
      
      if (isReportRequest) {
        setMessages(prev => [...prev, { 
          type: 'bot', 
          text: `Gerando o relatório solicitado. Preparei um ${text.includes('faturamento') ? 'relatório de faturamento' : 'demonstrativo contábil'} com base nos dados mais recentes. Deseja recebê-lo por e-mail também?` 
        }]);
        
        // Simular geração do relatório
        toast({
          title: "Relatório gerado",
          description: `O relatório foi gerado com sucesso e está disponível para download.`,
        });
      } else {
        setMessages(prev => [...prev, { 
          type: 'bot', 
          text: "Desculpe, não entendi sua solicitação. Você pode pedir relatórios contábeis ou fiscais específicos." 
        }]);
      }
      
      setIsProcessing(false);
    }, 2000);
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    processMessage(suggestion);
  };
  
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <CardTitle>Solicitar Relatórios por Voz</CardTitle>
        </div>
        <CardDescription>
          Solicite relatórios utilizando linguagem natural ou comandos de voz
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col h-[400px]">
        <div className="flex-1 overflow-hidden mb-4 border rounded-lg">
          <ConversationContainer 
            messages={messages}
            isProcessing={isProcessing}
            transcript={isListening ? transcript : undefined}
          />
        </div>
        
        {showSuggestions && (
          <div className="mb-4">
            <p className="text-xs text-muted-foreground mb-2">Sugestões:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <Button 
                  key={index} 
                  variant="outline" 
                  size="sm" 
                  className="text-xs"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <PlusCircle className="h-3 w-3 mr-1" />
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        )}
        
        <ChatInput 
          value={inputText} 
          onChange={handleInputChange} 
          onSubmit={handleSubmit} 
          onVoiceRecognition={handleVoiceRecognition} 
          isProcessing={isProcessing || isListening}
        />
      </CardContent>
      <CardFooter className="justify-center border-t pt-4">
        <div className="text-center text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-2">
            <FilePlus2 className="h-4 w-4" />
            <span>Os relatórios gerados serão enviados para o e-mail cadastrado</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
