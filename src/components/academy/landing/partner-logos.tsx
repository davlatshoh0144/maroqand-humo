'use client';

import { motion } from 'framer-motion';

const companies = [
  'US Carriers',
  'Freight Brokerages',
  '3PL Companies',
  'Logistics Firms',
  'Fleet Operators',
  'Supply Chain Co.',
  'Trucking Companies',
  'Distribution Networks',
];

function LogoChip({ name }: { name: string }) {
  return (
    <div className="inline-flex items-center rounded-lg border border-border/40 bg-card/60 px-5 py-2.5 text-sm font-medium text-muted-foreground/70 whitespace-nowrap select-none">
      {name}
    </div>
  );
}

export function PartnerLogos() {
  return (
    <section className="py-12 sm:py-16 bg-muted/10 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Skills For The Logistics Industry
          </h2>
          <p className="mt-2 text-muted-foreground">
            Our training prepares you for real-world logistics operations
          </p>
        </motion.div>

        {/* Infinite Scroll Row */}
        <motion.div
          className="mt-8 relative"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Fade edges */}
          <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-20 bg-gradient-to-r from-muted/10 to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-20 bg-gradient-to-l from-muted/10 to-transparent" />

          {/* Scrolling container */}
          <div className="flex overflow-hidden">
            <div className="flex animate-infinite-scroll gap-4">
              {/* Double the items for seamless loop */}
              {[...companies, ...companies].map((name, i) => (
                <LogoChip key={`${name}-${i}`} name={name} />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Static fallback grid for accessibility / reduced motion */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:hidden">
          {companies.map((name) => (
            <LogoChip key={name} name={name} />
          ))}
        </div>
      </div>
    </section>
  );
}
