'use client';

import { useAppStore } from '@/lib/store/app-store';
import type { AppView } from '@/lib/types';
import { normalizeRole } from '@/lib/auth/access-control';
import {
  LayoutDashboard,
  BookOpen,
  Dumbbell,
  Award,
  User,
} from 'lucide-react';

interface NavItem {
  view: AppView;
  label: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { view: 'dashboard', label: 'Workspace', icon: LayoutDashboard },
  { view: 'courses', label: 'Courses', icon: BookOpen },
  { view: 'practice', label: 'Practice', icon: Dumbbell },
  { view: 'certificates', label: 'Certificates', icon: Award },
  { view: 'profile', label: 'Profile', icon: User },
];

// Views where the bottom nav should be hidden
const HIDDEN_VIEWS: AppView[] = [
  'landing',
  'login',
  'signup',
  'forgot-password',
  'signout',
];

// Map related views to their parent nav item
function getActiveNavView(currentView: AppView): AppView {
  switch (currentView) {
    case 'course-detail':
    case 'lesson':
      return 'courses';
    case 'practice-detail':
      return 'practice';
    case 'certificate-verify':
      return 'certificates';
    case 'broker-mail':
    case 'load-board':
    case 'fleet-training':
      return 'practice';
    case 'discussions':
      return 'courses';
    default:
      return currentView;
  }
}

export function MobileBottomNav() {
  const { currentView, navigate, user } = useAppStore();

  // Only student workspace views use the bottom nav.
  if (!user || normalizeRole(user.role) !== 'student' || HIDDEN_VIEWS.includes(currentView)) {
    return null;
  }

  const activeNavView = getActiveNavView(currentView);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-background/95 backdrop-blur-lg border-t border-border/50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center justify-around h-14">
        {NAV_ITEMS.map((item) => {
          const isActive = activeNavView === item.view;
          const Icon = item.icon;

          return (
            <button
              key={item.view}
              onClick={() => navigate(item.view)}
              className={`
                flex flex-col items-center justify-center gap-0.5
                flex-1 h-full
                transition-colors duration-200 ease-in-out
                ${
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }
              `}
              aria-current={isActive ? 'page' : undefined}
              aria-label={item.label}
            >
              <Icon
                className={`h-5 w-5 transition-transform duration-200 ${
                  isActive ? 'scale-110' : 'scale-100'
                }`}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span
                className={`text-[10px] leading-tight transition-all duration-200 ${
                  isActive ? 'font-semibold' : 'font-normal'
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 h-0.5 w-8 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
