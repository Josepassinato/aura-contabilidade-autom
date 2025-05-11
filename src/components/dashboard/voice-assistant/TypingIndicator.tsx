
import React from 'react';

export function TypingIndicator() {
  return (
    <div className="flex gap-3 my-2 justify-start">
      <div className="bg-primary/10 p-2 rounded-full h-8 w-8 flex items-center justify-center">
        <svg className="h-4 w-4 text-primary" viewBox="0 0 24 24">
          <path fill="currentColor" d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z" />
        </svg>
      </div>
      <div className="p-3 rounded-lg max-w-[80%] bg-muted text-foreground">
        <div className="flex space-x-1">
          <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce"></div>
        </div>
      </div>
    </div>
  );
}
