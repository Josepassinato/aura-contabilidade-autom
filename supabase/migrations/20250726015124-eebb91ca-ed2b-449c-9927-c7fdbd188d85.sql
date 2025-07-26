-- Create scheduled_jobs table for real job scheduling
CREATE TABLE IF NOT EXISTS public.scheduled_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  cron_expression TEXT NOT NULL,
  function_name TEXT NOT NULL,
  parameters JSONB NOT NULL DEFAULT '{}',
  enabled BOOLEAN NOT NULL DEFAULT true,
  last_run TIMESTAMP WITH TIME ZONE,
  next_run TIMESTAMP WITH TIME ZONE,
  success_count INTEGER NOT NULL DEFAULT 0,
  error_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.scheduled_jobs ENABLE ROW LEVEL SECURITY;

-- Create policies for scheduled_jobs
CREATE POLICY "Admins and accountants can manage scheduled jobs"
ON public.scheduled_jobs
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'accountant')
  )
);

-- Create indexes for performance
CREATE INDEX idx_scheduled_jobs_enabled_next_run ON public.scheduled_jobs(enabled, next_run);
CREATE INDEX idx_scheduled_jobs_function_name ON public.scheduled_jobs(function_name, enabled);

-- Create updated_at trigger
CREATE TRIGGER update_scheduled_jobs_updated_at
  BEFORE UPDATE ON public.scheduled_jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to calculate next run time based on cron expression
CREATE OR REPLACE FUNCTION public.calculate_next_cron_run(cron_expression TEXT, from_time TIMESTAMP WITH TIME ZONE DEFAULT now())
RETURNS TIMESTAMP WITH TIME ZONE
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  next_time TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Simplified cron calculation - in production, use a proper cron library
  CASE cron_expression
    WHEN '*/5 * * * *' THEN -- Every 5 minutes
      next_time := date_trunc('minute', from_time) + interval '5 minutes' * CEIL(EXTRACT(MINUTE FROM from_time) / 5.0);
    WHEN '0 * * * *' THEN -- Every hour
      next_time := date_trunc('hour', from_time) + interval '1 hour';
    WHEN '0 2 * * *' THEN -- Daily at 2 AM
      next_time := date_trunc('day', from_time) + interval '2 hours';
      IF next_time <= from_time THEN
        next_time := next_time + interval '1 day';
      END IF;
    WHEN '0 6 * * *' THEN -- Daily at 6 AM
      next_time := date_trunc('day', from_time) + interval '6 hours';
      IF next_time <= from_time THEN
        next_time := next_time + interval '1 day';
      END IF;
    WHEN '0 0 * * 0' THEN -- Weekly on Sunday
      next_time := date_trunc('week', from_time) + interval '7 days';
    WHEN '0 0 1 * *' THEN -- Monthly on 1st
      next_time := date_trunc('month', from_time) + interval '1 month';
    ELSE
      -- Default: add 1 hour
      next_time := from_time + interval '1 hour';
  END CASE;
  
  RETURN next_time;
END;
$$;

-- Insert default scheduled jobs
INSERT INTO public.scheduled_jobs (name, description, cron_expression, function_name, parameters, enabled) VALUES
  ('Trigger Automation Engine', 'Executa o engine de automação a cada hora', '0 * * * *', 'automation-trigger-engine', '{}', true),
  ('Process Worker Queue', 'Executa workers para processar fila de tarefas', '*/5 * * * *', 'automation-worker', '{}', true),
  ('Daily Reports Generation', 'Gera relatórios diários automaticamente', '0 6 * * *', 'automation-trigger-engine', '{"trigger_type": "daily_reports"}', true)
ON CONFLICT DO NOTHING;

-- Update next_run times for default jobs
UPDATE public.scheduled_jobs 
SET next_run = public.calculate_next_cron_run(cron_expression)
WHERE next_run IS NULL;