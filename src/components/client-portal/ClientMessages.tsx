import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Send, 
  MessageSquare, 
  User, 
  Calendar,
  Paperclip,
  Eye,
  EyeOff
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { handleError } from '@/services/errorHandlingService';

interface Message {
  id: string;
  sender_type: 'client' | 'accountant';
  sender_name: string;
  message: string;
  attachments?: string[];
  read_by_client: boolean;
  read_by_accountant: boolean;
  created_at: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
}

interface ClientMessagesProps {
  clientId: string;
}

export const ClientMessages = ({ clientId }: ClientMessagesProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [messageCategory, setMessageCategory] = useState('geral');
  const [messagePriority, setMessagePriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (clientId) {
      loadMessages();
    }
  }, [clientId]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('client_messages')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages((data as Message[]) || []);
    } catch (error) {
      await handleError(error, 'ClientMessages.loadMessages');
      toast({
        title: 'Erro ao carregar mensagens',
        description: 'Não foi possível carregar suas conversas. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const markMessagesAsRead = async () => {
    try {
      await supabase
        .from('client_messages')
        .update({ read_by_client: true })
        .eq('client_id', clientId)
        .eq('sender_type', 'accountant')
        .eq('read_by_client', false);

      setMessages(prev => prev.map(msg =>
        msg.sender_type === 'accountant' ? { ...msg, read_by_client: true } : msg
      ));
    } catch (error) {
      await handleError(error, 'ClientMessages.markMessagesAsRead', false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      setSending(true);

      // Verificar sessão
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast({
          title: 'Sessão necessária',
          description: 'É necessário estar autenticado para enviar mensagens.',
          variant: 'destructive',
        });
        return;
      }

      // Upload do anexo (opcional)
      let attachments: string[] | undefined;
      if (selectedFile) {
        const path = `${clientId}/${Date.now()}_${selectedFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from('client-messages')
          .upload(path, selectedFile, { upsert: false });
        if (uploadError) throw uploadError;
        attachments = [path];
      }

      // Inserir mensagem no banco
      const { data, error } = await supabase
        .from('client_messages')
        .insert([
          {
            client_id: clientId,
            sender_type: 'client',
            sender_name: sessionStorage.getItem('client_name') || 'Cliente',
            message: newMessage,
            priority: messagePriority,
            category: messageCategory,
            read_by_client: true,
            attachments,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Atualizar UI
      if (data) {
        setMessages(prev => [data as Message, ...prev]);
      }

      // Limpar campos
      setNewMessage('');
      setMessageCategory('geral');
      setMessagePriority('medium');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

      toast({
        title: 'Mensagem enviada',
        description: 'Sua mensagem foi enviada para o contador.'
      });
    } catch (error) {
      await handleError(error, 'ClientMessages.sendMessage');
      toast({
        title: 'Falha ao enviar',
        description: 'Não foi possível enviar a mensagem. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      low: 'secondary',
      medium: 'default',
      high: 'destructive'
    } as const;

    const labels = {
      low: 'Baixa',
      medium: 'Média',
      high: 'Alta'
    };

    return (
      <Badge variant={variants[priority as keyof typeof variants]}>
        {labels[priority as keyof typeof labels]}
      </Badge>
    );
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      geral: 'Geral',
      fiscal: 'Fiscal',
      contabil: 'Contábil',
      documentos: 'Documentos',
      prazos: 'Prazos'
    };
    return labels[category as keyof typeof labels] || category;
  };

  return (
    <div className="space-y-4">
      {/* Formulário para nova mensagem */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Nova Mensagem
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Categoria</label>
              <select 
                value={messageCategory}
                onChange={(e) => setMessageCategory(e.target.value)}
                className="w-full mt-1 p-2 border rounded-md"
              >
                <option value="geral">Geral</option>
                <option value="fiscal">Fiscal</option>
                <option value="contabil">Contábil</option>
                <option value="documentos">Documentos</option>
                <option value="prazos">Prazos</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Prioridade</label>
              <select 
                value={messagePriority}
                onChange={(e) => setMessagePriority(e.target.value as 'low' | 'medium' | 'high')}
                className="w-full mt-1 p-2 border rounded-md"
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
              </select>
            </div>
          </div>
          
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
            rows={4}
          />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                <Paperclip className="h-4 w-4 mr-2" />
                Anexar Arquivo
              </Button>
              {selectedFile && (
                <span className="text-xs text-muted-foreground">{selectedFile.name}</span>
              )}
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  const file = e.target.files?.[0] || null;
                  setSelectedFile(file);
                }}
              />
            </div>
            <Button 
              onClick={sendMessage}
              disabled={sending || !newMessage.trim()}
            >
              <Send className="h-4 w-4 mr-2" />
              {sending ? 'Enviando...' : 'Enviar'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de mensagens */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Conversas ({messages.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                    <div className="h-16 w-full bg-muted rounded animate-pulse" />
                  </div>
                ))}
              </div>
            ) : messages.length > 0 ? (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div 
                    key={message.id}
                    className={`p-4 rounded-lg border ${
                      message.sender_type === 'client' 
                        ? 'bg-primary/5 border-primary/20 ml-8' 
                        : 'bg-muted/50 mr-8'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span className="font-medium">{message.sender_name}</span>
                        {getPriorityBadge(message.priority)}
                        <Badge variant="outline">{getCategoryLabel(message.category)}</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {message.sender_type === 'accountant' && !message.read_by_client && (
                          <EyeOff className="h-3 w-3" />
                        )}
                        <Calendar className="h-3 w-3" />
                        {formatDistanceToNow(new Date(message.created_at), { 
                          addSuffix: true, 
                          locale: ptBR 
                        })}
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed">{message.message}</p>
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-2 flex items-center gap-2">
                        <Paperclip className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {message.attachments.length} arquivo(s) anexado(s)
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">
                  Nenhuma mensagem ainda. Envie uma mensagem para iniciar a conversa.
                </p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};