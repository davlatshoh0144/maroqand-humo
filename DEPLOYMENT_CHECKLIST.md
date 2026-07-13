# Production Deployment Checklist

## Vercel Environment Variables

Set these in Vercel Project Settings -> Environment Variables -> Production:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://nqetkwrtyyfoqqpuqyhs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase anon publishable key>
NEXT_PUBLIC_DEMO_MODE=false
SUPABASE_SERVICE_ROLE_KEY=<supabase service role key>
```

Keep `SUPABASE_SERVICE_ROLE_KEY` server-only. Never prefix it with `NEXT_PUBLIC_`.

## Supabase Preparation

Run SQL in this order:

```text
supabase/schema.sql
supabase/rls.sql
supabase/phase22_production_hardening.sql
supabase/storage_policies.sql
supabase/seed.sql
supabase/phase23b_live_seed_data.sql
```

Confirm Storage buckets exist:

```text
avatars
course-resources
assignment-submissions
certificates
```

Confirm Auth settings:

```text
Site URL: https://<production-domain>
Redirect URLs:
https://<production-domain>
https://<production-domain>/*
```

## QA Users

After `SUPABASE_SERVICE_ROLE_KEY` is available locally, run:

```bash
node scripts/create-supabase-qa-users.mjs
```

Default QA password:

```text
Phase23B!QaPass123
```

Created accounts:

```text
qa-student@marokandhumo.test
qa-paid-student@marokandhumo.test
qa-instructor@marokandhumo.test
qa-admin@marokandhumo.test
```

## Build Commands

For Vercel:

```text
Install Command: npm ci --include=optional
Build Command: npm run build
```

For standalone/self-hosted:

```bash
npm ci --include=optional
npm run build
npm start
```

## Post-Deploy Verification

Run the Supabase verifier with full env:

```bash
node scripts/verify-supabase-lms.mjs
```

Expected:

```text
No FAIL rows.
live schema inventory: PASS
login with test account: PASS when SUPABASE_TEST_EMAIL and SUPABASE_TEST_PASSWORD are set
```

Manual live checks:

```text
Homepage loads
Signup creates a student account
Login works
Course catalog loads all published courses
Free student can open only free lessons
Free student cannot open non-free lessons
Paid/enrolled QA user can open non-free lessons
Assignments appear for paid/enrolled QA user
Paid/enrolled QA user can submit an assignment
Instructor QA user can review assignment if assigned to the course
Certificate verification returns a visible valid/invalid result
Avatar upload succeeds and public read works
No demo controls are visible
No broken primary buttons
No console errors
No horizontal mobile scroll at 390px width
```
