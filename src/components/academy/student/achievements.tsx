'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  BookOpen,
  ClipboardList,
  Flame,
  MessageSquare,
  Star,
  Lock,
  Sun,
  Moon,
  Zap,
  Target,
  Crown,
  Medal,
  Diamond,
  Award,
  CheckCircle2,
  Truck,
  Mail,
  Users,
  Clock,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';

// ─── Types ───────────────────────────────────────────────────────────────────

type AchievementCategory = 'learning' | 'practice' | 'streaks' | 'social' | 'special';

interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  icon: React.ElementType;
  points: number;
  earned: boolean;
  earnedDate?: string;
  progress?: number; // 0-100
  progressLabel?: string; // e.g. "23/50 Lessons"
  isRare?: boolean;
}

// ─── Achievement Data ────────────────────────────────────────────────────────

const ACHIEVEMENTS: Achievement[] = [
  // Learning
  {
    id: 'first-lesson',
    name: 'First Lesson',
    description: 'Complete your very first lesson',
    category: 'learning',
    icon: BookOpen,
    points: 10,
    earned: true,
    earnedDate: '2025-01-15',
  },
  {
    id: 'ten-lessons',
    name: '10 Lessons',
    description: 'Complete 10 lessons across all courses',
    category: 'learning',
    icon: BookOpen,
    points: 20,
    earned: true,
    earnedDate: '2025-01-22',
  },
  {
    id: 'fifty-lessons',
    name: '50 Lessons',
    description: 'Complete 50 lessons across all courses',
    category: 'learning',
    icon: BookOpen,
    points: 50,
    earned: false,
    progress: 46,
    progressLabel: '23/50 Lessons',
  },
  {
    id: 'hundred-lessons',
    name: '100 Lessons',
    description: 'Complete 100 lessons across all courses',
    category: 'learning',
    icon: BookOpen,
    points: 80,
    earned: false,
    progress: 23,
    progressLabel: '23/100 Lessons',
  },
  {
    id: 'course-completion',
    name: 'Course Completion',
    description: 'Complete an entire course',
    category: 'learning',
    icon: Crown,
    points: 30,
    earned: false,
    progress: 68,
    progressLabel: '68% Complete',
  },
  {
    id: 'all-courses',
    name: 'All Courses',
    description: 'Complete every course in the academy',
    category: 'learning',
    icon: Crown,
    points: 100,
    earned: false,
    isRare: true,
    progress: 0,
    progressLabel: '0/5 Courses',
  },

  // Practice
  {
    id: 'first-broker-mail',
    name: 'First Broker Mail',
    description: 'Send your first practice broker email',
    category: 'practice',
    icon: Mail,
    points: 10,
    earned: true,
    earnedDate: '2025-01-18',
  },
  {
    id: 'load-board-pro',
    name: 'Load Board Pro',
    description: 'Book 10 loads on the practice load board',
    category: 'practice',
    icon: Truck,
    points: 30,
    earned: false,
    progress: 40,
    progressLabel: '4/10 Loads',
  },
  {
    id: 'fleet-master',
    name: 'Fleet Master',
    description: 'Manage all fleet vehicles successfully',
    category: 'practice',
    icon: Users,
    points: 40,
    earned: false,
    progress: 20,
    progressLabel: '1/5 Tasks',
  },
  {
    id: 'practice-10x',
    name: 'Practice 10x',
    description: 'Complete 10 practice assignments',
    category: 'practice',
    icon: ClipboardList,
    points: 20,
    earned: false,
    progress: 70,
    progressLabel: '7/10 Assignments',
  },
  {
    id: 'practice-50x',
    name: 'Practice 50x',
    description: 'Complete 50 practice assignments',
    category: 'practice',
    icon: ClipboardList,
    points: 50,
    earned: false,
    isRare: true,
    progress: 14,
    progressLabel: '7/50 Assignments',
  },

  // Streaks
  {
    id: 'streak-3',
    name: '3-Day Streak',
    description: 'Study for 3 consecutive days',
    category: 'streaks',
    icon: Flame,
    points: 10,
    earned: true,
    earnedDate: '2025-01-17',
  },
  {
    id: 'streak-7',
    name: '7-Day Streak',
    description: 'Study for 7 consecutive days',
    category: 'streaks',
    icon: Flame,
    points: 20,
    earned: true,
    earnedDate: '2025-01-24',
  },
  {
    id: 'streak-14',
    name: '14-Day Streak',
    description: 'Study for 14 consecutive days',
    category: 'streaks',
    icon: Flame,
    points: 40,
    earned: false,
    progress: 36,
    progressLabel: '5/14 Days',
  },
  {
    id: 'streak-30',
    name: '30-Day Streak',
    description: 'Study for 30 consecutive days',
    category: 'streaks',
    icon: Flame,
    points: 80,
    earned: false,
    isRare: true,
    progress: 17,
    progressLabel: '5/30 Days',
  },
  {
    id: 'streak-100',
    name: '100-Day Streak',
    description: 'Study for 100 consecutive days',
    category: 'streaks',
    icon: Flame,
    points: 150,
    earned: false,
    isRare: true,
    progress: 5,
    progressLabel: '5/100 Days',
  },

  // Social
  {
    id: 'first-discussion',
    name: 'First Discussion',
    description: 'Start your first discussion thread',
    category: 'social',
    icon: MessageSquare,
    points: 10,
    earned: true,
    earnedDate: '2025-01-20',
  },
  {
    id: 'ten-replies',
    name: '10 Replies',
    description: 'Reply to 10 discussion threads',
    category: 'social',
    icon: MessageSquare,
    points: 20,
    earned: false,
    progress: 30,
    progressLabel: '3/10 Replies',
  },
  {
    id: 'helpful-answer',
    name: 'Helpful Answer',
    description: 'Have your reply marked as helpful',
    category: 'social',
    icon: Star,
    points: 25,
    earned: false,
  },
  {
    id: 'discussion-starter',
    name: 'Discussion Starter',
    description: 'Start 5 discussion threads',
    category: 'social',
    icon: MessageSquare,
    points: 15,
    earned: false,
    progress: 20,
    progressLabel: '1/5 Discussions',
  },

  // Special
  {
    id: 'early-bird',
    name: 'Early Bird',
    description: 'Complete a study session before 8:00 AM',
    category: 'special',
    icon: Sun,
    points: 15,
    earned: false,
  },
  {
    id: 'night-owl',
    name: 'Night Owl',
    description: 'Complete a study session after 10:00 PM',
    category: 'special',
    icon: Moon,
    points: 15,
    earned: false,
  },
  {
    id: 'speed-demon',
    name: 'Speed Demon',
    description: 'Complete a lesson in under 5 minutes',
    category: 'special',
    icon: Zap,
    points: 25,
    earned: false,
  },
  {
    id: 'perfectionist',
    name: 'Perfectionist',
    description: 'Score 100% on any quiz',
    category: 'special',
    icon: Target,
    points: 30,
    earned: false,
  },
];

