'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, PenLine } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface CourseReviewsProps {
  courseId: string;
}

const AVATAR_COLORS = [
  'bg-primary/20 text-primary',
  'bg-emerald-500/20 text-emerald-600',
  'bg-amber-500/20 text-amber-600',
  'bg-rose-500/20 text-rose-600',
  'bg-violet-500/20 text-violet-600',
  'bg-cyan-500/20 text-cyan-600',
];

interface ReviewData {
  name: string;
  initials: string;
  focus: string;
  text: string;
}

const REVIEWS: ReviewData[] = [
  {
    name: 'New Dispatcher',
    initials: 'ND',
    focus: 'Practice exercises',
    text: 'The practical exercises made the dispatch workflow easier to understand step by step.',
  },
  {
    name: 'Career Student',
    initials: 'CS',
    focus: 'Broker communication',
    text: 'The broker communication section gave me useful phrases and structure for professional emails.',
  },
  {
    name: 'Operations Learner',
    initials: 'OL',
    focus: 'Beginner learning',
    text: 'The course felt approachable for a beginner and helped me identify what to practice next.',
  },
  {
    name: 'Compliance Student',
    initials: 'CP',
    focus: 'Career preparation',
    text: 'The career lessons helped me organize a dispatch portfolio and prepare for interview-style questions.',
  },
];

export function CourseReviews({ courseId: _courseId }: CourseReviewsProps) {
  const handleShowAll = () => {
    toast.info('Feedback view', { description: 'Full feedback is managed from the instructor dashboard.' });
  };

  const handleWriteReview = () => {
    toast.info('Feedback submission', { description: 'Submit course feedback from your enrolled course dashboard.' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-foreground">
            <MessageSquare className="h-5 w-5 text-primary" />
            Course Feedback
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
            <p className="text-sm text-muted-foreground">
              Feedback themes shown here summarize the learning experience this course is designed to deliver.
            </p>
          </div>

          <div className="space-y-4">
            {REVIEWS.map((review, index) => (
              <motion.div
                key={review.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="flex gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors"
              >
                <div
                  className={`h-9 w-9 shrink-0 rounded-full flex items-center justify-center text-xs font-semibold ${AVATAR_COLORS[index % AVATAR_COLORS.length]}`}
                >
                  {review.initials}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{review.name}</span>
                    <Badge variant="secondary" className="text-[10px] px-1.5">
                      {review.focus}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{review.text}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button variant="outline" className="gap-2 flex-1" onClick={handleShowAll}>
              <MessageSquare className="h-4 w-4" />
              Show More Feedback
            </Button>
            <Button className="gap-2 flex-1" onClick={handleWriteReview}>
              <PenLine className="h-4 w-4" />
              Share Feedback
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
