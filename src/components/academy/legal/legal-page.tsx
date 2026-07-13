'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, FileText, RotateCcw } from 'lucide-react';

type LegalKind = 'privacy' | 'terms' | 'refund';

const content: Record<LegalKind, {
  title: string;
  eyebrow: string;
  icon: typeof ShieldCheck;
  sections: { heading: string; body: string }[];
}> = {
  privacy: {
    title: 'Privacy Policy',
    eyebrow: 'Legal',
    icon: ShieldCheck,
    sections: [
      {
        heading: 'Information We Store',
        body: 'Marokand Humo Academy stores account profile details, course enrollments, lesson progress, quiz attempts, certificates, notes, and contact submissions so the training platform can function.',
      },
      {
        heading: 'How We Use Information',
        body: 'We use stored information to authenticate users, show progress, issue and verify certificates, respond to inquiries, and improve course operations.',
      },
      {
        heading: 'Local Platform Notice',
        body: 'In this build, platform data is stored locally in the browser. A production deployment should connect this policy to the final database, authentication provider, hosting provider, and data retention process.',
      },
      {
        heading: 'Third-Party Affiliation',
        body: 'Marokand Humo Academy is independent training software and is not affiliated with DAT, Samsara, Gmail, FMCSA, DOT, or other third-party services.',
      },
    ],
  },
  terms: {
    title: 'Terms of Service',
    eyebrow: 'Legal',
    icon: FileText,
    sections: [
      {
        heading: 'Training Software',
        body: 'The platform provides educational truck dispatch training, simulated practice tools, course materials, assignments, and certificates of course completion.',
      },
      {
        heading: 'No Employment Guarantee',
        body: 'Training completion does not guarantee employment, income, dispatch contracts, government approval, or acceptance by any employer or third-party platform.',
      },
      {
        heading: 'User Responsibilities',
        body: 'Users are responsible for providing accurate account information, protecting their sign-in credentials, and using training materials only for lawful educational purposes.',
      },
      {
        heading: 'Compliance Disclaimer',
        body: 'Compliance-related materials are educational and are not legal advice, official certification, or a substitute for reviewing current regulations with qualified professionals.',
      },
    ],
  },
  refund: {
    title: 'Refund Policy',
    eyebrow: 'Billing',
    icon: RotateCcw,
    sections: [
      {
        heading: 'Refund Review Window',
        body: 'Refund requests are reviewed during the first 14 days of a paid plan. Contact support with your account email and payment details so the request can be reviewed.',
      },
      {
        heading: 'Digital Course Access',
        body: 'Because course materials are digital, refund eligibility may depend on account usage, course access, certificates issued, and the payment provider rules in effect.',
      },
      {
        heading: 'No Placement-Based Refunds',
        body: 'Refunds are not based on employment results, job placement, contracts, or income outcomes because the platform does not guarantee those results.',
      },
      {
        heading: 'How To Request',
        body: 'Use the contact form and select a billing-related subject. The support team will review the request and respond with available options.',
      },
    ],
  },
};

export function LegalPage({ kind }: { kind: LegalKind }) {
  const page = content[kind];
  const Icon = page.icon;

  return (
    <main>
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge variant="secondary" className="mb-4">
              {page.eyebrow}
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              {page.title}
            </h1>
            <p className="mt-4 text-sm text-muted-foreground">
              Last updated: June 2, 2026
            </p>
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Card className="border-border/50">
            <CardContent className="space-y-8 p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-sm text-muted-foreground">
                  These terms are written for the academy training platform and should be reviewed by counsel before public launch.
                </p>
              </div>

              {page.sections.map((section) => (
                <section key={section.heading}>
                  <h2 className="text-lg font-semibold text-foreground">{section.heading}</h2>
                  <p className="mt-2 leading-relaxed text-muted-foreground">{section.body}</p>
                </section>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
