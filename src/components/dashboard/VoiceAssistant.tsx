
import React, { useEffect, useState } from 'react';
import { useVoiceAssistant } from '@/hooks/useVoiceAssistant';
import { useAuth } from '@/contexts/auth';
import { isOpenAIConfigured } from '@/components/settings/openai/openAiService';
import { useReportGeneration } from './voice-assistant/useReportGeneration';
import { useCommandProcessor } from './voice-assistant/useCommandProcessor';
import { VoiceAssistantContainer } from './voice-assistant/VoiceAssistantContainer';

interface VoiceAssistantProps {
  isActive: boolean;
  onToggle: () => void;
  clientInfo?: { id: string; name: string; cnpj: string } | null;
}

export function VoiceAssistant({ isActive, onToggle, clientInfo }: VoiceAssistantProps) {
  const { isAdmin } = useAuth();
  const [config, setConfig] = useState<any>(null);
  const [openAIConfigured, setOpenAIConfigured] = useState(false);

  const {
    transcript,
    isProcessing,
    isNlpProcessing,
    conversations,
    handleProcessCommand,
    startVoiceRecognition,
    addBotResponse
  } = useVoiceAssistant(isActive, clientInfo);

  const {
    reportGenerating,
    generatedReport,
    handleReportRequest
  } = useReportGeneration({ addBotResponse, config });

  const {
    manualInput,
    setManualInput,
    processWithReportDetection
  } = useCommandProcessor({
    handleProcessCommand,
    addBotResponse,
    handleReportRequest,
    isAdmin,
    openAIConfigured,
    config
  });

  useEffect(() => {
    // Carregar configuração do assistente
    const savedConfig = localStorage.getItem("voice-assistant-config");
    if (savedConfig) {
      try {
        setConfig(JSON.parse(savedConfig));
      } catch (error) {
        console.error("Erro ao carregar configuração do assistente:", error);
      }
    }

    // Verificar se OpenAI está configurada
    setOpenAIConfigured(isOpenAIConfigured());
    
    // Ouvir por mudanças na configuração da OpenAI
    const handleConfigUpdate = () => {
      setOpenAIConfigured(isOpenAIConfigured());
    };
    
    window.addEventListener('openai-config-updated', handleConfigUpdate);
    
    return () => {
      window.removeEventListener('openai-config-updated', handleConfigUpdate);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processWithReportDetection(manualInput);
    setManualInput('');
  };

  return (
    <VoiceAssistantContainer
      isActive={isActive}
      onToggle={onToggle}
      isAdmin={isAdmin}
      openAIConfigured={openAIConfigured}
      config={config}
      clientInfo={clientInfo}
      isProcessing={isProcessing}
      isNlpProcessing={isNlpProcessing}
      reportGenerating={reportGenerating}
      transcript={transcript}
      conversations={conversations}
      generatedReport={generatedReport}
      manualInput={manualInput}
      setManualInput={setManualInput}
      handleSubmit={handleSubmit}
      startVoiceRecognition={startVoiceRecognition}
    />
  );
}

export default VoiceAssistant;
