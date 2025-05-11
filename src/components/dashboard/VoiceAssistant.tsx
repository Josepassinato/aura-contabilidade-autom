
import React from 'react';
import { X } from "lucide-react";
import { useVoiceAssistant } from '@/hooks/useVoiceAssistant';
import { ConversationContainer } from './voice-assistant/ConversationContainer';
import { ChatInput } from './voice-assistant/ChatInput';

interface VoiceAssistantProps {
  isActive: boolean;
  onToggle: () => void;
  clientInfo?: { id: string; name: string; cnpj: string } | null;
}

export function VoiceAssistant({ isActive, onToggle, clientInfo }: VoiceAssistantProps) {
  const {
    transcript,
    isProcessing,
    isNlpProcessing,
    conversations,
    manualInput,
    setManualInput,
    handleProcessCommand,
    startVoiceRecognition
  } = useVoiceAssistant(isActive, clientInfo);
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleProcessCommand(manualInput);
  };

  if (!isActive) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-background rounded-lg border shadow-lg">
      <div className="p-4 flex justify-between items-center border-b">
        <div className="flex items-center gap-2">
          {isProcessing || isNlpProcessing ? (
            <div className="h-5 w-5 rounded-full bg-primary animate-pulse"></div>
          ) : (
            <div className="h-5 w-5 text-primary">🎙️</div>
          )}
          <span className="font-medium">
            {clientInfo ? `${clientInfo.name} Assistant` : "Voice Assistant"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onToggle} className="p-1 rounded-full hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <ConversationContainer 
        messages={conversations}
        isProcessing={isProcessing}
        transcript={transcript}
      />
      
      <div className="p-4 border-t">
        <ChatInput
          value={manualInput}
          onChange={(e) => setManualInput(e.target.value)}
          onSubmit={handleSubmit}
          onVoiceRecognition={startVoiceRecognition}
          isProcessing={isProcessing}
        />
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-muted-foreground">
            {isProcessing ? "Processing..." : "Ready to listen"}
          </span>
          <span className="text-xs text-muted-foreground">Powered by Advanced AI</span>
        </div>
      </div>
    </div>
  );
}

export default VoiceAssistant;
