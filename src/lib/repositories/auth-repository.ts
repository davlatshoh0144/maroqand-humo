import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { PlatformAccount, User, UserRole } from '@/lib/types';
import { fail, guarded, ok, type RepositoryResult } from '@/lib/repositories/result';
import { mapPlatformAccount, mapProfile, type Row } from '@/lib/repositories/mappers';

export interface AuthSessionState {
  user: User | null;
  session: Session | null;
}

async function fetchProfile(userId: string): Promise<RepositoryResult<User>> {
  const { data, error } = await getSupabaseBrowserClient()
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) return fail('AUTH_ERROR', error.message, error);

  const profile = mapProfile(data as Row);
  if ((data as Row).status === 'suspended') {
    return fail('PERMISSION_DENIED', 'This account has been disabled.');
  }

  return ok(profile);
}

export const authRepository = {
  fetchProfile,

  async signIn(email: string, password: string): Promise<RepositoryResult<AuthSessionState>> {
    return guarded(async () => {
      const { data, error } = await getSupabaseBrowserClient().auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) return fail('AUTH_ERROR', error.message, error);
      if (!data.user) return fail('AUTH_ERROR', 'No user returned from Supabase Auth.');

      const profile = await fetchProfile(data.user.id);
      if (profile.error) {
        await getSupabaseBrowserClient().auth.signOut();
        return profile;
      }

      await getSupabaseBrowserClient()
        .from('profiles')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', data.user.id);

      await authRepository.createAuditLog('login');

      return ok({ user: profile.data, session: data.session });
    });
  },

  async signUp(name: string, email: string, password: string): Promise<RepositoryResult<AuthSessionState>> {
    return guarded(async () => {
      const { data, error } = await getSupabaseBrowserClient().auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: { name: name.trim() },
        },
      });

      if (error) return fail('AUTH_ERROR', error.message, error);

      await authRepository.createAuditLog('signup');

      if (!data.user || !data.session) {
        return ok({ user: null, session: data.session });
      }

      const profile = await fetchProfile(data.user.id);
      if (profile.error) {
        return ok({ user: null, session: data.session });
      }
      return ok({ user: profile.data, session: data.session });
    });
  },

  async signOut(): Promise<RepositoryResult<true>> {
    return guarded(async () => {
      await authRepository.createAuditLog('logout');
      const { error } = await getSupabaseBrowserClient().auth.signOut();
      if (error) return fail('AUTH_ERROR', error.message, error);
      return ok(true);
    });
  },

  async resetPassword(email: string): Promise<RepositoryResult<true>> {
    return guarded(async () => {
      const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}?view=login` : undefined;
      const { error } = await getSupabaseBrowserClient().auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo,
      });
      if (error) return fail('AUTH_ERROR', error.message, error);
      return ok(true);
    });
  },

  async getSessionUser(): Promise<RepositoryResult<AuthSessionState>> {
    return guarded(async () => {
      const { data, error } = await getSupabaseBrowserClient().auth.getSession();
      if (error) return fail('AUTH_ERROR', error.message, error);
      if (!data.session?.user) return ok({ user: null, session: data.session });

      const profile = await fetchProfile(data.session.user.id);
      if (profile.error) return profile;
      return ok({ user: profile.data, session: data.session });
    });
  },

  onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    return getSupabaseBrowserClient().auth.onAuthStateChange(callback).data.subscription;
  },

  async updateProfileBasics(updates: Partial<Pick<User, 'name' | 'avatar' | 'city' | 'bio' | 'phone'>>): Promise<RepositoryResult<User>> {
    return guarded(async () => {
      const { data: sessionData } = await getSupabaseBrowserClient().auth.getSession();
      const userId = sessionData.session?.user.id;
      if (!userId) return fail('AUTH_ERROR', 'Authentication required.');

      const { data, error } = await getSupabaseBrowserClient()
        .from('profiles')
        .update({
          name: updates.name,
          avatar_url: updates.avatar,
          city: updates.city,
          bio: updates.bio,
          phone: updates.phone,
        })
        .eq('id', userId)
        .select('*')
        .single();

      if (error) return fail('AUTH_ERROR', error.message, error);
      return ok(mapProfile(data as Row));
    });
  },

  async createAuditLog(action: string, metadata: Record<string, unknown> = {}): Promise<RepositoryResult<true>> {
    return guarded(async () => {
      const { data: sessionData } = await getSupabaseBrowserClient().auth.getSession();
      const actorId = sessionData.session?.user.id;
      if (!actorId) return ok(true);

      const { error } = await getSupabaseBrowserClient()
        .from('audit_logs')
        .insert({ actor_id: actorId, action, metadata });

      if (error) return fail('PERMISSION_DENIED', error.message, error);
      return ok(true);
    });
  },

  async listProfiles(): Promise<RepositoryResult<PlatformAccount[]>> {
    return guarded(async () => {
      const { data, error } = await getSupabaseBrowserClient()
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) return fail('PERMISSION_DENIED', error.message, error);
      return ok(((data ?? []) as Row[]).map(mapPlatformAccount));
    });
  },

  async updateRole(userId: string, role: UserRole): Promise<RepositoryResult<true>> {
    return guarded(async () => {
      const { error } = await getSupabaseBrowserClient()
        .from('profiles')
        .update({ role })
        .eq('id', userId);

      if (error) return fail('PERMISSION_DENIED', error.message, error);
      await authRepository.createAuditLog('role_change', { user_id: userId, role });
      return ok(true);
    });
  },

  async updateAccountStatus(userId: string, status: PlatformAccount['status']): Promise<RepositoryResult<true>> {
    return guarded(async () => {
      const { error } = await getSupabaseBrowserClient()
        .from('profiles')
        .update({ status })
        .eq('id', userId);

      if (error) return fail('PERMISSION_DENIED', error.message, error);
      await authRepository.createAuditLog('account_status_changed', { user_id: userId, status });
      return ok(true);
    });
  },
};
