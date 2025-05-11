
import React, { useState, useEffect } from 'react';
import { Mic, MicOff, X, Send } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input"; 
import { useSupabaseClient } from "@/lib/supabase";

interface VoiceAssistantProps {
  isActive: boolean;
  onToggle: () => void;
  clientInfo?: { id: string; name: string; cnpj: string } | null;
}

export function VoiceAssistant({ isActive, onToggle, clientInfo }: VoiceAssistantProps) {
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState('');
  const [conversations, setConversations] = useState<Array<{type: 'user' | 'bot', text: string}>>([]);
  const supabase = useSupabaseClient();
  
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

  // Função para processar o comando de voz ou texto digitado
  const processCommand = async (command: string) => {
    if (!command.trim()) return;
    
    // Adiciona o comando do usuário ao histórico de conversas
    setConversations(prev => [...prev, {type: 'user', text: command}]);
    setIsProcessing(true);
    setManualInput('');
    
    try {
      // Verificar se temos informações do cliente para personalizar as respostas
      let responseText = '';
      
      // Se temos um clientInfo, podemos tentar buscar dados reais
      if (clientInfo && clientInfo.id) {
        // Em produção, aqui poderíamos usar uma AI real para processar a linguagem natural
        // e determinar a intenção do usuário. Para este exemplo, usaremos palavras-chave
        
        if (command.toLowerCase().includes('obrigações') || command.toLowerCase().includes('fiscal') || command.toLowerCase().includes('impostos')) {
          // Tente buscar dados reais, mas use dados simulados como fallback
          const taxData = await fetchClientData(clientInfo.id, 'taxes') || [
            { name: 'DARF PIS/COFINS', due_date: '25/05/2025', amount: 4271.61 },
            { name: 'DARF IRPJ', due_date: '30/05/2025', amount: 6814.82 },
            { name: 'GFIP', due_date: '20/05/2025', amount: 1728.40 }
          ];
          
          responseText = `${clientInfo.name} possui as seguintes obrigações fiscais para este mês: `;
          taxData.forEach((tax: any, index: number) => {
            responseText += `${tax.name} com vencimento em ${tax.due_date} no valor de R$ ${typeof tax.amount === 'number' ? tax.amount.toFixed(2) : tax.amount}`;
            if (index < taxData.length - 1) responseText += ', ';
          });
        } 
        else if (command.toLowerCase().includes('faturamento') || command.toLowerCase().includes('receita')) {
          // Tente buscar dados financeiros, use simulados como fallback
          const financialData = await fetchClientData(clientInfo.id, 'financial') || {
            revenue: 85432.18,
            previous_revenue: 76279.45,
            period: '04/2025'
          };
          
          const percentChange = ((financialData.revenue - financialData.previous_revenue) / financialData.previous_revenue) * 100;
          
          responseText = `O faturamento de ${clientInfo.name} no mês ${financialData.period} foi de R$ ${financialData.revenue.toFixed(2)}, representando um ${percentChange > 0 ? 'aumento' : 'redução'} de ${Math.abs(percentChange).toFixed(1)}% em relação ao mês anterior.`;
        }
        else if (command.toLowerCase().includes('documentos') || command.toLowerCase().includes('arquivos')) {
          // Busque documentos do cliente ou use simulados
          const documents = await fetchClientData(clientInfo.id, 'documents') || [
            { name: 'Balanço Patrimonial', created_at: '10/05/2025', type: 'contábil' },
            { name: 'DRE', created_at: '10/05/2025', type: 'contábil' },
            { name: 'Notas Fiscais Abril', created_at: '05/05/2025', type: 'fiscal' }
          ];
          
          responseText = `Os documentos recentes de ${clientInfo.name} incluem: `;
          documents.forEach((doc: any, index: number) => {
            responseText += `${doc.name} (${doc.type}) de ${doc.created_at}`;
            if (index < documents.length - 1) responseText += ', ';
          });
        }
        else {
          responseText = `Olá! Sou sua assistente contábil para ${clientInfo.name}. Posso ajudar com informações sobre obrigações fiscais, faturamento, documentos contábeis e muito mais. Como posso te ajudar hoje?`;
        }
      } else {
        // Respostas genéricas quando não temos informações do cliente
        if (command.toLowerCase().includes('obrigações') || command.toLowerCase().includes('fiscal')) {
          responseText = 'A empresa possui as seguintes obrigações fiscais para este mês: DARF PIS/COFINS com vencimento em 25/05, DARF IRPJ com vencimento em 30/05, e GFIP com vencimento em 20/05.';
        } else if (command.toLowerCase().includes('faturamento') || command.toLowerCase().includes('receita')) {
          responseText = 'O faturamento da empresa no último mês foi de R$ 152.789,45, representando um aumento de 12% em relação ao mês anterior.';
        } else if (command.toLowerCase().includes('folha') || command.toLowerCase().includes('pagamento')) {
          responseText = 'A folha de pagamento da empresa para este mês está em R$ 67.890,32. Há 3 admissões pendentes de processamento.';
        } else if (command.toLowerCase().includes('cliente') || command.toLowerCase().includes('empresa')) {
          responseText = 'Você tem 42 clientes ativos no momento. Destes, 5 estão com documentações pendentes e 3 com obrigações fiscais atrasadas.';
        } else {
          responseText = 'Desculpe, não consegui entender completamente sua solicitação. Poderia reformular ou ser mais específico sobre qual informação contábil você precisa?';
        }
      }
      
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
      // Comandos contextuais baseados no cliente
      let simulatedCommands;
      
      if (clientInfo) {
        simulatedCommands = [
          "Quais são minhas obrigações fiscais deste mês?",
          "Qual foi meu faturamento no último trimestre?",
          "Mostre meus documentos contábeis recentes",
          "Qual a situação dos meus impostos?"
        ];
      } else {
        simulatedCommands = [
          "Quais são as obrigações fiscais deste mês?",
          "Qual foi o faturamento do último trimestre?",
          "Mostre a situação da folha de pagamento",
          "Quantos clientes estão com documentação pendente?"
        ];
      }
      
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
