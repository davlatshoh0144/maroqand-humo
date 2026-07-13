'use client';

import { useAppStore } from '@/lib/store/app-store';
import { Header } from '@/components/academy/shared/header';
import { Footer } from '@/components/academy/shared/footer';
import { LandingPage } from '@/components/academy/landing/landing-page';
import { AboutPage } from '@/components/academy/landing/about-page';
import { ContactPage } from '@/components/academy/landing/contact-page';
import { PricingPage } from '@/components/academy/landing/pricing-page';
import { LoginForm } from '@/components/academy/auth/login-form';
import { SignupForm } from '@/components/academy/auth/signup-form';
import { StudentApplicationPage } from '@/components/academy/applications/student-application-page';
import { ForgotPasswordForm } from '@/components/academy/auth/forgot-password-form';
import { SignOutPage } from '@/components/academy/auth/signout-page';
import { CourseCatalog } from '@/components/academy/courses/course-catalog';
import { CourseDetail } from '@/components/academy/courses/course-detail';
import { LessonPlayer } from '@/components/academy/lessons/lesson-player';
import { StudentDashboard } from '@/components/academy/dashboard/student-dashboard';
import { TeacherDashboard } from '@/components/academy/dashboard/teacher-dashboard';
import { AdminDashboard } from '@/components/academy/dashboard/admin-dashboard';
import { AppSidebar } from '@/components/academy/dashboard/app-sidebar';
import { PracticeList } from '@/components/academy/practice/practice-list';
import { PracticeDetail } from '@/components/academy/practice/practice-detail';
import { BrokerMail } from '@/components/academy/broker-mail/broker-mail';
import { LoadBoard } from '@/components/academy/load-board/load-board';
import { FleetTraining } from '@/components/academy/fleet/fleet-training';
import { CertificateWall } from '@/components/academy/certificates/certificate-wall';
import { CertificateVerify } from '@/components/academy/certificates/certificate-verify';
import { StudentProfile } from '@/components/academy/profile/student-profile';
import { DiscussionList } from '@/components/academy/discussions/discussion-list';
import { MobileBottomNav } from '@/components/academy/shared/mobile-bottom-nav';
import { AIChatbot } from '@/components/academy/shared/ai-chatbot';
import { ProgressAnalytics } from '@/components/academy/student/progress-analytics';
import { StudyTimer } from '@/components/academy/student/study-timer';
import { Achievements } from '@/components/academy/student/achievements';
import { QuizPage } from '@/components/academy/student/quiz-page';
import { CourseBookmarks } from '@/components/academy/student/course-bookmarks';
import { LearningRoadmap } from '@/components/academy/student/learning-roadmap';
import { CourseNotes } from '@/components/academy/student/course-notes';
import { WeeklyReport } from '@/components/academy/student/weekly-report';
import { SettingsPage } from '@/components/academy/student/settings-page';
import { DispatcherToolkit } from '@/components/academy/student/dispatcher-toolkit';
import { CareerCenter } from '@/components/academy/student/career-center';
import { StudyGroups } from '@/components/academy/student/study-groups';
import { TruckingGlossary } from '@/components/academy/student/trucking-glossary';
import { Mentorship } from '@/components/academy/student/mentorship';
import { ResourceLibrary } from '@/components/academy/student/resource-library';
import { VideoLibrary } from '@/components/academy/student/video-library';
import { NotificationCenter } from '@/components/academy/shared/notification-center';
import { LegalPage } from '@/components/academy/legal/legal-page';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Truck, Home as HomeIcon, ShieldAlert, LogIn, RefreshCw } from 'lucide-react';
import type { AppView } from '@/lib/types';
import {
  canAccessView,
  getDefaultViewForRole,
  isKnownView,
  normalizeRole,
} from '@/lib/auth/access-control';

function ViewLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

