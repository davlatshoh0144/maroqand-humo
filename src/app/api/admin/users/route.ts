import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase/server';
import { getBearerToken } from '@/lib/supabase/server';
import { z } from 'zod';

const createUserSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(128),
  role: z.enum(['student', 'instructor', 'admin']),
});

export async function POST(request: NextRequest) {
  try {
    const token = getBearerToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    const supabase = getSupabaseAdminClient();
    const { data: requester, error: requesterError } = await supabase.auth.getUser(token);
    if (requesterError || !requester.user) {
      return NextResponse.json({ error: 'Invalid session.' }, { status: 401 });
    }

    const { data: requesterProfile } = await supabase
      .from('profiles')
      .select('role,status')
      .eq('id', requester.user.id)
      .single();

    if (requesterProfile?.role !== 'admin' || requesterProfile?.status !== 'active') {
      return NextResponse.json({ error: 'Admin permission required.' }, { status: 403 });
    }

    const parsed = createUserSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Valid name, email, password, and role are required.' }, { status: 400 });
    }

    const { name, email, password, role } = parsed.data;

    const { data: created, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    });

    if (createError || !created.user) {
      return NextResponse.json({ error: 'Could not create user.' }, { status: 400 });
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: created.user.id,
        email,
        name,
        role,
        status: 'active',
      })
      .select('*')
      .single();

    if (profileError) {
      return NextResponse.json({ error: 'Could not create user profile.' }, { status: 400 });
    }

    await supabase.from('audit_logs').insert({
      actor_id: requester.user.id,
      action: 'admin_action',
      entity_table: 'profiles',
      entity_id: created.user.id,
      metadata: { action: 'create_account', role },
    });

    return NextResponse.json({
      account: {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role,
        avatar: profile.avatar_url ?? '',
        city: profile.city ?? '',
        bio: profile.bio ?? '',
        phone: profile.phone ?? '',
        createdAt: profile.created_at,
        lastLoginAt: profile.last_login_at ?? undefined,
        passwordHash: '',
        status: profile.status,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Unexpected admin user error.' },
      { status: 500 }
    );
  }
}
