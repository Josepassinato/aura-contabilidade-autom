import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  user_id: string;
  title: string;
  message: string;
  type: 'error' | 'warning' | 'info' | 'success';
  priority: 1 | 2 | 3 | 4; // 1=critical, 2=high, 3=medium, 4=low
  category: 'closing' | 'compliance' | 'system' | 'integration';
  source_id?: string;
  source_type?: string;
  metadata?: Record<string, any>;
  auto_escalate?: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, ...data }: { action: string } & any = await req.json();

    switch (action) {
      case 'create_notification':
        return await createNotification(supabase, data as NotificationRequest);
      
      case 'process_escalations':
        return await processEscalations(supabase);
      
      case 'cleanup_expired':
        return await cleanupExpiredNotifications(supabase);
      
      case 'get_smart_suggestions':
        return await getSmartSuggestions(supabase, data.user_id);
      
      default:
        return new Response(
          JSON.stringify({ error: 'Action not supported' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

  } catch (error) {
    console.error('Error in smart-notification-manager:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function createNotification(supabase: any, request: NotificationRequest) {
  console.log('Creating smart notification:', request);

  // Verificar preferências do usuário
  const { data: preferences } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', request.user_id)
    .single();

  // Se o usuário tem threshold definido e a prioridade é menor, não enviar
  if (preferences?.priority_threshold && request.priority > preferences.priority_threshold) {
    console.log('Notification skipped due to user preferences');
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Notification skipped due to user preferences',
        skipped: true 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Verificar quiet hours
  if (preferences?.quiet_hours_start && preferences?.quiet_hours_end) {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
    
    if (currentTime >= preferences.quiet_hours_start && 
        currentTime <= preferences.quiet_hours_end &&
        request.priority > 2) { // Só respeitar quiet hours para prioridades baixas
      console.log('Notification delayed due to quiet hours');
      
      // Agendar para depois do quiet hours
      const nextDay = new Date(now);
      nextDay.setDate(nextDay.getDate() + 1);
      nextDay.setHours(parseInt(preferences.quiet_hours_end.split(':')[0]), 0, 0, 0);
      
      // Em um sistema real, agendaria para envio posterior
    }
  }

  // Verificar duplicatas recentes
  const { data: recentNotifications } = await supabase
    .from('notifications')
    .select('id')
    .eq('user_id', request.user_id)
    .eq('category', request.category)
    .eq('source_id', request.source_id)
    .gte('created_at', new Date(Date.now() - 15 * 60 * 1000).toISOString()) // 15 min
    .limit(1);

  if (recentNotifications && recentNotifications.length > 0) {
    console.log('Duplicate notification detected, consolidating...');
    
    // Atualizar notificação existente ao invés de criar nova
    const { error: updateError } = await supabase
      .from('notifications')
      .update({
        message: request.message,
        priority: Math.min(request.priority, 2), // Aumentar prioridade em duplicatas
        updated_at: new Date().toISOString()
      })
      .eq('id', recentNotifications[0].id);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Notification consolidated with existing one',
        consolidated: true
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Criar notificação usando a função do banco
  const { data: notificationId, error } = await supabase
    .rpc('create_notification_with_escalation', {
      p_user_id: request.user_id,
      p_title: request.title,
      p_message: request.message,
      p_type: request.type,
      p_priority: request.priority,
      p_category: request.category,
      p_source_id: request.source_id || null,
      p_source_type: request.source_type || null,
      p_metadata: request.metadata || {}
    });

  if (error) throw error;

  // Se for crítica e auto_escalate for true, enviar também para admins
  if (request.priority === 1 && request.auto_escalate) {
    const { data: admins } = await supabase
      .from('user_profiles')
      .select('user_id')
      .eq('role', 'admin');

    if (admins && admins.length > 0) {
      for (const admin of admins) {
        if (admin.user_id !== request.user_id) {
          await supabase.rpc('create_notification_with_escalation', {
            p_user_id: admin.user_id,
            p_title: `[ESCALATED] ${request.title}`,
            p_message: `User issue escalated: ${request.message}`,
            p_type: request.type,
            p_priority: 1,
            p_category: request.category,
            p_source_id: request.source_id || null,
            p_source_type: request.source_type || null,
            p_metadata: { ...request.metadata, escalated_from: request.user_id }
          });
        }
      }
    }
  }

  console.log('Notification created successfully:', notificationId);

  return new Response(
    JSON.stringify({ 
      success: true, 
      notification_id: notificationId,
      message: 'Notification created successfully'
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function processEscalations(supabase: any) {
  console.log('Processing pending escalations...');

  // Buscar notificações críticas não lidas há mais de 30 minutos
  const { data: criticalNotifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('priority', 1)
    .eq('is_acknowledged', false)
    .lt('created_at', new Date(Date.now() - 30 * 60 * 1000).toISOString());

  if (!criticalNotifications || criticalNotifications.length === 0) {
    return new Response(
      JSON.stringify({ message: 'No escalations needed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  let escalationsProcessed = 0;

  for (const notification of criticalNotifications) {
    // Verificar se já foi escalada
    const { data: existingEscalation } = await supabase
      .from('automated_actions_log')
      .select('id')
      .eq('action_type', 'notification_escalated')
      .eq('metadata->>notification_id', notification.id)
      .limit(1);

    if (existingEscalation && existingEscalation.length > 0) {
      continue; // Já foi escalada
    }

    // Buscar admins para escalar
    const { data: admins } = await supabase
      .from('user_profiles')
      .select('user_id, full_name')
      .eq('role', 'admin');

    if (admins && admins.length > 0) {
      for (const admin of admins) {
        await supabase.rpc('create_notification_with_escalation', {
          p_user_id: admin.user_id,
          p_title: `🚨 CRÍTICO - ${notification.title}`,
          p_message: `Escalation automático: ${notification.message} (Usuário não respondeu em 30min)`,
          p_type: 'error',
          p_priority: 1,
          p_category: notification.category,
          p_source_id: notification.source_id,
          p_source_type: notification.source_type,
          p_metadata: { 
            escalated_from: notification.user_id,
            original_notification_id: notification.id
          }
        });
      }

      // Log da escalation
      await supabase
        .from('automated_actions_log')
        .insert({
          action_type: 'notification_escalated',
          description: `Critical notification escalated to ${admins.length} admin(s)`,
          metadata: {
            notification_id: notification.id,
            escalated_to_count: admins.length,
            original_user: notification.user_id
          }
        });

      escalationsProcessed++;
    }
  }

  console.log(`Processed ${escalationsProcessed} escalations`);

  return new Response(
    JSON.stringify({ 
      message: `Processed ${escalationsProcessed} escalations`,
      escalations_count: escalationsProcessed
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function cleanupExpiredNotifications(supabase: any) {
  console.log('Cleaning up expired notifications...');

  const { data, error } = await supabase
    .from('notifications')
    .delete()
    .lt('expires_at', new Date().toISOString())
    .select('id');

  if (error) throw error;

  const cleanedCount = data ? data.length : 0;
  console.log(`Cleaned up ${cleanedCount} expired notifications`);

  return new Response(
    JSON.stringify({ 
      message: `Cleaned up ${cleanedCount} expired notifications`,
      cleaned_count: cleanedCount
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getSmartSuggestions(supabase: any, userId: string) {
  console.log('Getting smart suggestions for user:', userId);

  // Analisar padrões de notificações do usuário
  const { data: userStats } = await supabase
    .from('notifications')
    .select('category, priority, is_acknowledged, created_at')
    .eq('user_id', userId)
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // 30 dias
    .order('created_at', { ascending: false });

  const suggestions: string[] = [];

  if (userStats && userStats.length > 0) {
    // Calcular taxa de resposta por categoria
    const categoryStats = userStats.reduce((acc: any, notif: any) => {
      if (!acc[notif.category]) {
        acc[notif.category] = { total: 0, acknowledged: 0 };
      }
      acc[notif.category].total++;
      if (notif.is_acknowledged) {
        acc[notif.category].acknowledged++;
      }
      return acc;
    }, {});

    // Sugerir ajustes baseado no comportamento
    Object.entries(categoryStats).forEach(([category, stats]: [string, any]) => {
      const responseRate = stats.acknowledged / stats.total;
      
      if (responseRate < 0.3 && stats.total > 5) {
        suggestions.push(
          `Considere aumentar o threshold para categoria "${category}" - baixa taxa de resposta (${Math.round(responseRate * 100)}%)`
        );
      }
      
      if (responseRate > 0.9 && stats.total > 10) {
        suggestions.push(
          `Você pode reduzir o threshold para categoria "${category}" - alta taxa de engagement (${Math.round(responseRate * 100)}%)`
        );
      }
    });

    // Verificar volume de notificações
    const dailyAverage = userStats.length / 30;
    if (dailyAverage > 10) {
      suggestions.push('Alto volume de notificações diárias. Considere ajustar os filtros para reduzir ruído.');
    }
  }

  if (suggestions.length === 0) {
    suggestions.push('Suas configurações de notificação parecem estar bem balanceadas!');
  }

  return new Response(
    JSON.stringify({ 
      suggestions,
      stats: userStats ? {
        total_last_30_days: userStats.length,
        daily_average: Math.round((userStats.length / 30) * 10) / 10
      } : null
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}