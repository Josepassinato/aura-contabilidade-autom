
import React from 'react';
import { AssistantHeader } from './AssistantHeader';
import { ConfigWarning } from './ConfigWarning';
import { ConversationContainer } from './ConversationContainer';
import { ReportSection } from './ReportSection';
import { ChatInput } from './ChatInput';

interface VoiceAssistantContainerProps {
  isActive: boolean;
  onToggle: () => void;
  isAdmin: boolean;
  openAIConfigured: boolean;
  config: any;
  clientInfo?: { id: string; name: string; cnpj: string } | null;
  isProcessing: boolean;
  isNlpProcessing: boolean;
  reportGenerating: boolean;
  transcript: string;
  conversations: Array<{type: 'user' | 'bot', text: string}>;
  generatedReport: {
    title: string;
    url: string;
    type: string;
    id: string;
  } | null;
  manualInput: string;
  setManualInput: (value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  startVoiceRecognition: () => void;
}

export function VoiceAssistantContainer({
  isActive,
  onToggle,
  isAdmin,
  openAIConfigured,
  config,
  clientInfo,
  isProcessing,
  isNlpProcessing,
  reportGenerating,
  transcript,
  conversations,
  generatedReport,
  manualInput,
  setManualInput,
  handleSubmit,
  startVoiceRecognition
}: VoiceAssistantContainerProps) {
  if (!isActive) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-background rounded-lg border shadow-lg">
      <AssistantHeader
        isProcessing={isProcessing}
        isNlpProcessing={isNlpProcessing}
        reportGenerating={reportGenerating}
        config={config}
        clientInfo={clientInfo}
        onToggle={onToggle}
        openAIConfigured={openAIConfigured}
        isAdmin={isAdmin}
      />
      
      <ConfigWarning 
        openAIConfigured={openAIConfigured} 
        isAdmin={isAdmin} 
      />
      
      <ConversationContainer 
        messages={conversations}
        isProcessing={isProcessing || reportGenerating}
        transcript={transcript}
      />
      
      <ReportSection generatedReport={generatedReport} />
      
      <div className="p-4 border-t">
        <ChatInput
          value={manualInput}
          onChange={(e) => setManualInput(e.target.value)}
          onSubmit={handleSubmit}
          onVoiceRecognition={startVoiceRecognition}
          isProcessing={isProcessing || reportGenerating}
          disabled={!openAIConfigured}
        />
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-muted-foreground">
            {!openAIConfigured ? "Assistente não configurado" :
              isProcessing ? "Processando..." : 
              reportGenerating ? "Gerando relatório..." : 
              "Pronto para ouvir"}
          </span>
          <span className="text-xs text-muted-foreground">Powered by Advanced AI</span>
        </div>
      </div>
    </div>
  );
}