/** 404 Not Found Page */
function NotFoundPage() {
  const { navigate } = useAppStore();
  return (
    <div className="flex flex-1 items-center justify-center min-h-[70vh] px-4">
      <div className="text-center max-w-md space-y-6">
        {/* Truck illustration */}
        <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-muted/30">
          <Truck className="h-14 w-14 text-muted-foreground/40" />
        </div>

        {/* 404 text */}
        <h1 className="text-7xl font-extrabold text-foreground/10 select-none">404</h1>

        {/* Heading */}
        <h2 className="text-2xl font-bold text-foreground -mt-2">Page Not Found</h2>

        {/* Description */}
        <p className="text-muted-foreground text-base leading-relaxed">
          Looks like this route took a wrong turn. The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        {/* Go Home button */}
        <Button
          size="lg"
          className="gap-2"
          onClick={() => navigate('landing')}
        >
          <HomeIcon className="h-4 w-4" />
          Go Home
        </Button>
      </div>
    </div>
  );
}

function AccessBlockedPage() {
  const { user, navigate } = useAppStore();
  const defaultView = getDefaultViewForRole(user?.role);

  return (
    <div className="flex flex-1 items-center justify-center min-h-[70vh] px-4">
      <div className="text-center max-w-md space-y-5">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <ShieldAlert className="h-8 w-8 text-primary" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">You need access to view this page.</h2>
          <p className="text-muted-foreground text-base leading-relaxed">
            Sign in with an account that has permission for this academy area.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          {user ? (
            <Button onClick={() => navigate(defaultView)} className="gap-2">
              <HomeIcon className="h-4 w-4" />
              Go to Dashboard
            </Button>
          ) : (
            <Button onClick={() => navigate('login')} className="gap-2">
              <LogIn className="h-4 w-4" />
              Sign In
            </Button>
          )}
          <Button variant="outline" onClick={() => navigate('landing')}>
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}

function BackendErrorPage({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-1 items-center justify-center min-h-[70vh] px-4">
      <div className="text-center max-w-md space-y-5">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <ShieldAlert className="h-8 w-8 text-destructive" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Academy data could not load.</h2>
          <p className="text-muted-foreground text-base leading-relaxed">{message}</p>
        </div>
        <Button onClick={onRetry} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </div>
    </div>
  );
}

// Views that should show the sidebar when user is logged in
const sidebarViews = [
  'dashboard',
  'courses',
  'course-detail',
  'lesson',
  'practice',
  'broker-mail',
  'load-board',
  'fleet-training',
  'certificates',
  'profile',
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
];

function ViewRouter({ mounted }: { mounted: boolean }) {
  const { currentView, user, authLoading, dataLoading, backendError, retryBackend } = useAppStore();

  if (!mounted) {
    return (
      <div className="flex flex-1">
        <main className="flex-1 overflow-auto">
          <ViewLoading />
        </main>
      </div>
    );
  }

  if (authLoading || dataLoading) {
    return (
      <div className="flex flex-1">
        <main className="flex-1 overflow-auto">
          <ViewLoading />
        </main>
      </div>
    );
  }

  if (backendError) {
    return <BackendErrorPage message={backendError} onRetry={() => void retryBackend()} />;
  }

  // Protected route check — but only after mount (server has no user)
  if (!isKnownView(currentView)) {
    return <NotFoundPage />;
  }

  if (mounted && !canAccessView(currentView, user)) {
    return <AccessBlockedPage />;
  }

  const getViewContent = () => {
    switch (currentView) {
      case 'landing':
        return <LandingPage />;
      case 'login':
        return <LoginForm />;
      case 'signup':
        return <SignupForm />;
      case 'apply':
        return <StudentApplicationPage />;
      case 'forgot-password':
        return <ForgotPasswordForm />;
      case 'signout':
        return <SignOutPage />;
      case 'courses':
        return <CourseCatalog />;
      case 'course-detail':
        return <CourseDetail />;
      case 'lesson':
        return <LessonPlayer />;
      case 'dashboard':
        if (normalizeRole(user?.role) === 'instructor') return <TeacherDashboard />;
        if (normalizeRole(user?.role) === 'admin') return <AdminDashboard />;
        return <StudentDashboard />;
      case 'profile':
        return <StudentProfile />;
      case 'pricing':
        return <PricingPage />;
      case 'certificates':
        return <CertificateWall />;
      case 'certificate-verify':
        return <CertificateVerify />;
      case 'practice':
        return <PracticeList />;
      case 'practice-detail':
        return <PracticeDetail />;
      case 'broker-mail':
        return <BrokerMail />;
      case 'load-board':
        return <LoadBoard />;
      case 'fleet-training':
        return <FleetTraining />;
      case 'teacher-dashboard':
        return <TeacherDashboard />;
      case 'admin-dashboard':
        return <AdminDashboard />;
      case 'analytics':
        return <ProgressAnalytics />;
      case 'study-timer':
        return <StudyTimer />;
      case 'achievements':
        return <Achievements />;
      case 'quiz':
        return <QuizPage />;
      case 'bookmarks':
        return <CourseBookmarks />;
      case 'roadmap':
        return <LearningRoadmap />;
      case 'notes':
        return <CourseNotes />;
      case 'weekly-report':
        return <WeeklyReport />;
      case 'settings':
        return <SettingsPage />;
      case 'toolkit':
        return <DispatcherToolkit />;
      case 'career-center':
        return <CareerCenter />;
      case 'study-groups':
        return <StudyGroups />;
      case 'glossary':
        return <TruckingGlossary />;
      case 'mentorship':
        return <Mentorship />;
      case 'resources':
        return <ResourceLibrary />;
      case 'video-library':
        return <VideoLibrary />;
      case 'discussions':
        return <DiscussionList />;
      case 'about':
        return <AboutPage />;
      case 'contact':
        return <ContactPage />;
      case 'privacy':
        return <LegalPage kind="privacy" />;
      case 'terms':
        return <LegalPage kind="terms" />;
      case 'refund':
        return <LegalPage kind="refund" />;
      case 'not-found':
        return <NotFoundPage />;
      default:
        return <NotFoundPage />;
    }
  };

  const viewContent = getViewContent();
  const showSidebar = user && normalizeRole(user.role) === 'student' && sidebarViews.includes(currentView);

  return (
    <div className="flex flex-1">
      {showSidebar && <AppSidebar />}
      <main className="flex-1 overflow-auto page-enter">
        {viewContent}
      </main>
    </div>
  );
}

export default function Home() {
  const { currentView, user, navigate, initializeBackend } = useAppStore();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch — defer client-specific layout until mounted
  useEffect(() => {
    queueMicrotask(() => setMounted(true));
    void initializeBackend();
  }, []);

  // Hydrate from URL params on mount — URL is the source of truth
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const view = params.get('view');
      if (view) {
        const courseId = params.get('course');
        const lessonId = params.get('lesson');
        // Only hydrate if store doesn't already have this view (avoid infinite loop)
        if (view !== currentView) {
          navigate(isKnownView(view) ? view : 'not-found', courseId || undefined, lessonId || undefined);
        }
      } else {
        // No view param in URL — always reset to landing page
        // This prevents stale localStorage view from overriding the URL
        if (currentView !== 'landing') {
          useAppStore.setState({ currentView: 'landing' as AppView });
        }
      }
    }
  }, []);

  // Listen for browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const view = params.get('view') || 'landing';
      const courseId = params.get('course');
      const lessonId = params.get('lesson');
      // Update store without pushing to history again
      useAppStore.setState({
        currentView: (isKnownView(view) ? view : 'not-found') as AppView,
        selectedCourseId: courseId || null,
        selectedLessonId: lessonId || null,
      });
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Scroll to top on view change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView]);

  // Determine if we should show footer (landing, courses, pricing pages)
  const showFooter = ['landing', 'courses', 'pricing', 'apply', 'about', 'contact', 'certificates', 'certificate-verify', 'privacy', 'terms', 'refund'].includes(currentView);

  // Determine if mobile bottom nav should show
  const hiddenViewsForNav: AppView[] = ['landing', 'login', 'signup', 'forgot-password', 'signout'];
  const showMobileNav = !!user && normalizeRole(user.role) === 'student' && !hiddenViewsForNav.includes(currentView);

  return (
    <div className="flex min-h-screen flex-col" suppressHydrationWarning>
      <Header />
      <div className="flex-1">
        <ViewRouter mounted={mounted} />
      </div>
      {mounted && showFooter && <Footer />}
      {mounted && showMobileNav && <MobileBottomNav />}
      {mounted && showMobileNav && <AIChatbot />}
      {mounted && showMobileNav && <NotificationCenter />}
    </div>
  );
}
