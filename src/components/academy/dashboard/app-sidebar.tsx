'use client';

import { useState, useMemo } from 'react';
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  MonitorPlay,
  Mail,
  Truck,
  Award,
  MessageSquare,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  BarChart3,
  Timer,
  Trophy,
  Brain,
  Bookmark,
  Map,
  Search,
  ChevronDown,
  ChevronUp,
  PenTool,
  CalendarDays,
  Settings,
  PanelLeftClose,
  Wrench,
  Briefcase,
  Users,
  GraduationCap,
  FolderOpen,
  Clapperboard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';
import { useAppStore } from '@/lib/store/app-store';
import type { AppView } from '@/lib/types';
import { cn } from '@/lib/utils';

interface SidebarItem {
  label: string;
  icon: React.ElementType;
  view: AppView;
  group?: string;
  description?: string;
  isNew?: boolean;
  hasNotification?: boolean;
}

const sidebarItems: SidebarItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, view: 'dashboard', group: 'Main', description: 'Overview and stats' },
  { label: 'Analytics', icon: BarChart3, view: 'analytics', group: 'Main', description: 'Progress analytics', isNew: true },
  { label: 'My Courses', icon: BookOpen, view: 'courses', group: 'Main', description: 'Enrolled courses', hasNotification: true },
  { label: 'Learning Path', icon: Map, view: 'roadmap', group: 'Main', description: 'Your learning roadmap', isNew: true },
  { label: 'Bookmarks', icon: Bookmark, view: 'bookmarks', group: 'Main', description: 'Saved courses', isNew: true },
  { label: 'Study Notes', icon: PenTool, view: 'notes', group: 'Main', description: 'Your study journal', isNew: true },
  { label: 'Weekly Report', icon: CalendarDays, view: 'weekly-report', group: 'Main', description: 'Weekly progress summary', isNew: true },
  { label: 'Toolkit', icon: Wrench, view: 'toolkit', group: 'Main', description: 'Quick reference & terms', isNew: true },
  { label: 'Career Center', icon: Briefcase, view: 'career-center', group: 'Main', description: 'Job board & career tips', isNew: true },
  { label: 'Study Groups', icon: Users, view: 'study-groups', group: 'Main', description: 'Join live study rooms', isNew: true },
  { label: 'Glossary', icon: BookOpen, view: 'glossary', group: 'Main', description: 'Trucking terms dictionary', isNew: true },
  { label: 'Mentorship', icon: GraduationCap, view: 'mentorship', group: 'Main', description: '1-on-1 expert coaching', isNew: true },
  { label: 'Resources', icon: FolderOpen, view: 'resources', group: 'Main', description: 'Templates & guides', isNew: true },
  { label: 'Video Library', icon: Clapperboard, view: 'video-library', group: 'Main', description: 'Watch & learn with quizzes', isNew: true },
  { label: 'Practice', icon: ClipboardList, view: 'practice', group: 'Training', description: 'Practice assignments' },
  { label: 'Load Board Practice', icon: MonitorPlay, view: 'load-board', group: 'Training', description: 'Find and book loads' },
  { label: 'Broker Mail Practice', icon: Mail, view: 'broker-mail', group: 'Training', description: 'Email exercises', isNew: true },
  { label: 'Fleet Training', icon: Truck, view: 'fleet-training', group: 'Training', description: 'Vehicle management' },
  { label: 'Study Timer', icon: Timer, view: 'study-timer', group: 'Training', description: 'Pomodoro focus timer', isNew: true },
  { label: 'Quiz', icon: Brain, view: 'quiz', group: 'Training', description: 'Test your knowledge', isNew: true, hasNotification: true },
  { label: 'Milestones', icon: Trophy, view: 'achievements', group: 'Account', description: 'Learning records', isNew: true },
  { label: 'Certificates', icon: Award, view: 'certificates', group: 'Account', description: 'Your certificates' },
  { label: 'Discussions', icon: MessageSquare, view: 'discussions', group: 'Account', description: 'Community forum', hasNotification: true },
  { label: 'Profile', icon: User, view: 'profile', group: 'Account', description: 'Your profile settings' },
  { label: 'Settings', icon: Settings, view: 'settings', group: 'Account', description: 'App preferences' },
];

