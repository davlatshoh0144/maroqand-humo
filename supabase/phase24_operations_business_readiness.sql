-- Phase 24: Operations and business readiness additions.

alter table public.cohorts
  add column if not exists instructor_id uuid references public.profiles(id) on delete set null;

alter table public.crm_records
  add column if not exists follow_up_at timestamptz;

create index if not exists idx_cohorts_instructor on public.cohorts(instructor_id);
create index if not exists idx_crm_records_follow_up on public.crm_records(follow_up_at) where follow_up_at is not null;

create or replace function public.audit_operations_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  action_name text;
begin
  action_name := case tg_table_name
    when 'student_applications' then 'student_application_submitted'
    when 'crm_records' then 'crm_record_created'
    else tg_table_name || '_created'
  end;

  insert into public.audit_logs (actor_id, action, entity_table, entity_id, metadata)
  values (
    auth.uid(),
    action_name,
    tg_table_name,
    new.id,
    jsonb_build_object('operation', tg_op)
  );

  return new;
end;
$$;

drop trigger if exists audit_student_application_insert on public.student_applications;
create trigger audit_student_application_insert
after insert on public.student_applications
for each row execute function public.audit_operations_insert();

drop trigger if exists audit_crm_record_insert on public.crm_records;
create trigger audit_crm_record_insert
after insert on public.crm_records
for each row execute function public.audit_operations_insert();
