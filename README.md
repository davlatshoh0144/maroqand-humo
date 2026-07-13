# Marokand Humo Academy

Production LMS backed by Supabase Auth, Postgres, Row Level Security, and Storage.

## Supabase Setup

> Warning: The app will not work in production mode until the Supabase SQL in this repository is applied. If the live project is missing tables, RPC functions, or Storage buckets, the app will show: "Backend setup required. Please apply Supabase SQL migrations."

1. Create or open the Supabase project:
   `https://nqetkwrtyyfoqqpuqyhs.supabase.co`
2. In Supabase SQL Editor, run these files in order:
   `supabase/schema.sql`
   `supabase/rls.sql`
   `supabase/phase22_production_hardening.sql`
   `supabase/seed.sql`
3. Confirm the Storage buckets exist:
   `course-resources`
   `assignment-submissions`
   `certificates`
   `avatars`
4. For the full live setup and verification checklist, see `SUPABASE_SETUP.md`.
5. Set local environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://nqetkwrtyyfoqqpuqyhs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_Z3Q8yNh6KxHdFzbEuPGQ3Q_RcnpjpSp
NEXT_PUBLIC_DEMO_MODE=false
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_TEST_EMAIL=
SUPABASE_TEST_PASSWORD=
```

`SUPABASE_SERVICE_ROLE_KEY` is server-only. Never expose it in client code or `NEXT_PUBLIC_*` variables.
`SUPABASE_TEST_EMAIL` and `SUPABASE_TEST_PASSWORD` are optional local verification variables for `node scripts/verify-supabase-lms.mjs`.

For auth testing, either disable email confirmation in Supabase Auth settings or manually confirm the test user in the Supabase dashboard before signing in.

## Demo Mode

Use `NEXT_PUBLIC_DEMO_MODE=true` only for local demos. Demo mode keeps the existing local fallback data and localStorage behavior. Production mode uses Supabase repositories for auth, courses, enrollments, progress, notes, assignments, certificates, discussions, teacher data, and admin data.

## Development

```bash
npm install
npm run dev
npm run lint
npm run typecheck
npm run build
```

There is currently no `npm run test` script in `package.json`.

## Certificate Verification

Certificates are issued only when:

- required lessons are completed
- quiz scores meet each quiz threshold
- course assignments are approved

Public verification uses the safe `verify_certificate_public(credential_id)` RPC and returns only credential status, student name, course title, issued date, and score.
