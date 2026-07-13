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
    const value = line
      .slice(index + 1)
      .trim()
      .replace(/^['"]|['"]$/g, '');

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function firstPresent(...values) {
  return values.find((value) => typeof value === 'string' && value.trim().length > 0);
}

const supabaseUrl = firstPresent(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.VITE_SUPABASE_URL);
const anonKey = firstPresent(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, process.env.VITE_SUPABASE_ANON_KEY);
const serviceRoleKey = firstPresent(process.env.SUPABASE_SERVICE_ROLE_KEY);
const supabaseKey = firstPresent(serviceRoleKey, anonKey);

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL and a Supabase key.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const checks = [];

function recordResult(name, status, details = '') {
  checks.push({ check: name, status, details });
}

async function record(name, run) {
  try {
    await run();
    recordResult(name, 'PASS');
  } catch (error) {
    recordResult(name, 'FAIL', error instanceof Error ? error.message : String(error));
  }
}

async function assertNoError(result) {
  if (result.error) {
    throw new Error(result.error.message);
  }
}

function readSqlFiles() {
  return ['supabase/schema.sql', 'supabase/rls.sql', 'supabase/phase22_production_hardening.sql', 'supabase/storage_policies.sql']
    .map((file) => {
      const path = resolve(process.cwd(), file);
      return existsSync(path) ? readFileSync(path, 'utf8') : '';
    })
    .join('\n');
}

function uniqueMatches(sql, regex, transform = (match) => match[1]) {
  return [...new Set([...sql.matchAll(regex)].map(transform).filter(Boolean))].sort();
}

function publicTriggerNames(sql) {
  return sql
    .split(';')
    .map((statement) => statement.trim())
    .filter((statement) => /^create\s+trigger\b/i.test(statement) && /\bon\s+public\./i.test(statement))
    .map((statement) => statement.match(/^create\s+trigger\s+([a-z_]+)/i)?.[1])
    .filter(Boolean)
    .sort();
}

function policyNames(sql) {
  const policies = new Set();
  const policyRegex = /\b(drop\s+policy\s+if\s+exists|create\s+policy)\s+"([^"]+)"/gi;

  for (const match of sql.matchAll(policyRegex)) {
    const operation = match[1].toLowerCase();
    const name = match[2];

    if (operation.startsWith('drop')) {
      policies.delete(name);
    } else {
      policies.add(name);
    }
  }

  return [...policies].sort();
}

function localManifest() {
  const sql = readSqlFiles();

  return {
    tables: uniqueMatches(sql, /create table if not exists public\.([a-z_]+)/gi),
    indexes: uniqueMatches(sql, /create (?:unique )?index if not exists ([a-z_]+)/gi),
    functions: uniqueMatches(sql, /create or replace function public\.([a-z_]+)/gi),
    triggers: publicTriggerNames(sql),
    policies: policyNames(sql),
    buckets: uniqueMatches(sql, /\('([^']+)',\s*'[^']+',\s*(?:true|false),/gi),
  };
}

function diff(expected, actual) {
  const actualSet = new Set(actual ?? []);
  return expected.filter((item) => !actualSet.has(item));
}

const generatedStoragePolicyPrefixes = new Set([
  'avatars_public_read',
  'avatars_owner_write',
  'course_resources_authorized_read',
  'course_resources_teacher_write',
  'certificates_admin_write',
  'certificates_admin_update',
  'certificates_admin_delete',
]);

function policyDiff(expected, actual) {
  const actualPolicies = actual ?? [];

  return expected.filter(
    (expectedPolicy) =>
      !actualPolicies.some((actualPolicy) => {
        if (actualPolicy === expectedPolicy) return true;
        return generatedStoragePolicyPrefixes.has(expectedPolicy) && actualPolicy.startsWith(expectedPolicy);
      })
  );
}

async function checkTable(table) {
  const result = await supabase.from(table).select('id').limit(1);
  await assertNoError(result);
}

const manifest = localManifest();

for (const table of manifest.tables) {
  await record(`table exists: ${table}`, () => checkTable(table));
}

await record('verify_certificate_public RPC works', async () => {
  const result = await supabase.rpc('verify_certificate_public', {
    input_credential_id: 'MHA-SETUP-CHECK-NOT-ISSUED',
  });

  await assertNoError(result);
});

await record('submit_quiz_attempt RPC visible to API cache', async () => {
  const result = await supabase.rpc('submit_quiz_attempt', {
    target_quiz_id: '00000000-0000-4000-8000-000000000000',
    submitted_answers: {},
  });

  if (!result.error) return;
  const message = result.error.message.toLowerCase();
  if (message.includes('authentication required') || message.includes('invalid input syntax')) return;
  throw new Error(result.error.message);
});

if (!serviceRoleKey) {
  recordResult(
    'live schema inventory',
    'SKIP',
    'Set SUPABASE_SERVICE_ROLE_KEY and apply supabase/phase22_production_hardening.sql to compare tables, indexes, RPCs, buckets, triggers, and policies.'
  );
} else {
  await record('live schema inventory matches local SQL', async () => {
    const result = await supabase.rpc('lms_schema_inventory');
    await assertNoError(result);

    const inventory = result.data ?? {};
    const missing = {
      tables: diff(manifest.tables, inventory.tables),
      indexes: diff(manifest.indexes, inventory.indexes),
      functions: diff(manifest.functions, inventory.functions),
      triggers: diff(manifest.triggers, inventory.triggers),
      policies: policyDiff(manifest.policies, inventory.policies),
      buckets: diff(manifest.buckets, inventory.buckets),
    };

    const missingSummary = Object.entries(missing)
      .filter(([, values]) => values.length > 0)
      .map(([key, values]) => `${key}: ${values.join(', ')}`)
      .join(' | ');

    if (missingSummary) {
      throw new Error(missingSummary);
    }
  });
}

const authTestEmail = firstPresent(process.env.SUPABASE_TEST_EMAIL);
const authTestPassword = firstPresent(process.env.SUPABASE_TEST_PASSWORD);
if (authTestEmail && authTestPassword && anonKey) {
  const authClient = createClient(supabaseUrl, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  await record('login with test account', async () => {
    const result = await authClient.auth.signInWithPassword({
      email: authTestEmail,
      password: authTestPassword,
    });
    await assertNoError(result);
    await authClient.auth.signOut();
  });
} else {
  recordResult('login with test account', 'SKIP', 'Set SUPABASE_TEST_EMAIL and SUPABASE_TEST_PASSWORD for live auth verification.');
}

console.table(checks);

if (checks.some((check) => check.status === 'FAIL')) {
  console.error('Supabase LMS verification failed. Apply supabase/schema.sql, supabase/rls.sql, supabase/phase22_production_hardening.sql, and supabase/seed.sql, then reload the schema cache.');
  process.exit(1);
}

console.log('Supabase LMS verification completed.');
