
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Copy, Check } from "lucide-react";

interface InviteLinkDisplayProps {
  inviteLink: string;
}

export function InviteLinkDisplay({ inviteLink }: InviteLinkDisplayProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    toast({
      title: "Link copiado!",
      description: "Link do convite foi copiado para a área de transferência",
    });
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="invite-link">Link do Convite</Label>
      <div className="flex items-center space-x-2">
        <Input
          id="invite-link"
          value={inviteLink}
          readOnly
          className="font-mono text-sm"
        />
        <Button variant="outline" size="icon" onClick={copyInviteLink}>
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        Envie este link para o cliente criar sua conta e acessar o painel.
      </p>
    </div>
  );
}
