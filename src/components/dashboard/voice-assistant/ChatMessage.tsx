
import React from "react";
import { User, Bot } from "lucide-react";

interface ChatMessageProps {
  type: 'user' | 'bot';
  text: string;
}

export function ChatMessage({ type, text }: ChatMessageProps) {
  return (
    <div 
      className={`flex gap-3 my-2 ${type === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      {type === 'bot' && (
        <div className="bg-primary/10 p-2 rounded-full h-8 w-8 flex items-center justify-center">
          <Bot className="h-4 w-4 text-primary" />
        </div>
      )}
      
      <div 
        className={`p-3 rounded-lg max-w-[80%] ${
          type === 'user' ? 
          'bg-primary text-primary-foreground' : 
          'bg-muted text-foreground'
        }`}
      >
        <p className="text-sm">{text}</p>
      </div>
      
      {type === 'user' && (
        <div className="bg-primary p-2 rounded-full h-8 w-8 flex items-center justify-center">
          <User className="h-4 w-4 text-primary-foreground" />
        </div>
      )}
    </div>
  );
}
