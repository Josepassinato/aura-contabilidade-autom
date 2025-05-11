
import { useState, useEffect } from 'react';
import { toast } from "@/components/ui/use-toast";
import { useNaturalLanguage } from '@/hooks/useNaturalLanguage';
import { useSupabaseClient } from "@/lib/supabase";

type ClientInfo = {
  id: string;
  name: string;
  cnpj: string;
} | null;

type MessageType = 'user' | 'bot';
type Conversation = Array<{type: MessageType, text: string}>;

export function useVoiceAssistant(
  isActive: boolean,
  clientInfo?: ClientInfo
) {
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [conversations, setConversations] = useState<Conversation>([]);
  const supabase = useSupabaseClient();
  
  // Use the hook of natural language processing
  const { processCommand, generateResponse, isProcessing: isNlpProcessing } = useNaturalLanguage();
  
  // Initialize welcome message when activated
  useEffect(() => {
    if (!isActive) {
      return;
    }

    // Display welcome message when assistant is activated
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

  // Add a bot response to the conversation
  const addBotResponse = (text: string) => {
    setConversations(prev => [...prev, { type: 'bot', text }]);
  };

  // Function to fetch client data
  const fetchClientData = async (clientId: string, dataType: string) => {
    if (!supabase) return null;
    
    try {
      switch (dataType) {
        case 'financial':
          // Fetch summary financial data
          const { data: financialData } = await supabase
            .from('client_financial_data')
            .select('*')
            .eq('client_id', clientId)
            .order('period', { ascending: false })
            .limit(1)
            .single();
          return financialData;
          
        case 'taxes':
          // Fetch tax obligations
          const { data: taxData } = await supabase
            .from('tax_obligations')
            .select('*')
            .eq('client_id', clientId)
            .order('due_date', { ascending: true });
          return taxData;
          
        case 'documents':
          // Fetch documents
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
      console.error("Error fetching client data:", error);
      return null;
    }
  };

  // Process voice or text command using NLP
  const handleProcessCommand = async (command: string) => {
    if (!command.trim()) return;
    
    // Add user command to conversation history
    setConversations(prev => [...prev, {type: 'user', text: command}]);
    setIsProcessing(true);
    setManualInput('');
    
    try {
      // Use natural language processor to identify intent
      const nlpResult = await processCommand(command);
      console.log('NLP Result:', nlpResult);
      
      // Generate contextual response based on identified intent and client
      const responseText = generateResponse(nlpResult, clientInfo?.name);
      
      // Add bot response to conversation history
      setConversations(prev => [...prev, {type: 'bot', text: responseText}]);
      
      // Notify the user
      toast({
        title: "AI Assistant",
        description: "New response available",
      });
    } catch (error) {
      console.error("Error processing command:", error);
      setConversations(prev => [...prev, {
        type: 'bot', 
        text: 'Sorry, an error occurred while processing your request. Please try again.'
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Start voice recognition simulation
  const startVoiceRecognition = () => {
    toast({
      title: "Voice Recognition",
      description: "Listening... Tell me what you need.",
    });
    
    // Simulate recognition after 3 seconds
    setTimeout(() => {
      // Contextual commands based on client
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
      
      // Choose a random command
      const randomCommand = simulatedCommands[Math.floor(Math.random() * simulatedCommands.length)];
      setTranscript(randomCommand);
      handleProcessCommand(randomCommand);
    }, 3000);
  };

  return {
    transcript,
    isProcessing,
    isNlpProcessing,
    conversations,
    manualInput,
    setManualInput,
    handleProcessCommand,
    startVoiceRecognition,
    addBotResponse
  };
}
