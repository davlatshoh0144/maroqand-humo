import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { AnalyticsEvent, PlatformAccount, UserRole } from '@/lib/types';
import { authRepository } from '@/lib/repositories/auth-repository';
import { courseRepository } from '@/lib/repositories/course-repository';
import { fail, guarded, ok, type RepositoryResult } from '@/lib/repositories/result';

export interface AdminAccountInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export const adminRepository = {
  async listAccounts(): Promise<RepositoryResult<PlatformAccount[]>> {
    return authRepository.listProfiles();
  },

  async createAccount(input: AdminAccountInput): Promise<RepositoryResult<PlatformAccount>> {
    return guarded(async () => {
      const { data: sessionData } = await getSupabaseBrowserClient().auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) return fail('AUTH_ERROR', 'Authentication required.');

      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(input),
      });

      const body = await response.json().catch(() => null);
      if (!response.ok) {
        return fail(
          response.status === 403 ? 'PERMISSION_DENIED' : 'UNKNOWN_ERROR',
          body?.error ?? 'Could not create account.'
        );
      }

      await authRepository.createAuditLog('admin_action', { action: 'create_account', role: input.role });
      return ok(body.account as PlatformAccount);
    });
  },

  updateRole(userId: string, role: UserRole) {
    return authRepository.updateRole(userId, role);
  },

  updateAccountStatus(userId: string, status: PlatformAccount['status']) {
    return authRepository.updateAccountStatus(userId, status);
  },

  assignCourse(userId: string, courseId: string) {
    return courseRepository.assignCourse(userId, courseId);
  },

  async logAnalyticsEvent(event: Omit<AnalyticsEvent, 'id' | 'createdAt'>): Promise<RepositoryResult<true>> {
    return authRepository.createAuditLog(event.type, {
      user_id: event.userId,
      course_id: event.courseId,
      lesson_id: event.lessonId,
    });
  },
};
