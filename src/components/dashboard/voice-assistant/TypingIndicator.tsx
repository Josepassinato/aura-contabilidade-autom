
import React from 'react';

export function TypingIndicator() {
  return (
    <div className="flex gap-2 p-3 self-start">
      <div className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse"></div>
      <div className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse delay-150"></div>
      <div className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse delay-300"></div>
    </div>
  );
}
