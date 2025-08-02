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

  useEffect(() => {
    if (clientId) {
      loadMessages();
    }
  }, [clientId]);

  const loadMessages = async () => {
    try {
      setLoading(true);

      // Tentar carregar mensagens salvas no localStorage primeiro  
      const savedMessages = localStorage.getItem(`client_messages_${clientId}`);
      if (savedMessages) {
        try {
          const parsed = JSON.parse(savedMessages);
          setMessages(parsed);
          return;
        } catch (error) {
          console.warn('Erro ao carregar mensagens salvas:', error);
        }
      }

      // Se não há mensagens salvas, criar mensagens de exemplo
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
      // Salvar mensagens de exemplo para persistência
      localStorage.setItem(`client_messages_${clientId}`, JSON.stringify(sampleMessages));

    } catch (error) {
      await handleError(error, 'ClientMessages.loadMessages');
    } finally {
      setLoading(false);
    }
  };

  const markMessagesAsRead = async () => {
    // Marcar mensagens como lidas no localStorage
    const updatedMessages = messages.map(msg => 
      msg.sender_type === 'accountant' ? { ...msg, read_by_client: true } : msg
    );
    setMessages(updatedMessages);
    localStorage.setItem(`client_messages_${clientId}`, JSON.stringify(updatedMessages));
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      setSending(true);

      // Criar nova mensagem
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

      // Adicionar à lista local e salvar no localStorage
      const updatedMessages = [message, ...messages];
      setMessages(updatedMessages);
      localStorage.setItem(`client_messages_${clientId}`, JSON.stringify(updatedMessages));

      // Limpar campos
      setNewMessage('');
      setMessageCategory('geral');
      setMessagePriority('medium');

      toast({
        title: "Mensagem enviada",
        description: "Sua mensagem foi enviada para o contador"
      });

    } catch (error) {
      await handleError(error, 'ClientMessages.sendMessage');
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