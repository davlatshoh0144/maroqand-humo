alter type public.certificate_status add value if not exists 'revoked';

alter table public.certificates
  add column if not exists revoked_at timestamptz,
  add column if not exists revoked_by uuid references public.profiles(id) on delete set null,
  add column if not exists revocation_reason text;

create index if not exists idx_lessons_free_course on public.lessons(course_id, is_free);
create index if not exists idx_enrollments_course_status on public.enrollments(course_id, status);
create index if not exists idx_lesson_progress_lesson_user on public.lesson_progress(lesson_id, user_id);
create index if not exists idx_quizzes_course_published on public.quizzes(course_id, published);
create index if not exists idx_assignments_course_published on public.assignments(course_id, published);
create index if not exists idx_submissions_assignment_user on public.assignment_submissions(assignment_id, user_id);
create index if not exists idx_notes_user_lesson on public.notes(user_id, lesson_id);
create index if not exists idx_discussions_course_created on public.discussions(course_id, created_at desc);
create index if not exists idx_discussion_replies_discussion_created on public.discussion_replies(discussion_id, created_at);
create index if not exists idx_certificates_public_verify on public.certificates(credential_id) where status = 'approved';
create index if not exists idx_certificate_verifications_credential_created on public.certificate_verifications(credential_id, created_at desc);
create index if not exists idx_crm_records_email_status on public.crm_records(lower(email), status);

create or replace function public.protect_profile_system_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and auth.uid() = old.id and not public.is_admin() then
    if new.email is distinct from old.email
      or new.role is distinct from old.role
      or new.status is distinct from old.status
    then
      raise exception 'Profile email, role, and status cannot be changed by the profile owner'
        using errcode = '42501';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists protect_profile_system_fields on public.profiles;
create trigger protect_profile_system_fields
before update of email, role, status on public.profiles
for each row execute function public.protect_profile_system_fields();

create or replace function public.validate_lesson_course_match()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  linked_course_id uuid;
begin
  if new.lesson_id is null or new.course_id is null then
    return new;
  end if;

  select l.course_id into linked_course_id
  from public.lessons l
  where l.id = new.lesson_id;

  if linked_course_id is null then
    raise exception 'Referenced lesson does not exist' using errcode = '23503';
  end if;

  if linked_course_id <> new.course_id then
    raise exception 'Lesson does not belong to the supplied course' using errcode = '23514';
  end if;

  return new;
end;
$$;

drop trigger if exists validate_quiz_lesson_course on public.quizzes;
create trigger validate_quiz_lesson_course
before insert or update of course_id, lesson_id on public.quizzes
for each row execute function public.validate_lesson_course_match();

drop trigger if exists validate_assignment_lesson_course on public.assignments;
create trigger validate_assignment_lesson_course
before insert or update of course_id, lesson_id on public.assignments
for each row execute function public.validate_lesson_course_match();

drop trigger if exists validate_note_lesson_course on public.notes;
create trigger validate_note_lesson_course
before insert or update of course_id, lesson_id on public.notes
for each row execute function public.validate_lesson_course_match();

drop trigger if exists validate_attendance_lesson_course on public.lesson_attendance;
create trigger validate_attendance_lesson_course
before insert or update of course_id, lesson_id on public.lesson_attendance
for each row execute function public.validate_lesson_course_match();

create or replace function public.validate_attendance_cohort_course()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  cohort_course_id uuid;
begin
  if new.cohort_id is null then
    return new;
  end if;

  select c.course_id into cohort_course_id
  from public.cohorts c
  where c.id = new.cohort_id;

  if cohort_course_id is not null and cohort_course_id <> new.course_id then
    raise exception 'Attendance cohort does not belong to the supplied course' using errcode = '23514';
  end if;

  return new;
end;
$$;

drop trigger if exists validate_attendance_cohort_course on public.lesson_attendance;
create trigger validate_attendance_cohort_course
before insert or update of course_id, cohort_id on public.lesson_attendance
for each row execute function public.validate_attendance_cohort_course();

create or replace function public.can_access_lesson(target_lesson_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.lessons l
    join public.courses c on c.id = l.course_id
    where l.id = target_lesson_id
      and c.published
      and (
        l.is_free
        or public.is_enrolled(l.course_id)
        or public.teaches_course(l.course_id)
      )
  );
