import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Bell, 
  BellRing, 
  Check, 
  CheckCheck, 
  AlertTriangle, 
  Info, 
  AlertCircle,
  Settings,
  Trash2,
  Eye,
  EyeOff,
  Clock,
  TrendingUp
} from 'lucide-react';
import { useSmartNotifications, SmartNotification } from '@/hooks/useSmartNotifications';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function SmartNotificationCenter() {
  const {
    notifications,
    preferences,
    stats,
    loading,
    markAsRead,
    acknowledge,
    markAllAsRead,
    clearOldNotifications,
    unreadNotifications,
    criticalNotifications,
    hasUnreadCritical
  } = useSmartNotifications();

  const [activeTab, setActiveTab] = useState('all');
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);

  const getNotificationIcon = (type: SmartNotification['type'], priority: number) => {
    if (priority === 1) {
      return <AlertTriangle className="h-4 w-4 text-destructive" />;
    }
    
    switch (type) {
      case 'error':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'info':
        return <Info className="h-4 w-4 text-info" />;
      case 'success':
        return <Check className="h-4 w-4 text-success" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1:
        return 'bg-destructive text-destructive-foreground';
      case 2:
        return 'bg-warning text-warning-foreground';
      case 3:
        return 'bg-info text-info-foreground';
      case 4:
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 1: return 'Crítica';
      case 2: return 'Alta';
      case 3: return 'Média';
      case 4: return 'Baixa';
      default: return 'Normal';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'closing': return 'Fechamento';
      case 'compliance': return 'Compliance';
      case 'system': return 'Sistema';
      case 'integration': return 'Integração';
      default: return category;
    }
  };

  const filterNotifications = (notifs: SmartNotification[]) => {
    let filtered = notifs;

    if (showOnlyUnread) {
      filtered = filtered.filter(n => !n.is_read);
    }

    if (activeTab !== 'all') {
      if (activeTab === 'critical') {
        filtered = filtered.filter(n => n.priority === 1);
      } else {
        filtered = filtered.filter(n => n.category === activeTab);
      }
    }

    return filtered;
  };

  const filteredNotifications = filterNotifications(notifications);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Carregando notificações...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com stats */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {hasUnreadCritical ? (
                  <BellRing className="h-5 w-5 text-destructive animate-pulse" />
                ) : (
                  <Bell className="h-5 w-5" />
                )}
                Central de Notificações
                {stats && stats.total_unread > 0 && (
                  <Badge variant="destructive">{stats.total_unread}</Badge>
                )}
              </CardTitle>
              <CardDescription>
                Gerencie suas notificações e alertas do sistema
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowOnlyUnread(!showOnlyUnread)}
              >
                {showOnlyUnread ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                {showOnlyUnread ? 'Mostrar Todas' : 'Apenas Não Lidas'}
              </Button>
              
              {unreadNotifications.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markAllAsRead}
                >
                  <CheckCheck className="h-4 w-4 mr-2" />
                  Marcar Todas como Lidas
                </Button>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={clearOldNotifications}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Limpar Antigas
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Stats cards */}
        {stats && (
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-destructive">
                  {stats.critical_count}
                </div>
                <div className="text-xs text-muted-foreground">Críticas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-warning">
                  {stats.total_unread}
                </div>
                <div className="text-xs text-muted-foreground">Não Lidas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-info">
                  {notifications.length}
                </div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-success">
                  {stats.response_rate_last_7_days}%
                </div>
                <div className="text-xs text-muted-foreground">Taxa Resposta</div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Notificações por categoria */}
      <Card>
        <CardHeader>
          <CardTitle>Notificações</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all" className="text-xs">
                Todas {notifications.length > 0 && `(${notifications.length})`}
              </TabsTrigger>
              <TabsTrigger value="critical" className="text-xs">
                Críticas {criticalNotifications.length > 0 && `(${criticalNotifications.length})`}
              </TabsTrigger>
              <TabsTrigger value="closing" className="text-xs">
                Fechamento {stats?.by_category.closing && `(${stats.by_category.closing})`}
              </TabsTrigger>
              <TabsTrigger value="compliance" className="text-xs">
                Compliance {stats?.by_category.compliance && `(${stats.by_category.compliance})`}
              </TabsTrigger>
              <TabsTrigger value="system" className="text-xs">
                Sistema {stats?.by_category.system && `(${stats.by_category.system})`}
              </TabsTrigger>
            </TabsList>

            <div className="mt-4">
              <ScrollArea className="h-[600px]">
                {filteredNotifications.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">
                      {showOnlyUnread ? 'Nenhuma notificação não lida' : 'Nenhuma notificação encontrada'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredNotifications.map((notification, index) => (
                      <div key={notification.id}>
                        <div 
                          className={`p-4 rounded-lg border transition-all duration-200 ${
                            !notification.is_read 
                              ? 'bg-accent/50 border-primary/20 shadow-sm' 
                              : 'bg-muted/30 border-border'
                          } ${
                            notification.priority === 1 
                              ? 'border-l-4 border-l-destructive' 
                              : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-1">
                              {getNotificationIcon(notification.type, notification.priority)}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className={`font-medium ${!notification.is_read ? 'font-semibold' : ''}`}>
                                  {notification.title}
                                </h4>
                                
                                <div className="flex items-center gap-1">
                                  <Badge variant="outline" className={getPriorityColor(notification.priority)}>
                                    {getPriorityLabel(notification.priority)}
                                  </Badge>
                                  
                                  <Badge variant="outline">
                                    {getCategoryLabel(notification.category)}
                                  </Badge>
                                </div>
                              </div>
                              
                              <p className="text-sm text-muted-foreground mb-3">
                                {notification.message}
                              </p>
                              
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {formatDistanceToNow(new Date(notification.created_at), {
                                      addSuffix: true,
                                      locale: ptBR
                                    })}
                                  </span>
                                  
                                  {notification.is_acknowledged && (
                                    <span className="text-success">
                                      ✓ Reconhecida
                                    </span>
                                  )}
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  {!notification.is_read && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => markAsRead(notification.id)}
                                    >
                                      <Check className="h-3 w-3 mr-1" />
                                      Marcar como Lida
                                    </Button>
                                  )}
                                  
                                  {!notification.is_acknowledged && notification.priority <= 2 && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => acknowledge(notification.id)}
                                    >
                                      <CheckCheck className="h-3 w-3 mr-1" />
                                      Reconhecer
                                    </Button>
                                  )}
                                </div>
                              </div>

                              {/* Metadata adicional para notificações críticas */}
                              {notification.priority === 1 && notification.metadata && (
                                <div className="mt-3 p-2 bg-destructive/10 rounded border border-destructive/20">
                                  <div className="text-xs text-destructive font-medium mb-1">
                                    Detalhes Adicionais:
                                  </div>
                                  <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
                                    {JSON.stringify(notification.metadata, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {index < filteredNotifications.length - 1 && (
                          <Separator className="my-3" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}