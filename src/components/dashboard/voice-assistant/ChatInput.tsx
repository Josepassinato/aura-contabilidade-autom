
import React from 'react';
import { Mic, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChatInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onVoiceRecognition: () => void;
  isProcessing: boolean;
  disabled?: boolean; // Added the disabled prop
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  onVoiceRecognition,
  isProcessing,
  disabled
}: ChatInputProps) {
  return (
    <form onSubmit={onSubmit} className="flex items-center gap-2">
      <Input
        value={value}
        onChange={onChange}
        placeholder="Digite sua mensagem..."
        disabled={isProcessing || disabled}
        className="flex-1"
      />
      <Button
        type="button"
        size="icon"
        variant="ghost"
        onClick={onVoiceRecognition}
        disabled={isProcessing || disabled}
        className={isProcessing ? "animate-pulse bg-primary/10" : ""}
      >
        <Mic className="h-4 w-4" />
      </Button>
      <Button
        type="submit"
        size="icon"
        disabled={!value.trim() || isProcessing || disabled}
      >
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
}
