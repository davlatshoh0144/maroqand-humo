'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useAppStore } from '@/lib/store/app-store';
import type { Course, Lesson, LessonProgress } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Play,
  BookOpen,
  Lock,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  FileText,
  Link2,
  ClipboardList,
  MessageSquare,
  Save,
  ArrowLeft,
  Menu,
  Star,
  Clock,
  Zap,
  GraduationCap,
  List,
  Keyboard,
  HelpCircle,
  Download,
  ChevronDown,
  ChevronUp,
  PenLine,
  Loader2,
  PanelLeftClose,
  PanelLeftOpen,
  Video,
  Eye,
  Home,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { normalizeRole } from '@/lib/auth/access-control';
import { buildYouTubeEmbedUrl } from '@/lib/data/lesson-videos';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

/* ------------------------------------------------------------------ */
/* LessonSidebar — extracted as its own component to avoid the         */
/* "Cannot create components during render" lint error                 */
/* ------------------------------------------------------------------ */

interface LessonSidebarProps {
  course: Course;
  currentLessonId: string;
  progressMap: Record<string, { completed: boolean; checklistData: Record<string, boolean> }>;
  isPaid: boolean;
  completedLessons: number;
  progressPercent: number;
  onNavigate: (view: 'course-detail', courseId: string) => void;
  onSelectLesson: (courseId: string, lessonId: string) => void;
  onUpgrade: () => void;
  onCloseMobile: () => void;
}

