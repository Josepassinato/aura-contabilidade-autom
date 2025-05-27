
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { Mail, Send, Copy, Check } from "lucide-react";
import { AccountingClient } from "@/lib/supabase";

interface ClientInviteFormProps {
  client: AccountingClient;
  onInviteSent?: () => void;
}

export function ClientInviteForm({ client, onInviteSent }: ClientInviteFormProps) {
  const { toast } = useToast();
  const { userProfile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generateClientInvite = async () => {
    if (!userProfile) return;

    setIsGenerating(true);
    try {
      // Verificar se já existe um convite pendente para este cliente
      const { data: existingInvite } = await supabase
        .from('user_invitations')
        .select('token')
        .eq('email', client.email)
        .eq('status', 'pending')
        .single();

      let token;
      if (existingInvite) {
        token = existingInvite.token;
        toast({
          title: "Convite existente",
          description: "Já existe um convite pendente para este cliente. Link atualizado.",
        });
      } else {
        // Gerar novo token
        token = crypto.randomUUID();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30); // Expira em 30 dias

        // Criar convite para o cliente
        const { error } = await supabase
          .from('user_invitations')
          .insert({
            email: client.email,
            role: 'client',
            token,
            expires_at: expiresAt.toISOString(),
            invited_by: userProfile.id,
            invited_by_name: userProfile.full_name,
          });

        if (error) throw error;

        toast({
          title: "Convite gerado!",
          description: `Convite para ${client.name} foi criado com sucesso`,
        });
      }

      // Gerar link do convite
      const link = `${window.location.origin}/invite-signup?token=${token}`;
      setInviteLink(link);

      if (onInviteSent) {
        onInviteSent();
      }
    } catch (error: any) {
      console.error('Erro ao gerar convite:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível gerar o convite",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyInviteLink = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast({
        title: "Link copiado!",
        description: "Link do convite foi copiado para a área de transferência",
      });
      
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
  };

  const closeAndReset = () => {
    setIsOpen(false);
    setTimeout(() => {
      setInviteLink(null);
      setCopied(false);
    }, 300);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Mail className="mr-2 h-4 w-4" />
          Enviar Convite
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Convidar Cliente</DialogTitle>
          <DialogDescription>
            Gere um convite para {client.name} acessar o painel do cliente
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Empresa</Label>
            <Input value={client.name} readOnly className="bg-gray-50" />
          </div>
          
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={client.email} readOnly className="bg-gray-50" />
          </div>
          
          {inviteLink && (
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
          )}
        </div>
        
        <DialogFooter>
          {inviteLink ? (
            <Button onClick={closeAndReset}>Fechar</Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={generateClientInvite} disabled={isGenerating}>
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
