create or replace function public.current_profile_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select p.role
  from public.profiles p
  where p.id = auth.uid()
    and p.status = 'active'
  limit 1;
$$;

create or replace function public.current_profile_status()
returns public.account_status
language sql
stable
security definer
set search_path = public
as $$
  select p.status
  from public.profiles p
  where p.id = auth.uid()
  limit 1;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_profile_role() = 'admin', false);
$$;

create or replace function public.is_instructor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_profile_role() = 'instructor', false);
$$;

create or replace function public.teaches_course(target_course_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin()
    or exists (
      select 1
      from public.courses c
      where c.id = target_course_id
        and c.instructor_id = auth.uid()
    );
$$;

create or replace function public.is_enrolled(target_course_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.enrollments e
    where e.course_id = target_course_id
      and e.user_id = auth.uid()
      and e.status in ('active', 'completed')
  );
$$;

create or replace function public.safe_uuid(input text)
returns uuid
language plpgsql
immutable
as $$
begin
  return input::uuid;
exception when others then
  return null;
end;
$$;

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.lessons enable row level security;
alter table public.enrollments enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.quizzes enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.assignments enable row level security;
alter table public.assignment_submissions enable row level security;
alter table public.notes enable row level security;
alter table public.discussions enable row level security;
alter table public.discussion_replies enable row level security;
alter table public.certificates enable row level security;
alter table public.certificate_verifications enable row level security;
alter table public.pricing_plans enable row level security;
alter table public.cohorts enable row level security;
alter table public.student_applications enable row level security;
alter table public.cohort_enrollments enable row level security;
alter table public.lesson_attendance enable row level security;
alter table public.crm_records enable row level security;
alter table public.audit_logs enable row level security;

drop policy if exists "profiles_select_self" on public.profiles;
create policy "profiles_select_self"
on public.profiles for select
to authenticated
using (id = auth.uid());

drop policy if exists "profiles_select_students_for_instructors" on public.profiles;
create policy "profiles_select_students_for_instructors"
on public.profiles for select
to authenticated
using (
  public.is_admin()
  or exists (
    select 1
    from public.enrollments e
    join public.courses c on c.id = e.course_id
    where e.user_id = profiles.id
      and c.instructor_id = auth.uid()
  )
);

drop policy if exists "profiles_update_own_basics" on public.profiles;
create policy "profiles_update_own_basics"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (
  id = auth.uid()
  and role = public.current_profile_role()
  and status = public.current_profile_status()
);

drop policy if exists "profiles_admin_all" on public.profiles;
create policy "profiles_admin_all"
on public.profiles for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "courses_public_catalog" on public.courses;
create policy "courses_public_catalog"
on public.courses for select
to anon, authenticated
using (published = true);

drop policy if exists "courses_instructor_manage" on public.courses;
create policy "courses_instructor_manage"
on public.courses for all
to authenticated
using (public.is_admin() or instructor_id = auth.uid())
with check (public.is_admin() or instructor_id = auth.uid());

drop policy if exists "lessons_public_published" on public.lessons;
create policy "lessons_public_published"
on public.lessons for select
to anon, authenticated
using (
  is_free
  and
  exists (
    select 1 from public.courses c
    where c.id = lessons.course_id
      and c.published
  )
);

drop policy if exists "lessons_enrolled_or_teacher_read" on public.lessons;
create policy "lessons_enrolled_or_teacher_read"
on public.lessons for select
to authenticated
using (public.is_enrolled(course_id) or public.teaches_course(course_id));

drop policy if exists "lessons_teacher_manage" on public.lessons;
create policy "lessons_teacher_manage"
on public.lessons for all
to authenticated
using (public.teaches_course(course_id))
with check (public.teaches_course(course_id));

drop policy if exists "enrollments_student_own" on public.enrollments;
create policy "enrollments_student_own"
on public.enrollments for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "enrollments_student_create" on public.enrollments;

drop policy if exists "enrollments_student_update" on public.enrollments;
drop policy if exists "enrollments_student_drop_own" on public.enrollments;
create policy "enrollments_student_drop_own"
on public.enrollments for update
to authenticated
using (user_id = auth.uid())
with check (
  user_id = auth.uid()
  and status = 'dropped'
);

drop policy if exists "enrollments_teacher_read" on public.enrollments;
create policy "enrollments_teacher_read"
on public.enrollments for select
to authenticated
using (public.teaches_course(course_id));

drop policy if exists "enrollments_admin_all" on public.enrollments;
create policy "enrollments_admin_all"
on public.enrollments for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "progress_student_own" on public.lesson_progress;
create policy "progress_student_own"
on public.lesson_progress for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "progress_teacher_read" on public.lesson_progress;
create policy "progress_teacher_read"
on public.lesson_progress for select
to authenticated
using (
  exists (
    select 1
    from public.lessons l
    where l.id = lesson_progress.lesson_id
      and public.teaches_course(l.course_id)
  )
);

drop policy if exists "progress_admin_all" on public.lesson_progress;
create policy "progress_admin_all"
on public.lesson_progress for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "quizzes_enrolled_read" on public.quizzes;
create policy "quizzes_enrolled_read"
on public.quizzes for select
to authenticated
using (published and (public.is_enrolled(course_id) or public.teaches_course(course_id)));

drop policy if exists "quizzes_teacher_manage" on public.quizzes;
create policy "quizzes_teacher_manage"
on public.quizzes for all
to authenticated
using (public.teaches_course(course_id))
with check (public.teaches_course(course_id));

drop policy if exists "quiz_attempts_student_own" on public.quiz_attempts;
create policy "quiz_attempts_student_own"
on public.quiz_attempts for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "quiz_attempts_teacher_read" on public.quiz_attempts;
create policy "quiz_attempts_teacher_read"
on public.quiz_attempts for select
to authenticated
using (
  exists (
    select 1
    from public.quizzes q
    where q.id = quiz_attempts.quiz_id
      and public.teaches_course(q.course_id)
  )
);

drop policy if exists "quiz_attempts_admin_all" on public.quiz_attempts;
create policy "quiz_attempts_admin_all"
on public.quiz_attempts for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "assignments_enrolled_read" on public.assignments;
create policy "assignments_enrolled_read"
on public.assignments for select
to authenticated
using (published and (public.is_enrolled(course_id) or public.teaches_course(course_id)));

drop policy if exists "assignments_teacher_manage" on public.assignments;
create policy "assignments_teacher_manage"
on public.assignments for all
to authenticated
using (public.teaches_course(course_id))
with check (public.teaches_course(course_id));

drop policy if exists "submissions_student_own" on public.assignment_submissions;
drop policy if exists "submissions_student_select_own" on public.assignment_submissions;
create policy "submissions_student_select_own"
on public.assignment_submissions for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "submissions_student_insert_submitted" on public.assignment_submissions;
create policy "submissions_student_insert_submitted"
on public.assignment_submissions for insert
to authenticated
with check (
  user_id = auth.uid()
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
  and status = 'submitted'
  and reviewed_by is null
  and reviewed_at is null
)
with check (
  user_id = auth.uid()
  and status = 'submitted'
  and score is null
  and feedback is null
  and reviewed_by is null
  and reviewed_at is null
);

drop policy if exists "submissions_teacher_review" on public.assignment_submissions;
create policy "submissions_teacher_review"
on public.assignment_submissions for select
to authenticated
using (
  exists (
    select 1
    from public.assignments a
    where a.id = assignment_submissions.assignment_id
      and public.teaches_course(a.course_id)
  )
);

drop policy if exists "submissions_teacher_update" on public.assignment_submissions;
create policy "submissions_teacher_update"
on public.assignment_submissions for update
to authenticated
using (
  exists (
    select 1
    from public.assignments a
    where a.id = assignment_submissions.assignment_id
      and public.teaches_course(a.course_id)
  )
)
with check (
  exists (
    select 1
    from public.assignments a
    where a.id = assignment_submissions.assignment_id
      and public.teaches_course(a.course_id)
  )
);

drop policy if exists "submissions_admin_all" on public.assignment_submissions;
create policy "submissions_admin_all"
on public.assignment_submissions for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "notes_student_own" on public.notes;
create policy "notes_student_own"
on public.notes for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "notes_admin_all" on public.notes;
create policy "notes_admin_all"
on public.notes for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "discussions_enrolled_read" on public.discussions;
create policy "discussions_enrolled_read"
on public.discussions for select
to authenticated
using (
  course_id is null
  or public.is_enrolled(course_id)
  or public.teaches_course(course_id)
);

drop policy if exists "discussions_public_announcements" on public.discussions;
create policy "discussions_public_announcements"
on public.discussions for select
to anon, authenticated
using (
  is_announcement
  and exists (select 1 from public.courses c where c.id = discussions.course_id and c.published)
);

drop policy if exists "discussions_student_create" on public.discussions;
create policy "discussions_student_create"
on public.discussions for insert
to authenticated
with check (
  user_id = auth.uid()
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
using (user_id = auth.uid() or public.is_admin() or public.teaches_course(course_id))
with check (user_id = auth.uid() or public.is_admin() or public.teaches_course(course_id));

drop policy if exists "discussion_replies_enrolled_read" on public.discussion_replies;
create policy "discussion_replies_enrolled_read"
on public.discussion_replies for select
to authenticated
using (
  exists (
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

drop policy if exists "discussion_replies_create" on public.discussion_replies;
create policy "discussion_replies_create"
on public.discussion_replies for insert
to authenticated
with check (
  user_id = auth.uid()
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
  user_id = auth.uid()
  or public.is_admin()
  or exists (
    select 1
    from public.discussions d
    where d.id = discussion_replies.discussion_id
      and public.teaches_course(d.course_id)
  )
);

drop policy if exists "certificates_student_own" on public.certificates;
create policy "certificates_student_own"
on public.certificates for select
to authenticated
using (student_id = auth.uid());

drop policy if exists "certificates_teacher_read" on public.certificates;
create policy "certificates_teacher_read"
on public.certificates for select
to authenticated
using (public.teaches_course(course_id));

drop policy if exists "certificates_admin_all" on public.certificates;
create policy "certificates_admin_all"
on public.certificates for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "pricing_public_read" on public.pricing_plans;
create policy "pricing_public_read"
on public.pricing_plans for select
to anon, authenticated
using (is_active);

drop policy if exists "pricing_admin_all" on public.pricing_plans;
create policy "pricing_admin_all"
on public.pricing_plans for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "cohorts_public_read" on public.cohorts;
create policy "cohorts_public_read"
on public.cohorts for select
to anon, authenticated
using (status in ('planned', 'active'));

drop policy if exists "cohorts_admin_all" on public.cohorts;
create policy "cohorts_admin_all"
on public.cohorts for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "student_applications_public_insert" on public.student_applications;
create policy "student_applications_public_insert"
on public.student_applications for insert
to anon, authenticated
with check (
  status = 'applied'
  and reviewer_id is null
  and reviewed_at is null
);

drop policy if exists "student_applications_applicant_read" on public.student_applications;
create policy "student_applications_applicant_read"
on public.student_applications for select
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and lower(p.email) = lower(student_applications.email)
  )
);

drop policy if exists "student_applications_admin_instructor_read" on public.student_applications;
create policy "student_applications_admin_instructor_read"
on public.student_applications for select
to authenticated
using (public.is_admin() or public.is_instructor());

drop policy if exists "student_applications_admin_update" on public.student_applications;
create policy "student_applications_admin_update"
on public.student_applications for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "cohort_enrollments_student_read" on public.cohort_enrollments;
create policy "cohort_enrollments_student_read"
on public.cohort_enrollments for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "cohort_enrollments_instructor_read" on public.cohort_enrollments;
create policy "cohort_enrollments_instructor_read"
on public.cohort_enrollments for select
to authenticated
using (
  public.is_admin()
  or exists (
    select 1
    from public.cohorts co
    where co.id = cohort_enrollments.cohort_id
      and (co.course_id is null or public.teaches_course(co.course_id))
  )
);

drop policy if exists "cohort_enrollments_admin_all" on public.cohort_enrollments;
create policy "cohort_enrollments_admin_all"
on public.cohort_enrollments for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "lesson_attendance_student_read" on public.lesson_attendance;
create policy "lesson_attendance_student_read"
on public.lesson_attendance for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "lesson_attendance_instructor_manage" on public.lesson_attendance;
create policy "lesson_attendance_instructor_manage"
on public.lesson_attendance for all
to authenticated
using (public.teaches_course(course_id))
with check (public.teaches_course(course_id));

drop policy if exists "lesson_attendance_admin_all" on public.lesson_attendance;
create policy "lesson_attendance_admin_all"
on public.lesson_attendance for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "crm_records_public_lead_insert" on public.crm_records;
create policy "crm_records_public_lead_insert"
on public.crm_records for insert
to anon, authenticated
with check (
  type = 'lead'
  and status = 'new'
  and owner_id is null
);

drop policy if exists "crm_records_admin_instructor_read" on public.crm_records;
create policy "crm_records_admin_instructor_read"
on public.crm_records for select
to authenticated
using (public.is_admin() or public.is_instructor());

drop policy if exists "crm_records_admin_update" on public.crm_records;
create policy "crm_records_admin_update"
on public.crm_records for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "crm_records_admin_all" on public.crm_records;
create policy "crm_records_admin_all"
on public.crm_records for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "audit_admin_read" on public.audit_logs;
create policy "audit_admin_read"
on public.audit_logs for select
to authenticated
using (public.is_admin());

drop policy if exists "audit_authenticated_insert" on public.audit_logs;
create policy "audit_authenticated_insert"
on public.audit_logs for insert
to authenticated
with check (actor_id = auth.uid() or public.is_admin());

alter table storage.objects enable row level security;

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
  and (public.is_admin() or public.teaches_course(public.safe_uuid((storage.foldername(name))[1])))
)
with check (
  bucket_id = 'course-resources'
  and (public.is_admin() or public.teaches_course(public.safe_uuid((storage.foldername(name))[1])))
);

drop policy if exists "assignment_upload_owner_or_teacher" on storage.objects;
create policy "assignment_upload_owner_or_teacher"
on storage.objects for all
to authenticated
using (
  bucket_id = 'assignment-submissions'
  and (
    (storage.foldername(name))[1] = auth.uid()::text
    or public.is_admin()
    or public.is_instructor()
  )
)
with check (
  bucket_id = 'assignment-submissions'
  and (
    (storage.foldername(name))[1] = auth.uid()::text
    or public.is_admin()
    or public.is_instructor()
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
