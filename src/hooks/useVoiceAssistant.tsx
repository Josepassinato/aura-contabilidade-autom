
import { useState, useEffect } from 'react';
import { toast } from "@/components/ui/use-toast";
import { useNaturalLanguage } from '@/hooks/useNaturalLanguage';
import { 
  isOpenAIConfigured, 
  getOpenAiConfig, 
  registerTokenUsage 
} from '@/components/settings/openai/openAiService';

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
  
  // Use the hook of natural language processing
  const { processCommand, generateResponse, isProcessing: isNlpProcessing } = useNaturalLanguage();
  
  // Verificar se OpenAI está configurada
  const [openAIConfigured, setOpenAIConfigured] = useState(false);
  const [openAIConfig, setOpenAIConfig] = useState<any>(null);
  
  useEffect(() => {
    const checkConfig = () => {
      const isConfigured = isOpenAIConfigured();
      setOpenAIConfigured(isConfigured);
      
      if (isConfigured) {
        const config = getOpenAiConfig();
        setOpenAIConfig(config);
      }
    };
    
    checkConfig();
    
    // Listener para atualizações na configuração
    window.addEventListener('openai-config-updated', checkConfig);
    
    return () => {
      window.removeEventListener('openai-config-updated', checkConfig);
    };
  }, []);
  
  // Initialize welcome message when activated
  useEffect(() => {
    if (!isActive) {
      return;
    }

    // Display welcome message when assistant is activated
    if (conversations.length === 0) {
      let welcomeMessage = "";
      
      if (!openAIConfigured) {
        welcomeMessage = "O assistente de voz não está configurado. Por favor, configure a API OpenAI nas configurações do sistema.";
      } else {
        welcomeMessage = clientInfo 
          ? `Olá! Sou sua assistente contábil para ${clientInfo.name}. Como posso ajudar você hoje?`
          : 'Olá! Sou seu assistente de voz contábil. Como posso ajudar você hoje?';
      }
      
      setConversations([{
        type: 'bot',
        text: welcomeMessage
      }]);
    }
  }, [isActive, conversations.length, clientInfo, openAIConfigured]);

  // Add a bot response to the conversation
  const addBotResponse = (text: string) => {
    setConversations(prev => [...prev, { type: 'bot', text }]);
  };

  // Function to fetch client data (simplified local version)
  const fetchClientData = async (clientId: string, dataType: string) => {
    // Implementação simplificada que retorna dados simulados
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      switch (dataType) {
        case 'financial':
          return {
            id: clientId,
            total_revenue: 125000.00,
            total_expenses: 78500.00,
            profit_margin: 0.372,
            period: "2023-05"
          };
          
        case 'taxes':
          return [
            { 
              id: 1, 
              client_id: clientId, 
              tax_type: "IRPJ", 
              due_date: "2023-05-30", 
              amount: 4580.25,
              status: "pending"
            },
            { 
              id: 2, 
              client_id: clientId, 
              tax_type: "COFINS", 
              due_date: "2023-05-25", 
              amount: 3250.75,
              status: "pending"
            }
          ];
          
        case 'documents':
          return [
            { 
              id: 1, 
              client_id: clientId, 
              name: "Balancete Abril 2023", 
              created_at: "2023-05-10",
              file_type: "pdf"
            },
            { 
              id: 2, 
              client_id: clientId, 
              name: "DRE Q1 2023", 
              created_at: "2023-04-15",
              file_type: "xlsx"
            }
          ];
          
        default:
          return null;
      }
    } catch (error) {
      console.error("Erro ao buscar dados do cliente:", error);
      return null;
    }
  };

  // Process voice or text command using NLP
  const handleProcessCommand = async (command: string) => {
    if (!command.trim()) return;
    
    // Verificar se OpenAI está configurada
    if (!openAIConfigured) {
      addBotResponse("O assistente de voz não está configurado. Por favor, configure a API OpenAI nas configurações do sistema.");
      return;
    }
    
    // Add user command to conversation history
    setConversations(prev => [...prev, {type: 'user', text: command}]);
    setIsProcessing(true);
    setManualInput('');
    
    try {
      // Use natural language processor to identify intent
      const nlpResult = await processCommand(command);
      console.log('NLP Result:', nlpResult);
      
      // Simular uso de tokens para rastreamento
      // Em uma implementação real, isso viria da resposta da API
      const estimatedTokens = command.length / 3; // Estimativa simples: 1 token a cada 3 caracteres
      registerTokenUsage(estimatedTokens);
      
      // Generate contextual response based on identified intent and client
      const responseText = generateResponse(nlpResult, clientInfo?.name);
      
      // Add bot response to conversation history
      setConversations(prev => [...prev, {type: 'bot', text: responseText}]);
      
      // Notify the user
      toast({
        title: "AI Assistant",
        description: "Nova resposta disponível",
      });
    } catch (error) {
      console.error("Error processing command:", error);
      setConversations(prev => [...prev, {
        type: 'bot', 
        text: 'Desculpe, ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.'
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Start voice recognition simulation
  const startVoiceRecognition = () => {
    if (!openAIConfigured) {
      addBotResponse("O assistente de voz não está configurado. Por favor, configure a API OpenAI nas configurações do sistema.");
      return;
    }
    
    toast({
      title: "Reconhecimento de Voz",
      description: "Ouvindo... Diga o que você precisa.",
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
    addBotResponse,
    openAIConfig
  };
}
