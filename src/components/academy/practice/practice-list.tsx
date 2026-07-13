'use client';

import { useState, useMemo } from 'react';
import { useAppStore } from '@/lib/store/app-store';
import type { Assignment } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Mail,
  Calculator,
  FileSearch,
  ClipboardCheck,
  Drama,
  Zap,
  Search,
  ArrowRight,
  Trophy,
  CheckCircle2,
  Circle,
  Clock,
  RotateCcw,
  PlayCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';

const typeIcons: Record<Assignment['type'], React.ReactNode> = {
  email: <Mail className="h-4 w-4" />,
  calculation: <Calculator className="h-4 w-4" />,
  review: <FileSearch className="h-4 w-4" />,
  checklist: <ClipboardCheck className="h-4 w-4" />,
  scenario: <Drama className="h-4 w-4" />,
};

const typeLabels: Record<Assignment['type'], string> = {
  email: 'Broker Email',
  calculation: 'Load Calculation',
  review: 'Rate Review',
  checklist: 'Document Checklist',
  scenario: 'Scenario',
};

const typeColors: Record<Assignment['type'], string> = {
  email: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  calculation: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  review: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  checklist: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  scenario: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
};

const difficultyColors: Record<Assignment['difficulty'], string> = {
  beginner: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  intermediate: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  advanced: 'bg-red-500/10 text-red-500 border-red-500/20',
};

const difficultyDotColors: Record<Assignment['difficulty'], string> = {
  beginner: 'bg-emerald-500',
  intermediate: 'bg-amber-500',
  advanced: 'bg-red-500',
};

type CompletionStatus = 'not_started' | 'in_progress' | 'needs_revision' | 'completed';

const statusConfig: Record<CompletionStatus, { label: string; icon: React.ReactNode; color: string }> = {
  not_started: {
    label: 'Not Started',
    icon: <Circle className="h-3 w-3" />,
    color: 'bg-muted text-muted-foreground border-border',
  },
  in_progress: {
    label: 'Submitted',
    icon: <Clock className="h-3 w-3" />,
    color: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  },
  needs_revision: {
    label: 'Needs Revision',
    icon: <RotateCcw className="h-3 w-3" />,
    color: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  },
  completed: {
    label: 'Approved',
    icon: <CheckCircle2 className="h-3 w-3" />,
    color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  },
};

