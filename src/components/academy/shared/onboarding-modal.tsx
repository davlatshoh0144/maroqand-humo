'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useAppStore } from '@/lib/store/app-store';
import {
  GraduationCap,
  BookOpen,
  Shield,
  Truck,
  Calculator,
  Users,
  ArrowRight,
  PlayCircle,
  CheckCircle2,
} from 'lucide-react';

const learningTracks = [
  { id: 'dispatch', label: 'Freight Dispatch', icon: Truck, description: 'Load coordination & driver management' },
  { id: 'compliance', label: 'Compliance & Safety', icon: Shield, description: 'HOS, ELD, DOT regulations' },
  { id: 'operations', label: 'Operations', icon: Calculator, description: 'Load boards, rates & profitability' },
  { id: 'broker', label: 'Broker Relations', icon: Users, description: 'Communication & negotiation' },
  { id: 'business', label: 'Business Skills', icon: BookOpen, description: 'Scaling your dispatch business' },
];

interface OnboardingModalProps {
  open: boolean;
  onClose: () => void;
}

export function OnboardingModal({ open, onClose }: OnboardingModalProps) {
  const [step, setStep] = useState(0);
  const [selectedTracks, setSelectedTracks] = useState<string[]>([]);
  const { navigate, courses } = useAppStore();

  const totalSteps = 3;

  const toggleTrack = (trackId: string) => {
    setSelectedTracks((prev) =>
      prev.includes(trackId)
        ? prev.filter((t) => t !== trackId)
        : [...prev, trackId]
    );
  };

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      // Final step — close and navigate
      onClose();
      const firstCourse = courses[0];
      if (firstCourse) {
        const freeLesson = firstCourse.lessons.find((l) => l.isFree);
        if (freeLesson) {
          navigate('lesson', firstCourse.id, freeLesson.id);
        }
      }
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 pt-2">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <button
              key={i}
              className={`h-2 rounded-full transition-all ${
                i === step
                  ? 'w-6 bg-primary'
                  : i < step
                  ? 'w-2 bg-primary/50'
                  : 'w-2 bg-muted-foreground/20'
              }`}
              onClick={() => setStep(i)}
            />
          ))}
        </div>

        {/* Step 1: Welcome */}
        {step === 0 && (
          <div className="flex flex-col items-center text-center space-y-4 py-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <GraduationCap className="h-8 w-8 text-primary" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-xl">Welcome to Marokand Humo Academy!</DialogTitle>
              <DialogDescription className="text-base">
                Your journey to becoming a skilled freight dispatcher starts here. Learn at your own pace with real-world scenarios.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center gap-2 rounded-lg bg-primary/5 px-4 py-3">
              <Image
                src="/logo-simple.png"
                alt="Marokand Humo"
                width={32}
                height={32}
                className="h-8 w-auto"
              />
              <div className="text-left">
                <p className="text-sm font-medium text-foreground">7 Expert Courses</p>
                <p className="text-xs text-muted-foreground">40+ practical lessons</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: What do you want to learn? */}
        {step === 1 && (
          <div className="space-y-4 py-2">
            <DialogHeader>
              <DialogTitle className="text-xl">What do you want to learn?</DialogTitle>
              <DialogDescription>
                Select the topics that interest you most. We&apos;ll personalize your experience.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              {learningTracks.map((track) => {
                const isSelected = selectedTracks.includes(track.id);
                return (
                  <button
                    key={track.id}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                      isSelected
                        ? 'border-primary/50 bg-primary/5'
                        : 'border-border hover:border-primary/20 hover:bg-muted/30'
                    }`}
                    onClick={() => toggleTrack(track.id)}
                  >
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                      isSelected ? 'bg-primary/10' : 'bg-muted'
                    }`}>
                      <track.icon className={`h-4 w-4 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {track.label}
                      </p>
                      <p className="text-xs text-muted-foreground">{track.description}</p>
                    </div>
                    <Checkbox checked={isSelected} onCheckedChange={() => toggleTrack(track.id)} />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Start with a free lesson */}
        {step === 2 && (
          <div className="flex flex-col items-center text-center space-y-4 py-4">
            <div className="relative">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10">
                <PlayCircle className="h-8 w-8 text-emerald-500" />
              </div>
              <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20">
                <CheckCircle2 className="h-3 w-3 text-amber-500" />
              </div>
            </div>
            <DialogHeader>
              <DialogTitle className="text-xl">Start with a free lesson</DialogTitle>
              <DialogDescription>
                Try &ldquo;Introduction to Freight Dispatching&rdquo; — completely free, no enrollment required.
              </DialogDescription>
            </DialogHeader>
            <div className="w-full rounded-lg border border-primary/20 bg-primary/5 p-4 text-left">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Dispatch Fundamentals</p>
                  <p className="text-xs text-muted-foreground">Lesson 1: Introduction to Freight Dispatching</p>
                  <p className="text-xs text-muted-foreground mt-1">45 min · Free access</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer buttons */}
        <div className="flex items-center justify-between pt-2 border-t">
          <Button variant="ghost" size="sm" onClick={handleSkip} className="text-muted-foreground">
            Skip for now
          </Button>
          <Button size="sm" onClick={handleNext} className="gap-1.5">
            {step === totalSteps - 1 ? (
              <>
                <PlayCircle className="h-4 w-4" />
                Start Learning
              </>
            ) : (
              <>
                Next
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
