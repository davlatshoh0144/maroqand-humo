'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { CheckCircle2, ArrowRight, Users, BookOpen, TrendingUp, Shield, Route, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/store/app-store';
import { motion, AnimatePresence } from 'framer-motion';

const trustPoints = [
  'Free first lesson',
  'No credit card',
  'Start in 2 minutes',
];

const rotatingWords = [
  'dispatch',
  'compliance',
  'broker communication',
  'documentation',
  'operations',
];

const trustStats = [
  { icon: Users, value: 'Guided', label: 'Practice Path' },
  { icon: BookOpen, value: 'Hands-on', label: 'Course Lessons' },
  { icon: Shield, value: 'Simulated', label: 'Safe Scenarios' },
  { icon: TrendingUp, value: 'Career', label: 'Support Tools' },
];

export function Hero() {
  const { user, navigate } = useAppStore();
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % rotatingWords.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const handlePrimaryCTA = () => {
    if (user) {
      navigate('courses');
    } else {
      navigate('signup');
    }
  };

  return (
    <section className="logistics-hero-bg relative overflow-hidden py-20 sm:py-24 lg:py-32">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 logistics-blueprint-grid opacity-55" />
        <svg className="absolute inset-0 h-full w-full text-primary/10 dark:text-sky-300/20" viewBox="0 0 1200 720" preserveAspectRatio="none">
          <path d="M-80 540 C180 420 260 480 420 330 S720 160 940 230 1180 180 1280 90" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="8 10" />
          <path d="M70 120 C220 210 330 180 470 260 S680 430 820 390 1060 470 1210 340" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="5 12" />
          <path d="M760 700 C830 580 900 520 1010 490 S1180 430 1250 300" fill="none" stroke="currentColor" strokeWidth="1.25" />
          <g fill="none" stroke="currentColor" strokeWidth="1">
            <circle cx="420" cy="330" r="5" />
            <circle cx="820" cy="390" r="5" />
            <circle cx="1010" cy="490" r="5" />
          </g>
        </svg>
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Left Content */}
          <div className="flex flex-col items-start relative">
            {/* Static blueprint grid behind text */}
            <div
              className="absolute -left-8 -top-8 h-48 w-48 pointer-events-none border-l border-t border-primary/10 dark:border-sky-300/10"
              aria-hidden="true"
            />
            <div
              className="absolute -right-4 bottom-12 h-32 w-32 pointer-events-none border-r border-b border-primary/10 dark:border-sky-300/10"
              aria-hidden="true"
            />

            <div className="animate-fade-in mb-3 w-full">
              <Badge
                variant="outline"
                className="border-sky-200/80 bg-white/75 px-3 py-1 text-xs font-medium text-slate-700 shadow-sm gap-1.5 dark:border-sky-300/30 dark:bg-white/5 dark:text-sky-100 dark:shadow-none"
              >
                <Radio className="h-3 w-3" />
                <span>New: Broker Mail Practice Tool</span>
              </Badge>
            </div>

            <Badge className="animate-fade-in stagger-1 mb-6 border border-primary/10 bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground shadow-sm">
              USA Truck Dispatch Training
            </Badge>

            <h1 className="animate-fade-in stagger-2 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl leading-[1.1] dark:text-white">
              Master USA Truck Dispatch{' '}
              <span className="text-primary dark:text-sky-300">From Anywhere</span>
            </h1>

            <p className="animate-fade-in stagger-3 mt-6 max-w-lg text-xl text-slate-600 leading-relaxed dark:text-slate-200/90">
              Practical training for{' '}
              <span className="relative inline-block">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={wordIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-primary font-semibold dark:text-sky-300"
                  >
                    {rotatingWords[wordIndex]}
                  </motion.span>
                </AnimatePresence>
                <span className="absolute -bottom-0.5 left-0 right-0 h-0.5 rounded-full bg-primary/25 dark:bg-sky-300/40" />
              </span>
              {' '}and more.
            </p>

            <div className="animate-fade-in stagger-4 mt-8 flex flex-wrap gap-4">
              <Button
                size="lg"
                onClick={handlePrimaryCTA}
                className="h-14 px-8 text-base font-semibold shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-[0.99]"
              >
                Start Free Lesson
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('courses')}
                className="h-14 border-slate-300 bg-white/85 px-8 text-base text-slate-900 shadow-sm transition-all hover:border-slate-400 hover:bg-white active:scale-[0.99] dark:border-white/25 dark:bg-white/5 dark:text-white dark:shadow-none dark:hover:border-white/35 dark:hover:bg-white/10"
              >
                View Courses
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-5">
              {trustPoints.map((point, i) => (
                <div
                  key={point}
                  className={`animate-fade-in stagger-${i + 2} flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300`}
                >
                  <CheckCircle2 className="h-5 w-5 text-primary dark:text-sky-300" />
                  <span>{point}</span>
                </div>
              ))}
            </div>

            <div className="animate-fade-in stagger-5 mt-8 flex flex-wrap items-center gap-4 border-t border-slate-200 pt-6 dark:border-white/10">
              {trustStats.map((stat, i) => (
                <div
                  key={stat.label}
                  className={`animate-fade-in stagger-${Math.min(i + 3, 6)} flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white/80 px-3 py-2 shadow-sm shadow-slate-900/5 dark:border-white/10 dark:bg-white/5 dark:shadow-none`}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 dark:bg-sky-300/10">
                    <stat.icon className="h-4 w-4 text-primary dark:text-sky-300" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-950 dark:text-white">{stat.value}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-300">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right image */}
          <div className="animate-fade-in stagger-3 relative mx-auto w-full max-w-xl lg:mx-0 lg:max-w-none">
            <div className="relative overflow-hidden rounded-xl ring-1 ring-slate-200 shadow-xl shadow-slate-900/10 dark:ring-white/15 dark:shadow-2xl">
              <Image
                src="/hero-student.png"
                alt="Dispatch training workstation"
                width={640}
                height={540}
                className="h-auto w-full object-cover"
                priority
              />
              <div className="absolute inset-0 bg-white/0 dark:bg-slate-950/10" aria-hidden="true" />
            </div>
            <div className="absolute -inset-4 -z-10 rounded-2xl border border-slate-200 bg-white/70 shadow-xl shadow-slate-900/5 dark:border-sky-300/10 dark:bg-slate-950/40 dark:shadow-none" />

            <div className="absolute -bottom-3 -left-3 flex items-center gap-2 rounded-xl border border-slate-200 bg-white/95 px-4 py-2.5 shadow-lg shadow-slate-900/10 backdrop-blur-sm dark:border-white/15 dark:bg-slate-950/90 dark:shadow-lg">
              <Shield className="h-5 w-5 text-primary dark:text-sky-300" />
              <div>
                <p className="text-xs font-semibold text-slate-950 dark:text-white">Compliance-Aware</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-300">Training Content</p>
              </div>
            </div>

            <div className="absolute -bottom-2 -right-2 flex items-center gap-2 rounded-xl border border-slate-200 bg-white/95 px-3 py-2 shadow-lg shadow-slate-900/10 backdrop-blur-sm dark:border-white/15 dark:bg-slate-950/90 dark:shadow-lg">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 dark:bg-sky-300/10">
                <Route className="h-4 w-4 text-primary dark:text-sky-300" />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-slate-950 dark:text-white">Operations Lab</p>
                <p className="text-[9px] text-slate-500 dark:text-slate-300">Load planning tools</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
