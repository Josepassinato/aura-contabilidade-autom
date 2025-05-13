
// Importing React is necessary for ErrorBoundary component
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';

// ErrorBoundary component to catch errors in React components
export class ErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
    toast({
      title: "Um erro ocorreu",
      description: "Ocorreu um erro no aplicativo. Por favor, tente novamente.",
      variant: "destructive"
    });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div>Algo deu errado. Por favor, tente novamente.</div>;
    }

    return this.props.children;
  }
}
