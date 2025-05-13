
import { useState } from 'react';
import { toast } from "@/hooks/use-toast";
import { useNaturalLanguage } from '@/hooks/useNaturalLanguage';
import { 
  isOpenAIConfigured, 
  registerTokenUsage 
} from '@/components/settings/openai/openAiService';

type ClientInfo = {
  id: string;
  name: string;
  cnpj: string;
} | null;

type MessageType = 'user' | 'bot';
type Conversation = Array<{type: MessageType, text: string}>;

export function useVoiceCommandProcessor(clientInfo?: ClientInfo) {
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Use the hook of natural language processing
  const { processCommand, generateResponse, isProcessing: isNlpProcessing } = useNaturalLanguage();
  
  // Add a bot response to the conversation
  const addBotResponse = (text: string, setConversations: React.Dispatch<React.SetStateAction<Conversation>>) => {
    setConversations(prev => [...prev, { type: 'bot', text }]);
  };

  // Process voice or text command using NLP
  const handleProcessCommand = async (
    command: string, 
    setConversations: React.Dispatch<React.SetStateAction<Conversation>>,
    setManualInput: React.Dispatch<React.SetStateAction<string>>,
    openAIConfigured: boolean
  ) => {
    if (!command.trim()) return;
    
    // Verificar se OpenAI está configurada
    if (!openAIConfigured) {
      addBotResponse("O assistente de voz não está configurado. Por favor, configure a API OpenAI nas configurações do sistema.", setConversations);
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
  const startVoiceRecognition = (
    openAIConfigured: boolean,
    addBotResponse: (text: string) => void,
    handleProcessCommand: (command: string) => void
  ) => {
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
    setTranscript,
    isProcessing,
    isNlpProcessing,
    handleProcessCommand,
    startVoiceRecognition,
    addBotResponse
  };
}
