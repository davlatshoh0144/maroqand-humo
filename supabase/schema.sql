create extension if not exists "pgcrypto";

do $$
begin
  create type public.user_role as enum ('student', 'instructor', 'admin');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.account_status as enum ('active', 'suspended');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.enrollment_status as enum ('active', 'completed', 'dropped');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.assignment_submission_status as enum ('submitted', 'reviewed', 'graded', 'approved', 'rejected');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.certificate_status as enum ('pending', 'approved', 'rejected');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.student_application_status as enum ('applied', 'reviewing', 'accepted', 'rejected', 'enrolled');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.cohort_status as enum ('planned', 'active', 'completed', 'archived');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.lesson_attendance_status as enum ('present', 'absent', 'late', 'excused');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.crm_record_type as enum ('lead', 'applicant', 'student', 'graduate');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.crm_record_status as enum ('new', 'contacted', 'qualified', 'converted', 'closed');
exception when duplicate_object then null;
end $$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  name text not null,
  avatar_url text,
  city text,
  bio text,
  phone text,
  role public.user_role not null default 'student',
  status public.account_status not null default 'active',
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  subtitle text not null default '',
  description text not null default '',
  category text not null default 'Dispatch',
  image_url text not null default '',
  difficulty text not null default 'beginner' check (difficulty in ('beginner', 'intermediate', 'advanced')),
  duration_hours numeric(8,2) not null default 0,
  instructor_id uuid references public.profiles(id) on delete set null,
  instructor_name text not null default '',
  instructor_bio text not null default '',
  instructor_avatar_url text not null default '',
  enrollment_count integer not null default 0,
  certificate_available boolean not null default true,
  learning_outcomes text[] not null default '{}',
  prerequisites text[] not null default '{}',
  common_mistakes text[] not null default '{}',
  quiz_threshold integer not null default 70 check (quiz_threshold between 0 and 100),
  published boolean not null default false,
  last_updated date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  order_index integer not null,
  title text not null,
  description text not null default '',
  content text not null default '',
  video_url text,
  duration_min integer not null default 30 check (duration_min >= 0),
  is_free boolean not null default false,
  is_required boolean not null default true,
  checklist text[] not null default '{}',
  resources jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (course_id, order_index)
);

create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  status public.enrollment_status not null default 'active',
  enrolled_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, course_id)
);

