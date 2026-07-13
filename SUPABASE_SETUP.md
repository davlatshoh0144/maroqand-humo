# Supabase Setup

The production app uses Supabase Auth, Postgres, Row Level Security, RPC functions, and Storage. The app will not work in production mode until the SQL files in this repository are applied to the live Supabase project.

## Apply SQL

1. Open the Supabase project dashboard.
2. Go to **SQL Editor**.
3. Open `supabase/schema.sql` from this repository, paste the full file into SQL Editor, and run it.
4. Open `supabase/rls.sql`, paste the full file into SQL Editor, and run it.
5. Open `supabase/phase22_production_hardening.sql`, paste the full file into SQL Editor, and run it.
6. Open `supabase/seed.sql`, paste the full file into SQL Editor, and run it.
7. If Storage policy creation fails with a `storage.objects` ownership error, follow `supabase/storage_policy_setup.md`. If SQL is allowed, run `supabase/storage_policies.sql`.
8. Wait 30-60 seconds for the API schema cache to refresh.
9. If `PGRST202` or `PGRST205` still appears, run this in SQL Editor:

```sql
notify pgrst, 'reload schema';
```

10. Reload the deployed app.

## Verify Setup In SQL Editor

Run these checks after applying the SQL.

### Required Tables

```sql
select
  to_regclass('public.courses') as courses,
  to_regclass('public.lessons') as lessons,
  to_regclass('public.profiles') as profiles,
  to_regclass('public.pricing_plans') as pricing_plans;
```

Expected result: every column should return a `public.*` table name, not `null`.

### Certificate Verification RPC

```sql
select routine_schema, routine_name
from information_schema.routines
where routine_schema = 'public'
  and routine_name = 'verify_certificate_public';
```

Expected result: one row for `public.verify_certificate_public`.

You can also verify the RPC is callable:

```sql
select *
from public.verify_certificate_public('MHA-SETUP-CHECK-NOT-ISSUED');
```

Expected result: no SQL error. It may return zero rows when the credential does not exist.

### Storage Buckets

```sql
select id, public
from storage.buckets
where id in ('course-resources', 'assignment-submissions', 'certificates', 'avatars')
order by id;
```

Expected result: four rows. The `avatars` bucket should exist and be public.

## Verify With Node

If environment variables are present in `.env` or `.env.local`, you can run:

```bash
node scripts/verify-supabase-lms.mjs
```

The script checks:

- every table declared in `supabase/schema.sql`
- `verify_certificate_public` and `submit_quiz_attempt` RPC availability
- live table, index, RPC, trigger, policy, and bucket inventory when `SUPABASE_SERVICE_ROLE_KEY` is set
- optional login when `SUPABASE_TEST_EMAIL` and `SUPABASE_TEST_PASSWORD` are set

Use `SUPABASE_SERVICE_ROLE_KEY` for the complete schema and bucket verification. Without it, the script performs anon-key smoke checks and marks the live inventory comparison as skipped.

## Email Confirmation During Testing

For local QA and staging account tests, use one of these options:

- Disable email confirmation in Supabase Auth settings while testing.
- Keep email confirmation enabled and manually confirm the test user in the Supabase dashboard before signing in.

Do not assume a newly signed-up user can sign in immediately when email confirmation is enabled.

## Common Production Errors

- `PGRST205 table not found`: run `supabase/schema.sql`, then reload the schema cache.
- `PGRST202 function not found`: run `supabase/schema.sql`, `supabase/rls.sql`, and `supabase/phase22_production_hardening.sql`, then reload the schema cache.
- `avatars bucket not found`: run `supabase/schema.sql` and verify `storage.buckets`.
- Blank or broken LMS screens: confirm production mode is not pointing at an uninitialized Supabase project.
