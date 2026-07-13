'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import {
  Sun,
  Moon,
  Menu,
  LogOut,
  User,
  LayoutDashboard,
  BookOpen,
  Award,
  Shield,
  GraduationCap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/store/app-store';
import { NotificationBell } from '@/components/academy/shared/notification-bell';
import { getDefaultViewForRole, getRoleLabel, normalizeRole, type AuthRole } from '@/lib/auth/access-control';

const roleBadgeConfig: Record<AuthRole, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive'; icon: typeof Shield }> = {
  admin: { label: 'Admin', variant: 'destructive', icon: Shield },
  instructor: { label: 'Instructor', variant: 'default', icon: GraduationCap },
  student: { label: 'Student', variant: 'secondary', icon: User },
  guest: { label: 'Guest', variant: 'outline', icon: User },
};

export function Header() {
  const { user, currentView, navigate } = useAppStore();
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch — don't render client-specific state until mounted
  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  const currentRole = normalizeRole(user?.role);
  const accountHomeView = getDefaultViewForRole(user?.role);

  // Map nav link labels to the view(s) they represent for active state matching
  const landingLinks = [
    { label: 'Courses', view: 'courses' as const, action: () => navigate('courses') },
    { label: 'Apply', view: 'apply' as const, action: () => navigate('apply') },
    { label: 'Pricing', view: 'pricing' as const, action: () => navigate('pricing') },
    { label: 'About', view: 'about' as const, action: () => navigate('about') },
    { label: 'Contact', view: 'contact' as const, action: () => navigate('contact') },
  ];

  const loggedInLinks = [
    {
      label: currentRole === 'student' ? 'Workspace' : 'Dashboard',
      icon: LayoutDashboard,
      view: accountHomeView,
      action: () => navigate(accountHomeView),
    },
    ...(currentRole === 'student'
      ? [
          { label: 'My Courses', icon: BookOpen, view: 'courses' as const, action: () => navigate('courses') },
          { label: 'Certificates', icon: Award, view: 'certificates' as const, action: () => navigate('certificates') },
        ]
      : []),
  ];

  const navLinks = user ? loggedInLinks : landingLinks;

  // Check if a nav link is active — supports related views (e.g., course-detail counts as courses)
  const isNavLinkActive = (linkView: string) => {
    if (currentView === linkView) return true;
    // course-detail and lesson views are "under" courses
    if (linkView === 'courses' && (currentView === 'course-detail' || currentView === 'lesson')) return true;
    // certificate-verify is under certificates
    if (linkView === 'certificates' && currentView === 'certificate-verify') return true;
    return false;
  };

  const roleConfig = user ? roleBadgeConfig[currentRole] : null;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 text-slate-900 shadow-sm shadow-slate-900/[0.03] backdrop-blur-lg supports-[backdrop-filter]:bg-white/85 dark:border-border/50 dark:bg-background/80 dark:text-foreground dark:shadow-none dark:supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <button
          onClick={() => navigate('landing')}
          className="flex items-center gap-2 rounded-md p-1 transition-opacity hover:opacity-80 focus-ring"
          aria-label="Go to homepage"
        >
          <Image
            src="/logo-simple.png"
            alt="Marokand Humo"
            width={40}
            height={40}
            className="h-10 w-auto"
          />
          <span className="hidden font-semibold tracking-tight text-slate-950 sm:inline-block dark:text-foreground">
            MAROKAND HUMO
          </span>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation" suppressHydrationWarning>
          {!mounted ? (
            // SSR: render landing links to avoid hydration mismatch
            landingLinks.map((link) => (
              <Button
                key={link.label}
                variant="ghost"
                size="sm"
                onClick={link.action}
                className="relative transition-colors duration-150 focus-ring text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                {link.label}
              </Button>
            ))
          ) : (
            navLinks.map((link) => {
              const isActive = isNavLinkActive(link.view);
              return (
                <Button
                  key={link.label}
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if ('action' in link) link.action();
                  }}
                  className={`relative transition-colors duration-150 focus-ring ${
                    isActive
                      ? 'nav-active bg-accent/50'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {'icon' in link && link.icon && (
                    <link.icon className="mr-1.5 h-4 w-4" />
                  )}
                  {link.label}
                </Button>
              );
            })
          )}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-1.5" suppressHydrationWarning>
          {/* Theme Toggle */}
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="h-9 w-9 text-slate-700 transition-colors duration-150 hover:bg-accent focus-ring dark:text-foreground"
              aria-label="Toggle theme"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
          )}

          {/* Notification Bell (logged in only) */}
          {mounted && user && <NotificationBell />}

          {/* Auth Buttons / User Menu */}
          {!mounted ? (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="transition-colors duration-150">Sign in</Button>
              <Button size="sm" className="transition-colors duration-150">Sign up</Button>
            </div>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 gap-2 rounded-full px-2 transition-colors duration-150 hover:bg-accent focus-ring">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                      {user.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                      .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden max-w-[150px] text-left leading-tight lg:block">
                    <span className="block truncate text-sm font-medium">{user.name}</span>
                    <span className="block truncate text-[11px] text-muted-foreground">{getRoleLabel(user.role)}</span>
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-60" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      {roleConfig && (
                        <Badge variant={roleConfig.variant} className="h-5 px-1.5 text-[10px] font-medium">
                          <roleConfig.icon className="mr-0.5 h-2.5 w-2.5" />
                          {roleConfig.label}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('profile')} className="cursor-pointer focus-ring">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate(accountHomeView)} className="cursor-pointer focus-ring">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('signout')} className="cursor-pointer text-destructive focus:text-destructive focus-ring">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('login')}
                className="transition-colors duration-150 hover:bg-accent hover:text-foreground focus-ring"
              >
                Sign in
              </Button>
              <Button
                size="sm"
                onClick={() => navigate('signup')}
                className="transition-colors duration-150 focus-ring"
              >
                Sign up
              </Button>
            </div>
          )}

          {/* Mobile Menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden transition-colors duration-150 hover:bg-accent focus-ring">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <SheetHeader>
                <SheetTitle>Navigation</SheetTitle>
                <SheetDescription>
                  Main site links and account actions.
                </SheetDescription>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4 pt-4" aria-label="Mobile navigation">
                {navLinks.map((link) => {
                  const isActive = isNavLinkActive(link.view);
                  return (
                    <Button
                      key={link.label}
                      variant={isActive ? 'secondary' : 'ghost'}
                      className={`justify-start transition-colors duration-150 focus-ring ${
                        isActive
                          ? 'bg-accent text-foreground font-medium'
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                      }`}
                      onClick={() => {
                        if ('action' in link) link.action();
                        setMobileOpen(false);
                      }}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      {'icon' in link && link.icon && (
                        <link.icon className="mr-2 h-4 w-4" />
                      )}
                      {link.label}
                      {isActive && (
                        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                      )}
                    </Button>
                  );
                })}

                {!user && (
                  <>
                    <div className="my-3 h-px bg-border" />
                    <p className="mb-1 px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground-secondary">
                      Account
                    </p>
                    <Button
                      variant="ghost"
                      className="justify-start text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-foreground focus-ring"
                      onClick={() => {
                        navigate('login');
                        setMobileOpen(false);
                      }}
                    >
                      Sign in
                    </Button>
                    <Button
                      className="justify-start transition-colors duration-150 focus-ring"
                      onClick={() => {
                        navigate('signup');
                        setMobileOpen(false);
                      }}
                    >
                      Sign up
                    </Button>
                  </>
                )}

                {user && (
                  <>
                    <div className="my-3 h-px bg-border" />
                    <p className="mb-1 px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground-secondary">
                      Account
                    </p>
                    <Button
                      variant="ghost"
                      className="justify-start text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-foreground focus-ring"
                      onClick={() => {
                        navigate('profile');
                        setMobileOpen(false);
                      }}
                    >
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start text-destructive transition-colors duration-150 hover:bg-destructive/10 focus-ring"
                      onClick={() => {
                        navigate('signout');
                        setMobileOpen(false);
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </Button>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