function groupItems(items: SidebarItem[]) {
  const groups: Record<string, SidebarItem[]> = {};
  items.forEach((item) => {
    const group = item.group || 'Other';
    if (!groups[group]) groups[group] = [];
    groups[group].push(item);
  });
  return groups;
}

function UserAvatar({ name, sidebarOpen }: { name: string; sidebarOpen: boolean }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Training progress calculation
  const trainingPoints = 450;
  const pointsToNext = 1000;
  const milestone = 4;
  const progressPercent = Math.round((trainingPoints / pointsToNext) * 100);

  return (
    <div className={cn(
      'flex flex-col transition-all duration-300',
      sidebarOpen ? 'px-4 py-3' : 'px-0 py-2 items-center'
    )}>
      <div className="flex items-center gap-3 w-full">
        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold ring-2 ring-primary/20">
          {initials}
        </div>
        {sidebarOpen && (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{name}</p>
            <p className="text-[11px] text-muted-foreground truncate">Student · Milestone {milestone}</p>
          </div>
        )}
      </div>
      {/* Training progress bar */}
      {sidebarOpen && (
        <div className="mt-2 w-full">
          <div className="flex items-center justify-between text-[9px] text-muted-foreground mb-1">
            <span className="flex items-center gap-0.5"><BarChart3 className="h-2.5 w-2.5 text-primary" /> {trainingPoints} pts</span>
            <span>{pointsToNext} pts</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-muted/50 xp-progress-bar">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function AppSidebar() {
  const { currentView, navigate, sidebarOpen, toggleSidebar, user } =
    useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const grouped = groupItems(sidebarItems);

  // Filter items based on search
  const filteredGrouped = useMemo(() => {
    if (!searchQuery.trim()) return grouped;
    const q = searchQuery.toLowerCase();
    const result: Record<string, SidebarItem[]> = {};
    for (const [group, items] of Object.entries(grouped)) {
      const filtered = items.filter(
        (item) =>
          item.label.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q)
      );
      if (filtered.length > 0) {
        result[group] = filtered;
      }
    }
    return result;
  }, [grouped, searchQuery]);

  const toggleGroup = (group: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [group]: !prev[group] }));
  };

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'relative flex h-full flex-col border-r border-border/50 bg-card/50 transition-all duration-300',
          sidebarOpen ? 'w-64' : 'w-16'
        )}
      >
        {/* User Avatar at Top */}
        <div className="border-b border-border/50">
          {user && <UserAvatar name={user.name} sidebarOpen={sidebarOpen} />}
        </div>

        {/* Quick Search */}
        {sidebarOpen && (
          <div className="px-3 py-2 border-b border-border/50">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Quick search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-7 pl-8 text-xs bg-muted/30 border-border/50 focus-visible:ring-1"
              />
            </div>
          </div>
        )}

        {/* Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-3 top-6 z-10 h-6 w-6 rounded-full border bg-background shadow-sm hover:bg-muted"
          onClick={toggleSidebar}
          aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {sidebarOpen ? (
            <ChevronLeft className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
        </Button>

        <ScrollArea className="flex-1 px-2 py-3">
          <nav className="flex flex-col gap-1">
            {Object.entries(filteredGrouped).map(([group, items], groupIndex) => {
              const isCollapsed = collapsedGroups[group];
              return (
                <div key={group}>
                  {/* Section dividers between groups with collapse/expand */}
                  {groupIndex > 0 && (
                    <div className="my-2 mx-3">
                      <Separator className="mb-2" />
                      {sidebarOpen && (
                        <button
                          onClick={() => toggleGroup(group)}
                          className="flex items-center justify-between w-full px-1 group/section"
                        >
                          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 group-hover/section:text-muted-foreground transition-colors">
                            {group}
                          </p>
                          {isCollapsed ? (
                            <ChevronDown className="h-2.5 w-2.5 text-muted-foreground/30" />
                          ) : (
                            <ChevronUp className="h-2.5 w-2.5 text-muted-foreground/30" />
                          )}
                        </button>
                      )}
                    </div>
                  )}
                  {groupIndex === 0 && sidebarOpen && (
                    <button
                      onClick={() => toggleGroup(group)}
                      className="mb-1 flex items-center justify-between w-full px-3 group/section"
                    >
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 group-hover/section:text-muted-foreground transition-colors">
                        {group}
                      </p>
                      {isCollapsed ? (
                        <ChevronDown className="h-2.5 w-2.5 text-muted-foreground/30" />
                      ) : (
                        <ChevronUp className="h-2.5 w-2.5 text-muted-foreground/30" />
                      )}
                    </button>
                  )}
                  {/* Collapsible section with smooth animation */}
                  <div
                    className={cn(
                      'transition-all duration-300 ease-in-out overflow-hidden',
                      isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[500px] opacity-100'
                    )}
                  >
                    {items.map((item) => {
                      const isActive =
                        currentView === item.view ||
                        (item.view === 'courses' && currentView === 'course-detail') ||
                        (item.view === 'courses' && currentView === 'lesson');

                      const button = (
                        <Button
                          key={item.view}
                          variant="ghost"
                          className={cn(
                            'w-full transition-all relative',
                            sidebarOpen
                              ? 'justify-start gap-3 px-3'
                              : 'justify-center px-0',
                            isActive
                              ? 'bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary sidebar-active-item'
                              : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                          )}
                          onClick={() => navigate(item.view)}
                          aria-current={isActive ? 'page' : undefined}
                        >
                          <div className="relative">
                            <item.icon className="h-4 w-4 shrink-0" />
                          </div>
                          {sidebarOpen && (
                            <span className="truncate text-sm">{item.label}</span>
                          )}
                          {/* NEW badge */}
                          {item.isNew && sidebarOpen && (
                            <Badge className="ml-auto text-[8px] px-1 py-0 h-4 bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                              NEW
                            </Badge>
                          )}
                        </Button>
                      );

                      if (!sidebarOpen) {
                        return (
                          <Tooltip key={item.view}>
                            <TooltipTrigger asChild>{button}</TooltipTrigger>
                            <TooltipContent side="right" sideOffset={8}>
                              <div>
                                <p className="font-medium text-xs">{item.label}</p>
                                {item.description && (
                                  <p className="text-muted-foreground text-[10px]">{item.description}</p>
                                )}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        );
                      }

                      // When sidebar is open, use Tooltip for description on hover
                      return (
                        <Tooltip key={item.view}>
                          <TooltipTrigger asChild>{button}</TooltipTrigger>
                          {item.description && (
                            <TooltipContent side="right" sideOffset={8} className="hidden lg:block">
                              <p className="text-[11px]">{item.description}</p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Bottom section: Help & Support + Collapse + Logout */}
        <div className="border-t border-border/50 p-2 space-y-1">
          {/* Help & Support */}
          {sidebarOpen ? (
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 px-3 text-muted-foreground hover:text-foreground hover:bg-muted"
              onClick={() => navigate('contact')}
            >
              <HelpCircle className="h-4 w-4 shrink-0" />
              <span className="text-sm">Help & Support</span>
            </Button>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-center px-0 text-muted-foreground hover:text-foreground hover:bg-muted"
                  onClick={() => navigate('contact')}
                >
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8}>
                <div>
                  <p className="font-medium text-xs">Help & Support</p>
                  <p className="text-muted-foreground text-[10px]">Get help and contact us</p>
                </div>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Collapse sidebar toggle at bottom */}
          {sidebarOpen && (
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 px-3 text-muted-foreground hover:text-foreground hover:bg-muted"
              onClick={toggleSidebar}
            >
              <PanelLeftClose className="h-4 w-4 shrink-0" />
              <span className="text-sm">Collapse Sidebar</span>
            </Button>
          )}

          <Separator className="mx-2" />

          {/* Logout */}
          {sidebarOpen ? (
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 px-3 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => navigate('signout')}
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span className="text-sm">Sign out</span>
            </Button>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-center px-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => navigate('signout')}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8}>
                Sign out
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}
