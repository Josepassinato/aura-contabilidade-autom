
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useNaturalLanguage, NLPResult } from '@/hooks/useNaturalLanguage';
import { 
  isOpenAIConfigured, 
  registerTokenUsage 
} from '@/components/settings/openai/supabaseOpenAiService';

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
  const [isListening, setIsListening] = useState(false);
  const { toast } = useToast();
  
  // Use the hook of natural language processing
  const { processCommand, generateResponse, isProcessing: isNlpProcessing } = useNaturalLanguage();
  
  // Add a bot response to the conversation
  const addBotResponse = (text: string, setConversations: React.Dispatch<React.SetStateAction<Conversation>>) => {
    setConversations(prev => [...prev, { type: 'bot', text }]);
  };

  // Real voice recognition using browser API
  const startRealVoiceRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: "Não suportado",
        description: "Reconhecimento de voz não é suportado neste navegador.",
        variant: "destructive"
      });
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'pt-BR';
    
    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('Ouvindo...');
      toast({
        title: "Reconhecimento de Voz",
        description: "Ouvindo... Fale agora.",
      });
    };
    
    recognition.onresult = (event: any) => {
      const result = event.results[0][0].transcript;
      setTranscript(result);
      console.log('Reconhecimento de voz resultado:', result);
      
      // Process the recognized speech
      setTimeout(() => {
        setIsListening(false);
        return result;
      }, 500);
    };
    
    recognition.onerror = (event: any) => {
      setIsListening(false);
      setTranscript('');
      console.error('Erro no reconhecimento de voz:', event.error);
      toast({
        title: "Erro no reconhecimento",
        description: "Não foi possível reconhecer sua voz. Tente novamente.",
        variant: "destructive"
      });
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    return recognition;
  };

  // Process voice or text command using NLP with access to client-specific data
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
      console.log('Processando comando com NLP:', command);
      
      // Use natural language processor to identify intent
      const nlpResult = await processCommand(command);
      console.log('NLP Result:', nlpResult);
      
      // Simular uso de tokens para rastreamento
      // Em uma implementação real, isso viria da resposta da API
      const estimatedTokens = command.length / 3; // Estimativa simples: 1 token a cada 3 caracteres
      registerTokenUsage(estimatedTokens);
      
      // Generate contextual response based on identified intent and client
      const clientContext = clientInfo ? {
        clientId: clientInfo.id,
        clientName: clientInfo.name,
        clientCNPJ: clientInfo.cnpj
      } : undefined;
      
      const responseText = await generateResponse(nlpResult, clientContext);
      
      // Add bot response to conversation history
      setConversations(prev => [...prev, {type: 'bot', text: responseText}]);
      
      console.log('Resposta gerada:', responseText);
      
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

  // Start voice recognition - real implementation
  const startVoiceRecognition = (
    openAIConfigured: boolean,
    addBotResponse: (text: string) => void,
    handleProcessCommand: (command: string) => void
  ) => {
    if (!openAIConfigured) {
      addBotResponse("O assistente de voz não está configurado. Por favor, configure a API OpenAI nas configurações do sistema.");
      return;
    }
    
    const recognition = startRealVoiceRecognition();
    if (!recognition) return;
    
    recognition.onresult = (event: any) => {
      const recognizedText = event.results[0][0].transcript;
      setTranscript(recognizedText);
      console.log('Texto reconhecido:', recognizedText);
      
      // Process the recognized command
      setTimeout(() => {
        handleProcessCommand(recognizedText);
        setTranscript('');
      }, 1000);
    };
    
    recognition.start();
  };

  return {
    transcript,
    setTranscript,
    isProcessing,
    isNlpProcessing,
    isListening,
    handleProcessCommand,
    startVoiceRecognition,
    addBotResponse
  };
}
