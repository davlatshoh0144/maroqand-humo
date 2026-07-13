'use client';

import { useReducer, useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Settings,
  Clock,
  Flame,
  CheckCircle2,
  Timer,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// ─── Types ───────────────────────────────────────────────────────────────────

type TimerPhase = 'focus' | 'short-break' | 'long-break';

interface TimerSettings {
  focusDuration: number;
  shortBreak: number;
  longBreak: number;
  sessionsBeforeLongBreak: number;
}

interface TimerSession {
  date: string;
  completedSessions: number;
  totalFocusMinutes: number;
}

interface TimerState {
  settings: TimerSettings;
  currentPhase: TimerPhase;
  currentSession: number;
  sessions: TimerSession[];
  streak: number;
  lastActiveDate: string;
  timeLeft: number;
  isRunning: boolean;
}

type TimerAction =
  | { type: 'TICK' }
  | { type: 'START_PAUSE' }
  | { type: 'RESET' }
  | { type: 'SKIP' }
  | { type: 'UPDATE_SETTINGS'; settings: TimerSettings };

// ─── Constants ───────────────────────────────────────────────────────────────

const STORAGE_KEY = 'marokand_study_timer';

const DEFAULT_SETTINGS: TimerSettings = {
  focusDuration: 25,
  shortBreak: 5,
  longBreak: 15,
  sessionsBeforeLongBreak: 4,
};

const FOCUS_OPTIONS = [15, 25, 30, 45, 60];
const SHORT_BREAK_OPTIONS = [3, 5, 10];
const LONG_BREAK_OPTIONS = [10, 15, 20];
const SESSIONS_OPTIONS = [2, 3, 4, 6];

const PHASE_CONFIG: Record<TimerPhase, { label: string; color: string; ringColor: string; bgGradient: string }> = {
  focus: {
    label: 'Focus Time',
    color: 'text-primary',
    ringColor: 'stroke-primary',
    bgGradient: 'from-primary/20 via-primary/5 to-transparent',
  },
  'short-break': {
    label: 'Short Break',
    color: 'text-emerald-500',
    ringColor: 'stroke-emerald-500',
    bgGradient: 'from-emerald-500/20 via-emerald-500/5 to-transparent',
  },
  'long-break': {
    label: 'Long Break',
    color: 'text-amber-500',
    ringColor: 'stroke-amber-500',
    bgGradient: 'from-amber-500/20 via-amber-500/5 to-transparent',
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function getPhaseDuration(phase: TimerPhase, settings: TimerSettings): number {
  switch (phase) {
    case 'focus': return settings.focusDuration * 60;
    case 'short-break': return settings.shortBreak * 60;
    case 'long-break': return settings.longBreak * 60;
  }
}

function loadTimerState(): TimerState {
  if (typeof window === 'undefined') {
    return {
      settings: DEFAULT_SETTINGS,
      currentPhase: 'focus',
      currentSession: 1,
      sessions: [],
      streak: 0,
      lastActiveDate: '',
      timeLeft: DEFAULT_SETTINGS.focusDuration * 60,
      isRunning: false,
    };
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Omit<TimerState, 'isRunning'>;
      return { ...parsed, isRunning: false };
    }
  } catch { /* ignore */ }
  return {
    settings: DEFAULT_SETTINGS,
    currentPhase: 'focus',
    currentSession: 1,
    sessions: [],
    streak: 0,
    lastActiveDate: '',
    timeLeft: DEFAULT_SETTINGS.focusDuration * 60,
    isRunning: false,
  };
}

function saveTimerState(state: TimerState): void {
  if (typeof window === 'undefined') return;
  try {
    const { isRunning: _, ...toSave } = state;
    void _;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch { /* ignore */ }
}

function playBeep(): void {
  try {
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.5);
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.frequency.value = 1000;
    osc2.type = 'sine';
    gain2.gain.setValueAtTime(0.3, ctx.currentTime + 0.3);
    gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
    osc2.start(ctx.currentTime + 0.3);
    osc2.stop(ctx.currentTime + 0.8);
  } catch { /* Web Audio API not available */ }
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// ─── Reducer ─────────────────────────────────────────────────────────────────

function timerReducer(state: TimerState, action: TimerAction): TimerState {
  switch (action.type) {
    case 'TICK': {
      if (!state.isRunning) return state;
      const newTimeLeft = state.timeLeft - 1;

      if (newTimeLeft <= 0) {
        // Timer completed — transition phase
        playBeep();
        const todayStr = getToday();

        if (state.currentPhase === 'focus') {
          // Record completed focus session
          let newSessions = [...state.sessions];
          const todayIdx = newSessions.findIndex((s) => s.date === todayStr);
          if (todayIdx >= 0) {
            newSessions[todayIdx] = {
              ...newSessions[todayIdx],
              completedSessions: newSessions[todayIdx].completedSessions + 1,
              totalFocusMinutes: newSessions[todayIdx].totalFocusMinutes + state.settings.focusDuration,
            };
          } else {
            newSessions.push({
              date: todayStr,
              completedSessions: 1,
              totalFocusMinutes: state.settings.focusDuration,
            });
          }

          // Update streak
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          let newStreak = state.streak;
          if (!state.lastActiveDate || state.lastActiveDate === yesterdayStr) {
            newStreak = state.streak + 1;
          } else if (state.lastActiveDate === todayStr) {
            newStreak = state.streak;
          } else {
            newStreak = 1;
          }

          const nextSession = state.currentSession + 1;
          const isLongBreak = nextSession > state.settings.sessionsBeforeLongBreak;
          const nextPhase: TimerPhase = isLongBreak ? 'long-break' : 'short-break';

          const updated: TimerState = {
            ...state,
            isRunning: false,
            currentPhase: nextPhase,
            currentSession: isLongBreak ? 1 : nextSession,
            timeLeft: getPhaseDuration(nextPhase, state.settings),
            sessions: newSessions,
            streak: newStreak,
            lastActiveDate: todayStr,
          };
          saveTimerState(updated);
          return updated;
        }

        // Break completed — go back to focus
        const updated: TimerState = {
          ...state,
          isRunning: false,
          currentPhase: 'focus',
          timeLeft: getPhaseDuration('focus', state.settings),
        };
        saveTimerState(updated);
        return updated;
      }

      return { ...state, timeLeft: newTimeLeft };
    }

    case 'START_PAUSE': {
      return { ...state, isRunning: !state.isRunning };
    }

    case 'RESET': {
      const updated: TimerState = {
        ...state,
        isRunning: false,
        timeLeft: getPhaseDuration(state.currentPhase, state.settings),
      };
      saveTimerState(updated);
      return updated;
    }

    case 'SKIP': {
      if (state.currentPhase === 'focus') {
        const nextSession = state.currentSession + 1;
        const isLongBreak = nextSession > state.settings.sessionsBeforeLongBreak;
        const nextPhase: TimerPhase = isLongBreak ? 'long-break' : 'short-break';
        const updated: TimerState = {
          ...state,
          isRunning: false,
          currentPhase: nextPhase,
          currentSession: isLongBreak ? 1 : nextSession,
          timeLeft: getPhaseDuration(nextPhase, state.settings),
        };
        saveTimerState(updated);
        return updated;
      }

      const updated: TimerState = {
        ...state,
        isRunning: false,
        currentPhase: 'focus',
        timeLeft: getPhaseDuration('focus', state.settings),
      };
      saveTimerState(updated);
      return updated;
    }

    case 'UPDATE_SETTINGS': {
      const updated: TimerState = {
        ...state,
        settings: action.settings,
        isRunning: false,
        timeLeft: getPhaseDuration(state.currentPhase, action.settings),
      };
      saveTimerState(updated);
      return updated;
    }

    default:
      return state;
  }
}

// ─── SVG Ring Component ──────────────────────────────────────────────────────

function TimerRing({
  progress,
  phase,
  size = 200,
}: {
  progress: number;
  phase: TimerPhase;
  size?: number;
}) {
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);
  const config = PHASE_CONFIG[phase];

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="transform -rotate-90"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-muted/20"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        className={config.ringColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
      />
    </svg>
  );
}

// ─── Settings Panel ──────────────────────────────────────────────────────────

function SettingsPanel({
  settings,
  onUpdate,
  onClose,
}: {
  settings: TimerSettings;
  onUpdate: (s: TimerSettings) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<TimerSettings>(settings);

  const handleSave = () => {
    onUpdate(draft);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Timer Settings</h3>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-7 text-xs">
          Close
        </Button>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Focus Duration (min)</label>
        <div className="flex gap-1.5">
          {FOCUS_OPTIONS.map((opt) => (
            <Button
              key={opt}
              size="sm"
              variant={draft.focusDuration === opt ? 'default' : 'outline'}
              className="h-7 text-xs px-2.5"
              onClick={() => setDraft({ ...draft, focusDuration: opt })}
            >
              {opt}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Short Break (min)</label>
        <div className="flex gap-1.5">
          {SHORT_BREAK_OPTIONS.map((opt) => (
            <Button
              key={opt}
              size="sm"
              variant={draft.shortBreak === opt ? 'default' : 'outline'}
              className="h-7 text-xs px-2.5"
              onClick={() => setDraft({ ...draft, shortBreak: opt })}
            >
              {opt}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Long Break (min)</label>
        <div className="flex gap-1.5">
          {LONG_BREAK_OPTIONS.map((opt) => (
            <Button
              key={opt}
              size="sm"
              variant={draft.longBreak === opt ? 'default' : 'outline'}
              className="h-7 text-xs px-2.5"
              onClick={() => setDraft({ ...draft, longBreak: opt })}
            >
              {opt}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Sessions before long break</label>
        <div className="flex gap-1.5">
          {SESSIONS_OPTIONS.map((opt) => (
            <Button
              key={opt}
              size="sm"
              variant={draft.sessionsBeforeLongBreak === opt ? 'default' : 'outline'}
              className="h-7 text-xs px-2.5"
              onClick={() => setDraft({ ...draft, sessionsBeforeLongBreak: opt })}
            >
              {opt}
            </Button>
          ))}
        </div>
      </div>

      <Button size="sm" className="w-full" onClick={handleSave}>
        Save Settings
      </Button>
    </motion.div>
  );
}

// ─── Main StudyTimer Component ───────────────────────────────────────────────

export function StudyTimer() {
  const [state, dispatch] = useReducer(timerReducer, undefined, loadTimerState);
  const [showSettings, setShowSettings] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { currentPhase, settings, currentSession, timeLeft, isRunning, sessions, streak } = state;
  const config = PHASE_CONFIG[currentPhase];

  const totalTime = getPhaseDuration(currentPhase, settings);
  const progress = totalTime > 0 ? (totalTime - timeLeft) / totalTime : 0;

  // Get today's stats
  const today = getToday();
  const todaySession = sessions.find((s) => s.date === today);
  const completedToday = todaySession?.completedSessions ?? 0;
  const focusMinutesToday = todaySession?.totalFocusMinutes ?? 0;

  // Timer tick via interval
  useEffect(() => {
    if (!isRunning) return;
    intervalRef.current = setInterval(() => {
      dispatch({ type: 'TICK' });
    }, 1000);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning]);

  // Session indicators
  const sessionDots = Array.from({ length: settings.sessionsBeforeLongBreak }, (_, i) => {
    const sessionNum = i + 1;
    const isCurrentSession = currentPhase === 'focus' && currentSession === sessionNum;
    const isCompleted = currentPhase === 'focus'
      ? sessionNum < currentSession
      : sessionNum <= currentSession;
    return { sessionNum, isCurrentSession, isCompleted };
  });

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Timer className="h-6 w-6 text-primary" />
            Study Timer
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Stay focused with the Pomodoro technique
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSettings(!showSettings)}
          className="gap-1.5"
        >
          <Settings className="h-3.5 w-3.5" />
          Settings
        </Button>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <Card>
            <CardContent className="p-4">
              <SettingsPanel
                settings={settings}
                onUpdate={(s) => dispatch({ type: 'UPDATE_SETTINGS', settings: s })}
                onClose={() => setShowSettings(false)}
              />
            </CardContent>
          </Card>
        )}
      </AnimatePresence>

      {/* Main Timer Card */}
      <Card className="overflow-hidden">
        <div className={`h-2 bg-gradient-to-r ${config.bgGradient}`} />
        <CardContent className="p-6 md:p-8 flex flex-col items-center gap-6">
          {/* Phase Label */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPhase}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
            >
              <Badge
                variant="outline"
                className={`text-sm px-3 py-1 ${config.color} border-current/20`}
              >
                {config.label}
              </Badge>
            </motion.div>
          </AnimatePresence>

          {/* Timer Ring */}
          <div className="relative flex items-center justify-center">
            <TimerRing progress={progress} phase={currentPhase} size={200} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold tabular-nums tracking-tight text-foreground">
                {formatTime(timeLeft)}
              </span>
              <span className="text-xs text-muted-foreground mt-1">
                Session {currentSession} of {settings.sessionsBeforeLongBreak}
              </span>
            </div>
          </div>

          {/* Session Progress Dots */}
          <div className="flex items-center gap-2">
            {sessionDots.map((dot) => (
              <motion.div
                key={dot.sessionNum}
                className={`h-3 w-3 rounded-full transition-all duration-300 ${
                  dot.isCompleted
                    ? 'bg-primary'
                    : dot.isCurrentSession
                      ? 'bg-primary/40 ring-2 ring-primary/20'
                      : 'bg-muted-foreground/20'
                }`}
                animate={dot.isCurrentSession ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => dispatch({ type: 'RESET' })}
              className="h-10 w-10 rounded-full"
              aria-label="Reset timer"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>

            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                onClick={() => dispatch({ type: 'START_PAUSE' })}
                className="h-14 w-14 rounded-full gap-0"
                aria-label={isRunning ? 'Pause timer' : 'Start timer'}
              >
                {isRunning ? (
                  <Pause className="h-6 w-6" />
                ) : (
                  <Play className="h-6 w-6 ml-0.5" />
                )}
              </Button>
            </motion.div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => dispatch({ type: 'SKIP' })}
              className="h-10 w-10 rounded-full"
              aria-label="Skip to next phase"
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Today&apos;s Focus</p>
              <p className="text-lg font-bold text-foreground">
                {focusMinutesToday} <span className="text-xs font-normal text-muted-foreground">min</span>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Sessions Today</p>
              <p className="text-lg font-bold text-foreground">{completedToday}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
              <Flame className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Current Streak</p>
              <p className="text-lg font-bold text-foreground">
                {streak} <span className="text-xs font-normal text-muted-foreground">days</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Progress */}
      <Card>
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">This Week</h3>
          <div className="flex items-end gap-1.5 h-20">
            {(() => {
              const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
              const now = new Date();
              const dayOfWeek = now.getDay();
              const todayIdx = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

              return days.map((day, i) => {
                const d = new Date(now);
                d.setDate(d.getDate() - (todayIdx - i));
                const dateStr = d.toISOString().split('T')[0];
                const session = sessions.find((s) => s.date === dateStr);
                const minutes = session?.totalFocusMinutes ?? 0;
                const maxMinutes = 120;
                const heightPercent = Math.min((minutes / maxMinutes) * 100, 100);
                const isToday = i === todayIdx;

                return (
                  <div key={day} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex items-end" style={{ height: '48px' }}>
                      <motion.div
                        className={`w-full rounded-t-sm ${isToday ? 'bg-primary' : 'bg-primary/20'}`}
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.max(heightPercent, 4)}%` }}
                        transition={{ duration: 0.5, delay: i * 0.05 }}
                      />
                    </div>
                    <span className={`text-[10px] ${isToday ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                      {day}
                    </span>
                  </div>
                );
              });
            })()}
          </div>
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card>
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">How Pomodoro Works</h3>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-[10px] font-bold text-primary">1</span>
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-foreground font-medium">Focus</span> — Work on your study material for {settings.focusDuration} minutes without distraction
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="h-5 w-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-[10px] font-bold text-emerald-500">2</span>
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-foreground font-medium">Short Break</span> — Take a {settings.shortBreak} minute break to recharge
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="h-5 w-5 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-[10px] font-bold text-amber-500">3</span>
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-foreground font-medium">Long Break</span> — After {settings.sessionsBeforeLongBreak} sessions, enjoy a {settings.longBreak} minute break
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-[10px] font-bold text-primary">4</span>
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-foreground font-medium">Repeat</span> — Keep the cycle going to build deep focus habits
              </p>
            </div>
          </div>

          {/* Session cycle visual */}
          <div className="mt-4 flex items-center gap-1.5 overflow-x-auto pb-1">
            {Array.from({ length: settings.sessionsBeforeLongBreak }).map((_, i) => (
              <div key={i} className="flex items-center gap-1.5 shrink-0">
                <div className="h-6 w-6 rounded bg-primary/10 flex items-center justify-center">
                  <span className="text-[9px] font-bold text-primary">F</span>
                </div>
                {i < settings.sessionsBeforeLongBreak - 1 && (
                  <div className="h-6 w-4 rounded bg-emerald-500/10 flex items-center justify-center">
                    <span className="text-[8px] font-bold text-emerald-500">B</span>
                  </div>
                )}
              </div>
            ))}
            <div className="flex items-center gap-1.5 shrink-0 ml-1">
              <span className="text-muted-foreground text-xs">→</span>
              <div className="h-6 w-8 rounded bg-amber-500/10 flex items-center justify-center">
                <span className="text-[8px] font-bold text-amber-500">LB</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
