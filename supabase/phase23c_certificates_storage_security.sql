-- Phase 23C: certificates bucket Storage policy hardening.
-- Run in Supabase SQL Editor if Dashboard-created certificates policies are broad.

drop policy if exists "certificates_private_read" on storage.objects;
create policy "certificates_private_read"
on storage.objects for select
to authenticated
using (
  bucket_id = 'certificates'
  and (
    (storage.foldername(name))[1] = auth.uid()::text
    or public.is_admin()
    or public.teaches_course(public.safe_uuid((storage.foldername(name))[2]))
  )
);

drop policy if exists "certificates_admin_write" on storage.objects;
create policy "certificates_admin_write"
on storage.objects for insert
to authenticated
with check (bucket_id = 'certificates' and public.is_admin());

drop policy if exists "certificates_admin_update" on storage.objects;
create policy "certificates_admin_update"
on storage.objects for update
to authenticated
using (bucket_id = 'certificates' and public.is_admin())
with check (bucket_id = 'certificates' and public.is_admin());

drop policy if exists "certificates_admin_delete" on storage.objects;
create policy "certificates_admin_delete"
on storage.objects for delete
to authenticated
using (bucket_id = 'certificates' and public.is_admin());