export function PracticeList() {
  const { navigate, submissions, user, assignments } = useAppStore();

  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const getSubmissionForAssignment = (assignmentId: string) => {
    if (!user) return null;
    return submissions
      .filter((s) => s.assignmentId === assignmentId && s.userId === user.id)
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())[0] ?? null;
  };

  const getCompletionStatus = (assignmentId: string): CompletionStatus => {
    const submission = getSubmissionForAssignment(assignmentId);
    if (!submission) return 'not_started';
    if (submission.status === 'approved' || submission.status === 'graded' || submission.status === 'reviewed') return 'completed';
    if (submission.status === 'rejected') return 'needs_revision';
    return 'in_progress';
  };

  const completedCount = assignments.filter(
    (a) => getCompletionStatus(a.id) === 'completed'
  ).length;
  const inProgressCount = assignments.filter(
    (a) => getCompletionStatus(a.id) === 'in_progress'
  ).length;
  const revisionCount = assignments.filter(
    (a) => getCompletionStatus(a.id) === 'needs_revision'
  ).length;

  const filtered = useMemo(() => {
    return assignments.filter((a) => {
      if (typeFilter !== 'all' && a.type !== typeFilter) return false;
      if (difficultyFilter !== 'all' && a.difficulty !== difficultyFilter) return false;
      if (searchQuery && !a.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [assignments, typeFilter, difficultyFilter, searchQuery]);

  // In-progress assignments for "Recently Updated" section
  const inProgressAssignments = assignments.filter(
    (a) => getCompletionStatus(a.id) === 'in_progress'
  );

  const progressPercent = Math.round((completedCount / assignments.length) * 100);

  const getActionButton = (assignment: Assignment) => {
    const status = getCompletionStatus(assignment.id);
    switch (status) {
      case 'completed':
        return { label: 'Review', icon: <RotateCcw className="h-3.5 w-3.5" />, variant: 'outline' as const };
      case 'needs_revision':
        return { label: 'Revise', icon: <RotateCcw className="h-3.5 w-3.5" />, variant: 'default' as const };
      case 'in_progress':
        return { label: 'View Submission', icon: <ArrowRight className="h-3.5 w-3.5" />, variant: 'outline' as const };
      default:
        return { label: 'Start Practice', icon: <PlayCircle className="h-3.5 w-3.5" />, variant: 'default' as const };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            Practice Assignments
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Apply what you&apos;ve learned through realistic dispatch scenarios
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-amber-500" />
          <span className="text-sm text-muted-foreground">
            {completedCount} of {assignments.length} completed
          </span>
        </div>
      </div>

      {/* Progress Summary */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent stat-card-gradient-border">
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-foreground">
                  {completedCount} of {assignments.length} assignments completed
                </p>
                <span className="text-sm text-muted-foreground">{progressPercent}%</span>
              </div>
              <div className="relative h-2.5 bg-muted/30 rounded-full overflow-hidden progress-shimmer-bar">
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary to-primary/80"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5">
                <Circle className="h-3 w-3 text-muted-foreground" />
                {assignments.length - completedCount - inProgressCount - revisionCount} Not started
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3 w-3 text-amber-500" />
                {inProgressCount} Submitted
              </span>
              <span className="flex items-center gap-1.5">
                <RotateCcw className="h-3 w-3 text-rose-500" />
                {revisionCount} Revision
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                {completedCount} Done
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recently Updated - In Progress Assignments */}
      {inProgressAssignments.length > 0 && (
        <div>
          <h2 className="text-base font-semibold mb-3 flex items-center gap-2 text-foreground">
            <Clock className="h-4 w-4 text-amber-500" />
            Continue Where You Left Off
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {inProgressAssignments.map((assignment) => {
              const status = getCompletionStatus(assignment.id);
              const statusInfo = statusConfig[status];
              const actionBtn = getActionButton(assignment);

              return (
                <Card
                  key={assignment.id}
                  className={`group glass-practice-card hover:border-amber-500/30 transition-all border-amber-500/20 bg-amber-500/[0.02]`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-md ${typeColors[assignment.type]}`}>
                          {typeIcons[assignment.type]}
                        </div>
                        <Badge variant="secondary" className={typeColors[assignment.type]}>
                          {typeLabels[assignment.type]}
                        </Badge>
                      </div>
                      <Badge variant="secondary" className={`text-[10px] gap-1 ${statusInfo.color}`}>
                        {statusInfo.icon}
                        {statusInfo.label}
                      </Badge>
                    </div>
                    <CardTitle className="text-base mt-2 leading-tight">{assignment.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {assignment.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${difficultyDotColors[assignment.difficulty]}`} />
                        <Badge variant="secondary" className={difficultyColors[assignment.difficulty]}>
                          {assignment.difficulty.charAt(0).toUpperCase() + assignment.difficulty.slice(1)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        {assignment.rubric.length} criteria
                      </div>
                    </div>
                    <Button
                      className="w-full gap-1.5"
                      variant={actionBtn.variant}
                      onClick={() => {
                        navigate('practice-detail', undefined, assignment.id);
                      }}
                    >
                      {actionBtn.icon}
                      {actionBtn.label}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Gradient Divider */}
      <div className="gradient-divider" />

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search assignments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="email">Broker Email</SelectItem>
                <SelectItem value="calculation">Load Calculation</SelectItem>
                <SelectItem value="review">Rate Review</SelectItem>
                <SelectItem value="checklist">Document Checklist</SelectItem>
                <SelectItem value="scenario">Scenario</SelectItem>
              </SelectContent>
            </Select>
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Assignment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((assignment) => {
          const status = getCompletionStatus(assignment.id);
          const statusInfo = statusConfig[status];
          const actionBtn = getActionButton(assignment);

          return (
            <Card
              key={assignment.id}
              className={`group glass-practice-card hover:border-primary/30 transition-all ${
                status === 'completed'
                  ? 'border-emerald-500/20'
                  : status === 'in_progress'
                  ? 'border-amber-500/20'
                  : status === 'needs_revision'
                  ? 'border-rose-500/20'
                  : ''
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-md ${typeColors[assignment.type]}`}>
                      {typeIcons[assignment.type]}
                    </div>
                    <Badge variant="secondary" className={typeColors[assignment.type]}>
                      {typeLabels[assignment.type]}
                    </Badge>
                  </div>
                  <Badge variant="secondary" className={`text-[10px] gap-1 ${statusInfo.color}`}>
                    {statusInfo.icon}
                    {statusInfo.label}
                  </Badge>
                </div>
                <CardTitle className="text-base mt-2 leading-tight">{assignment.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {assignment.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${difficultyDotColors[assignment.difficulty]}`} />
                    <Badge variant="secondary" className={difficultyColors[assignment.difficulty]}>
                      {assignment.difficulty.charAt(0).toUpperCase() + assignment.difficulty.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    {assignment.rubric.length} criteria
                  </div>
                </div>
                <Button
                  className="w-full gap-1.5"
                  variant={actionBtn.variant}
                  onClick={() => {
                    navigate('practice-detail', undefined, assignment.id);
                  }}
                >
                  {actionBtn.icon}
                  {actionBtn.label}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <Search className="h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground">No assignments match your filters.</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setTypeFilter('all');
              setDifficultyFilter('all');
              setSearchQuery('');
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}
