
import React from 'react';
import { Mic } from "lucide-react";

interface VoiceAssistantButtonProps {
  isActive: boolean;
  onClick: () => void;
}

export function VoiceAssistantButton({ isActive, onClick }: VoiceAssistantButtonProps) {
  return (
    <button 
      onClick={onClick}
      className={`p-2 rounded-full ${isActive ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}
    >
      <Mic className="h-5 w-5" />
    </button>
  );
}

export default VoiceAssistantButton;
