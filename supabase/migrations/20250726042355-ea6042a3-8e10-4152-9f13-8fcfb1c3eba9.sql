-- Fix remaining function search path security issues

-- Update all functions that don't have explicit search_path set
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT role FROM public.user_profiles WHERE user_id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_invitation_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_procuracao_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.log_parametros_alteracao()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.atualizacoes_parametros_log(
    parametro_id, tipo_operacao, detalhes
  )
  VALUES(
    NEW.id,
    TG_OP,
    jsonb_build_object(
      'tipo', NEW.tipo,
      'versao', NEW.versao,
      'ativo', NEW.ativo
    )
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_automation_rules_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_automation_duration()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  IF NEW.completed_at IS NOT NULL AND OLD.completed_at IS NULL THEN
    NEW.duration_seconds = EXTRACT(EPOCH FROM (NEW.completed_at - NEW.started_at))::INTEGER;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_closing_progress()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  -- Update counters based on checklist items
  UPDATE public.monthly_closing_status
  SET 
    validations_passed = (
      SELECT COUNT(*) 
      FROM public.closing_checklist_items 
      WHERE closing_id = NEW.closing_id 
      AND status = 'completed'
    ),
    validations_total = (
      SELECT COUNT(*) 
      FROM public.closing_checklist_items 
      WHERE closing_id = NEW.closing_id
    ),
    last_activity = now(),
    status = CASE 
      WHEN (SELECT COUNT(*) FROM public.closing_checklist_items WHERE closing_id = NEW.closing_id AND status = 'failed') > 0 THEN 'blocked'
      WHEN (SELECT COUNT(*) FROM public.closing_checklist_items WHERE closing_id = NEW.closing_id AND status = 'completed') = 
           (SELECT COUNT(*) FROM public.closing_checklist_items WHERE closing_id = NEW.closing_id) THEN 'completed'
      WHEN (SELECT COUNT(*) FROM public.closing_checklist_items WHERE closing_id = NEW.closing_id AND status IN ('in_progress', 'completed')) > 0 THEN 'in_progress'
      ELSE 'pending'
    END
  WHERE id = NEW.closing_id;
  
  RETURN NEW;
END;
$$;