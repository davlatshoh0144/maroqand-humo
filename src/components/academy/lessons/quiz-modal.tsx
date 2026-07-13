'use client';

import { useState, useCallback } from 'react';
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  ChevronRight,
  Trophy,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/store/app-store';
import type { Quiz, QuizQuestion } from '@/lib/types';

interface QuizModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quizId: string;
}

export function QuizModal({ open, onOpenChange, quizId }: QuizModalProps) {
  const { quizzes } = useAppStore();
  const quiz = quizzes.find((q) => q.id === quizId) as Quiz | undefined;

  if (!quiz) return null;

  return (
    <QuizModalInner
      open={open}
      onOpenChange={onOpenChange}
      quiz={quiz}
    />
  );
}

function QuizModalInner({
  open,
  onOpenChange,
  quiz,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quiz: Quiz;
}) {
  const { user, submitQuizAttempt } = useAppStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResult, setShowResult] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);

  const questions = quiz.questions;
  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const progressPercent = ((currentIndex + 1) / totalQuestions) * 100;

  const handleSelectAnswer = (optionIndex: number) => {
    if (showExplanation) return;
    setSelectedAnswer(optionIndex);
  };

  const handleSubmitAnswer = useCallback(() => {
    if (selectedAnswer === null) return;

    const newAnswers = { ...answers, [currentQuestion.id]: selectedAnswer };
    setAnswers(newAnswers);
    setShowExplanation(true);
  }, [selectedAnswer, answers, currentQuestion.id]);

  const handleNext = useCallback(() => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      // Quiz complete — calculate score
      let correct = 0;
      questions.forEach((q) => {
        if (answers[q.id] === q.correctIndex) correct++;
      });
      const score = Math.round((correct / totalQuestions) * 100);
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

      setQuizComplete(true);
    }
  }, [currentIndex, totalQuestions, questions, quiz, user, submitQuizAttempt, answers]);

  const handleRetake = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setAnswers({});
    setShowResult(false);
    setShowExplanation(false);
    setQuizComplete(false);
  };

  const getScore = () => {
    let correct = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correctIndex) correct++;
    });
    return Math.round((correct / totalQuestions) * 100);
  };

  const getCorrectCount = () => {
    let correct = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correctIndex) correct++;
    });
    return correct;
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset after dialog close animation
    setTimeout(() => {
      handleRetake();
    }, 200);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        {!quizComplete ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {quiz.title}
              </DialogTitle>
              <DialogDescription>
                Question {currentIndex + 1} of {totalQuestions}
              </DialogDescription>
            </DialogHeader>

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Progress: {currentIndex + 1}/{totalQuestions}
                </span>
                <Badge variant="secondary" className="text-xs">
                  Passing: {quiz.passingScore}%
                </Badge>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>

            {/* Question */}
            <div className="mt-4">
              <h3 className="text-lg font-semibold leading-relaxed">
                {currentQuestion.question}
              </h3>

              {/* Options */}
              <div className="mt-4 space-y-2">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = selectedAnswer === index;
                  const isCorrect = index === currentQuestion.correctIndex;
                  const hasAnswered = showExplanation;

                  let optionClass =
                        'relative flex items-start gap-3 rounded-lg border p-4 transition-all cursor-pointer text-sm';

                  if (hasAnswered) {
                    if (isCorrect) {
                      optionClass +=
                        ' border-emerald-500/50 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400';
                    } else if (isSelected && !isCorrect) {
                      optionClass +=
                        ' border-red-500/50 bg-red-500/5 text-red-700 dark:text-red-400';
                    } else {
                      optionClass +=
                        ' border-border/50 opacity-60 cursor-not-allowed';
                    }
                  } else if (isSelected) {
                    optionClass +=
                      ' border-primary/50 bg-primary/5 text-foreground';
                  } else {
                    optionClass +=
                        ' border-border/50 hover:border-primary/30 hover:bg-primary/5';
                  }

                  return (
                    <button
                      key={index}
                      className={optionClass}
                      onClick={() => handleSelectAnswer(index)}
                      disabled={hasAnswered}
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium">
                        {hasAnswered && isCorrect ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        ) : hasAnswered && isSelected && !isCorrect ? (
                          <XCircle className="h-5 w-5 text-red-500" />
                        ) : (
                          String.fromCharCode(65 + index)
                        )}
                      </span>
                      <span className="pt-0.5">{option}</span>
                    </button>
                  );
                })}
              </div>

              {/* Explanation */}
              {showExplanation && currentQuestion.explanation && (
                <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <p className="text-sm font-medium text-primary">
                    Explanation
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {currentQuestion.explanation}
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-6 flex justify-end gap-3">
              {!showExplanation ? (
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={selectedAnswer === null}
                >
                  Submit Answer
                </Button>
              ) : (
                <Button onClick={handleNext}>
                  {currentIndex < totalQuestions - 1
                    ? 'Next Question'
                    : 'See Results'}
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              )}
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" />
                Quiz Complete!
              </DialogTitle>
              <DialogDescription>
                {quiz.title}
              </DialogDescription>
            </DialogHeader>

            {/* Results Summary */}
            <div className="mt-4 flex flex-col items-center gap-6 py-6">
              <div
                className={`flex h-28 w-28 items-center justify-center rounded-full ${
                  getScore() >= quiz.passingScore
                    ? 'bg-emerald-500/10 text-emerald-500'
                    : 'bg-red-500/10 text-red-500'
                }`}
              >
                <span className="text-4xl font-bold">{getScore()}%</span>
              </div>

              <div className="text-center">
                <h3 className="text-xl font-semibold">
                  {getScore() >= quiz.passingScore
                    ? 'Congratulations! You passed!'
                    : 'Keep studying — you can retake this quiz.'}
                </h3>
                <p className="mt-2 text-muted-foreground">
                  You answered {getCorrectCount()} out of {totalQuestions}{' '}
                  questions correctly
                </p>
              </div>

              {/* Question Summary */}
              <div className="w-full space-y-2">
                {questions.map((q: QuizQuestion, index: number) => {
                  const isCorrect = answers[q.id] === q.correctIndex;
                  return (
                    <div
                      key={q.id}
                      className={`flex items-center gap-3 rounded-lg border p-3 text-sm ${
                        isCorrect
                          ? 'border-emerald-500/30 bg-emerald-500/5'
                          : 'border-red-500/30 bg-red-500/5'
                      }`}
                    >
                      {isCorrect ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                      ) : (
                        <XCircle className="h-4 w-4 shrink-0 text-red-500" />
                      )}
                      <span className="truncate">{q.question}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={handleRetake}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Retake Quiz
              </Button>
              <Button onClick={handleClose}>Continue</Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
