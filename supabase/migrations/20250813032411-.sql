-- Fix nightly maintenance function to use EXECUTE for ANALYZE
create or replace function public.nightly_classification_maintenance()
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  execute 'analyze public.classification_examples';
  return jsonb_build_object('analyzed', true, 'timestamp', now());
end;
$$;