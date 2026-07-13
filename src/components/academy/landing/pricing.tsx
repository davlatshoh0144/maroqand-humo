'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store/app-store';

const ctaLabels: Record<string, string> = {
  free: 'Get Started',
  'pro-student': 'Start Pro',
  'career-track': 'Start Career Track',
};

export function Pricing() {
  const { user, navigate, pricingPlans } = useAppStore();
  const [isAnnual, setIsAnnual] = useState(false);

  const handleCTA = (planSlug: string) => {
    if (planSlug === 'free') {
      if (user) {
        navigate('courses');
      } else {
        navigate('signup');
      }
    } else {
      navigate('pricing');
    }
  };

  const getPrice = (plan: (typeof pricingPlans)[0]) => {
    if (plan.price === 0) return 0;
    return isAnnual ? Math.round(plan.price * 10) : plan.price;
  };

  const getInterval = () => (isAnnual ? 'year' : 'month');

  return (
    <section className="py-20 sm:py-28 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="animate-fade-up text-3xl font-bold tracking-tight sm:text-4xl">
            Simple, Transparent Pricing
          </h2>
          <p className="animate-fade-up stagger-1 mt-4 text-lg text-muted-foreground">
            Start free, upgrade when you&apos;re ready to go deeper
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="animate-fade-up stagger-2 mt-8 flex items-center justify-center gap-3">
          <span
            className={`text-sm font-medium ${
              !isAnnual ? 'text-foreground' : 'text-muted-foreground'
            }`}
          >
            Monthly
          </span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isAnnual ? 'bg-primary' : 'bg-muted-foreground/30'
            }`}
            role="switch"
            aria-checked={isAnnual}
            aria-label="Toggle annual billing"
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isAnnual ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span
            className={`text-sm font-medium ${
              isAnnual ? 'text-foreground' : 'text-muted-foreground'
            }`}
          >
            Annual
          </span>
          {isAnnual && (
            <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              Save ~17%
            </Badge>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-3">
          {pricingPlans.map((plan, index) => {
            const price = getPrice(plan);
            const interval = getInterval();

            return (
              <Card
                key={plan.id}
                className={`animate-fade-up stagger-${Math.min(index + 1, 6)} relative flex flex-col transition-all duration-200 hover:-translate-y-1 ${
                  plan.isPopular
                    ? 'border-primary shadow-xl shadow-primary/10 bg-card scale-105 z-10 ring-1 ring-primary/20'
                    : 'border-border/50 bg-card/50 hover:shadow-lg'
                }`}
              >
                {plan.isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-4 py-1 text-sm font-semibold shadow-lg shadow-primary/25">
                      <Check className="mr-1 h-3.5 w-3.5" />
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className={`pb-2 text-center ${plan.isPopular ? 'pt-10' : 'pt-8'}`}>
                  <h3 className="text-lg font-semibold">{plan.name}</h3>
                  <div className="mt-3 flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-bold">${price}</span>
                    <span className="text-muted-foreground">
                      /{interval}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="flex flex-1 flex-col pt-4">
                  <ul className="flex-1 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <Check className={`mt-0.5 h-4 w-4 shrink-0 ${plan.isPopular ? 'text-primary' : 'text-muted-foreground'}`} />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="mt-8 w-full"
                    variant={plan.isPopular ? 'default' : 'outline'}
                    size="lg"
                    onClick={() => handleCTA(plan.slug)}
                  >
                    {ctaLabels[plan.slug] || 'Get Started'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
