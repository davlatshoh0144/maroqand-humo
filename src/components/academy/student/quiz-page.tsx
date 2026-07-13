'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Trophy,
  RotateCcw,
  BookOpen,
  AlertTriangle,
  PartyPopper,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
import { Label } from '@/components/ui/label';
import { useAppStore } from '@/lib/store/app-store';
import { cn } from '@/lib/utils';

// ─── Types ───────────────────────────────────────────────────────────────────

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface QuizData {
  id: string;
  title: string;
  courseName: string;
  questions: QuizQuestion[];
  passingScore: number;
  timeLimitMinutes: number | null;
}

interface QuizProgress {
  quizId: string;
  answers: Record<string, number>;
  currentQuestion: number;
  startedAt: number;
  timeRemaining: number | null;
}

// ─── Quiz Data ───────────────────────────────────────────────────────────────

const QUIZ_DATA: QuizData = {
  id: 'quiz-dispatch-fundamentals',
  title: 'Dispatch Fundamentals',
  courseName: 'Intro to Truck Dispatch',
  passingScore: 70,
  timeLimitMinutes: 15,
  questions: [
    {
      id: 'q1',
      question: 'What does DOT stand for in the trucking industry?',
      options: [
        'Department of Transportation',
        'Direct Operation Transit',
        'Division of Trucking',
        'Department of Transit',
      ],
      correctIndex: 0,
      explanation:
        'DOT stands for Department of Transportation, the federal agency responsible for regulating transportation in the United States, including commercial trucking.',
    },
    {
      id: 'q2',
      question: 'What is a bill of lading?',
      options: [
        'A type of truck trailer',
        'A legal document between shipper and carrier detailing the shipment',
        'A permit required for oversized loads',
        'A log of driver hours',
      ],
      correctIndex: 1,
      explanation:
        'A bill of lading (BOL) is a legal document issued by a carrier to a shipper that details the type, quantity, and destination of the goods being carried. It serves as a receipt of shipment and a document of title.',
    },
    {
      id: 'q3',
      question: 'What are deadhead miles?',
      options: [
        'Miles driven at night',
        'Miles driven with a heavy load',
        'Miles driven without a load',
        'Miles driven over the speed limit',
      ],
      correctIndex: 2,
      explanation:
        'Deadhead miles refer to miles driven without a load (empty trailer). These miles generate no revenue and are a key cost factor that dispatchers try to minimize.',
    },
    {
      id: 'q4',
      question: 'What does RPM stand for in freight pricing?',
      options: [
        'Revenue Per Mile',
        'Rate Per Month',
        'Route Performance Metric',
        'Required Permit Mileage',
      ],
      correctIndex: 0,
      explanation:
        'RPM stands for Revenue Per Mile. It is calculated by dividing the total rate by the total miles and is the key metric dispatchers use to evaluate load profitability.',
    },
    {
      id: 'q5',
      question: 'Under FMCSA Hours of Service rules, what is the maximum driving hours per day?',
      options: [
        '8 hours',
        '10 hours',
        '11 hours',
        '14 hours',
      ],
      correctIndex: 2,
      explanation:
        'Under FMCSA HOS regulations, a property-carrying driver may drive a maximum of 11 hours after 10 consecutive hours off duty. The 14-hour rule limits the overall on-duty window.',
    },
    {
      id: 'q6',
      question: 'What is a freight broker?',
      options: [
        'A truck driver who owns their own rig',
        'An intermediary between shipper and carrier who arranges transportation',
        'A government inspector for trucking companies',
        'A warehouse manager',
      ],
      correctIndex: 1,
      explanation:
        'A freight broker is a licensed intermediary who connects shippers (who need to move freight) with carriers (who have the capacity to move it). Brokers earn a commission on each load they arrange.',
    },
    {
      id: 'q7',
      question: 'What is dispatch in the trucking context?',
      options: [
        'Repairing truck engines',
        'Assigning drivers to freight loads and coordinating their routes',
        'Loading cargo onto trailers',
        'Filing tax returns for carriers',
      ],
      correctIndex: 1,
      explanation:
        'Dispatch refers to the process of assigning drivers to freight loads, coordinating pickup and delivery schedules, managing routes, and ensuring regulatory compliance throughout the transportation process.',
    },
    {
      id: 'q8',
      question: 'Which equipment type is the most common in the US trucking industry?',
      options: [
        'Flatbed',
        'Refrigerated (Reefer)',
        'Dry van',
        'Tanker',
      ],
      correctIndex: 2,
      explanation:
        'Dry van trailers are the most common equipment type in the US, accounting for roughly 50% of all trailers. They are enclosed and protect cargo from weather, making them versatile for many types of freight.',
    },
    {
      id: 'q9',
      question: 'What does FMCSA stand for?',
      options: [
        'Federal Motor Carrier Safety Administration',
        'Freight Management and Carrier Standards Agency',
        'Federal Maritime and Cargo Safety Association',
        'Fleet Motor Compliance and Safety Authority',
      ],
      correctIndex: 0,
      explanation:
        'FMCSA stands for Federal Motor Carrier Safety Administration. It is an agency within the DOT that regulates the trucking industry in the United States, focusing on safety and reducing crashes involving large trucks and buses.',
    },
    {
      id: 'q10',
      question: 'What is a rate confirmation?',
      options: [
        'A receipt for fuel purchases',
        'A document confirming the agreed shipping rate between broker and carrier',
        'A certification of driver qualifications',
        'A verification of vehicle weight',
      ],
      correctIndex: 1,
      explanation:
        'A rate confirmation (or rate con) is a document that confirms the agreed-upon shipping rate and terms between a broker and a carrier. It serves as a binding agreement and includes details like load number, rate, pickup/delivery info, and commodity.',
    },
  ],
};