function LessonSidebar({
  course,
  currentLessonId,
  progressMap,
  isPaid,
  completedLessons,
  progressPercent,
  onNavigate,
  onSelectLesson,
  onUpgrade,
  onCloseMobile,
}: LessonSidebarProps) {
  const isLessonUnlocked = (l: Lesson, idx: number) => {
    if (l.isFree) return true;
    if (isPaid) return true;
    if (idx === 0) return true;
    const prevLesson = course.lessons[idx - 1];
    if (!prevLesson) return false;
    return progressMap[prevLesson.id]?.completed ?? false;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onNavigate('course-detail', course.id)}
          className="mb-3 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Course
        </Button>
        <h3 className="font-semibold text-sm line-clamp-2">{course.title}</h3>
        <div className="mt-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>{completedLessons}/{course.lessons.length} lessons</span>
            <span>{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2">
          {course.lessons.map((l, idx) => {
            const unlocked = isLessonUnlocked(l, idx);
            const completed = progressMap[l.id]?.completed;
            const isCurrent = l.id === currentLessonId;
            return (
              <button
                key={l.id}
                onClick={() => {
                  if (!unlocked) {
                    if (!isPaid && !l.isFree) {
                      onUpgrade();
                    }
                    return;
                  }
                  onSelectLesson(course.id, l.id);
                  onCloseMobile();
                }}
                className={`w-full text-left px-3 py-2.5 rounded-lg mb-1 flex items-center gap-2 transition-colors ${
                  isCurrent
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : unlocked
                      ? 'hover:bg-muted/50'
                      : 'opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex-shrink-0">
                  {completed ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : !unlocked ? (
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  ) : isCurrent ? (
                    <Play className="h-4 w-4 text-primary" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/40" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-medium truncate ${isCurrent ? 'text-primary' : ''}`}>
                    {l.title}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">{l.durationMin}m</span>
                    {l.isFree && (
                      <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4 ml-1 bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                        Free
                      </Badge>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Success animation for marking lesson complete                        */
/* ------------------------------------------------------------------ */
function SuccessAnimation({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
    >
      <div className="relative">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="h-24 w-24 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center"
        >
          <CheckCircle2 className="h-12 w-12 text-emerald-500" />
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Keyboard Shortcuts Dialog                                            */
/* ------------------------------------------------------------------ */
function KeyboardShortcutsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const shortcuts = [
    { keys: '→', description: 'Go to next lesson (when current is completed)' },
    { keys: '←', description: 'Go to previous lesson' },
    { keys: 'N', description: 'Toggle notes panel' },
    { keys: 'T', description: 'Toggle table of contents' },
    { keys: 'M', description: 'Mark lesson complete' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-4 w-4" /> Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Navigate lessons faster with these shortcuts.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {shortcuts.map((s) => (
            <div key={s.keys} className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{s.description}</span>
              <kbd className="inline-flex h-6 items-center rounded border border-border bg-muted px-2 text-xs font-mono text-foreground">
                {s.keys}
              </kbd>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function LessonVideoFallback({ sourceUrl }: { sourceUrl: string }) {
  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-video bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center p-6">
        <div className="max-w-sm text-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-amber-500/15 border border-amber-400/30 flex items-center justify-center mx-auto">
            <Video className="h-8 w-8 text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">
              {sourceUrl ? 'Video cannot be embedded here' : 'Lesson video unavailable'}
            </p>
            <p className="mt-1 text-xs text-slate-300">
              {sourceUrl
                ? 'Open the verified source video in a new tab.'
                : 'This lesson does not have a video source yet.'}
            </p>
          </div>
          {sourceUrl && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => window.open(sourceUrl, '_blank', 'noopener,noreferrer')}
            >
              <Play className="h-3.5 w-3.5 mr-1.5" />
              Open Video
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

function EmbeddedLessonVideo({
  embedUrl,
  lessonTitle,
  sourceUrl,
}: {
  embedUrl: string;
  lessonTitle: string;
  sourceUrl: string;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  if (hasError) return <LessonVideoFallback sourceUrl={sourceUrl} />;

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-video bg-slate-950">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950">
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading lesson video
            </div>
          </div>
        )}
        <iframe
          src={embedUrl}
          title={`${lessonTitle} video`}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          className="absolute inset-0 h-full w-full"
        />
      </div>
    </Card>
  );
}

function LessonVideoFrame({ lesson }: { lesson: Lesson }) {
  const sourceUrl = lesson.videoUrl?.trim() ?? '';
  const embedUrl = useMemo(() => (sourceUrl ? buildYouTubeEmbedUrl(sourceUrl) : null), [sourceUrl]);

  if (!embedUrl) return <LessonVideoFallback sourceUrl={sourceUrl} />;

  return (
    <EmbeddedLessonVideo
      key={embedUrl}
      embedUrl={embedUrl}
      lessonTitle={lesson.title}
      sourceUrl={sourceUrl}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Main LessonPlayer component                                         */
/* ------------------------------------------------------------------ */

export function LessonPlayer() {
  const {
    user,
    selectedCourseId,
    selectedLessonId,
    lessonProgress,
    notes,
    navigate,
    updateProgress,
    trackLessonTime,
    addNote,
    updateNote,
    enrollments,
    courses,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState('notes');
  const [noteText, setNoteText] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [shortcutsDialogOpen, setShortcutsDialogOpen] = useState(false);
  const [tocCollapsed, setTocCollapsed] = useState(false);
  const [notesExpanded, setNotesExpanded] = useState(true);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastAutoSaved, setLastAutoSaved] = useState<Date | null>(null);
  const [noteLessonId, setNoteLessonId] = useState<string | null>(null);
  const [showShortcutsOverlay, setShowShortcutsOverlay] = useState(false);
  const [showFloatingBack, setShowFloatingBack] = useState(false);
  const mainContentRef = useRef<HTMLDivElement>(null);

  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const course = useMemo(
    () => courses.find((c) => c.id === selectedCourseId) ?? null,
    [courses, selectedCourseId]
  );

  const lesson = useMemo(() => {
    if (!course) return null;
    return course.lessons.find((l) => l.id === selectedLessonId) ?? null;
  }, [course, selectedLessonId]);

  const isEnrolled = enrollments.some(
    (e) => e.userId === user?.id && e.courseId === selectedCourseId && e.status === 'active'
  );
  const normalizedRole = normalizeRole(user?.role);
  const isPaid = isEnrolled || normalizedRole === 'instructor' || normalizedRole === 'admin';

  const progressMap = useMemo(() => {
    const map: Record<string, { completed: boolean; checklistData: Record<string, boolean> }> = {};
    lessonProgress.forEach((p) => {
      if (p.userId !== user?.id) return;
      map[p.lessonId] = { completed: p.completed, checklistData: p.checklistData };
    });
    return map;
  }, [lessonProgress, user?.id]);

  const currentProgress = lesson ? progressMap[lesson.id] : null;
  const checklistData = currentProgress?.checklistData ?? {};
  const allChecklistComplete = lesson
    ? lesson.checklist.every((_, i) => checklistData[`item-${i}`])
    : false;

  const currentLessonIndex = course && lesson ? course.lessons.findIndex((l) => l.id === lesson.id) : -1;
  const nextLesson =
    course && currentLessonIndex >= 0 && currentLessonIndex < course.lessons.length - 1
      ? course.lessons[currentLessonIndex + 1]
      : null;
  const prevLesson =
    course && currentLessonIndex > 0
      ? course.lessons[currentLessonIndex - 1]
      : null;

  const completedLessons = course
    ? course.lessons.filter((l) => progressMap[l.id]?.completed).length
    : 0;
  const progressPercent = course
    ? Math.round((completedLessons / course.lessons.length) * 100)
    : 0;

  const lessonNotes = useMemo(
    () => notes.filter((n) => n.lessonId === selectedLessonId && n.userId === user?.id),
    [notes, selectedLessonId, user?.id]
  );

  useEffect(() => {
    if (!lesson || !user) return;
    const startedAt = Date.now();
    return () => {
      const seconds = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
      trackLessonTime(lesson.id, seconds);
    };
  }, [lesson, trackLessonTime, user]);

  const isLessonUnlocked = useCallback(
    (l: Lesson, idx: number) => {
      if (l.isFree) return true;
      if (isPaid) return true;
      if (!isEnrolled) return false;
      if (idx === 0) return true;
      const prevLessonCheck = course?.lessons[idx - 1];
      if (!prevLessonCheck) return false;
      return progressMap[prevLessonCheck.id]?.completed ?? false;
    },
    [isPaid, isEnrolled, progressMap, course]
  );

  const handleChecklistToggle = (index: number) => {
    if (!lesson || !user) return;
    const key = `item-${index}`;
    const newData = { ...checklistData, [key]: !checklistData[key] };
    const allDone = lesson.checklist.every((_, i) => newData[`item-${i}`]);
    updateProgress(lesson.id, allDone && Boolean(currentProgress?.completed), newData);
    if (!checklistData[key] && newData[key]) {
      toast.success('Checklist item completed!', { duration: 2000 });
    }
  };

  const handleMarkComplete = () => {
    if (!lesson || !user) return;
    if (!allChecklistComplete) {
      toast.error('Please complete all checklist items first.');
      return;
    }
    updateProgress(lesson.id, true, checklistData);
    setShowSuccessAnimation(true);
    toast.success('Lesson marked as complete! 🎉', { duration: 3000 });
  };

  const handleNextLesson = () => {
    if (!nextLesson || !course) return;
    if (!isLessonUnlocked(nextLesson, currentLessonIndex + 1)) {
      if (!isPaid && !nextLesson.isFree) {
        setUpgradeDialogOpen(true);
        return;
      }
    }
    navigate('lesson', course.id, nextLesson.id);
    setSidebarOpen(false);
  };

  const handlePrevLesson = () => {
    if (!prevLesson || !course) return;
    if (!isLessonUnlocked(prevLesson, currentLessonIndex - 1)) {
      if (!isPaid && !prevLesson.isFree) {
        setUpgradeDialogOpen(true);
        return;
      }
    }
    navigate('lesson', course.id, prevLesson.id);
    setSidebarOpen(false);
  };

  // Auto-save notes
  const autoSaveNotes = useCallback(() => {
    if (!noteText.trim() || !selectedLessonId) return;
    const existing = lessonNotes[0];
    setIsAutoSaving(true);
    // Simulate a brief save delay for UX
    setTimeout(() => {
      if (existing) {
        updateNote(existing.id, noteText);
      } else {
        addNote(noteText, selectedLessonId, selectedCourseId ?? undefined);
      }
      setLastAutoSaved(new Date());
      setIsAutoSaving(false);
    }, 300);
  }, [noteText, selectedLessonId, selectedCourseId, lessonNotes, updateNote, addNote]);

  // Auto-save timer — saves every 5 seconds when there's unsaved text
  useEffect(() => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    if (noteText.trim()) {
      autoSaveTimerRef.current = setTimeout(() => {
        autoSaveNotes();
      }, 5000);
    }
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [noteText, autoSaveNotes]);

  // Load existing notes into textarea when lesson changes (during render, not in effect)
  if (selectedLessonId !== noteLessonId) {
    setNoteLessonId(selectedLessonId);
    if (lessonNotes.length > 0) {
      setNoteText(lessonNotes[0].content);
    } else {
      setNoteText('');
    }
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if (e.key === '?') {
        e.preventDefault();
        setShowShortcutsOverlay((prev) => !prev);
        return;
      }

      if (e.key === 'ArrowRight' && nextLesson && currentProgress?.completed) {
        e.preventDefault();
        handleNextLesson();
      } else if (e.key === 'ArrowLeft' && prevLesson) {
        e.preventDefault();
        handlePrevLesson();
      } else if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setNotesExpanded((prev) => !prev);
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        setTocCollapsed((prev) => !prev);
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        if (!currentProgress?.completed && allChecklistComplete && lesson) {
          handleMarkComplete();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextLesson, prevLesson, currentProgress?.completed, currentLessonIndex, course, isPaid, isLessonUnlocked, handleNextLesson, handlePrevLesson, allChecklistComplete, currentProgress, lesson]);

  // Floating back button visibility on scroll
  useEffect(() => {
    const el = mainContentRef.current;
    if (!el) return;
    const handleScroll = () => {
      setShowFloatingBack(el.scrollTop > 300);
    };
    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSaveNote = () => {
    if (!noteText.trim() || !selectedLessonId) return;
    const existing = lessonNotes[0];
    if (existing) {
      updateNote(existing.id, noteText);
    } else {
      addNote(noteText, selectedLessonId, selectedCourseId ?? undefined);
    }
    setLastAutoSaved(new Date());
    toast.success('Note saved!');
  };

  // Lesson resources from the course catalog
  const lessonResources = useMemo(() => {
    if (!lesson) return [];
    return lesson.resources.map((r) => ({
      ...r,
      type: r.url.endsWith('.pdf') ? 'pdf' as const : 'template' as const,
    }));
  }, [lesson]);

  if (!course || !lesson) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <GraduationCap className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-2xl font-bold">No Lesson Selected</h2>
        <p className="text-muted-foreground">Choose a course and lesson to start learning.</p>
        <Button onClick={() => navigate('courses')}>Browse Courses</Button>
      </div>
    );
  }

  const sidebarProps: LessonSidebarProps = {
    course,
    currentLessonId: lesson.id,
    progressMap,
    isPaid,
    completedLessons,
    progressPercent,
    onNavigate: (view, courseId) => navigate(view, courseId),
    onSelectLesson: (courseId, lessonId) => navigate('lesson', courseId, lessonId),
    onUpgrade: () => setUpgradeDialogOpen(true),
    onCloseMobile: () => setSidebarOpen(false),
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] relative">
      {/* Thin progress bar at very top with shimmer */}
      <div className="w-full h-1 bg-muted/30 progress-shimmer-bar">
        <div
          className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Table of Contents Sidebar - Collapsible */}
        <div className={`hidden lg:flex flex-col border-r border-border/50 transition-all duration-300 ease-in-out ${tocCollapsed ? 'w-0 overflow-hidden' : 'w-80'}`}>
          <div className="flex items-center justify-between p-3 border-b border-border/50">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Contents</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setTocCollapsed(true)}
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <LessonSidebar {...sidebarProps} />
          </div>
        </div>

        {/* Toggle TOC button when collapsed */}
        {tocCollapsed && (
          <div className="hidden lg:flex flex-col items-center pt-2 border-r border-border/50">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setTocCollapsed(false)}
              aria-label="Expand sidebar"
            >
              <PanelLeftOpen className="h-4 w-4" />
            </Button>
            <span className="text-[9px] text-muted-foreground mt-1 writing-mode-vertical" style={{ writingMode: 'vertical-rl' }}>
              TOC
            </span>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto" ref={mainContentRef}>
          <div className="p-4 lg:p-6 space-y-6 max-w-4xl mx-auto">
            {/* Progress Breadcrumb Trail: Course > Lesson */}
            <nav className="flex items-center gap-1.5 text-xs text-muted-foreground overflow-hidden">
              <button
                onClick={() => navigate('course-detail', course.id)}
                className="hover:text-primary transition-colors truncate max-w-[200px] underline-offset-2 hover:underline"
              >
                {course.title}
              </button>
              <ChevronRight className="h-3 w-3 flex-shrink-0 opacity-40" />
              <span className="text-foreground font-medium truncate">
                {lesson.title}
              </span>
              {/* Lesson type indicator badge */}
              <Badge
                variant="secondary"
                className={`ml-auto text-[10px] gap-1 h-5 ${
                  lesson.durationMin > 0
                    ? 'bg-primary/10 text-primary border-primary/20'
                    : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                }`}
              >
                {lesson.durationMin > 0 ? (
                  <><Video className="h-2.5 w-2.5" /> Video</>
                ) : (
                  <><BookOpen className="h-2.5 w-2.5" /> Reading</>
                )}
              </Badge>
            </nav>
            {/* Mobile controls row */}
            <div className="lg:hidden flex items-center gap-2 flex-wrap">
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Menu className="h-4 w-4 mr-1" /> Outline
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0">
                  <SheetTitle className="sr-only">Lesson Outline</SheetTitle>
                  <LessonSidebar {...sidebarProps} />
                </SheetContent>
              </Sheet>

              {/* Table of Contents Popover for mobile */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <List className="h-4 w-4 mr-1" /> Contents
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-0 max-h-80 overflow-y-auto" align="start">
                  <div className="p-2">
                    <p className="text-xs font-medium text-muted-foreground px-2 py-1.5">
                      {course.lessons.length} Lessons
                    </p>
                    {course.lessons.map((l, idx) => {
                      const unlocked = isLessonUnlocked(l, idx);
                      const completed = progressMap[l.id]?.completed;
                      const isCurrent = l.id === lesson.id;
                      return (
                        <button
                          key={l.id}
                          onClick={() => {
                            if (unlocked) {
                              navigate('lesson', course.id, l.id);
                            }
                          }}
                          disabled={!unlocked}
                          className={`w-full text-left px-2 py-1.5 rounded text-xs flex items-center gap-2 transition-colors ${
                            isCurrent
                              ? 'bg-primary/10 text-primary font-medium'
                              : unlocked
                                ? 'hover:bg-muted/50'
                                : 'opacity-40 cursor-not-allowed'
                          }`}
                        >
                          {completed ? (
                            <CheckCircle2 className="h-3 w-3 text-emerald-500 flex-shrink-0" />
                          ) : (
                            <span className="h-3 w-3 flex-shrink-0 text-muted-foreground">{idx + 1}</span>
                          )}
                          <span className="truncate">{l.title}</span>
                        </button>
                      );
                    })}
                  </div>
                </PopoverContent>
              </Popover>

              <div className="ml-auto flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handlePrevLesson}
                  disabled={!prevLesson || !isLessonUnlocked(prevLesson, currentLessonIndex - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleNextLesson}
                  disabled={!nextLesson || !currentProgress?.completed}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Video / Content Area */}
            <LessonVideoFrame lesson={lesson} />

            {/* Collapsible Note-taking area below video */}
            <Card>
              <button
                onClick={() => setNotesExpanded(!notesExpanded)}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <PenLine className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Quick Notes</span>
                  {noteText.trim() && (
                    <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary border-primary/20 h-5">
                      Draft
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {isAutoSaving && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Loader2 className="h-3 w-3 animate-spin" /> Saving...
                    </span>
                  )}
                  {!isAutoSaving && lastAutoSaved && (
                    <span className="text-xs text-muted-foreground">
                      Saved {lastAutoSaved.toLocaleTimeString()}
                    </span>
                  )}
                  {notesExpanded ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </button>
              <AnimatePresence>
                {notesExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-3">
                      <Separator />
                      <Textarea
                        placeholder="Take notes for this lesson... (supports **bold**, *italic*, `code`)"
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        rows={5}
                        className="resize-y text-sm min-h-[100px]"
                      />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className={`text-xs ${noteText.length > 5000 ? 'text-red-500' : 'text-muted-foreground'}`}>
                            {noteText.length.toLocaleString()} / 5,000
                          </span>
                          <span className="text-xs text-muted-foreground/50">
                            Markdown: **bold** *italic* `code`
                          </span>
                        </div>
                        <Button size="sm" onClick={handleSaveNote} disabled={!noteText.trim()} className="gap-1.5">
                          <Save className="h-3.5 w-3.5" /> Save Now
                        </Button>
                      </div>
                      {lessonNotes.length > 0 && (
                        <div className="space-y-2 mt-3">
                          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Previous Notes</h4>
                          {lessonNotes.map((n) => (
                            <Card key={n.id} className="bg-muted/30">
                              <CardContent className="p-3">
                                <p className="text-sm whitespace-pre-wrap">{n.content}</p>
                                <p className="text-xs text-muted-foreground mt-2">
                                  {new Date(n.updatedAt).toLocaleString()}
                                </p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>

            {/* Lesson Title & Description */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs">
                  Lesson {lesson.orderIndex}
                </Badge>
                {lesson.isRequired && (
                  <Badge variant="secondary" className="text-xs bg-amber-500/10 text-amber-500 border-amber-500/20">
                    Required
                  </Badge>
                )}
                {lesson.isFree && (
                  <Badge variant="secondary" className="text-xs bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                    Free
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl font-bold">{lesson.title}</h1>
              <p className="text-muted-foreground">{lesson.description}</p>
            </div>

            {/* Content with Key Concept Callouts */}
            <Card>
              <CardContent className="p-6">
                <div className="prose prose-invert max-w-none">
                  {lesson.content.split('\n\n').map((paragraph, i) => {
                    // Detect key concept paragraphs (start with ** or contain "key concept" / "important")
                    const isKeyConcept = paragraph.startsWith('**') || /key concept|important|remember|note:/i.test(paragraph);
                    return isKeyConcept ? (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="key-concept-callout bg-primary/5 p-4 rounded-r-lg mb-4"
                      >
                        <p className="text-sm leading-relaxed text-foreground font-medium">
                          {paragraph.replace(/\*\*/g, '')}
                        </p>
                      </motion.div>
                    ) : (
                      <p key={i} className="text-sm leading-relaxed text-muted-foreground mb-4">
                        {paragraph}
                      </p>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Lesson Resources - Enhanced with download buttons */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Download className="h-4 w-4 text-primary" />
                  Lesson Resources
                </CardTitle>
              </CardHeader>
              <CardContent>
                {lessonResources.length > 0 ? (
                  <div className="space-y-2">
                    {lessonResources.map((r, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded flex items-center justify-center ${
                            r.type === 'pdf' ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary'
                          }`}>
                            {r.type === 'pdf' ? (
                              <FileText className="h-4 w-4" />
                            ) : (
                              <ClipboardList className="h-4 w-4" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{r.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {r.type === 'pdf' ? 'PDF Document' : 'Template'}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5"
                          onClick={() => {
                            window.open(r.url, '_blank');
                          }}
                        >
                          <Download className="h-3.5 w-3.5" /> Download
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No resources available for this lesson yet.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Interactive Checklist */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-primary" />
                  Lesson Checklist
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {lesson.checklist.map((item, index) => {
                  const checked = checklistData[`item-${index}`] ?? false;
                  return (
                    <div
                      key={index}
                      className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                        checked ? 'bg-emerald-500/5' : 'bg-muted/30'
                      }`}
                    >
                      <Checkbox
                        id={`check-${index}`}
                        checked={checked}
                        onCheckedChange={() => handleChecklistToggle(index)}
                        className={`mt-0.5 ${checked ? 'data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500' : ''}`}
                      />
                      <label
                        htmlFor={`check-${index}`}
                        className={`text-sm cursor-pointer transition-colors ${
                          checked ? 'line-through text-muted-foreground' : 'text-foreground'
                        }`}
                      >
                        {item}
                      </label>
                      {checked && <CheckCircle2 className="h-4 w-4 text-emerald-500 ml-auto mt-0.5 flex-shrink-0" />}
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 flex-wrap">
              {currentProgress?.completed ? (
                <Button disabled className="gap-2">
                  <CheckCircle2 className="h-4 w-4" /> Completed
                </Button>
              ) : (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      disabled={!allChecklistComplete}
                      className="gap-2"
                    >
                      <Star className="h-4 w-4" /> Mark Complete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Mark Lesson as Complete?</AlertDialogTitle>
                      <AlertDialogDescription>
                        You&apos;re about to mark &quot;{lesson.title}&quot; as complete. This action confirms you&apos;ve
                        reviewed all the material and completed the checklist items.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleMarkComplete}>
                        Yes, Mark Complete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              {prevLesson && (
                <Button
                  variant="outline"
                  onClick={handlePrevLesson}
                  disabled={!isLessonUnlocked(prevLesson, currentLessonIndex - 1)}
                  className="gap-2"
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </Button>
              )}
              {nextLesson && (
                <Button
                  variant="outline"
                  onClick={handleNextLesson}
                  disabled={!currentProgress?.completed}
                  className="gap-2"
                >
                  Next Lesson <ChevronRight className="h-4 w-4" />
                </Button>
              )}

              {/* Keyboard shortcut help button */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 ml-auto"
                onClick={() => setShortcutsDialogOpen(true)}
                aria-label="Keyboard shortcuts"
              >
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>

            {/* Keyboard shortcut hint */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Keyboard className="h-3.5 w-3.5" />
              <span>Use ← → to navigate • Press <kbd className="inline-flex h-5 items-center rounded border border-border bg-muted px-1 text-[10px] font-mono">?</kbd> for all shortcuts</span>
            </div>

            {/* Bottom Tabs */}
            <Card>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <div className="border-b px-4">
                  <TabsList className="w-full justify-start h-auto p-0 bg-transparent">
                    <TabsTrigger value="notes" className="gap-1.5 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-4 py-3">
                      <FileText className="h-3.5 w-3.5" /> Notes
                    </TabsTrigger>
                    <TabsTrigger value="resources" className="gap-1.5 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-4 py-3">
                      <Link2 className="h-3.5 w-3.5" /> Resources
                    </TabsTrigger>
                    <TabsTrigger value="homework" className="gap-1.5 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-4 py-3">
                      <ClipboardList className="h-3.5 w-3.5" /> Homework
                    </TabsTrigger>
                    <TabsTrigger value="discussion" className="gap-1.5 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-4 py-3">
                      <MessageSquare className="h-3.5 w-3.5" /> Discussion
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="notes" className="p-4 space-y-3">
                  <Textarea
                    placeholder="Take notes for this lesson..."
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    rows={5}
                    className="resize-y"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {isAutoSaving ? 'Auto-saving...' : noteText.trim() ? 'Auto-saves every 5s' : ''}
                    </span>
                    <Button size="sm" onClick={handleSaveNote} disabled={!noteText.trim()} className="gap-1.5">
                      <Save className="h-3.5 w-3.5" /> Save Note
                    </Button>
                  </div>
                  {lessonNotes.length > 0 && (
                    <div className="space-y-2 mt-4">
                      <h4 className="text-sm font-medium">Your Notes</h4>
                      {lessonNotes.map((n) => (
                        <Card key={n.id} className="bg-muted/30">
                          <CardContent className="p-3">
                            <p className="text-sm whitespace-pre-wrap">{n.content}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {new Date(n.updatedAt).toLocaleString()}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="resources" className="p-4">
                  {lesson.resources.length > 0 ? (
                    <div className="space-y-2">
                      {lesson.resources.map((r, i) => (
                        <a
                          key={i}
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors text-sm"
                        >
                          <Link2 className="h-4 w-4 text-primary" />
                          {r.title}
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No resources for this lesson.</p>
                  )}
                </TabsContent>

                <TabsContent value="homework" className="p-4">
                  <div className="flex flex-col items-center justify-center py-6 text-center gap-3">
                    <BookOpen className="h-10 w-10 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Practice assignments for this lesson are available in the Practice section.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('practice')}
                      className="gap-1.5"
                    >
                      <Zap className="h-3.5 w-3.5" /> Go to Practice
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="discussion" className="p-4">
                  <div className="flex flex-col items-center justify-center py-6 text-center gap-3">
                    <MessageSquare className="h-10 w-10 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Join the discussion about this lesson.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('discussions')}
                      className="gap-1.5"
                    >
                      <MessageSquare className="h-3.5 w-3.5" /> Go to Discussions
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>

      {/* Upgrade Dialog */}
      <Dialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upgrade to Access This Lesson</DialogTitle>
            <DialogDescription>
              This lesson requires a paid subscription. Upgrade your plan to unlock all lessons,
              practice assignments, and certificates.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>Unlimited access to all courses</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>All practice assignments & quizzes</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>Certificate of completion</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>Broker Mail & Load Board practice</span>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setUpgradeDialogOpen(false)}>
              Maybe Later
            </Button>
            <Button onClick={() => { setUpgradeDialogOpen(false); navigate('pricing'); }}>
              View Plans
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Keyboard Shortcuts Dialog */}
      <KeyboardShortcutsDialog open={shortcutsDialogOpen} onOpenChange={setShortcutsDialogOpen} />

      {/* Keyboard shortcuts overlay (? key to toggle) */}
      <AnimatePresence>
        {showShortcutsOverlay && !shortcutsDialogOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 right-6 z-40 bg-card border border-border/50 rounded-xl shadow-xl p-4 space-y-2 min-w-[220px]"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Shortcuts</p>
              <button onClick={() => setShowShortcutsOverlay(false)} className="text-muted-foreground hover:text-foreground">
                <Eye className="h-3.5 w-3.5" />
              </button>
            </div>
            {[
              { keys: '←', desc: 'Previous lesson' },
              { keys: '→', desc: 'Next lesson' },
              { keys: 'N', desc: 'Toggle notes' },
              { keys: 'T', desc: 'Toggle TOC' },
              { keys: 'M', desc: 'Mark complete' },
              { keys: '?', desc: 'Toggle this overlay' },
            ].map((s) => (
              <div key={s.keys} className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{s.desc}</span>
                <kbd className="inline-flex h-5 items-center rounded border border-border bg-muted px-1.5 text-[10px] font-mono text-foreground">
                  {s.keys}
                </kbd>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating "Back to Course" button when scrolled down */}
      <AnimatePresence>
        {showFloatingBack && course && (
          <motion.button
            initial={{ x: -60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -60, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={() => navigate('course-detail', course.id)}
            className="fixed left-4 bottom-6 z-40 h-10 px-3 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center gap-1.5 text-xs font-medium hover:bg-primary/90 transition-colors"
            aria-label="Back to course"
          >
            <Home className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Back to Course</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Success Animation */}
      <AnimatePresence>
        {showSuccessAnimation && (
          <SuccessAnimation onComplete={() => setShowSuccessAnimation(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
