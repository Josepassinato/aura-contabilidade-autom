-- Enable pg_cron extension for scheduling
create extension if not exists pg_cron;

-- Schedule daily SEFAZ scraping by invoking the orchestrator function
select cron.schedule(
  'daily-sefaz-invoke',
  '0 6 * * *',
  $$
  select public.invoke_sefaz_scraper();
  $$
) where not exists (
  select 1 from cron.job where jobname = 'daily-sefaz-invoke'
);

-- Register job in scheduled_jobs table for observability/UX
insert into public.scheduled_jobs (id, name, description, function_name, cron_expression, enabled, created_at, updated_at, parameters, next_run)
select 
  gen_random_uuid(),
  'sefaz_daily_scrape',
  'Coleta automática diária na SEFAZ via invoke_sefaz_scraper()',
  'invoke_sefaz_scraper',
  '0 6 * * *',
  true,
  now(),
  now(),
  '{}'::jsonb,
  public.calculate_next_cron_run('0 6 * * *')
where not exists (
  select 1 from public.scheduled_jobs where name = 'sefaz_daily_scrape'
);