$$;

create or replace function public.can_access_quiz(target_quiz_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.quizzes q
    join public.courses c on c.id = q.course_id
    where q.id = target_quiz_id
      and q.published
      and c.published
      and (
        public.is_enrolled(q.course_id)
        or public.teaches_course(q.course_id)
      )
  );
$$;

create or replace function public.can_access_assignment(target_assignment_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.assignments a
    join public.courses c on c.id = a.course_id
    where a.id = target_assignment_id
      and a.published
      and c.published
      and (
        public.is_enrolled(a.course_id)
        or public.teaches_course(a.course_id)
      )
  );
$$;

create or replace function public.submit_quiz_attempt(target_quiz_id uuid, submitted_answers jsonb)
returns public.quiz_attempts
language plpgsql
security definer
set search_path = public
as $$
declare
  quiz_record public.quizzes;
  inserted_attempt public.quiz_attempts;
  question jsonb;
  question_index integer;
  total_questions integer := 0;
  correct_answers integer := 0;
  correct_index integer;
  submitted_value text;
  calculated_score numeric(5,2);
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  select * into quiz_record
  from public.quizzes
  where id = target_quiz_id
    and published;

  if quiz_record.id is null then
    raise exception 'Quiz not found' using errcode = '02000';
  end if;

  if not public.can_access_quiz(target_quiz_id) then
    raise exception 'Quiz access denied' using errcode = '42501';
  end if;

  for question, question_index in
    select value, ordinality::integer - 1
    from jsonb_array_elements(coalesce(quiz_record.questions, '[]'::jsonb)) with ordinality
  loop
    total_questions := total_questions + 1;
    correct_index := nullif(question->>'correctIndex', '')::integer;
    submitted_value := submitted_answers->>(question->>'id');

    if submitted_value is null then
      submitted_value := submitted_answers->>question_index::text;
    end if;

    if submitted_value is not null and submitted_value::integer = correct_index then
      correct_answers := correct_answers + 1;
    end if;
  end loop;

  if total_questions = 0 then
    calculated_score := 0;
  else
    calculated_score := round((correct_answers::numeric / total_questions::numeric) * 100, 2);
  end if;

  insert into public.quiz_attempts (user_id, quiz_id, answers, score, passed, attempted_at)
  values (
    auth.uid(),
    target_quiz_id,
    coalesce(submitted_answers, '{}'::jsonb),
    calculated_score,
    calculated_score >= quiz_record.passing_score,
    now()
  )
  returning * into inserted_attempt;

  insert into public.audit_logs (actor_id, action, entity_table, entity_id, metadata)
  values (
    auth.uid(),
    'quiz_attempt_submitted',
    'quiz_attempts',
    inserted_attempt.id,
    jsonb_build_object('quiz_id', target_quiz_id, 'score', calculated_score)
  );

  return inserted_attempt;
end;
$$;

create or replace function public.issue_certificate_if_eligible(target_course_id uuid)
returns public.certificates
language plpgsql
security definer
set search_path = public
as $$
declare
  existing_certificate public.certificates;
  issued_certificate public.certificates;
  target_course public.courses;
  calculated_score numeric(5,2);
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  if public.current_profile_status() <> 'active' then
    raise exception 'Active account required' using errcode = '42501';
  end if;

  select * into target_course
  from public.courses
  where id = target_course_id;

  if target_course.id is null or not target_course.published or not target_course.certificate_available then
    raise exception 'Certificate is not available for this course' using errcode = '42501';
  end if;

  if not public.is_enrolled(target_course_id) then
    raise exception 'Active enrollment is required for certificates' using errcode = '42501';
  end if;

  select * into existing_certificate
  from public.certificates
  where student_id = auth.uid()
    and course_id = target_course_id;

  if existing_certificate.id is not null then
    return existing_certificate;
  end if;

  if not public.certificate_requirements_met(auth.uid(), target_course_id) then
    raise exception 'Certificate requirements are not met' using errcode = '42501';
  end if;

  select coalesce(avg(best_score), 100)
  into calculated_score
  from (
    select max(qa.score) as best_score
    from public.quizzes q
    join public.quiz_attempts qa on qa.quiz_id = q.id
    where q.course_id = target_course_id
      and qa.user_id = auth.uid()
    group by q.id
  ) scores;

  insert into public.certificates (
    student_id,
    course_id,
    credential_id,
    score,
    status
  )
  values (
    auth.uid(),
    target_course_id,
    'MHA-' || upper(left(replace(gen_random_uuid()::text, '-', ''), 12)),
    calculated_score,
    'pending'
  )
  returning * into issued_certificate;

  insert into public.audit_logs (actor_id, action, entity_table, entity_id, metadata)
  values (auth.uid(), 'certificate_requested', 'certificates', issued_certificate.id, jsonb_build_object('course_id', target_course_id));

  return issued_certificate;
