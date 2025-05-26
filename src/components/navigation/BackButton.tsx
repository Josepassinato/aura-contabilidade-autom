
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
    navigate(-1); // Navigate to the previous page in history
  };

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={goBack}
      className={`flex items-center gap-2 h-10 sm:h-9 text-sm sm:text-sm px-3 sm:px-3 ${className}`}
      title="Voltar à página anterior"
    >
      <ArrowLeft className="h-4 w-4 sm:h-4 sm:w-4" />
      <span>Voltar</span>
    </Button>
  );
};
