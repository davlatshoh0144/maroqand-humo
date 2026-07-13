'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
  X,
  Filter,
  Star,
  Trophy,
  Eye,
  Brain,
  ArrowRight,
  RotateCcw,
  BookOpen,
  MessageSquare,
  BarChart3,
  Clapperboard,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { videoLibrary, videoCategories, VideoItem, VideoQuizQuestion } from '@/lib/data/video-library';
import { buildYouTubeEmbedUrl, buildYouTubeThumbnailUrl } from '@/lib/data/lesson-videos';

const difficultyStyles = {
  beginner: { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', label: 'Beginner' },
  intermediate: { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', label: 'Intermediate' },
  advanced: { bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-400', label: 'Advanced' },
};

const categoryIcons: Record<string, React.ElementType> = {
  'Dispatch Fundamentals': BookOpen,
  'Broker Communication': MessageSquare,
  'Load Board Training': BarChart3,
  'Compliance': CheckCircle2,
  'Fleet Management': Star,
};

function getYouTubeHDThumbnail(youtubeId: string) {
  return buildYouTubeThumbnailUrl(youtubeId, 'hqdefault');
}

// ─── Video Player Modal ────────────────────────────────────────────────
function VideoPlayerModal({
  video,
  onClose,
}: {
  video: VideoItem;
  onClose: () => void;
}) {
  const [showQuiz, setShowQuiz] = useState(false);
  const embedUrl = buildYouTubeEmbedUrl(video.youtubeId);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-3 top-3 z-10 h-8 w-8 rounded-full bg-black/50 text-white hover:bg-black/70"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>

        <ScrollArea className="max-h-[90vh]">
          {!showQuiz ? (
            <div>
              {/* YouTube Embed */}
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                {embedUrl ? (
                  <iframe
                    src={embedUrl}
                    title={video.title}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                    className="absolute inset-0 h-full w-full rounded-t-2xl"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-950 text-white">
                    <XCircle className="h-8 w-8 text-amber-400" />
                    <p className="text-sm font-medium">Video source unavailable</p>
                  </div>
                )}
              </div>

              {/* Video Info */}
              <div className="p-6">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Badge variant="secondary" className={difficultyStyles[video.difficulty].bg}>
                    <span className={difficultyStyles[video.difficulty].text}>
                      {difficultyStyles[video.difficulty].label}
                    </span>
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <Clock className="h-3 w-3" />
                    {video.duration}
                  </Badge>
                  <Badge variant="outline">{video.category}</Badge>
                </div>

                <h2 className="text-xl font-bold text-foreground mb-2">{video.title}</h2>
                <p className="text-sm text-muted-foreground mb-1">
                  by <span className="font-medium text-foreground">{video.channel}</span>
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed mt-3">
                  {video.description}
                </p>

                <Separator className="my-5" />

                {/* Quiz CTA */}
                <div className="rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-purple-500/10 border border-primary/20 p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15">
                      <Brain className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-foreground">Test Your Knowledge</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {video.quizQuestions.length} questions based on this video. Watch carefully, then take the quiz!
                      </p>
                      <Button
                        className="mt-3 gap-2"
                        onClick={() => setShowQuiz(true)}
                      >
                        <Brain className="h-4 w-4" />
                        Start Quiz
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <VideoQuizView
              video={video}
              onBack={() => setShowQuiz(false)}
            />
          )}
        </ScrollArea>
      </motion.div>
    </motion.div>
  );
}

// ─── Video Quiz Component ──────────────────────────────────────────────
function VideoQuizView({
  video,
  onBack,
}: {
  video: VideoItem;
  onBack: () => void;
}) {
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [answered, setAnswered] = useState(false);

  const questions = video.quizQuestions;
  const question = questions[currentQ];
  const totalQuestions = questions.length;

  const correctCount = questions.filter(
    (q) => selectedAnswers[q.id] === q.correctIndex
  ).length;
  const scorePercent = Math.round((correctCount / totalQuestions) * 100);
  const passed = scorePercent >= 70;

  const handleSelect = (optionIndex: number) => {
    if (answered) return;
    setSelectedAnswers((prev) => ({ ...prev, [question.id]: optionIndex }));
    setAnswered(true);
  };

  const handleNext = () => {
    if (currentQ < totalQuestions - 1) {
      setCurrentQ((prev) => prev + 1);
      setAnswered(false);
    } else {
      setShowResults(true);
    }
  };

  const handleRetry = () => {
    setCurrentQ(0);
    setSelectedAnswers({});
    setShowResults(false);
    setAnswered(false);
  };

  if (showResults) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.1 }}
            className="mx-auto mb-5"
          >
            {passed ? (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500/15 mx-auto">
                <Trophy className="h-12 w-12 text-emerald-500" />
              </div>
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-amber-500/15 mx-auto">
                <RotateCcw className="h-12 w-12 text-amber-500" />
              </div>
            )}
          </motion.div>

          <h2 className="text-2xl font-bold text-foreground">
            {passed ? 'Great Job!' : 'Keep Learning!'}
          </h2>
          <p className="text-muted-foreground mt-2">
            {passed
              ? 'You demonstrated a solid understanding of this video content.'
              : 'Review the video and try again — practice makes perfect!'}
          </p>

          <div className="mt-6 flex items-center justify-center gap-8">
            <div className="text-center">
              <p className="text-4xl font-extrabold text-primary">{scorePercent}%</p>
              <p className="text-sm text-muted-foreground">Score</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-extrabold text-emerald-500">{correctCount}/{totalQuestions}</p>
              <p className="text-sm text-muted-foreground">Correct</p>
            </div>
          </div>

          <div className="mt-6 max-w-md mx-auto">
            <Progress
              value={scorePercent}
              className="h-3"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {passed ? '✓ Passed (70% or higher)' : '✗ Did not pass (need 70% or higher)'}
            </p>
          </div>

          {/* Answer Review */}
          <div className="mt-8 space-y-3 text-left max-w-lg mx-auto">
            {questions.map((q, idx) => {
              const userAnswer = selectedAnswers[q.id];
              const isCorrect = userAnswer === q.correctIndex;
              return (
                <div
                  key={q.id}
                  className={`rounded-lg border p-4 ${
                    isCorrect ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-red-500/30 bg-red-500/5'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {isCorrect ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        Q{idx + 1}: {q.question}
                      </p>
                      {!isCorrect && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Your answer: <span className="text-red-500">{q.options[userAnswer]}</span>
                        </p>
                      )}
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                        Correct: {q.options[q.correctIndex]}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 italic">
                        {q.explanation}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex items-center justify-center gap-3">
            <Button variant="outline" onClick={onBack} className="gap-2">
              <X className="h-4 w-4" />
              Back to Video
            </Button>
            <Button onClick={handleRetry} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Retry Quiz
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Quiz header */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1">
          <X className="h-4 w-4" />
          Back to Video
        </Button>
        <Badge variant="secondary" className="gap-1">
          <Brain className="h-3 w-3" />
          Question {currentQ + 1} of {totalQuestions}
        </Badge>
      </div>

      {/* Progress bar */}
      <Progress value={((currentQ + (answered ? 1 : 0)) / totalQuestions) * 100} className="h-2 mb-6" />

      {/* Video title reminder */}
      <p className="text-xs text-muted-foreground mb-2">
        Quiz for: <span className="font-medium">{video.title}</span>
      </p>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <h3 className="text-lg font-bold text-foreground mb-5">
            {question.question}
          </h3>

          <div className="space-y-3">
            {question.options.map((option, idx) => {
              const isSelected = selectedAnswers[question.id] === idx;
              const isCorrect = idx === question.correctIndex;
              const showCorrect = answered;

              let borderColor = 'border-border/50 hover:border-primary/30 hover:bg-primary/5';
              if (showCorrect && isCorrect) borderColor = 'border-emerald-500 bg-emerald-500/10';
              else if (showCorrect && isSelected && !isCorrect) borderColor = 'border-red-500 bg-red-500/10';
              else if (isSelected && !showCorrect) borderColor = 'border-primary bg-primary/10';

              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  className={`w-full rounded-xl border-2 p-4 text-left transition-all duration-200 ${borderColor} ${
                    answered ? 'cursor-default' : 'cursor-pointer'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                        showCorrect && isCorrect
                          ? 'bg-emerald-500 text-white'
                          : showCorrect && isSelected && !isCorrect
                          ? 'bg-red-500 text-white'
                          : isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {showCorrect && isCorrect ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : showCorrect && isSelected && !isCorrect ? (
                        <XCircle className="h-4 w-4" />
                      ) : (
                        String.fromCharCode(65 + idx)
                      )}
                    </div>
                    <span className="text-sm font-medium text-foreground">{option}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Explanation after answer */}
          {answered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-4 rounded-xl border p-4 ${
                selectedAnswers[question.id] === question.correctIndex
                  ? 'border-emerald-500/30 bg-emerald-500/5'
                  : 'border-amber-500/30 bg-amber-500/5'
              }`}
            >
              <div className="flex items-start gap-2">
                <MessageSquare className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {selectedAnswers[question.id] === question.correctIndex
                      ? 'Correct!'
                      : 'Not quite right.'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {question.explanation}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Next button */}
      {answered && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 flex justify-end"
        >
          <Button onClick={handleNext} className="gap-2">
            {currentQ < totalQuestions - 1 ? (
              <>
                Next Question
                <ArrowRight className="h-4 w-4" />
              </>
            ) : (
              <>
                See Results
                <Trophy className="h-4 w-4" />
              </>
            )}
          </Button>
        </motion.div>
      )}
    </div>
  );
}

// ─── Video Card ────────────────────────────────────────────────────────
function VideoCard({
  video,
  onClick,
}: {
  video: VideoItem;
  onClick: () => void;
}) {
  const diffStyle = difficultyStyles[video.difficulty];
  const CategoryIcon = categoryIcons[video.category] || BookOpen;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4 }}
    >
      <Card className="group h-full border-border/50 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-primary/20 cursor-pointer card-glow"
        onClick={onClick}
      >
        {/* Thumbnail */}
        <div className="relative overflow-hidden aspect-video">
          <img
            src={getYouTubeHDThumbnail(video.youtubeId)}
            alt={video.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Play button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-white shadow-lg transition-transform duration-300 group-hover:scale-110">
              <Play className="h-6 w-6 ml-0.5" fill="currentColor" />
            </div>
          </div>

          {/* YouTube badge */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-md bg-black/60 px-2 py-1 backdrop-blur-sm">
            <Clapperboard className="h-3.5 w-3.5 text-red-500" />
            <span className="text-[11px] font-medium text-white">YouTube</span>
          </div>

          {/* Duration badge */}
          <div className="absolute bottom-3 right-3 rounded-md bg-black/70 px-2 py-0.5 backdrop-blur-sm">
            <span className="text-xs font-medium text-white">{video.duration}</span>
          </div>

          {/* Quiz indicator */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-md bg-primary/90 px-2 py-0.5 backdrop-blur-sm">
            <Brain className="h-3 w-3 text-primary-foreground" />
            <span className="text-[11px] font-medium text-primary-foreground">
              {video.quizQuestions.length}Q Quiz
            </span>
          </div>
        </div>

        <CardContent className="p-4">
          {/* Category + Difficulty row */}
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 h-5 ${diffStyle.bg}`}>
              <span className={diffStyle.text}>{diffStyle.label}</span>
            </Badge>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 gap-1">
              <CategoryIcon className="h-2.5 w-2.5" />
              {video.category}
            </Badge>
          </div>

          {/* Title */}
          <h3 className="text-sm font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-snug">
            {video.title}
          </h3>

          {/* Channel */}
          <p className="text-xs text-muted-foreground mt-1.5">
            by <span className="font-medium">{video.channel}</span>
          </p>

          {/* Description preview */}
          <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
            {video.description}
          </p>

          {/* Watch + Quiz CTA */}
          <div className="mt-3 flex items-center gap-2 text-xs font-medium text-primary">
            <Eye className="h-3.5 w-3.5" />
            Watch & Take Quiz
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Main Video Library Component ──────────────────────────────────────
export function VideoLibrary() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);

  const filteredVideos = useMemo(() => {
    let result = videoLibrary;
    if (selectedCategory !== 'All') {
      result = result.filter((v) => v.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (v) =>
          v.title.toLowerCase().includes(q) ||
          v.channel.toLowerCase().includes(q) ||
          v.description.toLowerCase().includes(q) ||
          v.category.toLowerCase().includes(q)
      );
    }
    return result;
  }, [selectedCategory, searchQuery]);

  const totalQuestions = videoLibrary.reduce((acc, v) => acc + v.quizQuestions.length, 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-600/10 via-primary/5 to-purple-600/10 border border-red-500/20 p-6 sm:p-8 mb-8">
        <div className="absolute inset-0 -z-0 logistics-blueprint-grid opacity-35" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start gap-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-red-600/15 shrink-0">
            <Clapperboard className="h-7 w-7 text-red-600" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
              Video Learning Center
            </h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base leading-relaxed">
              Watch expert dispatch training videos and test your knowledge with quiz questions after each one.
              Learn from real dispatchers, brokers, and industry professionals.
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-4">
              <Badge variant="secondary" className="gap-1">
                <Play className="h-3 w-3" />
                {videoLibrary.length} Videos
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <Brain className="h-3 w-3" />
                {totalQuestions} Quiz Questions
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <Clock className="h-3 w-3" />
                {videoLibrary.reduce((acc, v) => {
                  const parts = v.duration.split(':');
                  return acc + (parts.length === 3 ? parseInt(parts[0]) * 60 + parseInt(parts[1]) : parseInt(parts[0]));
                }, 0)}+ min
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search videos by title, channel, or topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-border/50 bg-card pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {videoCategories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
              className="text-xs"
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Video Grid */}
      {filteredVideos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredVideos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              onClick={() => setSelectedVideo(video)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Clapperboard className="h-16 w-16 text-muted-foreground/20 mb-4" />
          <h3 className="text-lg font-bold text-foreground">No videos found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Try adjusting your search or filter criteria
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}

      {/* Video Player Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <VideoPlayerModal
            video={selectedVideo}
            onClose={() => setSelectedVideo(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
