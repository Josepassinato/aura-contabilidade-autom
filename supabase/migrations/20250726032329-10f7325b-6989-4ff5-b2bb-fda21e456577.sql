-- Fix search_path for all database functions for security
-- This addresses the Function Search Path Mutable warnings

ALTER FUNCTION public.handle_updated_at() SET search_path = public;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
ALTER FUNCTION public.update_invitation_updated_at() SET search_path = public;
ALTER FUNCTION public.update_procuracao_timestamp() SET search_path = public;
ALTER FUNCTION public.get_current_user_role() SET search_path = public;
ALTER FUNCTION public.log_parametros_alteracao() SET search_path = public;
ALTER FUNCTION public.update_automation_rules_updated_at() SET search_path = public;
ALTER FUNCTION public.update_automation_duration() SET search_path = public;
ALTER FUNCTION public.update_closing_progress() SET search_path = public;
ALTER FUNCTION public.check_overdue_payments() SET search_path = public;
ALTER FUNCTION public.get_pending_payment_alerts() SET search_path = public;
ALTER FUNCTION public.get_accountant_clients(uuid) SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.invoke_sefaz_scraper() SET search_path = public;
ALTER FUNCTION public.create_notification_with_escalation(uuid, text, text, text, integer, text, uuid, text, jsonb) SET search_path = public;
ALTER FUNCTION public.initiate_pix_payment(uuid, text, text, text) SET search_path = public;
ALTER FUNCTION public.mark_notification_read(uuid) SET search_path = public;
ALTER FUNCTION public.cleanup_orphaned_data() SET search_path = public;
ALTER FUNCTION public.calculate_next_cron_run(text, timestamp with time zone) SET search_path = public;
ALTER FUNCTION public.process_queue_item(text) SET search_path = public;
ALTER FUNCTION public.complete_queue_task(uuid, text, boolean, jsonb, jsonb) SET search_path = public;
ALTER FUNCTION public.cleanup_offline_workers() SET search_path = public;
ALTER FUNCTION public.archive_old_data() SET search_path = public;
ALTER FUNCTION public.handle_accountant_signup() SET search_path = public;
ALTER FUNCTION public.cleanup_expired_reports() SET search_path = public;
ALTER FUNCTION public.auto_confirm_accountant_email() SET search_path = public;
ALTER FUNCTION public.get_user_role() SET search_path = public;
ALTER FUNCTION public.update_integracoes_externas_updated_at() SET search_path = public;
ALTER FUNCTION public.setup_initial_admin_user() SET search_path = public;
ALTER FUNCTION public.upsert_integracao_externa(uuid, text, jsonb, text) SET search_path = public;