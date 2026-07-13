'use client';

import { useState, useMemo } from 'react';
import { useAppStore } from '@/lib/store/app-store';
import type { Assignment, AssignmentSubmission } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Mail,
  Calculator,
  FileSearch,
  ClipboardCheck,
  Drama,
  Send,
  CheckCircle2,
  Clock,
  AlertCircle,
  Trophy,
  RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';

const typeIcons: Record<Assignment['type'], React.ReactNode> = {
  email: <Mail className="h-5 w-5" />,
  calculation: <Calculator className="h-5 w-5" />,
  review: <FileSearch className="h-5 w-5" />,
  checklist: <ClipboardCheck className="h-5 w-5" />,
  scenario: <Drama className="h-5 w-5" />,
};

const typeColors: Record<Assignment['type'], string> = {
  email: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  calculation: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  review: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  checklist: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  scenario: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
};

interface PracticeDetailProps {
  assignmentId?: string;
}

export function PracticeDetail({ assignmentId }: PracticeDetailProps) {
  const { user, submissions, submitAssignment, navigate, selectedLessonId, assignments } = useAppStore();
  const [selectedId, setSelectedId] = useState(assignmentId ?? selectedLessonId ?? assignments[0]?.id ?? '');
  const [response, setResponse] = useState('');

  const assignment = useMemo(
    () => assignments.find((a) => a.id === selectedId) ?? null,
    [selectedId]
  );

  const existingSubmission = useMemo(() => {
    if (!user || !assignment) return null;
    return (
      submissions
        .filter((s) => s.assignmentId === assignment.id && s.userId === user.id)
        .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())[0] ?? null
    );
  }, [user, assignment, submissions]);

  const handleSubmit = () => {
    if (!user || !assignment) return;
    if (!response.trim()) {
      toast.error('Please write your response before submitting.');
      return;
    }

    const submission: AssignmentSubmission = {
      id: `sub-${Date.now()}`,
      userId: user.id,
      assignmentId: assignment.id,
      response,
      status: 'submitted',
      submittedAt: new Date().toISOString(),
    };

    submitAssignment(submission);
    toast.success('Assignment submitted for instructor review.', { duration: 4000 });
  };

  const handleReset = () => {
    setResponse('');
  };

  const score = existingSubmission?.score;
  const approved = existingSubmission?.status === 'approved' || ((existingSubmission?.status === 'graded' || existingSubmission?.status === 'reviewed') && (score ?? 0) >= 70);
  const rejected = existingSubmission?.status === 'rejected';
  const pendingReview = existingSubmission?.status === 'submitted';

  return (
    <div className="space-y-6">
      {/* Assignment Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('practice')}
          className="text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Practice
        </Button>
        <Select
          value={selectedId}
          onValueChange={(v) => {
            setSelectedId(v);
            handleReset();
            navigate('practice-detail', undefined, v);
          }}
        >
          <SelectTrigger className="w-full sm:w-[300px]">
            <SelectValue placeholder="Select assignment" />
          </SelectTrigger>
          <SelectContent>
            {assignments.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!assignment ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <AlertCircle className="h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground">No assignment selected.</p>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className={`p-2.5 rounded-xl ${typeColors[assignment.type]}`}>
              {typeIcons[assignment.type]}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold">{assignment.title}</h1>
                <Badge variant="secondary" className={typeColors[assignment.type]}>
                  {assignment.type.charAt(0).toUpperCase() + assignment.type.slice(1)}
                </Badge>
                <Badge
                  variant="secondary"
                  className={
                    assignment.difficulty === 'beginner'
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                      : assignment.difficulty === 'intermediate'
                        ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                        : 'bg-red-500/10 text-red-500 border-red-500/20'
                  }
                >
                  {assignment.difficulty.charAt(0).toUpperCase() + assignment.difficulty.slice(1)}
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm mt-1">{assignment.description}</p>
            </div>
          </div>

          {/* Score display if already submitted */}
          {existingSubmission && (
            <Card className={`border-2 ${approved ? 'border-emerald-500/30' : rejected ? 'border-rose-500/30' : 'border-amber-500/30'}`}>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {score !== undefined && (
                    <div className="text-center">
                      <div
                        className={`text-4xl font-bold ${
                          approved ? 'text-emerald-500' : 'text-amber-500'
                        }`}
                      >
                        {score}%
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Score</p>
                    </div>
                  )}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      {approved ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      ) : rejected ? (
                        <AlertCircle className="h-5 w-5 text-rose-500" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-amber-500" />
                      )}
                      <span className="font-medium">
                        {approved ? 'Approved' : rejected ? 'Revision requested' : 'Pending instructor review'}
                      </span>
                    </div>
                    {existingSubmission.feedback && (
                      <p className="text-sm text-muted-foreground">{existingSubmission.feedback}</p>
                    )}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Submitted {new Date(existingSubmission.submittedAt).toLocaleString()}
                    </div>
                    {score !== undefined && <Progress value={score} className="h-2 mt-2" />}
                  </div>
                  {rejected && (
                    <Button variant="outline" size="sm" onClick={handleReset} className="gap-1.5">
                      <RotateCcw className="h-3.5 w-3.5" /> Revise
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Scenario */}
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Drama className="h-4 w-4 text-primary" /> Scenario
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm leading-relaxed whitespace-pre-wrap">
                    {assignment.scenario}
                  </div>
                </CardContent>
              </Card>

              {/* Response Box */}
              {!existingSubmission || rejected ? (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{rejected ? 'Submit Revision' : 'Your Response'}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {assignment.type === 'calculation' ? (
                      <div className="space-y-3">
                        <Textarea
                          placeholder="Show your calculations and explain your reasoning..."
                          value={response}
                          onChange={(e) => setResponse(e.target.value)}
                          rows={10}
                          className="resize-y font-mono text-sm"
                        />
                      </div>
                    ) : (
                      <Textarea
                        placeholder={
                          assignment.type === 'email'
                            ? 'Write your professional email response...'
                            : assignment.type === 'review'
                              ? 'Document your review findings...'
                              : assignment.type === 'checklist'
                                ? 'Create your checklist...'
                                : 'Describe your action plan and response...'
                        }
                        value={response}
                        onChange={(e) => setResponse(e.target.value)}
                        rows={10}
                        className="resize-y"
                      />
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {response.trim().split(/\s+/).filter(Boolean).length} words
                      </span>
                      <Button
                        onClick={handleSubmit}
                        disabled={!response.trim() || pendingReview}
                        className="gap-1.5"
                      >
                        <Send className="h-3.5 w-3.5" /> Submit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Your Submitted Response</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm whitespace-pre-wrap p-4 bg-muted/30 rounded-lg">
                      {existingSubmission.response}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Checklist / Requirements */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ClipboardCheck className="h-4 w-4 text-primary" /> Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {assignment.rubric.map((r, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-medium">
                          {i + 1}
                        </div>
                        <div>
                          <p className="font-medium">{r.criterion}</p>
                          <p className="text-xs text-muted-foreground">{r.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Rubric / Scoring */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-amber-500" /> Rubric
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {assignment.rubric.map((r, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>{r.criterion}</span>
                          <span className="font-medium text-primary">{r.weight}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary/60 transition-all"
                            style={{ width: `${r.weight}%` }}
                          />
                        </div>
                      </div>
                    ))}
                    <Separator className="my-2" />
                    <div className="flex items-center justify-between text-sm font-medium">
                      <span>Total</span>
                      <span>100%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
