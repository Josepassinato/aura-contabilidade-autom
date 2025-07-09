import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Trash2, AlertTriangle, CheckCircle, Info, X } from 'lucide-react';
import { ButtonLoading } from './feedback';

interface ConfirmationDialogProps {
  trigger: React.ReactNode;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'destructive' | 'default';
  onConfirm: () => void | Promise<void>;
  isLoading?: boolean;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  trigger,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'default',
  onConfirm,
  isLoading = false
}) => {
  const handleConfirm = async () => {
    await onConfirm();
  };

  const getIcon = () => {
    if (variant === 'destructive') {
      return <AlertTriangle className="h-6 w-6 text-red-600" />;
    }
    return <Info className="h-6 w-6 text-blue-600" />;
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {trigger}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            {getIcon()}
            <AlertDialogTitle>{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="mt-2">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className={variant === 'destructive' ? 'bg-red-600 hover:bg-red-700' : ''}
          >
            <ButtonLoading isLoading={isLoading}>
              {confirmText}
            </ButtonLoading>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

// Componentes de confirmação pré-configurados
interface DeleteConfirmationProps {
  trigger: React.ReactNode;
  itemName: string;
  onConfirm: () => void | Promise<void>;
  isLoading?: boolean;
}

export const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({
  trigger,
  itemName,
  onConfirm,
  isLoading
}) => {
  return (
    <ConfirmationDialog
      trigger={trigger}
      title={`Excluir ${itemName}`}
      description={`Tem certeza que deseja excluir "${itemName}"? Esta ação não pode ser desfeita.`}
      confirmText="Sim, excluir"
      cancelText="Cancelar"
      variant="destructive"
      onConfirm={onConfirm}
      isLoading={isLoading}
    />
  );
};

interface SaveConfirmationProps {
  trigger: React.ReactNode;
  onConfirm: () => void | Promise<void>;
  isLoading?: boolean;
  hasChanges?: boolean;
}

export const SaveConfirmation: React.FC<SaveConfirmationProps> = ({
  trigger,
  onConfirm,
  isLoading,
  hasChanges = true
}) => {
  if (!hasChanges) {
    return <>{trigger}</>;
  }

  return (
    <ConfirmationDialog
      trigger={trigger}
      title="Salvar alterações"
      description="Deseja salvar as alterações realizadas?"
      confirmText="Sim, salvar"
      cancelText="Cancelar"
      onConfirm={onConfirm}
      isLoading={isLoading}
    />
  );
};