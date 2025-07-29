
import React, { useState, useEffect } from 'react';
import { Bell, Clock, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'prazo' | 'alerta' | 'info';
  date: string;
  isRead: boolean;
  relatedId?: string;
  priority?: 'alta' | 'media' | 'baixa';
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();
  const auth = useAuth();
  
  // Carregar notificações simuladas
  useEffect(() => {
    // Em um ambiente real, você buscaria do backend
    const simulatedNotifications: Notification[] = [
      {
        id: '1',
        title: 'Prazo DARF se aproximando',
        message: 'O prazo para pagamento do DARF vence em 3 dias',
        type: 'prazo',
        date: new Date(new Date().getTime() - 1000 * 60 * 30).toISOString(), // 30 min atrás
        isRead: false,
        priority: 'alta'
      },
      {
        id: '2',
        title: 'Divergência encontrada',
        message: 'Foram encontradas divergências entre os saldos contábeis e bancários',
        type: 'alerta',
        date: new Date(new Date().getTime() - 1000 * 60 * 60 * 2).toISOString(), // 2h atrás
        isRead: false,
        priority: 'alta'
      },
      {
        id: '3',
        title: 'Novos documentos disponíveis',
        message: 'O cliente Tech Solutions enviou 5 novos documentos',
        type: 'info',
        date: new Date(new Date().getTime() - 1000 * 60 * 60 * 24).toISOString(), // 1 dia atrás
        isRead: true,
        priority: 'media'
      },
      {
        id: '4',
        title: 'Lembrete de obrigações',
        message: 'Você tem 2 obrigações fiscais pendentes para o próximo mês',
        type: 'prazo',
        date: new Date(new Date().getTime() - 1000 * 60 * 60 * 48).toISOString(), // 2 dias atrás
        isRead: true,
        priority: 'baixa'
      },
    ];
    
    setNotifications(simulatedNotifications);
    setUnreadCount(simulatedNotifications.filter(n => !n.isRead).length);
  }, []);
  
  // Marcar uma notificação como lida
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true } 
          : notification
      )
    );
    
    setUnreadCount(prev => Math.max(0, prev - 1));
  };
  
  // Marcar todas como lidas
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
    
    setUnreadCount(0);
    
    toast({
      title: "Notificações",
      description: "Todas as notificações foram marcadas como lidas",
    });
  };
  
  // Filtrar notificações com base na tab atual
  const filteredNotifications = activeTab === 'all' 
    ? notifications 
    : notifications.filter(n => n.type === activeTab);
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 px-1 py-0 min-w-[18px] min-h-[18px] flex items-center justify-center bg-primary text-primary-foreground text-xs">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="border-b px-3 py-2 flex items-center justify-between">
          <h4 className="font-medium">Notificações</h4>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              Marcar todas como lidas
            </Button>
          )}
        </div>
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <div className="px-1 py-2">
            <TabsList className="w-full">
              <TabsTrigger value="all" className="flex-1">
                Todas
              </TabsTrigger>
              <TabsTrigger value="prazo" className="flex-1">
                Prazos
              </TabsTrigger>
              <TabsTrigger value="alerta" className="flex-1">
                Alertas
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="all" className="m-0">
            <NotificationList 
              notifications={filteredNotifications} 
              onMarkAsRead={markAsRead} 
            />
          </TabsContent>
          <TabsContent value="prazo" className="m-0">
            <NotificationList 
              notifications={filteredNotifications} 
              onMarkAsRead={markAsRead} 
            />
          </TabsContent>
          <TabsContent value="alerta" className="m-0">
            <NotificationList 
              notifications={filteredNotifications} 
              onMarkAsRead={markAsRead} 
            />
          </TabsContent>
        </Tabs>
        <div className="border-t p-2 flex justify-center">
          <Button variant="outline" size="sm" className="w-full" asChild>
            <a href="/notifications">Ver todas as notificações</a>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface NotificationListProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
}

function NotificationList({ notifications, onMarkAsRead }: NotificationListProps) {
  if (notifications.length === 0) {
    return (
      <div className="py-12 px-4 text-center">
        <p className="text-muted-foreground">Nenhuma notificação</p>
      </div>
    );
  }
  
  return (
    <ScrollArea className="h-[320px]">
      <div className="p-2 space-y-2">
        {notifications.map(notification => (
          <NotificationItem 
            key={notification.id} 
            notification={notification} 
            onMarkAsRead={onMarkAsRead} 
          />
        ))}
      </div>
    </ScrollArea>
  );
}

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}

function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
  const getIcon = () => {
    switch (notification.type) {
      case 'prazo':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'alerta':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };
  
  const getBgColor = () => {
    if (!notification.isRead) {
      return 'bg-muted/60';
    }
    return '';
  };

  const getPriorityColor = () => {
    switch (notification.priority) {
      case 'alta':
        return 'text-red-500';
      case 'media':
        return 'text-amber-500';
      case 'baixa':
        return 'text-green-500';
      default:
        return 'text-muted-foreground';
    }
  };
  
  return (
    <div 
      className={`rounded-md p-3 ${getBgColor()} hover:bg-muted cursor-pointer transition-colors`}
      onClick={() => onMarkAsRead(notification.id)}
    >
      <div className="flex gap-3">
        <div className="shrink-0 mt-1">{getIcon()}</div>
        <div className="space-y-1 flex-1">
          <div className="flex justify-between items-start">
            <p className="font-medium text-sm leading-none">
              {notification.title}
            </p>
            {notification.priority && (
              <span className={`text-xs ${getPriorityColor()}`}>
                {notification.priority}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {notification.message}
          </p>
          <p className="text-xs text-muted-foreground">
            {new Date(notification.date).toLocaleString('pt-BR', { 
              hour: '2-digit', 
              minute: '2-digit',
              day: '2-digit',
              month: '2-digit'
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
