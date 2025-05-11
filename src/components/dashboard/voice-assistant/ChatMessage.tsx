
import React from 'react';

type MessageProps = {
  type: 'user' | 'bot';
  text: string;
};

export function ChatMessage({ type, text }: MessageProps) {
  return (
    <div 
      className={`p-3 rounded-lg max-w-[80%] ${
        type === 'user' 
          ? 'bg-muted self-end rounded-br-none' 
          : 'bg-primary/10 self-start rounded-bl-none'
      }`}
    >
      <p className="text-sm">{text}</p>
    </div>
  );
}
