-- Fix critical RLS security issues

-- Enable RLS on tables that have policies but RLS disabled
DO $$
DECLARE
    table_name text;
    tables_to_fix text[] := ARRAY[
        'automation_logs',
        'automation_rules',
        'closing_checklist_items',
        'monthly_closing_status',
        'user_profiles',
        'accounting_clients',
        'accounting_firms',
        'payment_alerts',
        'notification_preferences',
        'notifications',
        'performance_metrics',
        'generated_reports',
        'processing_queue',
        'worker_instances'
    ];
BEGIN
    FOREACH table_name IN ARRAY tables_to_fix
    LOOP
        -- Check if table exists and enable RLS
        IF EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = table_name
        ) THEN
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', table_name);
            RAISE NOTICE 'Enabled RLS for table: %', table_name;
        END IF;
    END LOOP;
END $$;