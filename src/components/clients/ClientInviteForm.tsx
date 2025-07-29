
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { DialogTrigger } from "@/components/ui/dialog";
import { Mail } from "lucide-react";
import { AccountingClient } from "@/lib/supabase";
import { useClientInvite } from "./hooks/useClientInvite";
import { InviteDialog } from "./components/InviteDialog";

interface ClientInviteFormProps {
  client: AccountingClient;
  onInviteSent?: () => void;
}

export function ClientInviteForm({ client, onInviteSent }: ClientInviteFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { isGenerating, inviteLink, generateClientInvite, resetInvite } = useClientInvite();

  const handleGenerateInvite = async () => {
    console.log('Calling onInviteSent callback');
    try {
      await generateClientInvite(client.email);
      if (onInviteSent) {
        onInviteSent();
      }
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const closeAndReset = () => {
    setIsOpen(false);
    setTimeout(() => {
      resetInvite();
    }, 300);
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
        <Mail className="mr-2 h-4 w-4" />
        Enviar Convite
      </Button>
      
      <InviteDialog
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        client={client}
        isGenerating={isGenerating}
        inviteLink={inviteLink}
        onGenerateInvite={handleGenerateInvite}
        onClose={closeAndReset}
      />
    </>
  );
}
