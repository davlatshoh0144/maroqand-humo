'use client';

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wrench,
  Search,
  Star,
  StarOff,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Shield,
  Clock,
  FileText,
  Truck,
  ClipboardList,
  Lightbulb,
  X,
  Filter,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppStore } from '@/lib/store/app-store';
import { cn } from '@/lib/utils';

// ─── Types ───────────────────────────────────────────────────────────────────

type ToolkitCategory =
  | 'Freight Terms'
  | 'DOT Regulations'
  | 'HOS Rules'
  | 'Broker Abbreviations'
  | 'Equipment Types'
  | 'Document Types';

interface ToolkitTerm {
  id: string;
  term: string;
  definition: string;
  category: ToolkitCategory;
  example: string;
}

// ─── Category Config ─────────────────────────────────────────────────────────

const categoryConfig: Record<ToolkitCategory, { icon: React.ElementType; color: string; bg: string; border: string }> = {
  'Freight Terms': { icon: Truck, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  'DOT Regulations': { icon: Shield, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  'HOS Rules': { icon: Clock, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  'Broker Abbreviations': { icon: FileText, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  'Equipment Types': { icon: ClipboardList, color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/20' },
  'Document Types': { icon: BookOpen, color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/20' },
};

// ─── Toolkit Data (35+ terms) ────────────────────────────────────────────────

const toolkitTerms: ToolkitTerm[] = [
  // Freight Terms (7)
  { id: 'ft-1', term: 'Deadhead', definition: 'Driving a truck without a load (empty trailer). Deadhead miles generate no revenue and should be minimized.', category: 'Freight Terms', example: 'After dropping off a load in Chicago, the driver deadheaded 200 miles to Dallas for the next pickup.' },
  { id: 'ft-2', term: 'LTL (Less-Than-Truckload)', definition: 'A shipping method for smaller freight that does not require a full trailer. Multiple shippers share space on the same truck.', category: 'Freight Terms', example: 'The customer only had 4 pallets, so we booked it as LTL instead of FTL to save on cost.' },
  { id: 'ft-3', term: 'FTL (Full Truckload)', definition: 'A shipment that fills an entire trailer, typically 44,000+ lbs. One shipper has exclusive use of the truck.', category: 'Freight Terms', example: 'Walmart booked an FTL from their distribution center — 22 pallets, 40,000 lbs of dry goods.' },
  { id: 'ft-4', term: 'RPM (Revenue Per Mile)', definition: 'The rate earned per mile driven. Calculated as total rate divided by total miles. Key metric for profitability.', category: 'Freight Terms', example: 'Load pays $2,500 for 1,000 miles = $2.50 RPM. That\'s a good lane in today\'s market.' },
  { id: 'ft-5', term: 'Lane', definition: 'A specific origin-to-destination route that a carrier or broker regularly services.', category: 'Freight Terms', example: 'Our best lane is Chicago to Atlanta — we run 5 trucks on it every week at $3.00 RPM.' },
  { id: 'ft-6', term: 'Drayage', definition: 'Short-distance transport of containerized freight between a port/rail terminal and a nearby destination.', category: 'Freight Terms', example: 'We need a drayage carrier to move the container from the Port of Savannah to the warehouse 15 miles away.' },
  { id: 'ft-7', term: 'Reefer', definition: 'A refrigerated trailer used for temperature-sensitive freight like produce, pharmaceuticals, or frozen foods.', category: 'Freight Terms', example: 'This load of strawberries requires a reefer set at 34°F. The reefer surcharge is $300.' },

  // DOT Regulations (6)
  { id: 'dot-1', term: 'DOT Number', definition: 'A unique identifier issued by the Department of Transportation required for commercial motor carriers operating in interstate commerce.', category: 'DOT Regulations', example: 'Before booking any loads, verify the carrier\'s DOT number is active and their safety rating is satisfactory.' },
  { id: 'dot-2', term: 'MC Number', definition: 'Motor Carrier number issued by FMCSA. Required for for-hire carriers and brokers operating in interstate commerce.', category: 'DOT Regulations', example: 'The broker asked for our MC number to set up the carrier packet: MC-123456.' },
  { id: 'dot-3', term: 'FMCSA', definition: 'Federal Motor Carrier Safety Administration — the agency that regulates the trucking industry to reduce crashes and improve safety.', category: 'DOT Regulations', example: 'FMCSA updated the ELD mandate in 2017, requiring most carriers to switch from paper logs.' },
  { id: 'dot-4', term: 'CSA Scores', definition: 'Compliance, Safety, Accountability scores that measure a carrier\'s safety performance across 7 Behavior Analysis and Safety Improvement Categories (BASICs).', category: 'DOT Regulations', example: 'Our CSA scores are below the intervention threshold, which means we won\'t get flagged for a DOT audit.' },
  { id: 'dot-5', term: 'Weight Limits', definition: 'Federal weight limit for commercial vehicles is 80,000 lbs gross vehicle weight. Overweight permits may be required for heavier loads.', category: 'DOT Regulations', example: 'The shipper declared 82,000 lbs — we need an overweight permit or we\'ll be fined at the scale.' },
  { id: 'dot-6', term: 'DOT Inspection', definition: 'Periodic safety inspections of commercial vehicles. Levels I-VII range from full vehicle/driver inspection to just checking documentation.', category: 'DOT Regulations', example: 'We passed our Level I DOT inspection with no violations — that goes on our safety record for 2 years.' },

  // HOS Rules (6)
  { id: 'hos-1', term: '11-Hour Driving Limit', definition: 'A driver may not drive a CMV after having been on duty for 11 hours following 10 consecutive hours off duty.', category: 'HOS Rules', example: 'The driver has been driving for 10.5 hours — only 30 more minutes of drive time before hitting the 11-hour limit.' },
  { id: 'hos-2', term: '14-Hour On-Duty Window', definition: 'After coming on duty following 10+ hours off, a driver has a 14-hour window to complete all driving. Non-driving work counts against this limit.', category: 'HOS Rules', example: 'Driver started at 6 AM — all driving must be done by 8 PM even if the 11-hour driving limit hasn\'t been reached.' },
  { id: 'hos-3', term: '30-Minute Break', definition: 'Drivers must take a 30-minute break after 8 cumulative hours of driving time before resuming driving.', category: 'HOS Rules', example: 'You\'ve been driving for 8 hours straight — pull over at the next rest area for your mandatory 30-minute break.' },
  { id: 'hos-4', term: '70-Hour/8-Day Rule', definition: 'A driver operating under the 70-hour/8-day rule may not drive after having been on duty 70 hours in any 8 consecutive days.', category: 'HOS Rules', example: 'With 68 hours in the last 8 days, the driver only has 2 hours available before needing a 34-hour reset.' },
  { id: 'hos-5', term: '34-Hour Reset', definition: 'A driver may restart the 60/70-hour clock after taking 34 consecutive hours off duty. Must include two periods of 1 AM–5 AM.', category: 'HOS Rules', example: 'Start your 34-hour reset Friday evening and you\'ll have a fresh 70-hour clock by Sunday morning.' },
  { id: 'hos-6', term: 'Sleeper Berth Split', definition: 'Drivers may split their required 10-hour off-duty period into two periods: 8+ hours in sleeper berth and 2+ hours off duty (or 7/3 split).', category: 'HOS Rules', example: 'Driver took 8 hours in the sleeper berth and 2 hours off duty — that satisfies the 10-hour rest requirement.' },

  // Broker Abbreviations (6)
  { id: 'ba-1', term: 'BOL / B/L', definition: 'Bill of Lading — the legal document between the shipper and carrier detailing the type, quantity, and destination of goods.', category: 'Broker Abbreviations', example: 'Make sure the BOL is signed at both pickup and delivery — without it, we can\'t process payment.' },
  { id: 'ba-2', term: 'POD', definition: 'Proof of Delivery — a document signed by the consignee confirming receipt of freight. Required for carrier payment.', category: 'Broker Abbreviations', example: 'The carrier sent the POD within 24 hours of delivery. Now we can process the payment within 30 days.' },
  { id: 'ba-3', term: 'RC / Rate Con', definition: 'Rate Confirmation — a document from the broker confirming the agreed rate, lane, and terms for a load.', category: 'Broker Abbreviations', example: 'Always get the rate con signed before dispatching. No rate con = no guaranteed payment.' },
  { id: 'ba-4', term: 'NU / NUC', definition: 'No Until Called — instruction that the driver should not deliver until the broker or receiver calls to authorize delivery.', category: 'Broker Abbreviations', example: 'The RC says NU — don\'t deliver until the warehouse confirms they can unload.' },
  { id: 'ba-5', term: 'PU', definition: 'Pickup — the location and time where freight is loaded onto the truck.', category: 'Broker Abbreviations', example: 'PU is at 2 PM at the Samsung warehouse in Garland, TX. Driver needs to be there 15 min early.' },
  { id: 'ba-6', term: 'O/O', definition: 'Owner-Operator — a truck driver who owns and operates their own truck, typically leased to a carrier or operating independently.', category: 'Broker Abbreviations', example: 'We have 15 company drivers and 8 O/Os. The O/Os get 85% of the load revenue.' },

  // Equipment Types (6)
  { id: 'eq-1', term: 'Dry Van', definition: 'An enclosed trailer for general freight that doesn\'t require temperature control. The most common equipment type in trucking.', category: 'Equipment Types', example: 'We booked a dry van for the pallets of building materials — no special temperature requirements.' },
  { id: 'eq-2', term: 'Flatbed', definition: 'An open trailer with no sides or roof, used for oversized, heavy, or oddly shaped freight that can\'t fit in enclosed trailers.', category: 'Equipment Types', example: 'The construction equipment is too tall for a van — book it on a flatbed with tarps and chain securement.' },
  { id: 'eq-3', term: 'Refrigerated (Reefer)', definition: 'A temperature-controlled trailer with a powered refrigeration unit. Used for perishable goods, pharmaceuticals, and frozen items.', category: 'Equipment Types', example: 'This load of ice cream needs a reefer at -20°F. Make sure the reefer unit is pre-cooled before loading.' },
  { id: 'eq-4', term: 'Step Deck', definition: 'A flatbed trailer with a lower deck section, allowing taller freight to be transported while staying under height limits.', category: 'Equipment Types', example: 'The machinery is 11 feet tall — a step deck gives us the extra clearance we need to stay under the 13\'6" bridge limit.' },
  { id: 'eq-5', term: 'Tanker', definition: 'A trailer designed to carry liquids or gases. Can be food-grade (milk, juice) or chemical-grade. Requires special endorsement.', category: 'Equipment Types', example: 'Driver needs a Tanker endorsement on their CDL and HazMat for the chemical tanker load.' },
  { id: 'eq-6', term: 'Box Truck', definition: 'A smaller enclosed truck (typically 12-26 feet) used for local deliveries and last-mile logistics. Does not require a CDL for smaller sizes.', category: 'Equipment Types', example: 'The box truck is perfect for downtown deliveries — it can fit in loading docks that a semi can\'t access.' },

  // Document Types (6)
  { id: 'dt-1', term: 'Bill of Lading (BOL)', definition: 'Primary legal document for freight transportation. Serves as receipt, contract, and document of title for the shipment.', category: 'Document Types', example: 'The shipper prepared 3 copies of the BOL: one for shipper, one for carrier, one for consignee.' },
  { id: 'dt-2', term: 'Rate Confirmation', definition: 'A binding agreement between broker and carrier that specifies the load details, rate, and payment terms.', category: 'Document Types', example: 'The rate confirmation shows $2,800 CHI to ATL, 48-hour delivery, no lumper fees covered.' },
  { id: 'dt-3', term: 'Carrier Packet', definition: 'A set of documents required by brokers to set up a new carrier: W-9, insurance certificates, authority documents, and signed broker-carrier agreement.', category: 'Document Types', example: 'Before we can book loads with this broker, we need to submit our carrier packet with all insurance docs.' },
  { id: 'dt-4', term: 'Insurance Certificate (COI)', definition: 'Certificate of Insurance showing the carrier\'s coverage. Brokers typically require $100K cargo and $1M auto liability minimum.', category: 'Document Types', example: 'The broker needs an updated COI listing them as certificate holder before they\'ll tender any loads.' },
  { id: 'dt-5', term: 'Lumper Receipt', definition: 'A receipt for third-party loading/unloading services. Must be submitted for reimbursement from the broker/shipper.', category: 'Document Types', example: 'The warehouse charged $350 for unloading. Get the lumper receipt so we can bill it back to the broker.' },
  { id: 'dt-6', term: 'Detention Letter', definition: 'A formal document claiming compensation for time a driver spent waiting beyond the allowed free time at pickup or delivery.', category: 'Document Types', example: 'Driver waited 5 hours at the receiver. Free time is 2 hours, so we\'re filing a detention letter for 3 hours at $75/hr.' },
];

const categories: ToolkitCategory[] = ['Freight Terms', 'DOT Regulations', 'HOS Rules', 'Broker Abbreviations', 'Equipment Types', 'Document Types'];

// ─── Flashcard Mode Component ────────────────────────────────────────────────

function FlashcardMode({ terms, onClose }: { terms: ToolkitTerm[]; onClose: () => void }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const term = terms[index];

  const goNext = () => {
    setFlipped(false);
    setIndex((i) => (i + 1) % terms.length);
  };
  const goPrev = () => {
    setFlipped(false);
    setIndex((i) => (i - 1 + terms.length) % terms.length);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNext();
      else if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setFlipped((f) => !f); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [terms.length]);

  const config = categoryConfig[term.category];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
    >
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <Badge className={cn('gap-1', config.bg, config.color, config.border)}>
            <config.icon className="h-3 w-3" />
            {term.category}
          </Badge>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Card */}
        <div
          className="perspective-1000 cursor-pointer"
          onClick={() => setFlipped(!flipped)}
        >
          <motion.div
            className="relative w-full min-h-[320px]"
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Front - Term */}
            <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border-2 bg-card p-8 text-center shadow-xl" style={{ backfaceVisibility: 'hidden' }}>
              <p className="text-xs text-muted-foreground mb-4 uppercase tracking-wider">What is this term?</p>
              <h2 className="text-3xl font-bold text-foreground mb-4">{term.term}</h2>
              <Badge variant="outline" className={cn(config.bg, config.color, config.border)}>
                {term.category}
              </Badge>
              <p className="text-xs text-muted-foreground mt-6">Tap or press Space to flip</p>
            </div>

            {/* Back - Definition + Example */}
            <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border-2 bg-card p-8 text-center shadow-xl" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
              <h3 className="text-xl font-bold text-foreground mb-3">{term.term}</h3>
              <p className="text-sm text-foreground/80 mb-4 leading-relaxed">{term.definition}</p>
              <div className="w-full rounded-lg bg-muted/50 p-3 text-left">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
                  <Lightbulb className="h-3 w-3 text-amber-500" /> Real-World Example
                </p>
                <p className="text-xs text-foreground/70 italic">{term.example}</p>
              </div>
              <p className="text-xs text-muted-foreground mt-4">Tap or press Space to flip back</p>
            </div>
          </motion.div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-4">
          <Button variant="outline" size="sm" onClick={goPrev} className="gap-1">
            <ChevronLeft className="h-4 w-4" /> Prev
          </Button>
          <span className="text-sm text-muted-foreground">{index + 1} / {terms.length}</span>
          <Button variant="outline" size="sm" onClick={goNext} className="gap-1">
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function DispatcherToolkit() {
  const { toolkitFavoriteIds, toggleToolkitFavorite } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<ToolkitCategory | 'All'>('All');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [flashcardMode, setFlashcardMode] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced search
  useEffect(() => {
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => {
      if (debounceRef.current !== null) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchQuery]);

  // Filter terms
  const filteredTerms = useMemo(() => {
    let terms = toolkitTerms;
    if (activeCategory !== 'All') {
      terms = terms.filter((t) => t.category === activeCategory);
    }
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      terms = terms.filter(
        (t) =>
          t.term.toLowerCase().includes(q) ||
          t.definition.toLowerCase().includes(q) ||
          t.example.toLowerCase().includes(q)
      );
    }
    if (showFavoritesOnly) {
      terms = terms.filter((t) => toolkitFavoriteIds.includes(t.id));
    }
    return terms;
  }, [activeCategory, debouncedSearch, showFavoritesOnly, toolkitFavoriteIds]);

  // Stats
  const totalTerms = toolkitTerms.length;
  const favoritedCount = toolkitFavoriteIds.length;

  const handleToggleFavorite = useCallback((termId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleToolkitFavorite(termId);
  }, [toggleToolkitFavorite]);

  return (
    <>
      <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-amber-500/5 border border-primary/10 p-6 md:p-8"
        >
          <div className="absolute top-4 right-4 opacity-10">
            <Wrench className="h-24 w-24 text-primary" />
          </div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Wrench className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Dispatcher&apos;s Toolkit</h1>
            </div>
            <p className="text-muted-foreground text-sm md:text-base max-w-xl">
              Your quick-reference guide to trucking dispatch terminology, regulations, and industry jargon. Search, filter, and study with flashcards.
            </p>
            <div className="flex items-center gap-4 mt-4 text-sm">
              <span className="flex items-center gap-1 text-muted-foreground">
                <BookOpen className="h-4 w-4 text-primary" /> {totalTerms} terms
              </span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <Star className="h-4 w-4 text-amber-500" /> {favoritedCount} favorited
              </span>
            </div>
          </div>
        </motion.div>

        {/* Search + Controls */}
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search terms, definitions, examples..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={showFavoritesOnly ? 'default' : 'outline'}
              size="sm"
              className="gap-1"
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            >
              <Star className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Favorites</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={() => setFlashcardMode(true)}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Flashcards</span>
            </Button>
          </div>
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="flex flex-wrap gap-2"
        >
          <Button
            variant={activeCategory === 'All' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveCategory('All')}
            className="gap-1.5"
          >
            <Filter className="h-3.5 w-3.5" />
            All ({totalTerms})
          </Button>
          {categories.map((cat) => {
            const config = categoryConfig[cat];
            const count = toolkitTerms.filter((t) => t.category === cat).length;
            return (
              <Button
                key={cat}
                variant={activeCategory === cat ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveCategory(cat)}
                className="gap-1.5"
              >
                <config.icon className={cn('h-3.5 w-3.5', activeCategory !== cat && config.color)} />
                {cat} ({count})
              </Button>
            );
          })}
        </motion.div>

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filteredTerms.length} of {totalTerms} terms
          </p>
          {(debouncedSearch || activeCategory !== 'All' || showFavoritesOnly) && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('All');
                setShowFavoritesOnly(false);
              }}
            >
              Clear filters
            </Button>
          )}
        </div>

        {/* Terms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredTerms.map((term, i) => {
              const config = categoryConfig[term.category];
              const isFav = toolkitFavoriteIds.includes(term.id);
              return (
                <motion.div
                  key={term.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.02 }}
                >
                  <Card className="group h-full hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 border-border/50">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base font-bold flex items-center gap-2">
                            {term.term}
                          </CardTitle>
                          <Badge variant="outline" className={cn('mt-1.5 gap-1 text-[10px]', config.bg, config.color, config.border)}>
                            <config.icon className="h-2.5 w-2.5" />
                            {term.category}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0 -mt-1 -mr-2"
                          onClick={(e) => handleToggleFavorite(term.id, e)}
                        >
                          {isFav ? (
                            <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                          ) : (
                            <Star className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-3">
                      <p className="text-sm text-foreground/80 leading-relaxed">{term.definition}</p>
                      <div className="rounded-lg bg-muted/40 p-2.5">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
                          <Lightbulb className="h-3 w-3 text-amber-500" /> Example
                        </p>
                        <p className="text-xs text-foreground/60 italic leading-relaxed">{term.example}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredTerms.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/30 mb-4">
              <Wrench className="h-8 w-8 text-muted-foreground/30" />
            </div>
            <h3 className="text-lg font-semibold mb-1">No terms found</h3>
            <p className="text-sm text-muted-foreground mb-4">Try adjusting your search or filters</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('All');
                setShowFavoritesOnly(false);
              }}
            >
              Clear all filters
            </Button>
          </motion.div>
        )}
      </div>

      {/* Flashcard Mode Overlay */}
      <AnimatePresence>
        {flashcardMode && filteredTerms.length > 0 && (
          <FlashcardMode terms={filteredTerms} onClose={() => setFlashcardMode(false)} />
        )}
      </AnimatePresence>
    </>
  );
}