// ─── Constants ───────────────────────────────────────────────────────────────

const STORAGE_KEY = 'marokand_quiz_progress';
const OPTION_LABELS = ['A', 'B', 'C', 'D'] as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function loadProgress(quizId: string): QuizProgress | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as QuizProgress;
      if (parsed.quizId === quizId) return parsed;
    }
  } catch { /* ignore */ }
  return null;
}

function saveProgress(progress: QuizProgress): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch { /* ignore */ }
}

function clearProgress(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch { /* ignore */ }
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// ─── SVG Score Ring Component ────────────────────────────────────────────────

function ScoreRing({
  score,
  passed,
  size = 160,
}: {
  score: number;
  passed: boolean;
  size?: number;
}) {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);
  const color = passed ? 'stroke-emerald-500' : 'stroke-rose-500';
  const bgRing = passed ? 'text-emerald-500/10' : 'text-rose-500/10';

  return (
    <div className="relative" style={{ width: size, height: size }}>
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
          className={bgRing}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-4xl font-bold tabular-nums"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          {score}%
        </motion.span>
        <motion.span
          className="text-xs text-muted-foreground mt-0.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          Score
        </motion.span>
      </div>
    </div>
  );
}

// ─── Confetti Component ──────────────────────────────────────────────────────

function Confetti() {
  return null;
}

// ─── Question Grid Component ─────────────────────────────────────────────────

function QuestionGrid({
  totalQuestions,
  currentQuestion,
  answers,
  onSelect,
}: {
  totalQuestions: number;
  currentQuestion: number;
  answers: Record<string, number>;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5 justify-center">
      {Array.from({ length: totalQuestions }, (_, i) => {
        const isAnswered = answers[String(i)] !== undefined;
        const isCurrent = i === currentQuestion;

        return (
          <button
            key={i}
            onClick={() => onSelect(i)}
            className={cn(
              'h-8 w-8 rounded-md text-xs font-medium transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-primary/50',
              isCurrent && !isAnswered && 'ring-2 ring-primary bg-primary/10 text-primary',
              isCurrent && isAnswered && 'ring-2 ring-primary bg-primary text-primary-foreground',
              isAnswered && !isCurrent && 'bg-primary text-primary-foreground',
              !isAnswered && !isCurrent && 'bg-muted/50 text-muted-foreground hover:bg-muted'
            )}
            aria-label={`Question ${i + 1}${isAnswered ? ' (answered)' : ''}${isCurrent ? ' (current)' : ''}`}
          >
            {i + 1}
          </button>
        );
      })}
    </div>
  );
}

// ─── Quiz Taking View ────────────────────────────────────────────────────────

function getInitialQuizState(quiz: QuizData) {
  const saved = loadProgress(quiz.id);
  if (saved) {
    return {
      currentQ: saved.currentQuestion,
      answers: saved.answers,
      timeRemaining:
        saved.timeRemaining !== null && quiz.timeLimitMinutes
          ? saved.timeRemaining
          : quiz.timeLimitMinutes
            ? quiz.timeLimitMinutes * 60
            : null,
    };
  }
  return {
    currentQ: 0,
    answers: {} as Record<string, number>,
    timeRemaining: quiz.timeLimitMinutes ? quiz.timeLimitMinutes * 60 : null,
  };
}

