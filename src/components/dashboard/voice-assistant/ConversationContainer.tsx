
import React from "react";
import { ChatMessage } from "./ChatMessage";
import { TypingIndicator } from "./TypingIndicator";

interface Message {
  type: 'user' | 'bot';
  text: string;
}

interface ConversationContainerProps {
  messages: Message[];
  isProcessing: boolean;
  transcript?: string;
}

export function ConversationContainer({ 
  messages, 
  isProcessing,
  transcript 
}: ConversationContainerProps) {
  return (
    <div className="flex flex-col h-full overflow-y-auto p-4">
      {messages.map((message, index) => (
        <ChatMessage key={index} type={message.type} text={message.text} />
      ))}
      
      {isProcessing && (
        <TypingIndicator />
      )}
      
      {transcript && (
        <div className="py-2 px-4 bg-muted/30 text-muted-foreground rounded-lg self-end mt-2 animate-pulse">
          <p className="text-sm">{transcript}</p>
        </div>
      )}
      
      <div className="mt-auto" /> {/* Espaço para garantir que mensagens sempre fiquem no topo */}
    </div>
  );
}
