-- Enable pgvector
create extension if not exists vector;

-- Classification examples table
create table if not exists public.classification_examples (
  id uuid primary key default gen_random_uuid(),
  text_content text not null,
  label text not null,
  embedding vector(1536) not null,
  created_by uuid not null default auth.uid(),
  created_at timestamptz not null default now()
);

-- Enable RLS and policies (accountant/admin only)
alter table public.classification_examples enable row level security;

drop policy if exists "Manage classification examples (staff)" on public.classification_examples;
create policy "Manage classification examples (staff)"
  on public.classification_examples
  for all
  using (exists (
    select 1 from public.user_profiles up
    where up.user_id = auth.uid() and up.role in ('accountant','admin')
  ))
  with check (exists (
    select 1 from public.user_profiles up
    where up.user_id = auth.uid() and up.role in ('accountant','admin')
  ));

-- Vector index for fast similarity search
create index if not exists classification_examples_embedding_ivfflat
  on public.classification_examples
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

analyze public.classification_examples;

-- Matching RPC (guards role; takes float8[] and casts to vector)
drop function if exists public.match_classification_examples(double precision[], integer, double precision);
create or replace function public.match_classification_examples(
  query_embedding double precision[],
  match_count integer default 5,
  min_similarity double precision default 0.0
)
returns table(id uuid, label text, text_content text, similarity double precision)
language plpgsql
stable
security definer
set search_path to 'public'
as $$
begin
  -- Only accountants/admins can use
  if not exists (
    select 1 from public.user_profiles up
    where up.user_id = auth.uid() and up.role in ('accountant','admin')
  ) then
    raise exception 'forbidden';
  end if;

  return query
  select ce.id,
         ce.label,
         ce.text_content,
         1 - (ce.embedding <=> (query_embedding::vector)) as similarity
  from public.classification_examples ce
  where 1 - (ce.embedding <=> (query_embedding::vector)) >= min_similarity
  order by ce.embedding <=> (query_embedding::vector) asc
  limit match_count;
end;
$$;

-- RPC to insert example from embeddings array (for feedback loop)
drop function if exists public.insert_classification_example(text, text, double precision[]);
create or replace function public.insert_classification_example(
  p_text text,
  p_label text,
  p_embedding double precision[]
) returns uuid
language plpgsql
security definer
stable
set search_path to 'public'
as $$
declare
  v_id uuid;
begin
  -- Only accountants/admins can insert
  if not exists (
    select 1 from public.user_profiles up
    where up.user_id = auth.uid() and up.role in ('accountant','admin')
  ) then
    raise exception 'forbidden';
  end if;

  insert into public.classification_examples (text_content, label, embedding)
  values (p_text, p_label, p_embedding::vector)
  returning id into v_id;

  return v_id;
end;
$$;

-- Nightly maintenance for vector stats
create or replace function public.nightly_classification_maintenance()
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  perform analyze public.classification_examples;
  return jsonb_build_object('analyzed', true, 'timestamp', now());
end;
$$;

-- Schedule nightly job at 02:00 if not exists
insert into public.scheduled_jobs (id, name, description, function_name, cron_expression, enabled, created_at, updated_at, parameters)
select gen_random_uuid(), 'nightly_classification_maintenance', 'Atualiza estatísticas da base de exemplos de classificação', 'nightly_classification_maintenance', '0 2 * * *', true, now(), now(), '{}'::jsonb
where not exists (
  select 1 from public.scheduled_jobs where function_name = 'nightly_classification_maintenance'
);
