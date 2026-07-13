'use client';

import { useState, useMemo } from 'react';
import { loadBoardEntries } from '@/lib/data/load-board';
import type { LoadBoardEntry } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from '@/components/ui/pagination';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Search,
  Truck,
  MapPin,
  DollarSign,
  TrendingUp,
  Shield,
  Phone,
  Mail,
  Bookmark,
  XCircle,
  Send,
  Lightbulb,
  Calculator,
  Package,
  CalendarDays,
  FileText,
  Star,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Zap,
  Flame,
  BarChart3,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAppStore } from '@/lib/store/app-store';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const ITEMS_PER_PAGE = 10;

function SortableHeader({ field, children, className, sortField, sortDirection, onSort }: {
  field: SortField;
  children: React.ReactNode;
  className?: string;
  sortField: SortField | null;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
}) {
  return (
    <TableHead className={`cursor-pointer select-none hover:bg-muted/50 transition-colors ${className ?? ''}`} onClick={() => onSort(field)}>
      <div className="flex items-center gap-1">
        {children}
        {sortField === field ? (
          sortDirection === 'asc' ? (
            <ArrowUp className="h-3 w-3 text-primary" />
          ) : (
            <ArrowDown className="h-3 w-3 text-primary" />
          )
        ) : (
          <ArrowUpDown className="h-3 w-3 text-muted-foreground/40" />
        )}
      </div>
    </TableHead>
  );
}

const equipmentColors: Record<string, string> = {
  Van: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  Reefer: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  Flatbed: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  'Step Deck': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
};

const equipmentDescriptions: Record<string, string> = {
  Van: 'Enclosed dry van trailer for general freight. Most common equipment type.',
  Reefer: 'Refrigerated trailer for temperature-sensitive cargo. Requires continuous power.',
  Flatbed: 'Open trailer for oversized or heavy cargo. Requires securement.',
  'Step Deck': 'Double-deck flatbed for taller loads. Lower deck height for clearance.',
};

