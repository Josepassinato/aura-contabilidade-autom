
import { useState, useEffect } from 'react';
import { toast } from "@/components/ui/use-toast";
import { useVoiceCommandProcessor } from '@/hooks/useVoiceCommandProcessor';
import { useClientDataFetcher } from '@/hooks/useClientDataFetcher';
import { 
  isOpenAIConfigured, 
  getOpenAiConfig
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
  const [manualInput, setManualInput] = useState('');
  const [conversations, setConversations] = useState<Conversation>([]);
  
  // Verificar se OpenAI está configurada
  const [openAIConfigured, setOpenAIConfigured] = useState(false);
  const [openAIConfig, setOpenAIConfig] = useState<any>(null);

  // Use the custom hooks
  const { fetchClientData } = useClientDataFetcher();
  const { 
    transcript, 
    isProcessing, 
    isNlpProcessing,
    handleProcessCommand: processCommand,
    startVoiceRecognition: startRecognition,
    addBotResponse: addResponse
  } = useVoiceCommandProcessor(clientInfo);
  
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

  // Add a bot response to the conversation - Wrapper for the hook function
  const addBotResponse = (text: string) => {
    setConversations(prev => [...prev, { type: 'bot', text }]);
  };

  // Process voice or text command using NLP - Wrapper for the hook function
  const handleProcessCommand = async (command: string) => {
    await processCommand(command, setConversations, setManualInput, openAIConfigured);
  };

  // Start voice recognition simulation - Wrapper for the hook function
  const startVoiceRecognition = () => {
    startRecognition(
      openAIConfigured, 
      addBotResponse,
      handleProcessCommand
    );
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
