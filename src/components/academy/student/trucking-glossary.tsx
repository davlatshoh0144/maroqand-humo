'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Search,
  Star,
  StarOff,
  ChevronRight,
  Lightbulb,
  Tag,
  Hash,
  X,
  ArrowUp,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/lib/store/app-store';
import { cn } from '@/lib/utils';

type GlossaryCategory = 'General' | 'Compliance' | 'Equipment' | 'Financial' | 'Operations';

interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
  example: string;
  category: GlossaryCategory;
  relatedTerms: string[];
}

const categoryColors: Record<GlossaryCategory, string> = {
  General: 'bg-primary/10 text-primary border-primary/20',
  Compliance: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
  Equipment: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  Financial: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  Operations: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
};

const categoryIcons: Record<GlossaryCategory, string> = {
  General: '📘',
  Compliance: '📋',
  Equipment: '🚛',
  Financial: '💰',
  Operations: '⚙️',
};

const glossaryTerms: GlossaryTerm[] = [
  { id: 't-1', term: 'Bill of Lading (BOL)', definition: 'A legal document issued by a carrier to a shipper that details the type, quantity, and destination of the goods being carried. It serves as a receipt of shipment and a document of title.', example: '"Make sure the BOL matches the freight before the driver leaves the shipper — incorrect BOLs cause delivery refusals."', category: 'Compliance', relatedTerms: ['Carrier', 'Shipper', 'Freight'] },
  { id: 't-2', term: 'Broker', definition: 'An intermediary who arranges transportation between a shipper and a carrier. Brokers do not own trucks; they earn a commission on the difference between what the shipper pays and what the carrier receives.', example: '"The broker posted the load at $3,200 and covered it with a carrier for $2,800, making a $400 margin."', category: 'Financial', relatedTerms: ['Carrier', 'Shipper', 'Commission'] },
  { id: 't-3', term: 'Carrier', definition: 'A company or individual that transports goods for hire. Carriers own or lease trucks and are responsible for the physical movement of freight from pickup to delivery.', example: '"We work with over 50 carriers in our network to cover loads across all 48 states."', category: 'General', relatedTerms: ['Broker', 'Shipper', 'Freight'] },
  { id: 't-4', term: 'Deadhead', definition: 'Driving a truck without a load, typically to reach a pickup location or returning home after a delivery. Deadhead miles generate no revenue and increase operating costs.', example: '"After delivering in Miami, the driver had a 200-mile deadhead to Atlanta for the next pickup."', category: 'Operations', relatedTerms: ['Revenue Per Mile', 'Empty Mile', 'Lane'] },
  { id: 't-5', term: 'Dispatch', definition: 'The process of assigning a load to a driver and coordinating the pickup and delivery. Also refers to the person or department responsible for this coordination.', example: '"Dispatch called at 6 AM with a hot load from Dallas to Houston — driver needs to pick up by noon."', category: 'General', relatedTerms: ['Dispatcher', 'Load', 'Carrier'] },
  { id: 't-6', term: 'Dispatcher', definition: 'A person who coordinates freight movement between shippers, brokers, and drivers. Dispatchers negotiate rates, plan routes, track shipments, and handle issues that arise during transit.', example: '"A skilled dispatcher can build a steady income by finding profitable loads and negotiating good rates for their carriers."', category: 'General', relatedTerms: ['Dispatch', 'Broker', 'Rate Negotiation'] },
  { id: 't-7', term: 'Dry Van', definition: 'An enclosed trailer used to protect cargo from weather and theft. The most common trailer type in trucking, used for general merchandise that doesn\'t require temperature control.', example: '"Most consumer goods ship in dry vans — they account for about 70% of all trailer traffic."', category: 'Equipment', relatedTerms: ['Reefer', 'Flatbed', 'Trailer'] },
  { id: 't-8', term: 'ELD (Electronic Logging Device)', definition: 'A device mandated by the FMCSA that automatically records a driver\'s driving time and other aspects of Hours of Service compliance. Replaces paper logbooks for most commercial drivers.', example: '"The ELD automatically switches to driving mode when the truck exceeds 5 mph."', category: 'Compliance', relatedTerms: ['Hours of Service', 'FMCSA', 'Logbook'] },
  { id: 't-9', term: 'FMCSA (Federal Motor Carrier Safety Administration)', definition: 'The federal agency within the Department of Transportation that regulates the trucking industry, establishes safety standards, and enforces Hours of Service rules.', example: '"FMCSA conducts roadside inspections and can place carriers out of service for safety violations."', category: 'Compliance', relatedTerms: ['DOT', 'Hours of Service', 'Compliance'] },
  { id: 't-10', term: 'Freight', definition: 'Goods or cargo transported by truck, train, ship, or aircraft. In trucking, freight refers specifically to the goods being hauled by a commercial motor vehicle.', example: '"The freight on this load is 42,000 lbs of bottled water — make sure the weight is distributed properly."', category: 'General', relatedTerms: ['Bill of Lading', 'Carrier', 'Shipper'] },
  { id: 't-11', term: 'Flatbed', definition: 'An open trailer with no sides or roof, used for transporting oversized, heavy, or oddly shaped cargo that cannot fit in an enclosed trailer. Requires load securement with straps, chains, or tarps.', example: '"Construction materials like lumber and steel beams typically ship on flatbeds."', category: 'Equipment', relatedTerms: ['Dry Van', 'Reefer', 'Load Securement'] },
  { id: 't-12', term: 'Hours of Service (HOS)', definition: 'FMCSA regulations that limit the number of hours a commercial driver can operate a vehicle. Key limits: 11-hour driving limit, 14-hour on-duty window, and mandatory 10-hour off-duty period.', example: '"The driver has 4 hours of drive time remaining on their 11-hour clock."', category: 'Compliance', relatedTerms: ['ELD', 'FMCSA', 'Logbook'] },
  { id: 't-13', term: 'Lane', definition: 'A specific origin-destination route for freight movement. Lanes can be one-way or round-trip and vary in profitability based on supply and demand in each market.', example: '"The Chicago-to-Atlanta lane is one of the busiest in the country — rates are competitive but volume is high."', category: 'Operations', relatedTerms: ['Deadhead', 'Revenue Per Mile', 'Load Board'] },
  { id: 't-14', term: 'Load Board', definition: 'An online marketplace where brokers and shippers post available freight and carriers/search for loads to haul. Examples include major load board platforms.', example: '"I found a great paying load on a major load board — $4,500 for 900 miles on a dry van."', category: 'Operations', relatedTerms: ['Broker', 'Revenue Per Mile', 'Lane'] },
  { id: 't-15', term: 'Lumper Fee', definition: 'A charge for hiring third-party workers (lumpers) to load or unload freight at a warehouse. Carriers may pay lumpers and then bill the shipper, or the shipper pays directly.', example: '"The grocery warehouse requires a lumper — it\'s a $250 fee that we need to get approved before delivery."', category: 'Financial', relatedTerms: ['Detention', 'Accessorial Charges', 'Shipper'] },
  { id: 't-16', term: 'MC Number', definition: 'Motor Carrier number — a unique identifier assigned by the FMCSA to for-hire carriers and brokers operating in interstate commerce. Required for legal operation.', example: '"Before booking a load, verify the carrier\'s MC number is active and their authority hasn\'t been revoked."', category: 'Compliance', relatedTerms: ['DOT Number', 'FMCSA', 'Authority'] },
  { id: 't-17', term: 'Rate Confirmation', definition: 'A document sent by the broker to the carrier confirming the agreed-upon rate, origin, destination, and terms for a specific load. Also called a "rate con" or "confirm."', example: '"Always wait for the rate confirmation before dispatching a driver — verbal agreements aren\'t enforceable."', category: 'Financial', relatedTerms: ['Broker', 'Rate Negotiation', 'Carrier'] },
  { id: 't-18', term: 'Reefer', definition: 'Short for refrigerated trailer. A temperature-controlled trailer used for transporting perishable goods such as food, pharmaceuticals, and chemicals.', example: '"The reefer needs to be set at 34°F for this produce load — check the temperature at every fuel stop."', category: 'Equipment', relatedTerms: ['Dry Van', 'Flatbed', 'Surge Tank'] },
  { id: 't-19', term: 'Revenue Per Mile (RPM)', definition: 'A key performance metric calculated by dividing total revenue by total miles driven. RPM helps dispatchers and owner-operators assess the profitability of a load or lane.', example: '"The load pays $3,200 for 800 miles — that\'s $4.00 RPM, well above the $2.50 average for dry van."', category: 'Financial', relatedTerms: ['Deadhead', 'Lane', 'Rate Negotiation'] },
  { id: 't-20', term: 'Shipper', definition: 'The person or company that owns the freight and needs it transported from one location to another. Also called the consignor.', example: '"The shipper requires a 2-hour pickup window — make sure the driver arrives on time or we\'ll lose the load."', category: 'General', relatedTerms: ['Consignee', 'Carrier', 'Bill of Lading'] },
  { id: 't-21', term: 'Tonu', definition: 'An accessorial charge when a driver arrives for a scheduled pickup but the load is not available. The carrier is compensated for the wasted trip. Also called "truck ordered not used."', example: '"The shipper didn\'t have the freight ready — we\'re billing a $250 TONU for the driver\'s time."', category: 'Financial', relatedTerms: ['Detention', 'Accessorial Charges', 'Lumper Fee'] },
  { id: 't-22', term: 'Authority', definition: 'Legal permission from the FMCSA to operate as a for-hire carrier or broker. Includes active MC/DOT numbers, insurance filings, and BOC-3 process agent designation.', example: '"New carriers must wait 21 days after filing for authority before they can legally haul freight."', category: 'Compliance', relatedTerms: ['MC Number', 'DOT Number', 'FMCSA'] },
  { id: 't-23', term: 'Accessorial Charges', definition: 'Additional fees beyond the base freight rate for services such as detention, lumper fees, layover, stop-offs, or fuel surcharges. These compensate carriers for extra time or expenses.', example: '"Always include accessorial charges in the rate con — detention at $50/hour after 2 free hours."', category: 'Financial', relatedTerms: ['Detention', 'Lumper Fee', 'Tonu'] },
  { id: 't-24', term: 'Consignee', definition: 'The person or company receiving the freight at the delivery location. The consignee signs the Bill of Lading to acknowledge receipt of the shipment.', example: '"The consignee at the Walmart DC requires an appointment — make sure it\'s confirmed before dispatch."', category: 'General', relatedTerms: ['Shipper', 'Bill of Lading', 'Delivery'] },
  { id: 't-25', term: 'Detention', definition: 'A charge for driver wait time exceeding a specified free period (usually 2 hours) at a shipper or receiver. Compensates the carrier for the opportunity cost of the driver\'s time.', example: '"The driver has been at the shipper for 4 hours — that\'s 2 hours of detention at $50/hour = $100."', category: 'Financial', relatedTerms: ['Accessorial Charges', 'Lumper Fee', 'Tonu'] },
  { id: 't-26', term: 'DOT Number', definition: 'A unique identifier assigned by the Department of Transportation to commercial motor vehicles operating in interstate commerce. Used for safety monitoring and compliance tracking.', example: '"The DOT number must be displayed on both sides of the power unit in letters at least 2 inches tall."', category: 'Compliance', relatedTerms: ['MC Number', 'FMCSA', 'Authority'] },
  { id: 't-27', term: 'Fuel Surcharge (FSC)', definition: 'An additional charge added to the base freight rate to compensate for fluctuations in diesel fuel prices. Typically calculated as a per-mile rate based on the national average fuel price.', example: '"The base rate is $2.50/mile plus a $0.50 FSC — total RPM is $3.00."', category: 'Financial', relatedTerms: ['Revenue Per Mile', 'Accessorial Charges', 'Rate Negotiation'] },
  { id: 't-28', term: 'Load Securement', definition: 'The process and equipment used to safely secure cargo on a trailer. Includes straps, chains, binders, edge protectors, and tarps. FMCSA regulation 393.100 specifies requirements.', example: '"Flatbed loads require a minimum of 2 direct tie-downs for the first 5 feet of cargo length, plus 1 per additional 10 feet."', category: 'Equipment', relatedTerms: ['Flatbed', 'FMCSA', 'Cargo'] },
  { id: 't-29', term: 'Owner-Operator', definition: 'A truck driver who owns and operates their own truck, either leased to a carrier or operating under their own authority. Owner-operators bear all operating costs but earn higher revenue.', example: '"An owner-operator with their own authority has higher revenue potential but also bears all operating costs, so net profit varies widely."', category: 'General', relatedTerms: ['Carrier', 'Authority', 'Revenue Per Mile'] },
  { id: 't-30', term: 'Placard', definition: 'A diamond-shaped sign displayed on vehicles transporting hazardous materials, indicating the hazard class of the cargo. Required by DOT for loads meeting certain quantity thresholds.', example: '"Class 3 flammable liquid requires a red placard — make sure all four are properly displayed."', category: 'Compliance', relatedTerms: ['Hazmat', 'DOT Number', 'FMCSA'] },
  { id: 't-31', term: 'Rate Negotiation', definition: 'The process of bargaining between a broker/shipper and a carrier/dispatcher to agree on the freight rate. Effective negotiation is a core skill for dispatchers and can significantly impact profitability.', example: '"The broker offered $2,800 but I countered at $3,200 based on the lane average — we settled at $3,050."', category: 'Financial', relatedTerms: ['Revenue Per Mile', 'Broker', 'Rate Confirmation'] },
  { id: 't-32', term: 'Team Driving', definition: 'A driving arrangement where two drivers share one truck, alternating between driving and resting. This allows the truck to operate nearly 24/7, significantly reducing transit time.', example: '"Team drivers can cover 1,000+ miles per day compared to 600-650 for solo drivers."', category: 'Operations', relatedTerms: ['Hours of Service', 'ELD', 'Solo Driver'] },
  { id: 't-33', term: 'Weight Distribution', definition: 'The arrangement of cargo weight across the trailer axles and the tractor drive axle. Improper distribution can cause overweight violations, handling problems, and accelerated tire wear.', example: '"Slide the tandems forward one hole to shift about 250 lbs from the steer to the drive axle."', category: 'Equipment', relatedTerms: ['Axle Weight', 'Tandem Axle', 'Bridge Formula'] },
  { id: 't-34', term: 'Hazmat', definition: 'Hazardous materials that pose a risk to health, safety, or the environment during transportation. Requires special permits, placarding, driver endorsements, and strict handling procedures.', example: '"A Hazmat endorsement on the CDL is required to transport placardable quantities of hazardous materials."', category: 'Compliance', relatedTerms: ['Placard', 'FMCSA', 'DOT Number'] },
  { id: 't-35', term: 'Escrow', definition: 'Money held by a carrier or broker as a security deposit or reserve fund. Lease-purchase drivers often have escrow accounts deducted from their settlements for truck maintenance and damages.', example: '"The carrier holds $5,000 in escrow from the lease-purchase driver — it\'s refundable upon lease completion."', category: 'Financial', relatedTerms: ['Owner-Operator', 'Carrier', 'Lease Purchase'] },
  { id: 't-36', term: 'Drop and Hook', definition: 'A loading/unloading method where a driver drops an empty or loaded trailer at a facility and hooks up to a pre-loaded or empty trailer. Much faster than live loading/unloading.', example: '"This is a drop and hook at both ends — the driver will be in and out in under an hour."', category: 'Operations', relatedTerms: ['Live Load', 'Detention', 'Trailer'] },
  { id: 't-37', term: 'Load Tender', definition: 'An offer from a shipper or broker to a carrier to haul a specific load at a stated rate. The carrier can accept, decline, or negotiate the terms.', example: '"We received a load tender from a broker for a dry van from Memphis to Nashville at $2.75/mile."', category: 'Operations', relatedTerms: ['Rate Negotiation', 'Broker', 'Carrier'] },
  { id: 't-38', term: 'Tandem Axle', definition: 'A pair of axles located close together at the rear of a trailer. The position of the tandem axle affects weight distribution and compliance with bridge formula weight limits.', example: '"Most states allow 34,000 lbs on a tandem axle group — check the bridge table for your route."', category: 'Equipment', relatedTerms: ['Weight Distribution', 'Axle Weight', 'Bridge Formula'] },
  { id: 't-39', term: 'Linehaul', definition: 'The base rate for transporting freight from origin to destination, excluding accessorial charges, fuel surcharges, and other extra fees. The core component of freight pricing.', example: '"The linehaul rate is $2,200 for this load, plus $300 FSC and $100 in stop-off charges."', category: 'Financial', relatedTerms: ['Fuel Surcharge', 'Accessorial Charges', 'Revenue Per Mile'] },
  { id: 't-40', term: 'Prepass', definition: 'An electronic system that allows qualified commercial vehicles to bypass weigh stations and port-of-entry inspections. Uses transponders and automated screening to reduce delays.', example: '"With Prepass, the green light means bypass the weigh station — saves 15-30 minutes per stop."', category: 'Operations', relatedTerms: ['DOT Number', 'Weigh Station', 'Compliance'] },
  { id: 't-41', term: 'Bobtail', definition: 'A tractor operating without a trailer attached. Bobtailing increases stopping distance and reduces fuel efficiency compared to normal loaded or empty operations.', example: '"The driver is bobtailing from the truck stop to the shipper — only 10 miles to pickup."', category: 'Equipment', relatedTerms: ['Deadhead', 'Tractor', 'Trailer'] },
  { id: 't-42', term: 'Trailer', definition: 'The cargo-carrying unit towed by a tractor. Common types include dry van, reefer, flatbed, step deck, and tank trailer. Trailers are interchangeable and can be dropped at facilities.', example: '"We need a 53-foot dry van trailer for this load — that\'s the standard size for most freight."', category: 'Equipment', relatedTerms: ['Dry Van', 'Reefer', 'Flatbed'] },
  { id: 't-43', term: 'Factoring', definition: 'A financial service where a carrier sells its accounts receivable (unpaid invoices) to a factoring company at a discount (typically 2-5%) in exchange for immediate cash flow.', example: '"Instead of waiting 30-45 days for broker payment, the carrier factors the invoice and gets paid within 24 hours."', category: 'Financial', relatedTerms: ['Broker', 'Rate Confirmation', 'Cash Flow'] },
  { id: 't-44', term: 'GPS Tracking', definition: 'Technology used to monitor the real-time location of trucks and trailers. Essential for fleet management, ETA updates, route optimization, and theft prevention.', example: '"GPS tracking shows the driver is 50 miles from delivery — ETA is approximately 1 hour."', category: 'Operations', relatedTerms: ['ELD', 'Dispatch', 'Fleet Management'] },
  { id: 't-45', term: 'CDL (Commercial Driver\'s License)', definition: 'A specialized license required to operate commercial motor vehicles. CDL classes include Class A (combination vehicles), Class B (single vehicles), and Class C (smaller CMVs carrying Hazmat or passengers).', example: '"A Class A CDL is required to operate any combination vehicle with a GCWR of 26,001 lbs or more."', category: 'Compliance', relatedTerms: ['FMCSA', 'Hazmat', 'DOT Number'] },
];

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function getTermOfTheDay(terms: GlossaryTerm[]): GlossaryTerm {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return terms[dayOfYear % terms.length];
}