function QuizTaking({
  quiz,
  on_submit,
}: {
  quiz: QuizData;
  on_submit: (answers: Record<string, number>, timeRemaining: number | null) => void;
}) {
  const [currentQ, setCurrentQ] = useState(() => getInitialQuizState(quiz).currentQ);
  const [answers, setAnswers] = useState<Record<string, number>>(() => getInitialQuizState(quiz).answers);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(() => getInitialQuizState(quiz).timeRemaining);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const on_submit_ref = useRef(on_submit);

  // Keep on_submit ref in sync
  useEffect(() => {
    on_submit_ref.current = on_submit;
  }, [on_submit]);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining === null) return;

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          // Auto-submit when time runs out
          if (prev !== null && prev <= 1) {
            setTimeout(() => {
              const saved = loadProgress(quiz.id);
              on_submit_ref.current(saved?.answers || {}, 0);
            }, 100);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [quiz.id, timeRemaining]);

  // Save progress to localStorage on changes
  useEffect(() => {
    const progress: QuizProgress = {
      quizId: quiz.id,
      answers,
      currentQuestion: currentQ,
      startedAt: Date.now(),
      timeRemaining,
    };
    saveProgress(progress);
  }, [answers, currentQ, quiz.id, timeRemaining]);

  const handleAnswer = useCallback((questionIndex: number, optionIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [String(questionIndex)]: optionIndex,
    }));
  }, []);

  const handleNext = useCallback(() => {
    if (currentQ < quiz.questions.length - 1) {
      setCurrentQ((prev) => prev + 1);
    }
  }, [currentQ, quiz.questions.length]);

  const handlePrev = useCallback(() => {
    if (currentQ > 0) {
      setCurrentQ((prev) => prev - 1);
    }
  }, [currentQ]);

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = quiz.questions.length;
  const progressPercent = (answeredCount / totalQuestions) * 100;
  const currentQuestion = quiz.questions[currentQ];
  const selectedAnswer = answers[String(currentQ)];

  // Timer color based on remaining time
  const timerColor =
    timeRemaining !== null && timeRemaining <= 60
      ? 'text-rose-500'
      : timeRemaining !== null && timeRemaining <= 180
        ? 'text-amber-500'
        : 'text-primary';

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Quiz Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            {quiz.title}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {quiz.courseName} &middot; {totalQuestions} questions
          </p>
        </div>
        <div className="flex items-center gap-3">
          {timeRemaining !== null && (
            <Badge
              variant="outline"
              className={cn(
                'text-sm px-3 py-1.5 tabular-nums font-semibold',
                timerColor,
                'border-current/20'
              )}
            >
              <Clock className="h-3.5 w-3.5 mr-1.5" />
              {formatTime(timeRemaining)}
            </Badge>
          )}
          <Badge variant="outline" className="text-sm px-3 py-1.5">
            Q {currentQ + 1}/{totalQuestions}
          </Badge>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{answeredCount} of {totalQuestions} answered</span>
          <span>{Math.round(progressPercent)}%</span>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>

      {/* Question Display */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <Card>
            <CardContent className="p-6 space-y-5">
              {/* Question Text */}
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-bold">
                  {currentQ + 1}
                </div>
                <h2 className="text-lg font-semibold text-foreground leading-relaxed pt-0.5">
                  {currentQuestion.question}
                </h2>
              </div>

              {/* Answer Options */}
              <div className="space-y-2.5">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = selectedAnswer === idx;
                  const label = OPTION_LABELS[idx];

                  return (
                    <motion.button
                      key={idx}
                      onClick={() => handleAnswer(currentQ, idx)}
                      className={cn(
                        'w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all duration-200',
                        'focus:outline-none focus:ring-2 focus:ring-primary/30',
                        isSelected
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border/50 bg-card hover:border-primary/30 hover:bg-primary/5 text-foreground'
                      )}
                      whileHover={!isSelected ? { scale: 1.01 } : {}}
                      whileTap={{ scale: 0.99 }}
                      aria-label={`Option ${label}: ${option}`}
                    >
                      <div
                        className={cn(
                          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold transition-all',
                          isSelected
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted/50 text-muted-foreground'
                        )}
                      >
                        {isSelected ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          label
                        )}
                      </div>
                      <span className={cn(
                        'text-sm leading-relaxed',
                        isSelected && 'font-medium'
                      )}>
                        {option}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Question Grid (Desktop) */}
      <Card className="hidden sm:block">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <Label className="text-xs font-medium text-muted-foreground">Question Navigator</Label>
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-sm bg-primary" /> Answered
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-sm ring-1.5 ring-primary bg-primary/10" /> Current
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-sm bg-muted/50" /> Unanswered
              </span>
            </div>
          </div>
          <QuestionGrid
            totalQuestions={totalQuestions}
            currentQuestion={currentQ}
            answers={answers}
            onSelect={setCurrentQ}
          />
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={currentQ === 0}
          className="gap-1.5"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <div className="flex items-center gap-2">
          {/* Submit Button */}
          <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
            <AlertDialogTrigger asChild>
              <Button
                variant="default"
                className="gap-1.5"
                disabled={answeredCount === 0}
              >
                Submit Quiz
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Submit Quiz?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {answeredCount < totalQuestions ? (
                    <>
                      You have only answered <strong>{answeredCount}</strong> out of <strong>{totalQuestions}</strong> questions.
                      Unanswered questions will be marked as incorrect. Are you sure you want to submit?
                    </>
                  ) : (
                    <>
                      You have answered all <strong>{totalQuestions}</strong> questions.
                      Are you sure you want to submit your quiz?
                    </>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Go Back</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => on_submit(answers, timeRemaining)}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Yes, Submit
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <Button
          variant="outline"
          onClick={handleNext}
          disabled={currentQ === totalQuestions - 1}
          className="gap-1.5"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// ─── Quiz Results View ───────────────────────────────────────────────────────

function QuizResults({
  quiz,
  answers,
  on_retake,
  on_back_to_course,
}: {
  quiz: QuizData;
  answers: Record<string, number>;
  on_retake: () => void;
  on_back_to_course: () => void;
}) {
  const [showReview, setShowReview] = useState(false);
  const [reviewQ, setReviewQ] = useState(0);

  // Calculate score
  const totalQuestions = quiz.questions.length;
  const correctCount = quiz.questions.filter(
    (q, i) => answers[String(i)] === q.correctIndex
  ).length;
  const scorePercent = Math.round((correctCount / totalQuestions) * 100);
  const passed = scorePercent >= quiz.passingScore;

  const currentReviewQ = quiz.questions[reviewQ];
  const userAnswer = answers[String(reviewQ)];
  const isCorrect = userAnswer === currentReviewQ.correctIndex;

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Confetti on pass */}
      <AnimatePresence>
        {passed && <Confetti />}
      </AnimatePresence>

      {/* Score Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="overflow-hidden">
          <div
            className={cn(
              'h-2',
              passed
                ? 'bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500'
                : 'bg-gradient-to-r from-rose-500 via-rose-400 to-rose-500'
            )}
          />
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col items-center text-center gap-4">
              {/* Pass/Fail Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              >
                {passed ? (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
                    <Trophy className="h-8 w-8 text-emerald-500" />
                  </div>
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10">
                    <XCircle className="h-8 w-8 text-rose-500" />
                  </div>
                )}
              </motion.div>

              {/* Result Title */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {passed ? (
                  <h2 className="text-2xl font-bold text-emerald-500 flex items-center gap-2">
                    <PartyPopper className="h-6 w-6" />
                    Congratulations! You Passed!
                  </h2>
                ) : (
                  <h2 className="text-2xl font-bold text-rose-500">
                    Not Quite — Keep Studying!
                  </h2>
                )}
              </motion.div>

              {/* Score Ring */}
              <ScoreRing score={scorePercent} passed={passed} />

              {/* Score Details */}
              <motion.div
                className="grid grid-cols-3 gap-4 w-full max-w-md"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className="text-center p-3 rounded-lg bg-muted/30">
                  <p className="text-2xl font-bold text-foreground">{correctCount}</p>
                  <p className="text-xs text-muted-foreground">Correct</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/30">
                  <p className="text-2xl font-bold text-foreground">{totalQuestions - correctCount}</p>
                  <p className="text-xs text-muted-foreground">Incorrect</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/30">
                  <p className="text-2xl font-bold text-foreground">{quiz.passingScore}%</p>
                  <p className="text-xs text-muted-foreground">Pass Score</p>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                className="flex flex-col sm:flex-row gap-3 w-full max-w-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <Button
                  variant="outline"
                  onClick={on_retake}
                  className="flex-1 gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Retake Quiz
                </Button>
                <Button
                  onClick={() => setShowReview(true)}
                  className="flex-1 gap-2"
                >
                  <BookOpen className="h-4 w-4" />
                  Review Answers
                </Button>
                <Button
                  variant="secondary"
                  onClick={on_back_to_course}
                  className="flex-1 gap-2"
                >
                  Back to Course
                </Button>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Review Mode */}
      <AnimatePresence>
        {showReview && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {/* Review Header */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-foreground">Review Your Answers</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowReview(false)}
                    className="text-xs"
                  >
                    Close Review
                  </Button>
                </div>
                <QuestionGrid
                  totalQuestions={totalQuestions}
                  currentQuestion={reviewQ}
                  answers={Object.fromEntries(
                    quiz.questions.map((q, i) => [
                      String(i),
                      answers[String(i)] === q.correctIndex ? 1 : 0,
                    ])
                  )}
                  onSelect={setReviewQ}
                />
              </CardContent>
            </Card>

            {/* Review Question Card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={reviewQ}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Card>
                  <CardContent className="p-6 space-y-5">
                    {/* Question */}
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-bold">
                        {reviewQ + 1}
                      </div>
                      <h2 className="text-lg font-semibold text-foreground leading-relaxed pt-0.5">
                        {currentReviewQ.question}
                      </h2>
                    </div>

                    {/* Options with correct/incorrect highlighting */}
                    <div className="space-y-2.5">
                      {currentReviewQ.options.map((option, idx) => {
                        const isThisCorrect = idx === currentReviewQ.correctIndex;
                        const isUserAnswer = idx === userAnswer;
                        const label = OPTION_LABELS[idx];

                        return (
                          <div
                            key={idx}
                            className={cn(
                              'w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all',
                              isThisCorrect && 'border-emerald-500 bg-emerald-500/10',
                              isUserAnswer && !isThisCorrect && 'border-rose-500 bg-rose-500/10',
                              !isThisCorrect && !isUserAnswer && 'border-border/30 bg-muted/20'
                            )}
                          >
                            <div
                              className={cn(
                                'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold',
                                isThisCorrect && 'bg-emerald-500 text-white',
                                isUserAnswer && !isThisCorrect && 'bg-rose-500 text-white',
                                !isThisCorrect && !isUserAnswer && 'bg-muted/50 text-muted-foreground'
                              )}
                            >
                              {isThisCorrect ? (
                                <CheckCircle2 className="h-4 w-4" />
                              ) : isUserAnswer ? (
                                <XCircle className="h-4 w-4" />
                              ) : (
                                label
                              )}
                            </div>
                            <span
                              className={cn(
                                'text-sm leading-relaxed',
                                isThisCorrect && 'text-emerald-700 dark:text-emerald-400 font-medium',
                                isUserAnswer && !isThisCorrect && 'text-rose-700 dark:text-rose-400',
                                !isThisCorrect && !isUserAnswer && 'text-muted-foreground'
                              )}
                            >
                              {option}
                            </span>
                            {isThisCorrect && (
                              <Badge className="ml-auto text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                                Correct
                              </Badge>
                            )}
                            {isUserAnswer && !isThisCorrect && (
                              <Badge className="ml-auto text-[10px] bg-rose-500/10 text-rose-600 border-rose-500/20">
                                Your Answer
                              </Badge>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ delay: 0.3 }}
                      className="rounded-lg border border-primary/20 bg-primary/5 p-4"
                    >
                      <div className="flex items-start gap-2">
                        <BookOpen className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-primary mb-1">Explanation</p>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {currentReviewQ.explanation}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>

            {/* Review Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setReviewQ((prev) => Math.max(0, prev - 1))}
                disabled={reviewQ === 0}
                className="gap-1.5"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                {reviewQ + 1} of {totalQuestions}
              </span>
              <Button
                variant="outline"
                onClick={() => setReviewQ((prev) => Math.min(totalQuestions - 1, prev + 1))}
                disabled={reviewQ === totalQuestions - 1}
                className="gap-1.5"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Quiz Page Component ────────────────────────────────────────────────

export function QuizPage() {
  const { navigate, submitQuizAttempt, user } = useAppStore();
  const [phase, setPhase] = useState<'intro' | 'taking' | 'results'>('intro');
  const [finalAnswers, setFinalAnswers] = useState<Record<string, number>>({});
  const [finalTimeRemaining, setFinalTimeRemaining] = useState<number | null>(null);

  const quiz = QUIZ_DATA;

  // Check if there is saved progress
  useEffect(() => {
    const saved = loadProgress(quiz.id);
    if (saved && Object.keys(saved.answers).length > 0) {
      // User has in-progress quiz, offer to resume
    }
  }, [quiz.id]);

  const handleStartQuiz = useCallback(() => {
    clearProgress();
    setPhase('taking');
  }, []);

  const handleSubmit = useCallback(
    (answers: Record<string, number>, timeRemaining: number | null) => {
      setFinalAnswers(answers);
      setFinalTimeRemaining(timeRemaining);
      clearProgress();

      // Calculate and save quiz attempt
      const correctCount = quiz.questions.filter(
        (q, i) => answers[String(i)] === q.correctIndex
      ).length;
      const score = Math.round((correctCount / quiz.questions.length) * 100);
      const passed = score >= quiz.passingScore;

      if (user) {
        submitQuizAttempt({
          id: `attempt-${Date.now()}`,
          userId: user.id,
          quizId: quiz.id,
          answers,
          score,
          passed,
          attemptedAt: new Date().toISOString(),
        });
      }

      setPhase('results');
    },
    [quiz, user, submitQuizAttempt]
  );

  const handleRetake = useCallback(() => {
    setFinalAnswers({});
    setFinalTimeRemaining(null);
    setPhase('intro');
  }, []);

  const handleBackToCourse = useCallback(() => {
    navigate('courses');
  }, [navigate]);

  // Intro Screen
  if (phase === 'intro') {
    const saved = loadProgress(quiz.id);
    const hasProgress = saved && Object.keys(saved.answers).length > 0;

    return (
      <div className="p-4 md:p-6 lg:p-8 max-w-2xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-primary/40 via-primary to-primary/40" />
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col items-center text-center gap-5">
                {/* Quiz Icon */}
                <motion.div
                  className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                >
                  <Brain className="h-10 w-10 text-primary" />
                </motion.div>

                {/* Title */}
                <div>
                  <h1 className="text-2xl font-bold text-foreground">{quiz.title}</h1>
                  <p className="text-sm text-muted-foreground mt-1">{quiz.courseName}</p>
                </div>

                {/* Quiz Details */}
                <div className="grid grid-cols-3 gap-4 w-full">
                  <div className="text-center p-3 rounded-lg bg-muted/30">
                    <p className="text-xl font-bold text-foreground">{quiz.questions.length}</p>
                    <p className="text-xs text-muted-foreground">Questions</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/30">
                    <p className="text-xl font-bold text-foreground">{quiz.passingScore}%</p>
                    <p className="text-xs text-muted-foreground">Pass Score</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/30">
                    <p className="text-xl font-bold text-foreground">
                      {quiz.timeLimitMinutes ? `${quiz.timeLimitMinutes}m` : '∞'}
                    </p>
                    <p className="text-xs text-muted-foreground">Time Limit</p>
                  </div>
                </div>

                {/* Info Banner */}
                <div className="w-full rounded-lg border border-primary/20 bg-primary/5 p-3 text-left">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>Choose the best answer for each question. You can navigate between questions and change your answers before submitting.</p>
                      {quiz.timeLimitMinutes && (
                        <p>The quiz has a <strong className="text-foreground">{quiz.timeLimitMinutes}-minute</strong> time limit. It will auto-submit when time runs out.</p>
                      )}
                      <p>Your progress is saved automatically, so you can resume if you leave.</p>
                    </div>
                  </div>
                </div>

                {/* Start Button */}
                <div className="flex flex-col gap-2 w-full max-w-xs">
                  <Button size="lg" onClick={handleStartQuiz} className="gap-2">
                    <Brain className="h-5 w-5" />
                    Start Quiz
                  </Button>
                  {hasProgress && (
                    <Button
                      variant="outline"
                      onClick={() => setPhase('taking')}
                      className="gap-2"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Resume Quiz
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Quiz Taking
  if (phase === 'taking') {
    return <QuizTaking quiz={quiz} on_submit={handleSubmit} />;
  }

  // Results
  return (
    <QuizResults
      quiz={quiz}
      answers={finalAnswers}
      on_retake={handleRetake}
      on_back_to_course={handleBackToCourse}
    />
  );
}
