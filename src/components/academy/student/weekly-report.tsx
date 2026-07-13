'use client';

import { useState, useMemo } from 'react';
import { motion, type Variants } from 'framer-motion';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  BookOpen,
  Brain,
  Flame,
  TrendingUp,
  Trophy,
  Star,
  Target,
  Edit3,
  Zap,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useAppStore } from '@/lib/store/app-store';
import { toast } from 'sonner';

function getWeekDates(offset: number) {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset + offset * 7);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { monday, sunday };
}

function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
};

const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getWeekReportData(weekOffset: number) {
  const seed = weekOffset + 100;
  const hoursStudied = weekOffset === 0 ? 12.5 : weekOffset === -1 ? 10.2 : 8.7;
  const lessonsCompleted = weekOffset === 0 ? 8 : weekOffset === -1 ? 6 : 4;
  const quizzesTaken = weekOffset === 0 ? 3 : weekOffset === -1 ? 2 : 1;
  const currentStreak = weekOffset === 0 ? 5 : weekOffset === -1 ? 3 : 2;

  const dailyActivity = dayNames.map((day, i) => {
    const h = [2.0, 1.5, 2.5, 1.0, 3.0, 1.5, 1.0];
    const l = [1, 1, 2, 1, 2, 1, 0];
    return {
      day,
      hours: weekOffset === 0 ? h[i] : weekOffset === -1 ? h[i] * 0.8 : h[i] * 0.6,
      lessons: weekOffset === 0 ? l[i] : weekOffset === -1 ? Math.max(0, l[i] - 1) : Math.max(0, l[i] - 1),
    };
  });

  const courseProgress = [
    { name: 'Dispatch Fundamentals', change: weekOffset === 0 ? 15 : weekOffset === -1 ? 12 : 8, color: 'bg-primary' },
    { name: 'HOS / ELD Basics', change: weekOffset === 0 ? 22 : weekOffset === -1 ? 10 : 5, color: 'bg-emerald-500' },
    { name: 'Load Board Mastery', change: weekOffset === 0 ? 8 : weekOffset === -1 ? 5 : 3, color: 'bg-amber-500' },
    { name: 'Broker Communication', change: weekOffset === 0 ? 12 : weekOffset === -1 ? 8 : 6, color: 'bg-purple-500' },
  ];

  const achievements = weekOffset === 0
    ? [
        { name: '5-Day Streak', icon: Flame, description: 'Studied 5 days in a row' },
        { name: 'Quick Learner', icon: Zap, description: 'Completed 5 lessons in one day' },
      ]
    : weekOffset === -1
      ? [{ name: 'First Quiz Passed', icon: Brain, description: 'Passed your first quiz' }]
      : [];

  const studyTimeDistribution = [
    { name: 'Dispatch Fundamentals', hours: 4.0, color: '#hsl(var(--primary))' },
    { name: 'HOS / ELD Basics', hours: 3.5, color: '#10b981' },
    { name: 'Load Board Mastery', hours: 2.8, color: '#f59e0b' },
    { name: 'Broker Communication', hours: 2.2, color: '#8b5cf6' },
  ];

  const bestDay = dailyActivity.reduce((best, d) => (d.hours > best.hours ? d : best), dailyActivity[0]);
  const longestSession = weekOffset === 0 ? 2.5 : weekOffset === -1 ? 2.0 : 1.5;

  const prevHours = weekOffset === 0 ? 10.2 : weekOffset === -1 ? 8.7 : 7.5;
  const hoursChange = hoursStudied > 0 ? Math.round(((hoursStudied - prevHours) / prevHours) * 100) : 0;

  return {
    hoursStudied,
    lessonsCompleted,
    quizzesTaken,
    currentStreak,
    dailyActivity,
    courseProgress,
    achievements,
    studyTimeDistribution,
    bestDay,
    longestSession,
    hoursChange,
  };
}