create table if not exists public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  completed boolean not null default false,
  checklist_data jsonb not null default '{}'::jsonb,
  completed_at timestamptz,
  time_spent_seconds integer not null default 0 check (time_spent_seconds >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  lesson_id uuid references public.lessons(id) on delete cascade,
  title text not null,
  questions jsonb not null default '[]'::jsonb,
  passing_score integer not null default 70 check (passing_score between 0 and 100),
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  answers jsonb not null default '{}'::jsonb,
  score numeric(5,2) not null default 0 check (score between 0 and 100),
  passed boolean not null default false,
  attempted_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  lesson_id uuid references public.lessons(id) on delete cascade,
  title text not null,
  description text not null default '',
  instructions text not null default '',
  scenario text not null default '',
  rubric jsonb not null default '[]'::jsonb,
  type text not null default 'scenario' check (type in ('email', 'calculation', 'review', 'checklist', 'scenario')),
  difficulty text not null default 'beginner' check (difficulty in ('beginner', 'intermediate', 'advanced')),
  due_date timestamptz,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.assignment_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  response text not null default '',
  file_path text,
  score numeric(5,2) check (score between 0 and 100),
  feedback text,
  status public.assignment_submission_status not null default 'submitted',
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid references public.courses(id) on delete cascade,
  lesson_id uuid references public.lessons(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.discussions (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete cascade,
  lesson_id uuid references public.lessons(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  content text not null,
  is_pinned boolean not null default false,
  is_announcement boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.discussion_replies (
  id uuid primary key default gen_random_uuid(),
  discussion_id uuid not null references public.discussions(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  is_helpful boolean not null default false,
  is_instructor boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  credential_id text not null unique,
  issued_at timestamptz not null default now(),
  score numeric(5,2) not null default 0 check (score between 0 and 100),
  status public.certificate_status not null default 'pending',
  approved_at timestamptz,
  approved_by uuid references public.profiles(id) on delete set null,
  pdf_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, course_id)
);

create table if not exists public.certificate_verifications (
  id uuid primary key default gen_random_uuid(),
  certificate_id uuid references public.certificates(id) on delete set null,
  credential_id text not null,
  verified boolean not null default false,
  verified_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.pricing_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  price numeric(10,2) not null default 0,
  currency text not null default 'USD',
  interval text not null default 'one_time' check (interval in ('month', 'year', 'one_time')),
  features text[] not null default '{}',
  is_popular boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cohorts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  course_id uuid references public.courses(id) on delete set null,
  instructor_id uuid references public.profiles(id) on delete set null,
  starts_at date not null,
  ends_at date,
  capacity integer not null default 25 check (capacity > 0),
  status public.cohort_status not null default 'planned',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.student_applications (
  id uuid primary key default gen_random_uuid(),
  applicant_name text not null,
  email text not null,
  phone text,
  city text,
  experience_level text not null default 'new' check (experience_level in ('new', 'some_experience', 'working_dispatcher')),
  preferred_cohort_id uuid references public.cohorts(id) on delete set null,
  course_interest text,
  motivation text not null,
  status public.student_application_status not null default 'applied',
  reviewer_id uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cohort_enrollments (
  id uuid primary key default gen_random_uuid(),
  cohort_id uuid not null references public.cohorts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  application_id uuid references public.student_applications(id) on delete set null,
  status public.enrollment_status not null default 'active',
  enrolled_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (cohort_id, user_id)
);

create table if not exists public.lesson_attendance (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  cohort_id uuid references public.cohorts(id) on delete set null,
  status public.lesson_attendance_status not null default 'present',
  attended_at timestamptz,
  recorded_by uuid references public.profiles(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

create table if not exists public.crm_records (
  id uuid primary key default gen_random_uuid(),
  type public.crm_record_type not null,
  name text not null,
  email text not null,
  phone text,
  source text,
  status public.crm_record_status not null default 'new',
  owner_id uuid references public.profiles(id) on delete set null,
  last_contact_at timestamptz,
  follow_up_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_table text,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_courses_instructor on public.courses(instructor_id);
create index if not exists idx_courses_published on public.courses(published);
create index if not exists idx_lessons_course on public.lessons(course_id, order_index);
create index if not exists idx_enrollments_user on public.enrollments(user_id);
create index if not exists idx_enrollments_course on public.enrollments(course_id);
create index if not exists idx_progress_user on public.lesson_progress(user_id);
create index if not exists idx_quiz_attempts_user on public.quiz_attempts(user_id);
create index if not exists idx_submissions_user on public.assignment_submissions(user_id);
create index if not exists idx_certificates_student on public.certificates(student_id);
create index if not exists idx_certificates_credential on public.certificates(credential_id);
create index if not exists idx_applications_email_status on public.student_applications(lower(email), status);
create index if not exists idx_applications_status_created on public.student_applications(status, created_at desc);
create index if not exists idx_cohorts_status_start on public.cohorts(status, starts_at);
create index if not exists idx_cohorts_instructor on public.cohorts(instructor_id);
create index if not exists idx_cohort_enrollments_user on public.cohort_enrollments(user_id);
create index if not exists idx_attendance_user_lesson on public.lesson_attendance(user_id, lesson_id);
create index if not exists idx_attendance_course_status on public.lesson_attendance(course_id, status);
create index if not exists idx_crm_records_type_status on public.crm_records(type, status);
create index if not exists idx_crm_records_follow_up on public.crm_records(follow_up_at) where follow_up_at is not null;
create index if not exists idx_audit_logs_actor_created on public.audit_logs(actor_id, created_at desc);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_courses_updated_at on public.courses;
create trigger set_courses_updated_at before update on public.courses
for each row execute function public.set_updated_at();

drop trigger if exists set_lessons_updated_at on public.lessons;
create trigger set_lessons_updated_at before update on public.lessons
for each row execute function public.set_updated_at();

drop trigger if exists set_enrollments_updated_at on public.enrollments;
create trigger set_enrollments_updated_at before update on public.enrollments
for each row execute function public.set_updated_at();

drop trigger if exists set_progress_updated_at on public.lesson_progress;
create trigger set_progress_updated_at before update on public.lesson_progress
for each row execute function public.set_updated_at();

drop trigger if exists set_quizzes_updated_at on public.quizzes;
create trigger set_quizzes_updated_at before update on public.quizzes
for each row execute function public.set_updated_at();

drop trigger if exists set_assignments_updated_at on public.assignments;
create trigger set_assignments_updated_at before update on public.assignments
for each row execute function public.set_updated_at();

drop trigger if exists set_submissions_updated_at on public.assignment_submissions;
create trigger set_submissions_updated_at before update on public.assignment_submissions
for each row execute function public.set_updated_at();

drop trigger if exists set_notes_updated_at on public.notes;
create trigger set_notes_updated_at before update on public.notes
for each row execute function public.set_updated_at();

drop trigger if exists set_discussions_updated_at on public.discussions;
create trigger set_discussions_updated_at before update on public.discussions
for each row execute function public.set_updated_at();

drop trigger if exists set_discussion_replies_updated_at on public.discussion_replies;
create trigger set_discussion_replies_updated_at before update on public.discussion_replies
for each row execute function public.set_updated_at();

drop trigger if exists set_certificates_updated_at on public.certificates;
create trigger set_certificates_updated_at before update on public.certificates
for each row execute function public.set_updated_at();

drop trigger if exists set_pricing_plans_updated_at on public.pricing_plans;
create trigger set_pricing_plans_updated_at before update on public.pricing_plans
for each row execute function public.set_updated_at();

drop trigger if exists set_cohorts_updated_at on public.cohorts;
create trigger set_cohorts_updated_at before update on public.cohorts
for each row execute function public.set_updated_at();

drop trigger if exists set_student_applications_updated_at on public.student_applications;
create trigger set_student_applications_updated_at before update on public.student_applications
for each row execute function public.set_updated_at();

drop trigger if exists set_cohort_enrollments_updated_at on public.cohort_enrollments;
create trigger set_cohort_enrollments_updated_at before update on public.cohort_enrollments
for each row execute function public.set_updated_at();

drop trigger if exists set_lesson_attendance_updated_at on public.lesson_attendance;
create trigger set_lesson_attendance_updated_at before update on public.lesson_attendance
for each row execute function public.set_updated_at();

drop trigger if exists set_crm_records_updated_at on public.crm_records;
create trigger set_crm_records_updated_at before update on public.crm_records
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, role)
  values (
    new.id,
    lower(coalesce(new.email, '')),
    coalesce(nullif(new.raw_user_meta_data->>'name', ''), split_part(coalesce(new.email, 'Student'), '@', 1)),
    'student'
  )
  on conflict (id) do update
  set email = excluded.email,
      name = coalesce(nullif(public.profiles.name, ''), excluded.name),
      updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.certificate_requirements_met(target_student_id uuid, target_course_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    not exists (
      select 1
      from public.lessons l
      where l.course_id = target_course_id
        and l.is_required
        and not exists (
          select 1
          from public.lesson_progress lp
          where lp.lesson_id = l.id
            and lp.user_id = target_student_id
            and lp.completed
        )
    )
    and not exists (
      select 1
      from public.quizzes q
      where q.course_id = target_course_id
        and q.published
        and not exists (
          select 1
          from public.quiz_attempts qa
          where qa.quiz_id = q.id
            and qa.user_id = target_student_id
            and qa.score >= q.passing_score
        )
    )
    and not exists (
      select 1
      from public.assignments a
      where a.course_id = target_course_id
        and a.published
        and not exists (
          select 1
          from public.assignment_submissions s
          where s.assignment_id = a.id
            and s.user_id = target_student_id
            and s.status = 'approved'
            and s.reviewed_at is not null
            and s.reviewed_by is not null
            and s.reviewed_by <> target_student_id
        )
    );
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
  calculated_score numeric(5,2);
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select * into existing_certificate
  from public.certificates
  where student_id = auth.uid()
    and course_id = target_course_id;

  if existing_certificate.id is not null then
    return existing_certificate;
  end if;

  if not public.certificate_requirements_met(auth.uid(), target_course_id) then
    raise exception 'Certificate requirements are not met';
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
    status,
    approved_at
  )
  values (
    auth.uid(),
    target_course_id,
    'MHA-' || upper(left(replace(gen_random_uuid()::text, '-', ''), 12)),
    calculated_score,
    'approved',
    now()
  )
  returning * into issued_certificate;

  insert into public.audit_logs (actor_id, action, entity_table, entity_id, metadata)
  values (auth.uid(), 'certificate_issued', 'certificates', issued_certificate.id, jsonb_build_object('course_id', target_course_id));

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
begin
  select c.id into matched_certificate_id
  from public.certificates c
  where c.credential_id = input_credential_id
    and c.status = 'approved'
  limit 1;

  insert into public.certificate_verifications (certificate_id, credential_id, verified)
  values (matched_certificate_id, input_credential_id, matched_certificate_id is not null);

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

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('course-resources', 'course-resources', false, 52428800, array['application/pdf', 'video/mp4', 'image/png', 'image/jpeg', 'text/plain']),
  ('assignment-submissions', 'assignment-submissions', false, 26214400, array['application/pdf', 'image/png', 'image/jpeg', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
  ('certificates', 'certificates', false, 10485760, array['application/pdf']),
  ('avatars', 'avatars', true, 5242880, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;