end;
$$;

create or replace function public.verify_certificate_public(input_credential_id text)
returns table (
  credential_id text,
  status text,
  student_name text,
  course_title text,
  issued_at timestamptz,
  score numeric
)
language plpgsql
security definer
set search_path = public
as $$
declare
  matched_certificate_id uuid;
  normalized_credential_id text := upper(trim(input_credential_id));
begin
  select c.id into matched_certificate_id
  from public.certificates c
  where c.credential_id = normalized_credential_id
    and c.status = 'approved'
    and c.revoked_at is null
  limit 1;

  insert into public.certificate_verifications (certificate_id, credential_id, verified)
  values (matched_certificate_id, normalized_credential_id, matched_certificate_id is not null);

  return query
  select
    c.credential_id,
    c.status::text,
    p.name as student_name,
    co.title as course_title,
    c.issued_at,
    c.score
  from public.certificates c
  join public.profiles p on p.id = c.student_id
  join public.courses co on co.id = c.course_id
  where c.id = matched_certificate_id;
end;
$$;

create or replace function public.revoke_certificate(target_certificate_id uuid, reason text default null)
returns public.certificates
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_certificate public.certificates;
begin
  if auth.uid() is null or not public.is_admin() then
    raise exception 'Admin permission required' using errcode = '42501';
  end if;

  update public.certificates
  set
    status = 'revoked',
    revoked_at = now(),
    revoked_by = auth.uid(),
    revocation_reason = nullif(trim(reason), ''),
    updated_at = now()
  where id = target_certificate_id
  returning * into updated_certificate;

  if updated_certificate.id is null then
    raise exception 'Certificate not found' using errcode = '02000';
  end if;

  insert into public.audit_logs (actor_id, action, entity_table, entity_id, metadata)
  values (
    auth.uid(),
    'certificate_revoked',
    'certificates',
    target_certificate_id,
    jsonb_build_object('reason', nullif(trim(reason), ''))
  );

  return updated_certificate;
end;
$$;

create or replace function public.lms_schema_inventory()
returns jsonb
language plpgsql
security definer
set search_path = public, storage
as $$
begin
  if auth.role() <> 'service_role' and not public.is_admin() then
    raise exception 'Admin permission required' using errcode = '42501';
  end if;

  return jsonb_build_object(
    'tables', (
      select coalesce(jsonb_agg(table_name order by table_name), '[]'::jsonb)
      from information_schema.tables
      where table_schema = 'public'
        and table_type = 'BASE TABLE'
    ),
    'indexes', (
      select coalesce(jsonb_agg(indexname order by indexname), '[]'::jsonb)
      from pg_indexes
      where schemaname = 'public'
    ),
    'functions', (
      select coalesce(jsonb_agg(proname order by proname), '[]'::jsonb)
      from pg_proc p
      join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public'
    ),
    'triggers', (
      select coalesce(jsonb_agg(t.tgname order by t.tgname), '[]'::jsonb)
      from pg_trigger t
      join pg_class c on c.oid = t.tgrelid
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public'
        and not t.tgisinternal
    ),
    'policies', (
      select coalesce(jsonb_agg(policyname order by policyname), '[]'::jsonb)
      from pg_policies
      where schemaname in ('public', 'storage')
    ),
    'buckets', (
      select coalesce(jsonb_agg(id order by id), '[]'::jsonb)
      from storage.buckets
    )
  );
end;
$$;

revoke all on function public.issue_certificate_if_eligible(uuid) from public;
grant execute on function public.issue_certificate_if_eligible(uuid) to authenticated;

revoke all on function public.submit_quiz_attempt(uuid, jsonb) from public;
grant execute on function public.submit_quiz_attempt(uuid, jsonb) to authenticated;