export function WeeklyReport() {
  const [weekOffset, setWeekOffset] = useState(0);
  const { userPreferences, updateUserPreferences } = useAppStore();
  const [editingGoals, setEditingGoals] = useState(false);
  const [goalsText, setGoalsText] = useState(userPreferences.nextWeekGoals);

  const { monday, sunday } = getWeekDates(weekOffset);
  const weekData = getWeekReportData(weekOffset);

  const totalDistributionHours = weekData.studyTimeDistribution.reduce(
    (sum, d) => sum + d.hours,
    0
  );

  const handleSaveGoals = () => {
    updateUserPreferences({ nextWeekGoals: goalsText });
    setEditingGoals(false);
    toast.success('Goals saved for next week');
  };

  // Pie chart segments
  const pieSegments = useMemo(() => {
    const cumulativePercents: number[] = [];
    weekData.studyTimeDistribution.reduce((acc, item) => {
      const percent = (item.hours / totalDistributionHours) * 100;
      cumulativePercents.push(acc + percent);
      return acc + percent;
    }, 0);

    return weekData.studyTimeDistribution.map((item, i) => {
      const percent = (item.hours / totalDistributionHours) * 100;
      const prevCumulative = i === 0 ? 0 : cumulativePercents[i - 1];
      const startAngle = prevCumulative * 3.6;
      const endAngle = cumulativePercents[i] * 3.6;

      // SVG arc calculation
      const startRad = ((startAngle - 90) * Math.PI) / 180;
      const endRad = ((endAngle - 90) * Math.PI) / 180;
      const r = 80;
      const cx = 100;
      const cy = 100;

      const x1 = cx + r * Math.cos(startRad);
      const y1 = cy + r * Math.sin(startRad);
      const x2 = cx + r * Math.cos(endRad);
      const y2 = cy + r * Math.sin(endRad);

      const largeArc = percent > 50 ? 1 : 0;

      return {
        ...item,
        percent,
        path:
          percent >= 99.9
            ? `M ${cx},${cy - r} A ${r},${r} 0 1,1 ${cx - 0.01},${cy - r} Z`
            : `M ${cx},${cy} L ${x1},${y1} A ${r},${r} 0 ${largeArc},1 ${x2},${y2} Z`,
      };
    });
  }, [weekData.studyTimeDistribution, totalDistributionHours]);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <CalendarDays className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Weekly Report</h1>
            <p className="text-sm text-muted-foreground">
              Your learning progress at a glance
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setWeekOffset((w) => w - 1)}
            aria-label="Previous week"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="px-4 py-2 rounded-lg bg-muted/50 text-sm font-medium min-w-[180px] text-center">
            Week of {formatDate(monday)} – {formatDate(sunday)}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setWeekOffset((w) => Math.min(0, w + 1))}
            disabled={weekOffset >= 0}
            aria-label="Next week"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <motion.div
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        key={weekOffset}
      >
        {/* Overview Stats */}
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          variants={itemVariants}
        >
          <Card className="stat-card-gradient-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{weekData.hoursStudied}h</p>
                <p className="text-xs text-muted-foreground">Hours Studied</p>
                {weekData.hoursChange !== 0 && (
                  <p className={`text-[10px] flex items-center gap-0.5 ${weekData.hoursChange >= 0 ? 'arrow-up-green' : 'arrow-down-red'}`}>
                    {weekData.hoursChange >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {weekData.hoursChange >= 0 ? '+' : ''}{weekData.hoursChange}%
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
          <Card className="stat-card-gradient-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{weekData.lessonsCompleted}</p>
                <p className="text-xs text-muted-foreground">Lessons Completed</p>
              </div>
            </CardContent>
          </Card>
          <Card className="stat-card-gradient-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Brain className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{weekData.quizzesTaken}</p>
                <p className="text-xs text-muted-foreground">Quizzes Taken</p>
              </div>
            </CardContent>
          </Card>
          <Card className="stat-card-gradient-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Flame className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{weekData.currentStreak}</p>
                <p className="text-xs text-muted-foreground">Day Streak</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Daily Heatmap Grid */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Daily Activity Heatmap
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1.5">
                {weekData.dailyActivity.map((day, i) => {
                  const maxHours = Math.max(...weekData.dailyActivity.map((d) => d.hours), 1);
                  const intensity = day.hours / maxHours;
                  const isBestDay = day.day === weekData.bestDay.day;
                  return (
                    <div key={day.day} className="flex flex-col items-center gap-1.5">
                      <span className="text-[10px] font-medium text-muted-foreground">{day.day}</span>
                      <div
                        className={`heatmap-cell w-full aspect-square rounded-md flex items-center justify-center text-[10px] font-bold ${
                          isBestDay ? 'most-productive-day heatmap-cell-active' : ''
                        } ${intensity > 0.7 ? 'bg-primary/70 text-primary-foreground' : intensity > 0.4 ? 'bg-primary/40 text-foreground' : intensity > 0.1 ? 'bg-primary/15 text-foreground' : 'bg-muted/20 text-muted-foreground'}`}
                        title={`${day.hours.toFixed(1)}h studied`}
                      >
                        {day.hours > 0 ? `${day.hours.toFixed(1)}` : ''}
                      </div>
                      {day.lessons > 0 && (
                        <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4">
                          {day.lessons}L
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-2 mt-3 text-[10px] text-muted-foreground">
                <span>Less</span>
                <div className="flex gap-1">
                  <div className="w-4 h-3 rounded-sm bg-muted/20" />
                  <div className="w-4 h-3 rounded-sm bg-primary/15" />
                  <div className="w-4 h-3 rounded-sm bg-primary/40" />
                  <div className="w-4 h-3 rounded-sm bg-primary/70" />
                </div>
                <span>More</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Daily Breakdown + Highlights Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Daily Breakdown */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Daily Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2">
                  {weekData.dailyActivity.map((day) => {
                    const maxHours = Math.max(
                      ...weekData.dailyActivity.map((d) => d.hours),
                      1
                    );
                    const barHeight = Math.max(
                      (day.hours / maxHours) * 100,
                      4
                    );
                    return (
                      <div
                        key={day.day}
                        className="flex flex-col items-center gap-2"
                      >
                        <span className="text-xs text-muted-foreground">
                          {day.hours.toFixed(1)}h
                        </span>
                        <div className="w-full h-24 bg-muted/30 rounded-md relative overflow-hidden">
                          <motion.div
                            className="absolute bottom-0 w-full bg-gradient-to-t from-primary to-primary/70 rounded-md"
                            initial={{ height: 0 }}
                            animate={{ height: `${barHeight}%` }}
                            transition={{
                              type: 'spring',
                              stiffness: 200,
                              damping: 20,
                              delay: 0.1,
                            }}
                          />
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">
                          {day.day}
                        </span>
                        {day.lessons > 0 && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1 py-0 h-4"
                          >
                            {day.lessons}L
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Week Highlights */}
          <motion.div variants={itemVariants}>
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Star className="h-4 w-4 text-amber-500" />
                  Week Highlights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/10">
                  <Trophy className="h-5 w-5 text-emerald-500 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Best Day</p>
                    <p className="text-xs text-muted-foreground">
                      {weekData.bestDay.day} — {weekData.bestDay.hours.toFixed(1)}h
                      studied
                    </p>
                  </div>
                  <Badge className="ml-auto bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px]">⭐ Most Productive</Badge>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10">
                  <Clock className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Longest Session</p>
                    <p className="text-xs text-muted-foreground">
                      {weekData.longestSession.toFixed(1)}h continuous study
                    </p>
                  </div>
                </div>
                <div className={`flex items-center gap-3 p-3 rounded-lg ${weekData.hoursChange >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                  <div className={weekData.hoursChange >= 0 ? 'arrow-up-green' : 'arrow-down-red'}>
                    {weekData.hoursChange >= 0 ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium">vs Last Week</p>
                    <p className={`text-xs ${weekData.hoursChange >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      {weekData.hoursChange >= 0 ? '+' : ''}{weekData.hoursChange}% more hours
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Course Progress Changes + Study Time Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Course Progress Changes */}
          <motion.div variants={itemVariants}>
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  Course Progress This Week
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {weekData.courseProgress.map((course) => (
                  <div key={course.name} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{course.name}</span>
                      <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-xs">
                        +{course.change}%
                      </Badge>
                    </div>
                    <Progress value={course.change * 4} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Study Time Distribution - CSS Pie Chart */}
          <motion.div variants={itemVariants}>
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  Study Time Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* SVG Pie Chart */}
                  <div className="shrink-0">
                    <svg
                      viewBox="0 0 200 200"
                      className="w-40 h-40"
                      role="img"
                      aria-label="Study time distribution pie chart"
                    >
                      {pieSegments.map((seg, i) => (
                        <motion.path
                          key={i}
                          d={seg.path}
                          fill={seg.color}
                          opacity={0.8}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 0.8, scale: 1 }}
                          transition={{ delay: i * 0.1, duration: 0.3 }}
                          style={{ transformOrigin: '100px 100px' }}
                        />
                      ))}
                      {/* Center hole for donut */}
                      <circle
                        cx="100"
                        cy="100"
                        r="50"
                        className="fill-card"
                      />
                      <text
                        x="100"
                        y="95"
                        textAnchor="middle"
                        className="fill-foreground text-lg font-bold"
                        style={{ fontSize: '18px' }}
                      >
                        {totalDistributionHours.toFixed(0)}h
                      </text>
                      <text
                        x="100"
                        y="112"
                        textAnchor="middle"
                        className="fill-muted-foreground text-xs"
                        style={{ fontSize: '10px' }}
                      >
                        total
                      </text>
                    </svg>
                  </div>

                  {/* Legend */}
                  <div className="flex-1 space-y-2 w-full">
                    {weekData.studyTimeDistribution.map((item, i) => {
                      const colors = [
                        'bg-primary',
                        'bg-emerald-500',
                        'bg-amber-500',
                        'bg-purple-500',
                      ];
                      return (
                        <div
                          key={i}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`h-3 w-3 rounded-full ${colors[i]}`}
                            />
                            <span className="text-sm">{item.name}</span>
                          </div>
                          <span className="text-sm font-medium">
                            {item.hours}h
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Achievements Earned */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Award className="h-4 w-4 text-amber-500" />
                Achievements Earned This Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              {weekData.achievements.length === 0 ? (
                <div className="text-center py-6">
                  <Award className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No achievements earned this week
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Keep studying to unlock new badges!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {weekData.achievements.map((ach) => (
                    <div
                      key={ach.name}
                      className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/10"
                    >
                      <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                        <ach.icon className="h-5 w-5 text-amber-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{ach.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {ach.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Goals for Next Week */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  Goals for Next Week
                </CardTitle>
                {!editingGoals && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs gap-1"
                    onClick={() => {
                      setGoalsText(userPreferences.nextWeekGoals);
                      setEditingGoals(true);
                    }}
                  >
                    <Edit3 className="h-3 w-3" />
                    Edit
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {editingGoals ? (
                <div className="space-y-3">
                  <Textarea
                    value={goalsText}
                    onChange={(e) => setGoalsText(e.target.value)}
                    rows={4}
                    placeholder="What do you want to accomplish next week?&#10;- Complete HOS/ELD course&#10;- Pass Load Board quiz&#10;- Study 2 hours daily"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSaveGoals}>
                      Save Goals
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingGoals(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  {userPreferences.nextWeekGoals ? (
                    <div className="text-sm text-foreground/80 whitespace-pre-line">
                      {userPreferences.nextWeekGoals}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <Target className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        No goals set for next week yet
                      </p>
                      <Button
                        variant="link"
                        size="sm"
                        className="text-xs mt-1"
                        onClick={() => {
                          setGoalsText('');
                          setEditingGoals(true);
                        }}
                      >
                        Set your goals
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