function getCreditRating(score: number): { label: string; color: string } {
  if (score >= 97) return { label: 'A+', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' };
  if (score >= 93) return { label: 'A', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' };
  if (score >= 89) return { label: 'B+', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' };
  return { label: 'B', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' };
}

/** Get RPM color class based on rate-per-mile */
function getRpmColorClass(rpm: number): string {
  if (rpm >= 4.0) return 'text-emerald-500'; // Green for high RPM
  if (rpm >= 2.5) return 'text-amber-500'; // Yellow/amber for medium RPM
  return 'text-red-500'; // Red for low RPM
}

/** Get RPM background class for badges */
function getRpmBgClass(rpm: number): string {
  if (rpm >= 4.0) return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
  if (rpm >= 2.5) return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
  return 'bg-red-500/10 text-red-500 border-red-500/20';
}

/** Check if a load is a "hot load" (high RPM) */
function isHotLoad(rpm: number): boolean {
  return rpm >= 4.0;
}

type SortField = 'age' | 'origin' | 'destination' | 'rate' | 'rpm' | 'miles' | 'deadhead' | 'weight';
type SortDirection = 'asc' | 'desc';

export function LoadBoard() {
  const { navigate } = useAppStore();

  const [originFilter, setOriginFilter] = useState('');
  const [destFilter, setDestFilter] = useState('');
  const [equipFilter, setEquipFilter] = useState('all');
  const [minRpm, setMinRpm] = useState('');
  const [weightFilter, setWeightFilter] = useState('');
  const [pickupFilter, setPickupFilter] = useState('');
  const [creditFilter, setCreditFilter] = useState('all');
  const [selectedLoad, setSelectedLoad] = useState<LoadBoardEntry | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [driverCost, setDriverCost] = useState('');
  const [fuelCost, setFuelCost] = useState('');
  const [otherCost, setOtherCost] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const filtered = useMemo(() => {
    return loadBoardEntries.filter((entry) => {
      if (originFilter && !entry.origin.toLowerCase().includes(originFilter.toLowerCase())) return false;
      if (destFilter && !entry.destination.toLowerCase().includes(destFilter.toLowerCase())) return false;
      if (equipFilter !== 'all' && entry.equipment !== equipFilter) return false;
      if (minRpm && entry.rpm < parseFloat(minRpm)) return false;
      if (weightFilter && entry.weight > parseInt(weightFilter)) return false;
      if (pickupFilter && !entry.pickupDate.includes(pickupFilter)) return false;
      if (creditFilter !== 'all') {
        const rating = getCreditRating(entry.creditScore);
        if (creditFilter !== rating.label) return false;
      }
      return true;
    });
  }, [originFilter, destFilter, equipFilter, minRpm, weightFilter, pickupFilter, creditFilter]);

  const sorted = useMemo(() => {
    if (!sortField) return filtered;
    return [...filtered].sort((a, b) => {
      let aVal: number | string;
      let bVal: number | string;

      switch (sortField) {
        case 'age':
          aVal = parseInt(a.age);
          bVal = parseInt(b.age);
          break;
        case 'origin':
          aVal = a.origin;
          bVal = b.origin;
          break;
        case 'destination':
          aVal = a.destination;
          bVal = b.destination;
          break;
        case 'rate':
          aVal = a.rate;
          bVal = b.rate;
          break;
        case 'rpm':
          aVal = a.rpm;
          bVal = b.rpm;
          break;
        case 'miles':
          aVal = a.miles;
          bVal = b.miles;
          break;
        case 'deadhead':
          aVal = a.deadhead;
          bVal = b.deadhead;
          break;
        case 'weight':
          aVal = a.weight;
          bVal = b.weight;
          break;
        default:
          return 0;
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortDirection === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });
  }, [filtered, sortField, sortDirection]);

  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sorted.slice(start, start + ITEMS_PER_PAGE);
  }, [sorted, currentPage]);

  const profitCalc = useMemo(() => {
    if (!selectedLoad) return null;
    const dc = parseFloat(driverCost) || 0;
    const fc = parseFloat(fuelCost) || 0;
    const oc = parseFloat(otherCost) || 0;
    const totalCost = dc + fc + oc;
    const profit = selectedLoad.rate - totalCost;
    const margin = totalCost > 0 ? ((profit / selectedLoad.rate) * 100) : 0;
    return { totalCost, profit, margin };
  }, [selectedLoad, driverCost, fuelCost, otherCost]);

  // Quick stats for the summary bar
  const quickStats = useMemo(() => {
    const totalLoads = filtered.length;
    const avgRate = totalLoads > 0
      ? Math.round(filtered.reduce((sum, e) => sum + e.rate, 0) / totalLoads)
      : 0;
    const avgRpm = totalLoads > 0
      ? (filtered.reduce((sum, e) => sum + e.rpm, 0) / totalLoads)
      : 0;
    return { totalLoads, avgRate, avgRpm };
  }, [filtered]);

  const getNegotiationTips = (entry: LoadBoardEntry): string[] => {
    const tips: string[] = [];
    if (entry.rpm < 3.0) tips.push('RPM is below $3.00 — consider negotiating up or finding a backhaul.');
    if (entry.deadhead > 50) tips.push('High deadhead miles — factor this into your total cost calculation.');
    if (entry.creditScore < 93) tips.push('Broker credit is below A — verify payment terms before booking.');
    if (entry.weight > 44000) tips.push('Heavy load — confirm your truck can handle it legally.');
    if (entry.rpm >= 4.0) tips.push('Excellent RPM — this is a strong rate. Book quickly before it\'s taken.');
    if (entry.equipment === 'Reefer') tips.push('Reefer load — confirm temperature settings and pre-cool requirements.');
    if (entry.equipment === 'Flatbed') tips.push('Flatbed load — verify securement requirements and tarping needs.');
    if (tips.length === 0) tips.push('This load looks solid. Standard booking process applies.');
    return tips;
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const handleQuickBook = (entry: LoadBoardEntry, e: React.MouseEvent) => {
    e.stopPropagation();
    toast.success(`Load ${entry.id} booked! ${entry.origin} → ${entry.destination} at $${entry.rate.toLocaleString()}`, {
      description: `Rate: $${entry.rpm.toFixed(2)}/mile | ${entry.miles} miles`,
      duration: 4000,
    });
  };

  // Max miles for mileage bar visualization
  const maxMiles = Math.max(...loadBoardEntries.map(e => e.miles), 1);

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('dashboard')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Truck className="h-6 w-6 text-primary" />
                Load Board Practice
              </h1>
              <p className="text-muted-foreground text-sm mt-0.5">
                Find, evaluate, and book loads like a professional dispatcher
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats Summary Bar */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="py-3 px-4">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-lg font-bold text-foreground">{quickStats.totalLoads}</p>
                  <p className="text-[10px] text-muted-foreground">Total Loads</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-emerald-500/5 to-emerald-500/10">
            <CardContent className="py-3 px-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-emerald-500" />
                <div>
                  <p className="text-lg font-bold text-foreground">${quickStats.avgRate.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground">Avg Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-amber-500/5 to-amber-500/10">
            <CardContent className="py-3 px-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-amber-500" />
                <div>
                  <p className="text-lg font-bold text-foreground">${quickStats.avgRpm.toFixed(2)}</p>
                  <p className="text-[10px] text-muted-foreground">Avg RPM</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Bar */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              <div className="relative">
                <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Origin"
                  value={originFilter}
                  onChange={(e) => { setOriginFilter(e.target.value); setCurrentPage(1); }}
                  className="pl-8 h-9 text-sm"
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Destination"
                  value={destFilter}
                  onChange={(e) => { setDestFilter(e.target.value); setCurrentPage(1); }}
                  className="pl-8 h-9 text-sm"
                />
              </div>
              <Select value={equipFilter} onValueChange={(v) => { setEquipFilter(v); setCurrentPage(1); }}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Equipment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Equipment</SelectItem>
                  <SelectItem value="Van">Van</SelectItem>
                  <SelectItem value="Reefer">Reefer</SelectItem>
                  <SelectItem value="Flatbed">Flatbed</SelectItem>
                  <SelectItem value="Step Deck">Step Deck</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Min RPM"
                type="number"
                value={minRpm}
                onChange={(e) => { setMinRpm(e.target.value); setCurrentPage(1); }}
                className="h-9 text-sm"
              />
              <Input
                placeholder="Max Weight"
                type="number"
                value={weightFilter}
                onChange={(e) => { setWeightFilter(e.target.value); setCurrentPage(1); }}
                className="h-9 text-sm"
              />
              <Input
                placeholder="Pickup Date"
                value={pickupFilter}
                onChange={(e) => { setPickupFilter(e.target.value); setCurrentPage(1); }}
                className="h-9 text-sm"
              />
              <Select value={creditFilter} onValueChange={(v) => { setCreditFilter(v); setCurrentPage(1); }}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Broker Rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="A+">A+</SelectItem>
                  <SelectItem value="A">A</SelectItem>
                  <SelectItem value="B+">B+</SelectItem>
                  <SelectItem value="B">B</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Active Filter Chips */}
        {(originFilter || destFilter || equipFilter !== 'all' || minRpm || weightFilter || creditFilter !== 'all') && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground">Active filters:</span>
            {originFilter && (
              <motion.span initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="filter-chip-active inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
                <MapPin className="h-3 w-3" />{originFilter}
                <button onClick={() => { setOriginFilter(''); setCurrentPage(1); }} className="hover:text-destructive"><XCircle className="h-3 w-3" /></button>
              </motion.span>
            )}
            {destFilter && (
              <motion.span initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="filter-chip-active inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
                <MapPin className="h-3 w-3" />{destFilter}
                <button onClick={() => { setDestFilter(''); setCurrentPage(1); }} className="hover:text-destructive"><XCircle className="h-3 w-3" /></button>
              </motion.span>
            )}
            {equipFilter !== 'all' && (
              <motion.span initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="filter-chip-active inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-xs">
                <Package className="h-3 w-3" />{equipFilter}
                <button onClick={() => { setEquipFilter('all'); setCurrentPage(1); }} className="hover:text-destructive"><XCircle className="h-3 w-3" /></button>
              </motion.span>
            )}
            {minRpm && (
              <motion.span initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="filter-chip-active inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-xs">
                <TrendingUp className="h-3 w-3" />Min ${minRpm}/mi
                <button onClick={() => { setMinRpm(''); setCurrentPage(1); }} className="hover:text-destructive"><XCircle className="h-3 w-3" /></button>
              </motion.span>
            )}
            {creditFilter !== 'all' && (
              <motion.span initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="filter-chip-active inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-500 text-xs">
                <Star className="h-3 w-3" />{creditFilter}
                <button onClick={() => { setCreditFilter('all'); setCurrentPage(1); }} className="hover:text-destructive"><XCircle className="h-3 w-3" /></button>
              </motion.span>
            )}
            <button onClick={() => { setOriginFilter(''); setDestFilter(''); setEquipFilter('all'); setMinRpm(''); setWeightFilter(''); setPickupFilter(''); setCreditFilter('all'); setCurrentPage(1); }} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Clear all
            </button>
          </div>
        )}

        {/* Data Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortableHeader field="age" sortField={sortField} sortDirection={sortDirection} onSort={handleSort}>Age</SortableHeader>
                    <SortableHeader field="origin" sortField={sortField} sortDirection={sortDirection} onSort={handleSort}>Origin</SortableHeader>
                    <SortableHeader field="destination" sortField={sortField} sortDirection={sortDirection} onSort={handleSort}>Destination</SortableHeader>
                    <SortableHeader field="miles" className="text-right" sortField={sortField} sortDirection={sortDirection} onSort={handleSort}>Miles</SortableHeader>
                    <SortableHeader field="deadhead" className="text-right" sortField={sortField} sortDirection={sortDirection} onSort={handleSort}>DH</SortableHeader>
                    <TableHead>Equipment</TableHead>
                    <SortableHeader field="weight" className="text-right" sortField={sortField} sortDirection={sortDirection} onSort={handleSort}>Weight</SortableHeader>
                    <SortableHeader field="rate" className="text-right" sortField={sortField} sortDirection={sortDirection} onSort={handleSort}>Rate</SortableHeader>
                    <SortableHeader field="rpm" className="text-right" sortField={sortField} sortDirection={sortDirection} onSort={handleSort}>RPM</SortableHeader>
                    <TableHead>Broker</TableHead>
                    <TableHead>Credit</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((entry, rowIndex) => {
                    const credit = getCreditRating(entry.creditScore);
                    const isEvenRow = rowIndex % 2 === 0;
                    const hotLoad = isHotLoad(entry.rpm);
                    return (
                      <motion.tr
                        key={entry.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: rowIndex * 0.03 }}
                        className={`cursor-pointer transition-colors ${isEvenRow ? 'bg-muted/5' : ''} ${hotLoad ? 'bg-orange-500/[0.03]' : ''} hover:bg-muted/30`}
                        onClick={() => {
                          setSelectedLoad(entry);
                          setSheetOpen(true);
                        }}
                      >
                        <TableCell className="text-xs font-mono">{entry.age}</TableCell>
                        <TableCell className="font-medium text-sm">
                          {entry.origin}, {entry.originState}
                        </TableCell>
                        <TableCell className="text-sm">
                          {entry.destination}, {entry.destinationState}
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          <div className="flex flex-col items-end gap-0.5">
                            <span>{entry.miles.toLocaleString()}</span>
                            {/* Mini mileage bar chart */}
                            <div className="w-16 h-1 bg-muted/30 rounded-full overflow-hidden">
                              <div
                                className={cn('h-full rounded-full transition-all', getRpmBgClass(entry.rpm))}
                                style={{ width: `${(entry.miles / maxMiles) * 100}%` }}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground">{entry.deadhead}</TableCell>
                        <TableCell>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="secondary" className={`text-[10px] cursor-default ${equipmentColors[entry.equipment] ?? ''}`}>
                                {entry.equipment}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs">
                              <p className="text-xs font-medium mb-1">{entry.equipment}</p>
                              <p className="text-xs">{equipmentDescriptions[entry.equipment] ?? 'Standard equipment type.'}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                        <TableCell className="text-right text-sm">{(entry.weight / 1000).toFixed(0)}k</TableCell>
                        {/* Rate column - color-coded */}
                        <TableCell className="text-right text-sm">
                          <span className={cn('font-medium', getRpmColorClass(entry.rpm))}>
                            ${entry.rate.toLocaleString()}
                          </span>
                        </TableCell>
                        {/* RPM column - color-coded with hot load badge */}
                        <TableCell className="text-right text-sm">
                          <div className="flex items-center justify-end gap-1">
                            {hotLoad && (
                              <Badge className="text-[8px] px-1 py-0 h-4 bg-orange-500/10 text-orange-500 border-orange-500/20 gap-0.5 hot-load-badge">
                                <Flame className="h-2.5 w-2.5" />HOT
                              </Badge>
                            )}
                            <span className={cn('font-medium', getRpmColorClass(entry.rpm))}>
                              ${entry.rpm.toFixed(2)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{entry.broker}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={`text-[10px] ${credit.color}`}>
                            {credit.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedLoad(entry);
                                setSheetOpen(true);
                              }}
                            >
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="default"
                              className={cn(
                                'h-7 text-xs gap-1',
                                hotLoad && 'bg-orange-500 hover:bg-orange-600'
                              )}
                              onClick={(e) => handleQuickBook(entry, e)}
                            >
                              <Zap className="h-3 w-3" />
                              Book
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Search className="h-10 w-10 text-muted-foreground" />
                <p className="text-muted-foreground">No loads match your filters.</p>
              </div>
            )}
          </CardContent>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t px-4 py-3">
              <p className="text-xs text-muted-foreground">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, sorted.length)} of {sorted.length} loads
              </p>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className={currentPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        isActive={page === currentPage}
                        onClick={() => setCurrentPage(page)}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </Card>

        {/* Load Detail Drawer */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
            {selectedLoad && (
              <>
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    Load Details
                    {isHotLoad(selectedLoad.rpm) && (
                      <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20 gap-1">
                        <Flame className="h-3 w-3" /> Hot Load
                      </Badge>
                    )}
                  </SheetTitle>
                </SheetHeader>

                <div className="mt-6 space-y-6">
                  {/* Route with Map Placeholder */}
                  <Card className="overflow-hidden">
                    <div className="h-32 map-placeholder relative flex items-center justify-center">
                      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 128" preserveAspectRatio="none">
                        <path d="M 80 90 C 150 30, 250 30, 320 70" fill="none" stroke="oklch(0.65 0.18 240 / 30%)" strokeWidth="2" className="route-dash" />
                      </svg>
                      <div className="relative z-10 flex items-center gap-6">
                        <div className="flex flex-col items-center gap-1">
                          <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                            <MapPin className="h-4 w-4 text-emerald-500" />
                          </div>
                          <span className="text-xs font-medium">{selectedLoad.origin}, {selectedLoad.originState}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-0.5 w-8 bg-primary/20 rounded" />
                          <Truck className="h-5 w-5 text-primary" />
                          <div className="h-0.5 w-8 bg-primary/20 rounded" />
                        </div>
                        <div className="flex flex-col items-center gap-1">
                          <div className="h-8 w-8 rounded-full bg-red-500/20 flex items-center justify-center">
                            <MapPin className="h-4 w-4 text-red-500" />
                          </div>
                          <span className="text-xs font-medium">{selectedLoad.destination}, {selectedLoad.destinationState}</span>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Key Stats with Gradient Header */}
                  <div className="rounded-lg overflow-hidden border">
                    <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-4 py-2 border-b">
                      <h3 className="text-sm font-semibold flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-primary" /> Load Statistics
                      </h3>
                    </div>
                    <div className="grid grid-cols-3 gap-3 p-3">
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <p className="text-lg font-bold">${selectedLoad.rate.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Rate</p>
                    </div>
                    <div className={cn('text-center p-3 rounded-lg', getRpmBgClass(selectedLoad.rpm))}>
                      <p className={cn('text-lg font-bold', getRpmColorClass(selectedLoad.rpm))}>${selectedLoad.rpm.toFixed(2)}</p>
                      <p className="text-xs opacity-70">RPM</p>
                    </div>
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <p className="text-lg font-bold">{selectedLoad.miles.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Miles</p>
                    </div>
                  </div>
                  </div>

                  <Separator />

                  {/* Details */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1.5"><Truck className="h-3.5 w-3.5" /> Equipment</span>
                      <Badge variant="secondary" className={equipmentColors[selectedLoad.equipment] ?? ''}>
                        {selectedLoad.equipment}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1.5"><Package className="h-3.5 w-3.5" /> Weight</span>
                      <span className="font-medium">{selectedLoad.weight.toLocaleString()} lbs</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1.5"><Package className="h-3.5 w-3.5" /> Commodity</span>
                      <span className="font-medium">{selectedLoad.commodity}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1.5"><TrendingUp className="h-3.5 w-3.5" /> Deadhead</span>
                      <span className="font-medium">{selectedLoad.deadhead} mi</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" /> Pickup</span>
                      <span className="font-medium">{selectedLoad.pickupDate}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" /> Delivery</span>
                      <span className="font-medium">{selectedLoad.deliveryDate}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1.5"><Shield className="h-3.5 w-3.5" /> Broker</span>
                      <span className="font-medium">{selectedLoad.broker}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1.5"><Star className="h-3.5 w-3.5" /> Credit</span>
                      <Badge variant="secondary" className={getCreditRating(selectedLoad.creditScore).color}>
                        {getCreditRating(selectedLoad.creditScore).label} ({selectedLoad.creditScore})
                      </Badge>
                    </div>
                  </div>

                  {/* Broker Notes */}
                  {selectedLoad.brokerNotes && (
                    <Card className="bg-muted/30">
                      <CardContent className="p-3">
                        <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                          <FileText className="h-3 w-3" /> Broker Notes
                        </p>
                        <p className="text-sm">{selectedLoad.brokerNotes}</p>
                      </CardContent>
                    </Card>
                  )}

                  <Separator />

                  {/* Profit Calculator */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold flex items-center gap-1.5">
                      <Calculator className="h-4 w-4 text-primary" /> Profit Calculator
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] text-muted-foreground">Driver Pay</label>
                        <Input
                          placeholder="$0"
                          type="number"
                          value={driverCost}
                          onChange={(e) => setDriverCost(e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground">Fuel Cost</label>
                        <Input
                          placeholder="$0"
                          type="number"
                          value={fuelCost}
                          onChange={(e) => setFuelCost(e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground">Other Costs</label>
                        <Input
                          placeholder="$0"
                          type="number"
                          value={otherCost}
                          onChange={(e) => setOtherCost(e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>
                    {profitCalc && (parseFloat(driverCost) || parseFloat(fuelCost) || parseFloat(otherCost)) && (
                      <div className="p-3 bg-muted/30 rounded-lg space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Total Cost</span>
                          <span>${profitCalc.totalCost.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm font-medium">
                          <span>Estimated Profit</span>
                          <span className={profitCalc.profit >= 0 ? 'text-emerald-500' : 'text-red-500'}>
                            ${profitCalc.profit.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Margin</span>
                          <span className={profitCalc.margin >= 20 ? 'text-emerald-500' : 'text-amber-500'}>
                            {profitCalc.margin.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Negotiation Tips */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold flex items-center gap-1.5">
                      <Lightbulb className="h-4 w-4 text-amber-500" /> Negotiation Tips
                    </h3>
                    <div className="space-y-2">
                      {getNegotiationTips(selectedLoad).map((tip, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm p-2 bg-amber-500/5 rounded-md">
                          <Lightbulb className="h-3.5 w-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                          <span>{tip}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Contact */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold">Broker Contact</h3>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{selectedLoad.contactPhone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{selectedLoad.contactEmail}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 pt-2">
                    <Button
                      className={cn('w-full gap-1.5', isHotLoad(selectedLoad.rpm) && 'bg-orange-500 hover:bg-orange-600')}
                      onClick={() => {
                        toast.success(`Load ${selectedLoad.id} booked! ${selectedLoad.origin} → ${selectedLoad.destination}`, { duration: 4000 });
                        setSheetOpen(false);
                      }}
                    >
                      <Zap className="h-4 w-4" /> Quick Book
                    </Button>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        className="gap-1.5"
                        onClick={() => {
                          toast.success(`Load ${selectedLoad.id} saved to your board!`);
                          setSheetOpen(false);
                        }}
                      >
                        <Bookmark className="h-3.5 w-3.5" /> Save Load
                      </Button>
                      <Button
                        variant="outline"
                        className="gap-1.5"
                        onClick={() => {
                          toast(`Email sent to ${selectedLoad.broker}`, { description: selectedLoad.contactEmail });
                          setSheetOpen(false);
                        }}
                      >
                        <Send className="h-3.5 w-3.5" /> Email Broker
                      </Button>
                    </div>
                    <Button
                      variant="destructive"
                      className="gap-1.5"
                      onClick={() => {
                        toast.info('Load rejected.');
                        setSheetOpen(false);
                      }}
                    >
                      <XCircle className="h-3.5 w-3.5" /> Reject Load
                    </Button>
                  </div>
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </TooltipProvider>
  );
}
