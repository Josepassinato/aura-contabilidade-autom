
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateToken } from "@/services/supabase/clientAccessService";
import { useToast } from "@/hooks/use-toast";
import { Plus, Copy, Check } from "lucide-react";

interface TokenGeneratorProps {
  clientId: string;
  clientName?: string;
  onTokenGenerated?: () => void;
}

export function TokenGenerator({ clientId, clientName, onTokenGenerated }: TokenGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [description, setDescription] = useState('');
  const [expiration, setExpiration] = useState<string>('never');
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const generateNewToken = async () => {
    setIsGenerating(true);
    
    try {
      let expiresAt: Date | undefined;
      
      // Calcular data de expiração com base na seleção
      if (expiration === '30days') {
        expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
      } else if (expiration === '90days') {
        expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 90);
      } else if (expiration === '1year') {
        expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 365);
      }
      
      const token = await generateToken(clientId, description, expiresAt);
      
      if (token) {
        setGeneratedToken(token);
        if (onTokenGenerated) {
          onTokenGenerated();
        }
      } else {
        toast({
          title: "Erro ao gerar token",
          description: "Não foi possível gerar o token. Tente novamente.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao gerar token:", error);
      toast({
        title: "Erro ao gerar token",
        description: "Ocorreu um erro ao gerar o token. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (generatedToken) {
      navigator.clipboard.writeText(generatedToken);
      setCopied(true);
      toast({
        title: "Token copiado",
        description: "O token foi copiado para a área de transferência."
      });
      
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
  };

  const closeAndReset = () => {
    setIsOpen(false);
    setTimeout(() => {
      setGeneratedToken(null);
      setDescription('');
      setExpiration('never');
    }, 300);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Gerar Novo Token
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Gerar Token de Acesso</DialogTitle>
          <DialogDescription>
            {clientName ? `Criar token para ${clientName}` : 'Crie um token de acesso para o cliente'}
          </DialogDescription>
        </DialogHeader>
        
        {generatedToken ? (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="token">Token Gerado</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="token"
                  value={generatedToken}
                  readOnly
                  className="font-mono text-lg text-center"
                />
                <Button variant="outline" size="icon" onClick={copyToClipboard}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Guarde este token com segurança. Ele não será exibido novamente.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                placeholder="Ex: Acesso do contador João"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="expiration">Validade</Label>
              <Select value={expiration} onValueChange={setExpiration}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a validade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="never">Sem expiração</SelectItem>
                  <SelectItem value="30days">30 dias</SelectItem>
                  <SelectItem value="90days">90 dias</SelectItem>
                  <SelectItem value="1year">1 ano</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
        
        <DialogFooter>
          {generatedToken ? (
            <Button onClick={closeAndReset}>Fechar</Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" onClick={generateNewToken} disabled={isGenerating}>
                {isGenerating ? "Gerando..." : "Gerar Token"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
