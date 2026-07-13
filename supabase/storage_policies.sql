drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'avatars');

drop policy if exists "avatars_owner_write" on storage.objects;
create policy "avatars_owner_write"
on storage.objects for all
to authenticated
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "course_resources_authorized_read" on storage.objects;
create policy "course_resources_authorized_read"
on storage.objects for select
to authenticated
using (
  bucket_id = 'course-resources'
  and (
    public.is_admin()
    or public.teaches_course(public.safe_uuid((storage.foldername(name))[1]))
    or public.is_enrolled(public.safe_uuid((storage.foldername(name))[1]))
  )
);

drop policy if exists "course_resources_teacher_write" on storage.objects;
create policy "course_resources_teacher_write"
on storage.objects for all
to authenticated
using (
  bucket_id = 'course-resources'
  and (
    public.is_admin()
    or public.teaches_course(public.safe_uuid((storage.foldername(name))[1]))
  )
)
with check (
  bucket_id = 'course-resources'
  and (
    public.is_admin()
    or public.teaches_course(public.safe_uuid((storage.foldername(name))[1]))
  )
);

drop policy if exists "assignment_upload_owner_or_teacher" on storage.objects;
create policy "assignment_upload_owner_or_teacher"
on storage.objects for all
to authenticated
using (
  bucket_id = 'assignment-submissions'
  and (
    (
      (storage.foldername(name))[1] = auth.uid()::text
      and public.can_access_assignment(public.safe_uuid((storage.foldername(name))[2]))
    )
    or public.is_admin()
    or exists (
      select 1
      from public.assignments a
      where a.id = public.safe_uuid((storage.foldername(name))[2])
        and public.teaches_course(a.course_id)
    )
  )
)
with check (
  bucket_id = 'assignment-submissions'
  and (
    (
      (storage.foldername(name))[1] = auth.uid()::text
      and public.can_access_assignment(public.safe_uuid((storage.foldername(name))[2]))
    )
    or public.is_admin()
    or exists (
      select 1
      from public.assignments a
      where a.id = public.safe_uuid((storage.foldername(name))[2])
        and public.teaches_course(a.course_id)
    )
  )
);

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