revoke all on function public.verify_certificate_public(text) from public;
grant execute on function public.verify_certificate_public(text) to anon, authenticated;

revoke all on function public.revoke_certificate(uuid, text) from public;
grant execute on function public.revoke_certificate(uuid, text) to authenticated;

revoke all on function public.lms_schema_inventory() from public;
grant execute on function public.lms_schema_inventory() to authenticated, service_role;

drop policy if exists "progress_student_own" on public.lesson_progress;
create policy "progress_student_own"
on public.lesson_progress for all
to authenticated
using (user_id = auth.uid() and public.can_access_lesson(lesson_id))
with check (user_id = auth.uid() and public.can_access_lesson(lesson_id));

drop policy if exists "quiz_attempts_student_own" on public.quiz_attempts;
drop policy if exists "quiz_attempts_student_select_own" on public.quiz_attempts;
create policy "quiz_attempts_student_select_own"
on public.quiz_attempts for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "submissions_student_insert_submitted" on public.assignment_submissions;
create policy "submissions_student_insert_submitted"
on public.assignment_submissions for insert
to authenticated
with check (
  user_id = auth.uid()
  and public.can_access_assignment(assignment_id)
  and status = 'submitted'
  and score is null
  and feedback is null
  and reviewed_by is null
  and reviewed_at is null
);

drop policy if exists "submissions_student_update_unreviewed" on public.assignment_submissions;
create policy "submissions_student_update_unreviewed"
on public.assignment_submissions for update
to authenticated
using (
  user_id = auth.uid()
  and public.can_access_assignment(assignment_id)
  and status = 'submitted'
  and reviewed_by is null
  and reviewed_at is null
)
with check (
  user_id = auth.uid()
  and public.can_access_assignment(assignment_id)
  and status = 'submitted'
  and score is null
  and feedback is null
  and reviewed_by is null
  and reviewed_at is null
);

drop policy if exists "discussions_student_create" on public.discussions;
create policy "discussions_student_create"
on public.discussions for insert
to authenticated
with check (
  user_id = auth.uid()
  and (not is_pinned or public.is_admin() or public.teaches_course(course_id))
  and (not is_announcement or public.is_admin() or public.teaches_course(course_id))
  and (
    course_id is null
    or public.is_enrolled(course_id)
    or public.teaches_course(course_id)
  )
);

drop policy if exists "discussions_author_update" on public.discussions;
create policy "discussions_author_update"
on public.discussions for update
to authenticated
using (
  user_id = auth.uid()
  or public.is_admin()
  or public.teaches_course(course_id)
)
with check (
  public.is_admin()
  or public.teaches_course(course_id)
  or (
    user_id = auth.uid()
    and not is_pinned
    and not is_announcement
  )
);

drop policy if exists "discussion_replies_create" on public.discussion_replies;
create policy "discussion_replies_create"
on public.discussion_replies for insert
to authenticated
with check (
  user_id = auth.uid()
  and (
    not is_instructor
    or public.is_admin()
    or exists (
      select 1
      from public.discussions d
      where d.id = discussion_replies.discussion_id
        and (
          public.teaches_course(d.course_id)
          or (d.course_id is null and public.is_instructor())
        )
    )
  )
  and exists (
    select 1
    from public.discussions d
    where d.id = discussion_replies.discussion_id
      and (
        d.course_id is null
        or public.is_enrolled(d.course_id)
        or public.teaches_course(d.course_id)
      )
  )
);

drop policy if exists "discussion_replies_author_or_teacher_update" on public.discussion_replies;
create policy "discussion_replies_author_or_teacher_update"
on public.discussion_replies for update
to authenticated
using (
  user_id = auth.uid()
  or public.is_admin()
  or exists (
    select 1
    from public.discussions d
    where d.id = discussion_replies.discussion_id
      and public.teaches_course(d.course_id)
  )
)
with check (
  (
    not is_instructor
    or public.is_admin()
    or exists (
      select 1
      from public.discussions d
      where d.id = discussion_replies.discussion_id
        and (
          public.teaches_course(d.course_id)
          or (d.course_id is null and public.is_instructor())
        )
    )
  )
  and (
    user_id = auth.uid()
    or public.is_admin()
    or exists (
      select 1
      from public.discussions d
      where d.id = discussion_replies.discussion_id
        and public.teaches_course(d.course_id)
    )
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