const CATEGORY_CONFIG: Record<AchievementCategory, { label: string; icon: React.ElementType; color: string }> = {
  learning: { label: 'Learning', icon: BookOpen, color: 'text-primary' },
  practice: { label: 'Practice', icon: ClipboardList, color: 'text-emerald-500' },
  streaks: { label: 'Streaks', icon: Flame, color: 'text-amber-500' },
  social: { label: 'Social', icon: MessageSquare, color: 'text-blue-500' },
  special: { label: 'Special', icon: Star, color: 'text-purple-500' },
};

// ─── Level System ────────────────────────────────────────────────────────────

function getLevel(totalPoints: number): { name: string; tier: string; color: string; bgColor: string; nextThreshold: number; currentThreshold: number } {
  if (totalPoints >= 1000) return { name: 'Diamond', tier: 'V', color: 'text-cyan-400', bgColor: 'bg-cyan-500/10', nextThreshold: 9999, currentThreshold: 1000 };
  if (totalPoints >= 600) return { name: 'Platinum', tier: 'IV', color: 'text-slate-300', bgColor: 'bg-slate-400/10', nextThreshold: 1000, currentThreshold: 600 };
  if (totalPoints >= 300) return { name: 'Gold', tier: 'III', color: 'text-amber-400', bgColor: 'bg-amber-500/10', nextThreshold: 600, currentThreshold: 300 };
  if (totalPoints >= 100) return { name: 'Silver', tier: 'II', color: 'text-gray-400', bgColor: 'bg-gray-400/10', nextThreshold: 300, currentThreshold: 100 };
  return { name: 'Bronze', tier: 'I', color: 'text-orange-400', bgColor: 'bg-orange-500/10', nextThreshold: 100, currentThreshold: 0 };
}

