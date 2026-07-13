import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';

const envFiles = ['.env.local', '.env'];

for (const file of envFiles) {
  const path = resolve(process.cwd(), file);
  if (!existsSync(path)) continue;

  for (const rawLine of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#') || !line.includes('=')) continue;

    const index = line.indexOf('=');
    const key = line.slice(0, index).trim();
    const value = line.slice(index + 1).trim().replace(/^['"]|['"]$/g, '');
    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function firstPresent(...values) {
  return values.find((value) => typeof value === 'string' && value.trim().length > 0);
}

const supabaseUrl = firstPresent(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.VITE_SUPABASE_URL);
const serviceRoleKey = firstPresent(process.env.SUPABASE_SERVICE_ROLE_KEY);

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const password = process.env.SUPABASE_QA_PASSWORD || 'Phase23B!QaPass123';

const qaUsers = [
  {
    key: 'student',
    email: 'qa-student@marokandhumo.test',
    name: 'QA Student',
    role: 'student',
  },
  {
    key: 'paid_student',
    email: 'qa-paid-student@marokandhumo.test',
    name: 'QA Paid Student',
    role: 'student',
    enrollAllCourses: true,
  },
  {
    key: 'instructor',
    email: 'qa-instructor@marokandhumo.test',
    name: 'QA Instructor',
    role: 'instructor',
    teachesFirstCourse: true,
  },
  {
    key: 'admin',
    email: 'qa-admin@marokandhumo.test',
    name: 'QA Admin',
    role: 'admin',
  },
];

async function findUserByEmail(email) {
  let page = 1;
  const perPage = 100;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;

    const found = data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase());
    if (found) return found;
    if (data.users.length < perPage) return null;
    page += 1;
  }
}

async function upsertAuthUser({ email, name }) {
  const existing = await findUserByEmail(email);
  if (existing) {
    const { data, error } = await supabase.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
      user_metadata: { name },
    });
    if (error) throw error;
    return data.user;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
  });

  if (error) throw error;
  return data.user;
}

async function main() {
  const { data: courses, error: coursesError } = await supabase
    .from('courses')
    .select('id,slug')
    .eq('published', true)
    .order('created_at', { ascending: true });

  if (coursesError) throw coursesError;
  if (!courses?.length) {
    throw new Error('No published courses found. Run supabase/phase23b_live_seed_data.sql first.');
  }

  const summary = [];

  for (const qaUser of qaUsers) {
    const authUser = await upsertAuthUser(qaUser);
    if (!authUser?.id) throw new Error(`No auth user id returned for ${qaUser.email}.`);

    const { error: profileError } = await supabase.from('profiles').upsert({
      id: authUser.id,
      email: qaUser.email,
      name: qaUser.name,
      role: qaUser.role,
      status: 'active',
    });
    if (profileError) throw profileError;

    if (qaUser.enrollAllCourses) {
      const enrollments = courses.map((course) => ({
        user_id: authUser.id,
        course_id: course.id,
        status: 'active',
      }));

      const { error } = await supabase
        .from('enrollments')
        .upsert(enrollments, { onConflict: 'user_id,course_id' });
      if (error) throw error;
    }

    if (qaUser.teachesFirstCourse) {
      const { error } = await supabase
        .from('courses')
        .update({ instructor_id: authUser.id })
        .eq('id', courses[0].id);
      if (error) throw error;
    }

    summary.push({
      key: qaUser.key,
      email: qaUser.email,
      role: qaUser.role,
      userId: authUser.id,
    });
  }

  console.table(summary);
  console.log(`QA password: ${password}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
