
import React from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Send } from "lucide-react";
import { AccountingClient } from "@/lib/supabase";
import { InviteFormFields } from "./InviteFormFields";
import { InviteLinkDisplay } from "./InviteLinkDisplay";

interface InviteDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  client: AccountingClient;
  isGenerating: boolean;
  inviteLink: string | null;
  onGenerateInvite: () => void;
  onClose: () => void;
}

export function InviteDialog({
  isOpen,
  onOpenChange,
  client,
  isGenerating,
  inviteLink,
  onGenerateInvite,
  onClose,
}: InviteDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Convidar Cliente</DialogTitle>
          <DialogDescription>
            Gere um convite para {client.name} acessar o painel do cliente
          </DialogDescription>
        </DialogHeader>
        
        <InviteFormFields client={client} />
        
        {inviteLink && <InviteLinkDisplay inviteLink={inviteLink} />}
        
        <DialogFooter>
          {inviteLink ? (
            <Button onClick={onClose}>Fechar</Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button onClick={onGenerateInvite} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <Send className="mr-2 h-4 w-4 animate-pulse" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Gerar Convite
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