export function TruckingGlossary() {
  const { toggleGlossaryFavorite, isGlossaryFavorite } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<GlossaryCategory | 'All'>('All');
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [expandedTerm, setExpandedTerm] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeLetter, setActiveLetter] = useState<string>('A');

  const termOfTheDay = useMemo(() => getTermOfTheDay(glossaryTerms), []);

  const filteredTerms = useMemo(() => {
    let terms = glossaryTerms;
    if (selectedCategory !== 'All') {
      terms = terms.filter((t) => t.category === selectedCategory);
    }
    if (selectedLetter) {
      terms = terms.filter((t) => t.term[0].toUpperCase() === selectedLetter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      terms = terms.filter(
        (t) =>
          t.term.toLowerCase().includes(q) ||
          t.definition.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
      );
    }
    return terms.sort((a, b) => a.term.localeCompare(b.term));
  }, [searchQuery, selectedCategory, selectedLetter]);

  // Group terms by first letter
  const groupedTerms = useMemo(() => {
    const groups: Record<string, GlossaryTerm[]> = {};
    filteredTerms.forEach((term) => {
      const letter = term.term[0].toUpperCase();
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(term);
    });
    return groups;
  }, [filteredTerms]);

  // Available letters based on filtered results
  const availableLetters = useMemo(() => {
    return new Set(filteredTerms.map((t) => t.term[0].toUpperCase()));
  }, [filteredTerms]);

  // Track scroll position for active letter indicator and scroll-to-top
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);

      // Find which letter section is currently visible
      const letterSections = document.querySelectorAll('[data-letter-section]');
      let currentLetter = 'A';
      letterSections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 150) {
          currentLetter = section.getAttribute('data-letter-section') || 'A';
        }
      });
      setActiveLetter(currentLetter);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToLetter = (letter: string) => {
    setSelectedLetter(null);
    const el = document.querySelector(`[data-letter-section="${letter}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRelatedTermClick = (termName: string) => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedLetter(null);
    // Find and scroll to the term
    const term = glossaryTerms.find((t) => t.term.toLowerCase() === termName.toLowerCase());
    if (term) {
      const letter = term.term[0].toUpperCase();
      setTimeout(() => scrollToLetter(letter), 100);
      setTimeout(() => setExpandedTerm(term.id), 400);
    }
  };

  const categories: (GlossaryCategory | 'All')[] = ['All', 'General', 'Compliance', 'Equipment', 'Financial', 'Operations'];

  const totalTerms = glossaryTerms.length;
  const categoryCount = (cat: GlossaryCategory) => glossaryTerms.filter((t) => t.category === cat).length;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/10 p-6 sm:p-8"
        >
          <div className="absolute top-4 right-4 opacity-5">
            <BookOpen className="h-32 w-32" />
          </div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold">Trucking Dictionary</h1>
            </div>
            <p className="text-muted-foreground max-w-2xl">
              Your comprehensive glossary of trucking and dispatch terminology. {totalTerms} terms across {categories.length - 1} categories.
            </p>
            {/* Stats row */}
            <div className="flex flex-wrap gap-3 mt-4">
              {categories.filter(c => c !== 'All').map((cat) => (
                <div key={cat} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span>{categoryIcons[cat as GlossaryCategory]}</span>
                  <span>{cat}: <strong className="text-foreground">{categoryCount(cat as GlossaryCategory)}</strong></span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Term of the Day */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-amber-500/20 bg-gradient-to-r from-amber-500/5 to-transparent overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                <CardTitle className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                  Term of the Day
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <h3 className="text-lg font-bold mb-1">{termOfTheDay.term}</h3>
              <p className="text-sm text-muted-foreground mb-2">{termOfTheDay.definition}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className={cn('text-[10px]', categoryColors[termOfTheDay.category])}>
                  {categoryIcons[termOfTheDay.category]} {termOfTheDay.category}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() => {
                    setExpandedTerm(termOfTheDay.id);
                    const letter = termOfTheDay.term[0].toUpperCase();
                    scrollToLetter(letter);
                  }}
                >
                  <ChevronRight className="h-3 w-3" /> See example
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-3"
        >
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search terms, definitions, categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => setSearchQuery('')}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? 'default' : 'outline'}
                size="sm"
                className="h-7 text-xs gap-1.5"
                onClick={() => {
                  setSelectedCategory(cat);
                  setSelectedLetter(null);
                }}
              >
                {cat !== 'All' && <span className="text-[10px]">{categoryIcons[cat as GlossaryCategory]}</span>}
                {cat}
                {cat !== 'All' && (
                  <span className="ml-0.5 text-[10px] opacity-60">({categoryCount(cat as GlossaryCategory)})</span>
                )}
              </Button>
            ))}
          </div>

          {/* Active filters indicator */}
          {(selectedLetter || selectedCategory !== 'All' || searchQuery) && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Showing {filteredTerms.length} of {totalTerms} terms</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs text-primary"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setSelectedLetter(null);
                }}
              >
                Clear filters
              </Button>
            </div>
          )}
        </motion.div>

        {/* A-Z Letter Navigation (Sticky) */}
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border/50 py-2 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-0.5 overflow-x-auto scrollbar-none">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'h-7 min-w-[28px] px-1 text-xs font-medium shrink-0',
                !selectedLetter && selectedCategory === 'All' && !searchQuery
                  ? 'text-muted-foreground/40'
                  : 'text-primary'
              )}
              onClick={() => {
                setSelectedLetter(null);
                scrollToTop();
              }}
            >
              All
            </Button>
            {alphabet.map((letter) => {
              const hasTerms = availableLetters.has(letter);
              const isActive = activeLetter === letter;
              return (
                <Button
                  key={letter}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'h-7 min-w-[28px] px-1 text-xs font-medium shrink-0 transition-all',
                    !hasTerms && 'opacity-25 cursor-not-allowed',
                    isActive && hasTerms && 'bg-primary/10 text-primary font-bold',
                    selectedLetter === letter && 'bg-primary text-primary-foreground'
                  )}
                  disabled={!hasTerms}
                  onClick={() => scrollToLetter(letter)}
                >
                  {letter}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Glossary Terms */}
        <div className="space-y-6">
          {Object.entries(groupedTerms).map(([letter, terms]) => (
            <div key={letter} data-letter-section={letter} className="scroll-mt-20">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-sm">
                  {letter}
                </div>
                <Separator className="flex-1" />
                <span className="text-xs text-muted-foreground">{terms.length} term{terms.length > 1 ? 's' : ''}</span>
              </div>
              <div className="space-y-3">
                {terms.map((term, index) => {
                  const isFav = isGlossaryFavorite(term.id);
                  const isExpanded = expandedTerm === term.id;
                  return (
                    <motion.div
                      key={term.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <Card
                        className={cn(
                          'transition-all cursor-pointer hover:shadow-md',
                          isExpanded && 'ring-1 ring-primary/20'
                        )}
                        onClick={() => setExpandedTerm(isExpanded ? null : term.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold text-foreground">{term.term}</h3>
                                <Badge variant="outline" className={cn('text-[10px]', categoryColors[term.category])}>
                                  {categoryIcons[term.category]} {term.category}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {term.definition}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 shrink-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleGlossaryFavorite(term.id);
                              }}
                            >
                              {isFav ? (
                                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                              ) : (
                                <Star className="h-4 w-4 text-muted-foreground/40" />
                              )}
                            </Button>
                          </div>

                          {/* Expanded Content */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <Separator className="my-3" />
                                <div className="space-y-3">
                                  {/* Full Definition */}
                                  <div>
                                    <p className="text-sm text-foreground">{term.definition}</p>
                                  </div>

                                  {/* Usage Example */}
                                  <div className="bg-muted/30 rounded-lg p-3">
                                    <div className="flex items-center gap-1.5 mb-1.5">
                                      <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                                      <span className="text-xs font-medium text-amber-600 dark:text-amber-400">Usage Example</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground italic">{term.example}</p>
                                  </div>

                                  {/* Related Terms */}
                                  {term.relatedTerms.length > 0 && (
                                    <div>
                                      <div className="flex items-center gap-1.5 mb-1.5">
                                        <Tag className="h-3.5 w-3.5 text-primary" />
                                        <span className="text-xs font-medium text-primary">Related Terms</span>
                                      </div>
                                      <div className="flex flex-wrap gap-1.5">
                                        {term.relatedTerms.map((rt) => (
                                          <Button
                                            key={rt}
                                            variant="outline"
                                            size="sm"
                                            className="h-6 text-[11px] gap-1"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleRelatedTermClick(rt);
                                            }}
                                          >
                                            <Hash className="h-2.5 w-2.5" />
                                            {rt}
                                          </Button>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}

          {filteredTerms.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-1">No terms found</h3>
              <p className="text-sm text-muted-foreground mb-4">Try adjusting your search or filters</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setSelectedLetter(null);
                }}
              >
                Clear all filters
              </Button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Scroll to Top */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-20 right-6 z-40"
          >
            <Button
              size="icon"
              className="h-10 w-10 rounded-full shadow-lg"
              onClick={scrollToTop}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
