import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { handleError } from '@/services/errorHandlingService';

export interface SmartNotification {
  id: string;
  title: string;
  message: string;
  type: 'error' | 'warning' | 'info' | 'success';
  priority: 1 | 2 | 3 | 4; // 1=critical, 2=high, 3=medium, 4=low
  category: 'closing' | 'compliance' | 'system' | 'integration';
  source_id?: string;
  source_type?: string;
  metadata: Record<string, any>;
  is_read: boolean;
  is_acknowledged: boolean;
  acknowledged_at?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreferences {
  email_enabled: boolean;
  push_enabled: boolean;
  categories_subscribed: string[];
  priority_threshold: number;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
}

export interface NotificationStats {
  total_unread: number;
  critical_count: number;
  by_category: Record<string, number>;
  response_rate_last_7_days: number;
}

export function useSmartNotifications() {
  const [notifications, setNotifications] = useState<SmartNotification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [realTimeSubscription, setRealTimeSubscription] = useState<any>(null);
  const { user } = useAuth();

  // Carregar notificações
  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('priority', { ascending: true })
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotifications((data || []) as SmartNotification[]);
    } catch (error) {
      handleError(error, 'useSmartNotifications.fetchNotifications');
    }
  }, [user?.id]);

  // Carregar preferências
  const fetchPreferences = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // Ignorar "not found"
        throw error;
      }

      if (data) {
        setPreferences(data);
      } else {
        // Criar preferências padrão
        const defaultPrefs: Partial<NotificationPreferences> = {
          email_enabled: true,
          push_enabled: true,
          categories_subscribed: ['closing', 'compliance', 'system'],
          priority_threshold: 2
        };

        const { data: newPrefs, error: createError } = await supabase
          .from('notification_preferences')
          .insert({ user_id: user.id, ...defaultPrefs })
          .select()
          .single();

        if (createError) throw createError;
        setPreferences(newPrefs);
      }
    } catch (error) {
      handleError(error, 'useSmartNotifications.fetchPreferences');
    }
  }, [user?.id]);

  // Calcular estatísticas
  const calculateStats = useCallback((notifs: SmartNotification[]): NotificationStats => {
    const unread = notifs.filter(n => !n.is_read);
    const critical = notifs.filter(n => n.priority === 1);
    
    const byCategory = notifs.reduce((acc, notif) => {
      acc[notif.category] = (acc[notif.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calcular taxa de resposta dos últimos 7 dias
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recent = notifs.filter(n => new Date(n.created_at) >= sevenDaysAgo);
    const recentAcknowledged = recent.filter(n => n.is_acknowledged);
    const responseRate = recent.length > 0 ? (recentAcknowledged.length / recent.length) * 100 : 0;

    return {
      total_unread: unread.length,
      critical_count: critical.length,
      by_category: byCategory,
      response_rate_last_7_days: Math.round(responseRate)
    };
  }, []);

  // Marcar como lida
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const { error } = await supabase
        .rpc('mark_notification_read', { p_notification_id: notificationId });

      if (error) throw error;

      // Atualizar estado local
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, is_read: true, updated_at: new Date().toISOString() }
            : n
        )
      );
    } catch (error) {
      handleError(error, 'useSmartNotifications.markAsRead');
    }
  }, []);

  // Marcar como reconhecida
  const acknowledge = useCallback(async (notificationId: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({
          is_acknowledged: true,
          acknowledged_at: new Date().toISOString(),
          acknowledged_by: user.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Atualizar estado local
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { 
                ...n, 
                is_acknowledged: true, 
                acknowledged_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
            : n
        )
      );
    } catch (error) {
      handleError(error, 'useSmartNotifications.acknowledge');
    }
  }, [user?.id]);

  // Criar notificação
  const createNotification = useCallback(async (params: {
    title: string;
    message: string;
    type: 'error' | 'warning' | 'info' | 'success';
    priority: 1 | 2 | 3 | 4;
    category: 'closing' | 'compliance' | 'system' | 'integration';
    source_id?: string;
    source_type?: string;
    metadata?: Record<string, any>;
    auto_escalate?: boolean;
  }) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase.functions.invoke('smart-notification-manager', {
        body: {
          action: 'create_notification',
          user_id: user.id,
          ...params
        }
      });

      if (error) throw error;

      // Refetch para pegar a nova notificação
      await fetchNotifications();
    } catch (error) {
      handleError(error, 'useSmartNotifications.createNotification');
    }
  }, [user?.id, fetchNotifications]);

  // Atualizar preferências
  const updatePreferences = useCallback(async (newPrefs: Partial<NotificationPreferences>) => {
    if (!user?.id || !preferences) return;

    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .update({ ...newPrefs, updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      setPreferences(data);
    } catch (error) {
      handleError(error, 'useSmartNotifications.updatePreferences');
    }
  }, [user?.id, preferences]);

  // Marcar todas como lidas
  const markAllAsRead = useCallback(async () => {
    if (!user?.id) return;

    try {
      const unreadIds = notifications
        .filter(n => !n.is_read)
        .map(n => n.id);

      if (unreadIds.length === 0) return;

      for (const id of unreadIds) {
        await markAsRead(id);
      }
    } catch (error) {
      handleError(error, 'useSmartNotifications.markAllAsRead');
    }
  }, [user?.id, notifications, markAsRead]);

  // Limpar notificações antigas
  const clearOldNotifications = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { error } = await supabase.functions.invoke('smart-notification-manager', {
        body: {
          action: 'cleanup_expired'
        }
      });

      if (error) throw error;
      await fetchNotifications();
    } catch (error) {
      handleError(error, 'useSmartNotifications.clearOldNotifications');
    }
  }, [user?.id, fetchNotifications]);

  // Obter sugestões inteligentes
  const getSmartSuggestions = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase.functions.invoke('smart-notification-manager', {
        body: {
          action: 'get_smart_suggestions',
          user_id: user.id
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error, 'useSmartNotifications.getSmartSuggestions');
      return null;
    }
  }, [user?.id]);

  // Setup realtime subscription
  useEffect(() => {
    if (!user?.id) return;

    const setupRealtime = () => {
      const subscription = supabase
        .channel('notifications')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Notification realtime update:', payload);
            
            if (payload.eventType === 'INSERT') {
              setNotifications(prev => [payload.new as SmartNotification, ...prev]);
            } else if (payload.eventType === 'UPDATE') {
              setNotifications(prev => 
                prev.map(n => 
                  n.id === payload.new.id ? payload.new as SmartNotification : n
                )
              );
            } else if (payload.eventType === 'DELETE') {
              setNotifications(prev => 
                prev.filter(n => n.id !== payload.old.id)
              );
            }
          }
        )
        .subscribe();

      setRealTimeSubscription(subscription);
    };

    setupRealtime();

    return () => {
      if (realTimeSubscription) {
        supabase.removeChannel(realTimeSubscription);
      }
    };
  }, [user?.id]);

  // Carregar dados iniciais
  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) return;

      setLoading(true);
      await Promise.all([
        fetchNotifications(),
        fetchPreferences()
      ]);
      setLoading(false);
    };

    loadData();
  }, [user?.id, fetchNotifications, fetchPreferences]);

  // Calcular stats quando notifications mudam
  useEffect(() => {
    if (notifications.length > 0) {
      setStats(calculateStats(notifications));
    } else {
      setStats({
        total_unread: 0,
        critical_count: 0,
        by_category: {},
        response_rate_last_7_days: 0
      });
    }
  }, [notifications, calculateStats]);

  return {
    notifications,
    preferences,
    stats,
    loading,
    
    // Actions
    markAsRead,
    acknowledge,
    createNotification,
    updatePreferences,
    markAllAsRead,
    clearOldNotifications,
    getSmartSuggestions,
    refetch: fetchNotifications,
    
    // Computed values
    unreadNotifications: notifications.filter(n => !n.is_read),
    criticalNotifications: notifications.filter(n => n.priority === 1 && !n.is_acknowledged),
    
    // Helper functions
    getNotificationsByCategory: (category: string) => 
      notifications.filter(n => n.category === category),
    
    hasUnreadCritical: notifications.some(n => n.priority === 1 && !n.is_read)
  };
}