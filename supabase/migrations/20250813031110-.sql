-- Create private bucket for client message attachments
insert into storage.buckets (id, name, public)
values ('client-messages', 'client-messages', false)
on conflict (id) do nothing;

-- Drop existing policies to recreate safely
drop policy if exists "View client message attachments" on storage.objects;
drop policy if exists "Upload client message attachments" on storage.objects;
drop policy if exists "Update client message attachments (staff only)" on storage.objects;
drop policy if exists "Delete client message attachments (staff only)" on storage.objects;

-- View policy
create policy "View client message attachments"
  on storage.objects
  for select
  using (
    bucket_id = 'client-messages'
    and auth.role() = 'authenticated'
    and exists (
      select 1 from public.user_profiles up
      where up.user_id = auth.uid()
        and (
          up.role in ('admin','accountant')
          or up.company_id = (storage.foldername(name))[1]
        )
    )
  );

-- Insert policy
create policy "Upload client message attachments"
  on storage.objects
  for insert
  with check (
    bucket_id = 'client-messages'
    and auth.role() = 'authenticated'
    and exists (
      select 1 from public.user_profiles up
      where up.user_id = auth.uid()
        and (
          up.role in ('admin','accountant')
          or up.company_id = (storage.foldername(name))[1]
        )
    )
  );

-- Update policy (staff only)
create policy "Update client message attachments (staff only)"
  on storage.objects
  for update
  using (
    bucket_id = 'client-messages'
    and auth.role() = 'authenticated'
    and exists (
      select 1 from public.user_profiles up
      where up.user_id = auth.uid() and up.role in ('admin','accountant')
    )
  )
  with check (
    bucket_id = 'client-messages'
    and auth.role() = 'authenticated'
    and exists (
      select 1 from public.user_profiles up
      where up.user_id = auth.uid() and up.role in ('admin','accountant')
    )
  );

-- Delete policy (staff only)
create policy "Delete client message attachments (staff only)"
  on storage.objects
  for delete
  using (
    bucket_id = 'client-messages'
    and auth.role() = 'authenticated'
    and exists (
      select 1 from public.user_profiles up
      where up.user_id = auth.uid() and up.role in ('admin','accountant')
    )
  );