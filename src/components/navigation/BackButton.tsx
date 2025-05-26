
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  className?: string;
}

export const BackButton = ({ className = '' }: BackButtonProps) => {
  const navigate = useNavigate();

  const goBack = () => {
    navigate(-1);
  };

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={goBack}
      className={`flex items-center gap-2 h-16 text-2xl px-4 ${className}`}
      title="Voltar à página anterior"
    >
      <ArrowLeft className="h-8 w-8" />
      <span>Voltar</span>
    </Button>
  );
};