function LevelIconDisplay({ name, className }: { name: string; className?: string }) {
  switch (name) {
    case 'Diamond': return <Diamond className={className} />;
    case 'Platinum': return <Crown className={className} />;
    case 'Gold': return <Medal className={className} />;
    case 'Silver': return <Award className={className} />;
    default: return <Trophy className={className} />;
  }
}

// ─── Achievement Badge Component ─────────────────────────────────────────────

function AchievementBadge({
  achievement,
  index,
}: {
  achievement: Achievement;
  index: number;
}) {
  const { name, description, icon: Icon, points, earned, earnedDate, progress, progressLabel, isRare, category } = achievement;
  const categoryColor = CATEGORY_CONFIG[category].color;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
    >
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Card
              className={`relative overflow-hidden cursor-default transition-all duration-200 ${
                earned
                  ? 'border-primary/20 hover:border-primary/40 hover:shadow-md'
                  : 'border-muted/50 opacity-70 hover:opacity-90'
              } ${isRare && earned ? 'holo-badge-border' : ''}`}
            >
              <CardContent className="p-3 flex flex-col items-center text-center gap-2">
                {/* Badge Circle */}
                <div className="relative">
                  <div
                    className={`h-14 w-14 rounded-full flex items-center justify-center ${
                      earned
                        ? isRare
                          ? 'bg-gradient-to-br from-amber-400/20 to-amber-600/20 ring-2 ring-amber-400/40'
                          : `bg-gradient-to-br from-primary/20 to-primary/5 ring-2 ring-primary/20`
                        : 'bg-muted/30 ring-2 ring-muted/20'
                    } ${earned ? 'badge-unlock-anim' : ''}`}
                  >
                    {earned ? (
                      <Icon className={`h-6 w-6 ${isRare ? 'text-amber-400' : categoryColor}`} />
                    ) : (
                      <Icon className="h-6 w-6 text-muted-foreground/30" />
                    )}
                  </div>

                  {/* Lock overlay for unearned */}
                  {!earned && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Lock className="h-4 w-4 text-muted-foreground/40" />
                    </div>
                  )}

                  {/* Rare earned marker */}
                  {isRare && earned && (
                    <Award className="absolute -top-1 -right-1 h-3.5 w-3.5 text-amber-400" />
                  )}

                  {/* Points badge */}
                  <div className="absolute -bottom-1 -right-1 h-5 min-w-5 rounded-full bg-background border border-border/50 flex items-center justify-center px-1">
                    <span className="text-[8px] font-bold text-muted-foreground">{points}</span>
                  </div>
                </div>

                {/* Name */}
                <p className={`text-xs font-semibold leading-tight ${
                  earned ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {name}
                </p>

                {/* Progress bar for partial achievements with shimmer */}
                {!earned && progress !== undefined && progress > 0 && (
                  <div className="w-full space-y-0.5">
                    <div className="relative h-1.5 bg-muted/30 rounded-full overflow-hidden progress-shimmer-bar">
                      <motion.div
                        className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary/60 to-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut', delay: index * 0.04 }}
                      />
                    </div>
                    {progressLabel && (
                      <p className="text-[9px] text-muted-foreground">{progressLabel}</p>
                    )}
                  </div>
                )}

                {/* Earned date */}
                {earned && earnedDate && (
                  <p className="text-[9px] text-emerald-500 flex items-center gap-0.5">
                    <CheckCircle2 className="h-2.5 w-2.5" />
                    {new Date(earnedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                )}

                {/* "Locked" label */}
                {!earned && progress === undefined && (
                  <p className="text-[9px] text-muted-foreground/50">Locked</p>
                )}
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-[200px]">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <Icon className={`h-3.5 w-3.5 ${earned ? categoryColor : 'text-muted-foreground'}`} />
                <p className="font-semibold text-xs">{name}</p>
              </div>
              <p className="text-[10px] text-muted-foreground">{description}</p>
              <p className="text-[10px]">
                <span className={earned ? 'text-emerald-500' : 'text-muted-foreground'}>
                  {earned ? 'Earned' : 'Locked'}
                </span>
                {' · '}
                <span className="text-amber-500">{points} pts</span>
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </motion.div>
  );
}

// ─── Recently Earned Section ─────────────────────────────────────────────────

function RecentlyEarned({ achievements }: { achievements: Achievement[] }) {
  const earned = achievements.filter((a) => a.earned).sort((a, b) => {
    // Sort by date, most recent first
    const dateA = a.earnedDate ? new Date(a.earnedDate).getTime() : 0;
    const dateB = b.earnedDate ? new Date(b.earnedDate).getTime() : 0;
    return dateB - dateA;
  }).slice(0, 3);

  if (earned.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
        <Award className="h-4 w-4 text-amber-500" />
        Recently Earned
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {earned.map((achievement, idx) => {
          const Icon = achievement.icon;
          const categoryColor = CATEGORY_CONFIG[achievement.category].color;
          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: idx * 0.1 }}
            >
              <Card className="overflow-hidden border-primary/20 hover:shadow-md transition-shadow">
                <div className="h-1 bg-gradient-to-r from-primary/40 via-primary/20 to-transparent" />
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 ring-2 ring-primary/20 flex items-center justify-center shrink-0">
                    <Icon className={`h-5 w-5 ${categoryColor}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{achievement.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{achievement.description}</p>
                    {achievement.earnedDate && (
                      <p className="text-[10px] text-emerald-500 mt-0.5">
                        Earned {new Date(achievement.earnedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                  <Badge variant="outline" className="shrink-0 text-amber-500 border-amber-500/20 text-[10px]">
                    +{achievement.points}
                  </Badge>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Achievements Component ─────────────────────────────────────────────

export function Achievements() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const { toast } = useToast();

  // Compute stats
  const totalEarned = ACHIEVEMENTS.filter((a) => a.earned).length;
  const totalAvailable = ACHIEVEMENTS.length;
  const totalPoints = ACHIEVEMENTS.filter((a) => a.earned).reduce((sum, a) => sum + a.points, 0);
  const level = getLevel(totalPoints);
  const levelProgress = ((totalPoints - level.currentThreshold) / (level.nextThreshold - level.currentThreshold)) * 100;

  // Filter achievements
  const filteredAchievements = useMemo(() => {
    if (activeCategory === 'all') return ACHIEVEMENTS;
    return ACHIEVEMENTS.filter((a) => a.category === activeCategory);
  }, [activeCategory]);

  const handlePreviewMilestone = () => {
    const achievement = ACHIEVEMENTS.find((a) => !a.earned);
    if (achievement) {
      const Icon = achievement.icon;
      toast({
        title: (
          <span className="flex items-center gap-2">
            <span className="text-lg">🎉</span>
            Achievement Unlocked!
          </span>
        ) as unknown as string,
        description: (
          <span className="flex items-center gap-1.5">
            <Icon className="h-4 w-4 text-primary" />
            <span>
              <strong>{achievement.name}</strong> — {achievement.description}
            </span>
          </span>
        ) as unknown as string,
        duration: 5000,
      });
    }
  };

  // Points by category
  const categoryPoints = useMemo(() => {
    const result: Record<string, { earned: number; total: number }> = {};
    for (const cat of Object.keys(CATEGORY_CONFIG) as AchievementCategory[]) {
      const catAchievements = ACHIEVEMENTS.filter((a) => a.category === cat);
      result[cat] = {
        earned: catAchievements.filter((a) => a.earned).reduce((s, a) => s + a.points, 0),
        total: catAchievements.reduce((s, a) => s + a.points, 0),
      };
    }
    return result;
  }, []);

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Trophy className="h-6 w-6 text-amber-500" />
            Learning Milestones
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track course progress and completion records
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handlePreviewMilestone}
          className="gap-1.5"
        >
          <Award className="h-3.5 w-3.5" />
          Preview Milestone
        </Button>
      </div>

      {/* Level & Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Level Card */}
        <Card className="sm:col-span-2 overflow-hidden">
          <div className={`h-1.5 bg-gradient-to-r ${level.color.replace('text-', 'from-').replace('400', '400/60')}`} />
          <CardContent className="p-4 flex items-center gap-4">
            <div className={`h-16 w-16 rounded-full ${level.bgColor} ring-2 ring-current/20 flex items-center justify-center ${level.color}`}>
              <LevelIconDisplay name={level.name} className="h-8 w-8" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className={`text-lg font-bold ${level.color}`}>{level.name}</h3>
                <Badge variant="outline" className="text-[10px]">Tier {level.tier}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                {totalPoints} points · Next: {level.nextThreshold < 9999 ? `${level.nextThreshold} pts` : 'Max Level'}
              </p>
              <Progress value={Math.min(levelProgress, 100)} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Earned Count */}
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Trophy className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Earned</p>
              <p className="text-lg font-bold text-foreground">
                {totalEarned}<span className="text-sm font-normal text-muted-foreground">/{totalAvailable}</span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Total Points */}
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Star className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Points</p>
              <p className="text-lg font-bold text-foreground">{totalPoints}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card>
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Category Progress</h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {(Object.entries(CATEGORY_CONFIG) as [AchievementCategory, typeof CATEGORY_CONFIG[AchievementCategory]][]).map(([cat, config]) => {
              const points = categoryPoints[cat];
              const percent = points.total > 0 ? (points.earned / points.total) * 100 : 0;
              const CatIcon = config.icon;
              return (
                <div key={cat} className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <CatIcon className={`h-3.5 w-3.5 ${config.color}`} />
                    <span className="text-xs font-medium text-foreground">{config.label}</span>
                  </div>
                  <Progress value={percent} className="h-1.5" />
                  <p className="text-[10px] text-muted-foreground">
                    {points.earned}/{points.total} pts
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recently Earned */}
      <RecentlyEarned achievements={ACHIEVEMENTS} />

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
            activeCategory === 'all'
              ? 'bg-primary text-primary-foreground border-primary shadow-sm pill-active-indicator'
              : 'bg-card text-muted-foreground border-border/70 hover:border-primary/30 hover:text-foreground'
          }`}
        >
          All
        </button>
        {(Object.entries(CATEGORY_CONFIG) as [AchievementCategory, typeof CATEGORY_CONFIG[AchievementCategory]][]).map(([cat, config]) => {
          const CatIcon = config.icon;
          const count = ACHIEVEMENTS.filter((a) => a.category === cat).filter((a) => a.earned).length;
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border flex items-center gap-1.5 ${
                isActive
                  ? `bg-primary text-primary-foreground border-primary shadow-sm pill-active-indicator`
                  : `${config.color === 'text-primary' ? 'bg-primary/10 text-primary border-primary/20' : config.color === 'text-emerald-500' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : config.color === 'text-amber-500' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : config.color === 'text-blue-500' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-purple-500/10 text-purple-500 border-purple-500/20'} border hover:opacity-80`
              }`}
            >
              <CatIcon className="h-3 w-3" />
              <span className="hidden sm:inline">{config.label}</span>
              <span className="sm:hidden">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        <AnimatePresence mode="popLayout">
          {filteredAchievements.map((achievement, idx) => (
            <AchievementBadge
              key={achievement.id}
              achievement={achievement}
              index={idx}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Footer info */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full bg-primary/20 ring-1 ring-primary/40" />
              <span>Earned</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full bg-muted/30 ring-1 ring-muted/20" />
              <span>Locked</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Award className="h-3 w-3 text-amber-400" />
              <span>Rare milestone</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="h-3 w-3 text-muted-foreground/40" />
              <span>Not yet started</span>
            </div>
            <p className="sm:ml-auto">
              Complete lessons, practice, and build streaks to unlock more badges!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
