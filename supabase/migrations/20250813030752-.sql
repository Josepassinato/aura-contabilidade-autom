-- Create private bucket for client message attachments
insert into storage.buckets (id, name, public)
values ('client-messages', 'client-messages', false)
on conflict (id) do nothing;

-- Policies for client-messages bucket
-- Allow authenticated users (clients, accountants, admins) to read files for their company/client
create policy if not exists "View client message attachments"
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

-- Allow clients/accountants/admins to upload files into folders named by client_id
create policy if not exists "Upload client message attachments"
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

-- Allow update only to accountants/admins
create policy if not exists "Update client message attachments (staff only)"
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

-- Allow delete only to accountants/admins
create policy if not exists "Delete client message attachments (staff only)"
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