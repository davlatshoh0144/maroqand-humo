# Storage Policy Setup

This LMS uses four Supabase Storage buckets:

- `avatars`: public bucket for profile images. App path convention: `{user_id}/{file_name}`.
- `course-resources`: private bucket for course files. App path convention: `{course_id}/{file_name}`.
- `certificates`: private bucket for generated certificate PDFs. App path convention: `{student_id}/{course_id}/{file_name}`.
- `assignment-submissions`: private bucket for student submissions. App path convention: `{student_id}/{assignment_id}/{file_name}`.

If Supabase SQL Editor reports an ownership error while creating policies on `storage.objects`, use the Dashboard policy builder. The policy expressions below are the exact expressions to enter.

## Dashboard Steps

1. Open Supabase Dashboard.
2. Go to **Storage**.
3. Confirm these buckets exist: `avatars`, `course-resources`, `certificates`, `assignment-submissions`.
4. Open **Policies**.
5. Select the bucket or `storage.objects`.
6. Create the policies below with the exact names and expressions.

### avatars_public_read

- Operation: `SELECT`
- Target roles: `anon`, `authenticated`
- USING:

```sql
bucket_id = 'avatars'
```

### avatars_owner_write

- Operations: `INSERT`, `UPDATE`, `DELETE`
- Target role: `authenticated`
- USING for update/delete:

```sql
bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
```

- WITH CHECK for insert/update:

```sql
bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
```

### course_resources_authorized_read

- Operation: `SELECT`
- Target role: `authenticated`
- USING:

```sql
bucket_id = 'course-resources'
and (
  public.is_admin()
  or public.teaches_course(public.safe_uuid((storage.foldername(name))[1]))
  or public.is_enrolled(public.safe_uuid((storage.foldername(name))[1]))
)
```

### course_resources_teacher_write

- Operations: `INSERT`, `UPDATE`, `DELETE`
- Target role: `authenticated`
- USING for update/delete:

```sql
bucket_id = 'course-resources'
and (
  public.is_admin()
  or public.teaches_course(public.safe_uuid((storage.foldername(name))[1]))
)
```

- WITH CHECK for insert/update:

```sql
bucket_id = 'course-resources'
and (
  public.is_admin()
  or public.teaches_course(public.safe_uuid((storage.foldername(name))[1]))
)
```

### certificates_admin_write

- Operation: `INSERT`
- Target role: `authenticated`
- WITH CHECK:

```sql
bucket_id = 'certificates' and public.is_admin()
```

### certificates_admin_update

- Operation: `UPDATE`
- Target role: `authenticated`
- USING:

```sql
bucket_id = 'certificates' and public.is_admin()
```

- WITH CHECK:

```sql
bucket_id = 'certificates' and public.is_admin()
```

### certificates_admin_delete

- Operation: `DELETE`
- Target role: `authenticated`
- USING:

```sql
bucket_id = 'certificates' and public.is_admin()
```

### assignment_upload_owner_or_teacher

This policy is already present in the Phase 22 hardening migration, but it is included here for full bucket coverage.

- Operations: `SELECT`, `INSERT`, `UPDATE`, `DELETE`
- Target role: `authenticated`
- USING and WITH CHECK:

```sql
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
```

### certificates_private_read

This policy is already present in the Phase 22 hardening migration, but it is included here for full bucket coverage.

- Operation: `SELECT`
- Target role: `authenticated`
- USING:

```sql
bucket_id = 'certificates'
and (
  (storage.foldername(name))[1] = auth.uid()::text
  or public.is_admin()
  or public.teaches_course(public.safe_uuid((storage.foldername(name))[2]))
)
```

## SQL Alternative

If your Supabase SQL Editor can create policies on `storage.objects`, run `supabase/storage_policies.sql`. It intentionally does not run `alter table storage.objects enable row level security`, because hosted Supabase owns that table and already manages Storage RLS.
