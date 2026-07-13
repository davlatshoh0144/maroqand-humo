import type { AppView, User, UserRole } from '@/lib/types';

export type AuthRole = 'guest' | 'student' | 'instructor' | 'admin';

const knownViews: ReadonlySet<AppView> = new Set<AppView>([
  'landing',
  'courses',
  'course-detail',
  'lesson',
  'login',
  'signup',
  'apply',
  'forgot-password',
  'signout',
  'dashboard',
  'profile',
  'pricing',
  'certificates',
  'certificate-verify',
  'practice',
  'practice-detail',
  'broker-mail',
  'load-board',
  'fleet-training',
  'teacher-dashboard',
  'admin-dashboard',
  'discussions',
  'about',
  'contact',
  'privacy',
  'terms',
  'refund',
  'analytics',
  'study-timer',
  'achievements',
  'quiz',
  'bookmarks',
  'roadmap',
  'notes',
  'weekly-report',
  'settings',
  'toolkit',
  'career-center',
  'study-groups',
  'glossary',
  'mentorship',
  'resources',
  'video-library',
  'not-found',
]);

export const publicViews: ReadonlySet<AppView> = new Set<AppView>([
  'landing',
  'courses',
  'course-detail',
  'pricing',
  'about',
  'contact',
  'privacy',
  'terms',
  'refund',
  'certificate-verify',
  'login',
  'signup',
  'apply',
  'forgot-password',
  'signout',
  'not-found',
]);

const studentWorkspaceViews: ReadonlySet<AppView> = new Set<AppView>([
  'dashboard',
  'profile',
  'lesson',
  'certificates',
  'practice',
  'practice-detail',
  'broker-mail',
  'load-board',
  'fleet-training',
  'discussions',
  'analytics',
  'study-timer',
  'achievements',
  'quiz',
  'bookmarks',
  'roadmap',
  'notes',
  'weekly-report',
  'settings',
  'toolkit',
  'career-center',
  'study-groups',
  'glossary',
  'mentorship',
  'resources',
  'video-library',
]);

const instructorViews: ReadonlySet<AppView> = new Set<AppView>([
  'dashboard',
  'profile',
  'settings',
  'teacher-dashboard',
]);

const adminViews: ReadonlySet<AppView> = new Set<AppView>([
  'dashboard',
  'profile',
  'settings',
  'admin-dashboard',
]);

export function isKnownView(view: string): view is AppView {
  return knownViews.has(view as AppView);
}

export function normalizeRole(role?: UserRole | null): AuthRole {
  if (role === 'admin') return 'admin';
  if (role === 'instructor' || role === 'teacher') return 'instructor';
  if (role === 'student' || role === 'free' || role === 'paid') return 'student';
  return 'guest';
}

export function getRoleLabel(role?: UserRole | AuthRole | null): string {
  const normalized = normalizeRole(role as UserRole | null);
  if (normalized === 'admin') return 'Admin';
  if (normalized === 'instructor') return 'Instructor';
  if (normalized === 'student') return 'Student';
  return 'Guest';
}

export function isProtectedView(view: AppView): boolean {
  return !publicViews.has(view);
}

export function getDefaultViewForRole(role?: UserRole | null): AppView {
  const normalized = normalizeRole(role);
  if (normalized === 'admin') return 'admin-dashboard';
  if (normalized === 'instructor') return 'teacher-dashboard';
  if (normalized === 'student') return 'dashboard';
  return 'landing';
}

export function canAccessView(view: AppView, user: User | null): boolean {
  if (!isKnownView(view)) return false;
  if (publicViews.has(view)) return true;

  const role = normalizeRole(user?.role);
  if (role === 'student') return studentWorkspaceViews.has(view);
  if (role === 'instructor') return instructorViews.has(view);
  if (role === 'admin') return adminViews.has(view);
  return false;
}
