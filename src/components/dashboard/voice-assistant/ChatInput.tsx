
import React from 'react';
import { Mic, Send } from "lucide-react";
import { Input } from "@/components/ui/input"; 

type ChatInputProps = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onVoiceRecognition: () => void;
  isProcessing: boolean;
};

export function ChatInput({ 
  value, 
  onChange, 
  onSubmit, 
  onVoiceRecognition, 
  isProcessing 
}: ChatInputProps) {
  return (
    <form onSubmit={onSubmit} className="flex items-center gap-2">
      <Input
        type="text"
        placeholder="Type or use voice command..."
        value={value}
        onChange={onChange}
        className="flex-1"
      />
      <button 
        type="button"
        onClick={onVoiceRecognition}
        className="p-2 rounded-full bg-primary text-primary-foreground"
        title="Activate voice recognition"
        disabled={isProcessing}
      >
        <Mic className="h-4 w-4" />
      </button>
      <button 
        type="submit"
        className="p-2 rounded-full bg-primary text-primary-foreground"
        disabled={!value.trim() || isProcessing}
        title="Send message"
      >
        <Send className="h-4 w-4" />
      </button>
    </form>
  );
}
