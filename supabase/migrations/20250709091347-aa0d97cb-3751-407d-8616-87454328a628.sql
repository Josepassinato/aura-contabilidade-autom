-- Criar sistema de notificações avançado
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL, -- 'error', 'warning', 'info', 'success'
  priority INTEGER NOT NULL DEFAULT 2, -- 1=critical, 2=high, 3=medium, 4=low
  category TEXT NOT NULL, -- 'closing', 'compliance', 'system', 'integration'
  source_id UUID, -- ID do registro relacionado (closing, client, etc)
  source_type TEXT, -- 'closing_status', 'client', etc
  metadata JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE,
  is_acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  acknowledged_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para configurações de notificação por usuário
CREATE TABLE public.notification_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
  email_enabled BOOLEAN DEFAULT TRUE,
  push_enabled BOOLEAN DEFAULT TRUE,
  categories_subscribed TEXT[] DEFAULT ARRAY['closing', 'compliance', 'system'],
  priority_threshold INTEGER DEFAULT 2, -- Só recebe notificações acima deste nível
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para escalation rules
CREATE TABLE public.notification_escalation_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  priority INTEGER NOT NULL,
  escalate_after_minutes INTEGER NOT NULL,
  escalate_to_role TEXT, -- 'admin', 'accountant'
  escalate_to_user_id UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_escalation_rules ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
ON public.notifications
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id);

-- Políticas RLS para notification_preferences
CREATE POLICY "Users can manage their own preferences"
ON public.notification_preferences
FOR ALL
USING (auth.uid() = user_id);

-- Políticas RLS para escalation rules
CREATE POLICY "Admins can manage escalation rules"
ON public.notification_escalation_rules
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

CREATE POLICY "Users can view escalation rules"
ON public.notification_escalation_rules
FOR SELECT
USING (is_active = true);

-- Índices para performance
CREATE INDEX idx_notifications_user_priority ON public.notifications(user_id, priority, created_at DESC);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id, is_read, created_at DESC);
CREATE INDEX idx_notifications_category ON public.notifications(category, priority, created_at DESC);
CREATE INDEX idx_notifications_source ON public.notifications(source_type, source_id);

-- Trigger para updated_at
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Função para criar notificação com auto-escalation
CREATE OR REPLACE FUNCTION public.create_notification_with_escalation(
  p_user_id UUID,
  p_title TEXT,
  p_message TEXT,
  p_type TEXT,
  p_priority INTEGER,
  p_category TEXT,
  p_source_id UUID DEFAULT NULL,
  p_source_type TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
  v_escalation_time TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Inserir notificação
  INSERT INTO public.notifications (
    user_id, title, message, type, priority, category,
    source_id, source_type, metadata
  ) VALUES (
    p_user_id, p_title, p_message, p_type, p_priority, p_category,
    p_source_id, p_source_type, p_metadata
  ) RETURNING id INTO v_notification_id;

  -- Se for crítica (priority 1), configurar escalation automático
  IF p_priority = 1 THEN
    -- Agendar escalation em 30 minutos para prioridade crítica
    v_escalation_time := now() + interval '30 minutes';
    
    -- Em um sistema real, aqui você agendaria um job
    -- Por agora, vamos apenas logar
    INSERT INTO public.automated_actions_log (
      action_type,
      description,
      metadata
    ) VALUES (
      'notification_escalation_scheduled',
      'Escalation scheduled for critical notification',
      jsonb_build_object(
        'notification_id', v_notification_id,
        'escalate_at', v_escalation_time,
        'category', p_category
      )
    );
  END IF;

  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para marcar como lida e calcular métricas
CREATE OR REPLACE FUNCTION public.mark_notification_read(p_notification_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID;
  v_created_at TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Atualizar notificação
  UPDATE public.notifications
  SET is_read = TRUE, updated_at = now()
  WHERE id = p_notification_id
  AND auth.uid() = user_id
  RETURNING user_id, created_at INTO v_user_id, v_created_at;

  IF v_user_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Log para métricas (tempo de resposta)
  INSERT INTO public.automated_actions_log (
    action_type,
    description,
    metadata
  ) VALUES (
    'notification_read',
    'Notification marked as read',
    jsonb_build_object(
      'notification_id', p_notification_id,
      'user_id', v_user_id,
      'response_time_minutes', EXTRACT(EPOCH FROM (now() - v_created_at)) / 60
    )
  );

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;