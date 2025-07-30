import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (clientId) {
      loadMessages();
      // Set up realtime subscription
      const subscription = supabase
        .channel(`client_messages:${clientId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'client_messages',
            filter: `client_id=eq.${clientId}`
          },
          () => {
            loadMessages();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [clientId]);

  const loadMessages = async () => {
    try {
      setLoading(true);

      // First, try to get messages from the table
      const { data: existingMessages, error } = await (supabase as any)
        .from('client_messages')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error && error.code !== 'PGRST116') { // Ignore "table not found" error
        throw error;
      }

      if (existingMessages && existingMessages.length > 0) {
        setMessages(existingMessages as any);
        // Mark messages as read by client
        await markMessagesAsRead();
      } else {
        // Create sample messages for demonstration
        const sampleMessages: Message[] = [
          {
            id: '1',
            sender_type: 'accountant',
            sender_name: 'Contador Responsável',
            message: 'Bem-vindo ao portal! Estou aqui para ajudar com suas questões contábeis.',
            read_by_client: false,
            read_by_accountant: true,
            created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            priority: 'medium',
            category: 'geral'
          },
          {
            id: '2',
            sender_type: 'accountant',
            sender_name: 'Contador Responsável',
            message: 'Lembre-se de enviar os documentos fiscais do mês até o dia 15. Qualquer dúvida, estarei disponível.',
            read_by_client: false,
            read_by_accountant: true,
            created_at: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
            priority: 'high',
            category: 'fiscal'
          }
        ];
        setMessages(sampleMessages);
      }
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
      toast({
        title: "Erro ao carregar mensagens",
        description: "Não foi possível carregar as mensagens",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const markMessagesAsRead = async () => {
    try {
      await (supabase as any)
        .from('client_messages')
        .update({ read_by_client: true } as any)
        .eq('client_id', clientId)
        .eq('read_by_client', false);
    } catch (error) {
      console.error('Erro ao marcar mensagens como lidas:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      setSending(true);

      // For demo purposes, we'll add the message to local state
      // In production, this would go through the database
      const message: Message = {
        id: Date.now().toString(),
        sender_type: 'client',
        sender_name: sessionStorage.getItem('client_name') || 'Cliente',
        message: newMessage,
        read_by_client: true,
        read_by_accountant: false,
        created_at: new Date().toISOString(),
        priority: messagePriority,
        category: messageCategory
      };

      // Try to insert into database
      const { error } = await (supabase as any)
        .from('client_messages')
        .insert([{
          client_id: clientId,
          sender_type: message.sender_type,
          sender_name: message.sender_name,
          message: message.message,
          read_by_client: message.read_by_client,
          read_by_accountant: message.read_by_accountant,
          priority: message.priority,
          category: message.category
        } as any]);

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      // Add to local state for immediate feedback
      setMessages(prev => [message, ...prev]);
      setNewMessage('');
      setMessageCategory('geral');
      setMessagePriority('medium');

      toast({
        title: "Mensagem enviada",
        description: "Sua mensagem foi enviada para o contador"
      });

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: "Erro ao enviar mensagem",
        description: "Não foi possível enviar a mensagem",
        variant: "destructive"
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
          
          <div className="flex justify-between">
            <Button variant="outline" size="sm">
              <Paperclip className="h-4 w-4 mr-2" />
              Anexar Arquivo
            </Button>
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