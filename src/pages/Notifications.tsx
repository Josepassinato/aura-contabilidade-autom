
import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Bell, Clock, AlertTriangle, Info } from "lucide-react";
import { Notification } from "@/components/notifications/NotificationCenter";
import { useToast } from "@/hooks/use-toast";

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Prazo DARF se aproximando',
      message: 'O prazo para pagamento do DARF vence em 3 dias',
      type: 'prazo',
      date: new Date(new Date().getTime() - 1000 * 60 * 30).toISOString(),
      isRead: false,
      priority: 'alta'
    },
    {
      id: '2',
      title: 'Divergência encontrada',
      message: 'Foram encontradas divergências entre os saldos contábeis e bancários',
      type: 'alerta',
      date: new Date(new Date().getTime() - 1000 * 60 * 60 * 2).toISOString(),
      isRead: false,
      priority: 'alta'
    },
    {
      id: '3',
      title: 'Novos documentos disponíveis',
      message: 'O cliente Tech Solutions enviou 5 novos documentos',
      type: 'info',
      date: new Date(new Date().getTime() - 1000 * 60 * 60 * 24).toISOString(),
      isRead: true,
      priority: 'media'
    },
    {
      id: '4',
      title: 'Lembrete de obrigações',
      message: 'Você tem 2 obrigações fiscais pendentes para o próximo mês',
      type: 'prazo',
      date: new Date(new Date().getTime() - 1000 * 60 * 60 * 48).toISOString(),
      isRead: true,
      priority: 'baixa'
    },
  ]);
  const [activeTab, setActiveTab] = useState('all');
  const { toast } = useToast();
  
  // Marcar todas como lidas
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
    
    toast({
      title: "Notificações",
      description: "Todas as notificações foram marcadas como lidas",
    });
  };
  
  // Marcar uma notificação como lida
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true } 
          : notification
      )
    );
  };
  
  // Deletar uma notificação
  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
    
    toast({
      title: "Notificação removida",
      description: "A notificação foi removida com sucesso",
    });
  };
  
  // Filtrar notificações com base na tab atual
  const filteredNotifications = activeTab === 'all' 
    ? notifications 
    : notifications.filter(n => n.type === activeTab);
  
  // Contar notificações não lidas
  const unreadCount = notifications.filter(n => !n.isRead).length;
  
  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Notificações</h1>
            <p className="text-muted-foreground">
              Gerencie suas notificações e alertas do sistema
            </p>
          </div>
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead}>
              Marcar todas como lidas ({unreadCount})
            </Button>
          )}
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Suas notificações</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="all" className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Todas
                </TabsTrigger>
                <TabsTrigger value="prazo" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Prazos
                </TabsTrigger>
                <TabsTrigger value="alerta" className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Alertas
                </TabsTrigger>
                <TabsTrigger value="info" className="flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Informações
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="m-0">
                <NotificationsList 
                  notifications={filteredNotifications}
                  onMarkAsRead={markAsRead}
                  onDelete={deleteNotification}
                />
              </TabsContent>
              <TabsContent value="prazo" className="m-0">
                <NotificationsList 
                  notifications={filteredNotifications}
                  onMarkAsRead={markAsRead}
                  onDelete={deleteNotification}
                />
              </TabsContent>
              <TabsContent value="alerta" className="m-0">
                <NotificationsList 
                  notifications={filteredNotifications}
                  onMarkAsRead={markAsRead}
                  onDelete={deleteNotification}
                />
              </TabsContent>
              <TabsContent value="info" className="m-0">
                <NotificationsList 
                  notifications={filteredNotifications}
                  onMarkAsRead={markAsRead}
                  onDelete={deleteNotification}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

interface NotificationsListProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

const NotificationsList = ({ notifications, onMarkAsRead, onDelete }: NotificationsListProps) => {
  if (notifications.length === 0) {
    return (
      <div className="py-12 px-4 text-center">
        <p className="text-muted-foreground">Nenhuma notificação encontrada</p>
      </div>
    );
  }
  
  const getIcon = (type: string) => {
    switch (type) {
      case 'prazo':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'alerta':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };
  
  const getPriorityClass = (priority?: string) => {
    switch (priority) {
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
    <div className="space-y-3">
      {notifications.map(notification => (
        <div 
          key={notification.id}
          className={`border rounded-md p-4 ${!notification.isRead ? 'bg-muted/30' : ''}`}
        >
          <div className="flex gap-4">
            <div className="shrink-0 mt-1">
              {getIcon(notification.type)}
            </div>
            <div className="space-y-1 flex-1">
              <div className="flex justify-between">
                <h4 className="font-medium">
                  {notification.title}
                  {!notification.isRead && (
                    <span className="ml-2 inline-block w-2 h-2 bg-primary rounded-full"></span>
                  )}
                </h4>
                {notification.priority && (
                  <span className={`text-xs ${getPriorityClass(notification.priority)}`}>
                    {notification.priority}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {notification.message}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(notification.date).toLocaleString('pt-BR', { 
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit', 
                  minute: '2-digit'
                })}
              </p>
              <div className="pt-2 flex gap-2">
                {!notification.isRead && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onMarkAsRead(notification.id)}
                  >
                    Marcar como lida
                  </Button>
                )}
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onDelete(notification.id)}
                >
                  Excluir
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Notifications;
