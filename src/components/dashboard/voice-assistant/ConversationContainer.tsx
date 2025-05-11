
import React from 'react';
import { ChatMessage } from './ChatMessage';
import { TypingIndicator } from './TypingIndicator';

type Message = {
  type: 'user' | 'bot';
  text: string;
};

type ConversationContainerProps = {
  messages: Message[];
  isProcessing: boolean;
  transcript?: string;
};

export function ConversationContainer({ 
  messages, 
  isProcessing, 
  transcript 
}: ConversationContainerProps) {
  return (
    <div className="p-4 h-64 overflow-y-auto flex flex-col gap-4">
      {messages.map((message, index) => (
        <ChatMessage key={index} type={message.type} text={message.text} />
      ))}
      
      {isProcessing && <TypingIndicator />}
      
      {transcript && (
        <div className="bg-muted p-3 rounded-lg rounded-br-none self-end max-w-[80%]">
          <p className="text-sm">{transcript}</p>
        </div>
      )}
    </div>
  );
}
