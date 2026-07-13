'use client';

import { useState, useMemo } from 'react';
import { fleetVehicles } from '@/lib/data/fleet';
import type { FleetVehicle } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip';
import {
  ArrowLeft,
  Truck,
  Fuel,
  Clock,
  AlertTriangle,
  MapPin,
  Gauge,
  Wrench,
  Route,
  Shield,
  CheckCircle2,
  Activity,
  Navigation,
  CircleParking,
  PlayCircle,
  Wifi,
  WifiOff,
  RefreshCw,
  Radio,
  Milestone,
  CalendarClock,
  User,
  Package,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAppStore } from '@/lib/store/app-store';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const statusConfig: Record<
  FleetVehicle['driverStatus'],
  { label: string; color: string; bgColor: string; dotColor: string; dotLabel: string }
> = {
  driving: { label: 'Driving', color: 'text-emerald-500', bgColor: 'bg-emerald-500/10 border-emerald-500/20', dotColor: 'bg-emerald-500', dotLabel: 'Green dot = Driving' },
  on_break: { label: 'On Break', color: 'text-amber-500', bgColor: 'bg-amber-500/10 border-amber-500/20', dotColor: 'bg-amber-500', dotLabel: 'Amber dot = On Break' },
  off_duty: { label: 'Off Duty', color: 'text-gray-400', bgColor: 'bg-gray-500/10 border-gray-500/20', dotColor: 'bg-gray-400', dotLabel: 'Gray dot = Off Duty' },
  sleeper_berth: { label: 'Sleeper', color: 'text-blue-400', bgColor: 'bg-blue-500/10 border-blue-500/20', dotColor: 'bg-blue-400', dotLabel: 'Blue dot = Sleeper Berth' },
};

// ELD status simulation
type ELDStatus = 'connected' | 'syncing' | 'offline';
const eldStatusMap: Record<string, ELDStatus> = {
  'fv-001': 'connected',
  'fv-002': 'syncing',
  'fv-003': 'connected',
  'fv-004': 'connected',
  'fv-005': 'offline',
  'fv-006': 'connected',
  'fv-007': 'syncing',
  'fv-008': 'connected',
};

const eldStatusConfig: Record<ELDStatus, { label: string; dotColor: string; textColor: string; bgColor: string; icon: typeof Wifi }> = {
  connected: { label: 'Connected', dotColor: 'bg-emerald-500', textColor: 'text-emerald-500', bgColor: 'bg-emerald-500/10', icon: Wifi },
  syncing: { label: 'Syncing', dotColor: 'bg-amber-500', textColor: 'text-amber-500', bgColor: 'bg-amber-500/10', icon: RefreshCw },
  offline: { label: 'Offline', dotColor: 'bg-red-500', textColor: 'text-red-500', bgColor: 'bg-red-500/10', icon: WifiOff },
};

function FuelBar({ level }: { level: number }) {
  const color = level > 50 ? 'bg-emerald-500' : level > 25 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <Fuel className={`h-3.5 w-3.5 ${level > 50 ? 'text-emerald-500' : level > 25 ? 'text-amber-500' : 'text-red-500'}`} />
      <div className="w-16 h-2 bg-muted/50 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${level}%` }} />
      </div>
      <span className="text-xs text-muted-foreground w-8">{level}%</span>
    </div>
  );
}

function HOSBar({ hours }: { hours: number }) {
  const maxHours = 14;
  const percent = Math.min(100, (hours / maxHours) * 100);
  const color = hours >= 8 ? 'bg-emerald-500' : hours >= 4 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <Clock className={`h-3.5 w-3.5 ${hours >= 8 ? 'text-emerald-500' : hours >= 4 ? 'text-amber-500' : 'text-red-500'}`} />
      <div className="w-16 h-2 bg-muted/50 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${percent}%` }} />
      </div>
      <span className="text-xs text-muted-foreground w-12">{hours}h left</span>
    </div>
  );
}

function ELDStatusBadge({ vehicleId }: { vehicleId: string }) {
  const status = eldStatusMap[vehicleId] ?? 'connected';
  const config = eldStatusConfig[status];
  const Icon = config.icon;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full ${config.bgColor} cursor-default`}>
          <span className={`h-1.5 w-1.5 rounded-full ${config.dotColor}`} />
          <span className={`text-[10px] font-medium ${config.textColor}`}>{config.label}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <p className="text-xs font-medium">ELD: {config.label}</p>
        <p className="text-xs text-muted-foreground">
          {status === 'connected' ? 'Device online, data syncing in real-time' :
           status === 'syncing' ? 'Device connecting, data may be delayed' :
           'Device offline, last known data may be stale'}
        </p>
      </TooltipContent>
    </Tooltip>
  );
}

function getAlerts(vehicle: FleetVehicle): { type: string; severity: 'warning' | 'danger'; icon: React.ReactNode }[] {
  const alerts: { type: string; severity: 'warning' | 'danger'; icon: React.ReactNode }[] = [];
  if (vehicle.hosRemaining < 3) {
    alerts.push({ type: 'HOS Risk', severity: 'danger', icon: <Clock className="h-3.5 w-3.5" /> });
  }
  if (vehicle.speed > 70) {
    alerts.push({ type: 'Unsafe Speed', severity: 'danger', icon: <Gauge className="h-3.5 w-3.5" /> });
  }
  if (vehicle.fuelLevel < 30) {
    alerts.push({ type: 'Low Fuel', severity: vehicle.fuelLevel < 20 ? 'danger' : 'warning', icon: <Fuel className="h-3.5 w-3.5" /> });
  }
  if (vehicle.maintenanceWarning) {
    alerts.push({ type: 'Maintenance', severity: 'warning', icon: <Wrench className="h-3.5 w-3.5" /> });
  }
  return alerts;
}

export function FleetTraining() {
  const { navigate } = useAppStore();
  const [selectedVehicle, setSelectedVehicle] = useState<FleetVehicle | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const totalAlerts = useMemo(() => {
    return fleetVehicles.reduce((acc, v) => acc + getAlerts(v).length, 0);
  }, []);

  const drivingCount = fleetVehicles.filter((v) => v.driverStatus === 'driving').length;
  const idleCount = fleetVehicles.filter((v) => v.driverStatus === 'on_break').length;
  const maintenanceCount = fleetVehicles.filter((v) => v.maintenanceWarning).length;
  const availableCount = fleetVehicles.filter(
    (v) => v.driverStatus === 'off_duty' || v.driverStatus === 'sleeper_berth'
  ).length;
  const totalCount = fleetVehicles.length;

  const drivingPercent = Math.round((drivingCount / totalCount) * 100);
  const availablePercent = Math.round((availableCount / totalCount) * 100);
  const idlePercent = Math.round((idleCount / totalCount) * 100);
  const offDutyPercent = 100 - drivingPercent - availablePercent - idlePercent;

  const handleVehicleClick = (vehicle: FleetVehicle) => {
    setSelectedVehicle(vehicle);
    setDialogOpen(true);
  };

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
                Fleet Visibility Practice
              </h1>
              <p className="text-muted-foreground text-sm mt-0.5">
                Monitor and manage your fleet in real-time
              </p>
            </div>
          </div>
          {/* CTA Button */}
          <Button
            size="lg"
            className="gap-2"
            onClick={() => {
              toast.success('Fleet Training Module started! Practice monitoring your fleet and responding to alerts.', { duration: 4000 });
            }}
          >
            <PlayCircle className="h-5 w-5" />
            Start Fleet Training Module
          </Button>
        </div>

        {/* Fleet Status Overview Bar */}
        <Card>
          <CardContent className="py-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">Fleet Status Overview</p>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    Driving ({drivingCount})
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-blue-400" />
                    Available ({availableCount})
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                    Idle ({idleCount})
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-gray-400" />
                    Off Duty
                  </span>
                </div>
              </div>
              {/* Proportional bar */}
              <div className="flex h-4 w-full rounded-full overflow-hidden bg-muted/30">
                {drivingPercent > 0 && (
                  <div
                    className="bg-emerald-500 transition-all flex items-center justify-center"
                    style={{ width: `${drivingPercent}%` }}
                  >
                    {drivingPercent >= 15 && <span className="text-[9px] text-white font-medium">{drivingCount}</span>}
                  </div>
                )}
                {availablePercent > 0 && (
                  <div
                    className="bg-blue-400 transition-all flex items-center justify-center"
                    style={{ width: `${availablePercent}%` }}
                  >
                    {availablePercent >= 15 && <span className="text-[9px] text-white font-medium">{availableCount}</span>}
                  </div>
                )}
                {idlePercent > 0 && (
                  <div
                    className="bg-amber-500 transition-all flex items-center justify-center"
                    style={{ width: `${idlePercent}%` }}
                  >
                    {idlePercent >= 15 && <span className="text-[9px] text-white font-medium">{idleCount}</span>}
                  </div>
                )}
                {offDutyPercent > 0 && (
                  <div
                    className="bg-gray-400 transition-all flex items-center justify-center"
                    style={{ width: `${offDutyPercent}%` }}
                  />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards - improved spacing */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-2xl font-bold">{totalCount}</p>
              <p className="text-xs text-muted-foreground">Total Trucks</p>
            </CardContent>
          </Card>
          <Card className="border-emerald-500/20">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <p className="text-2xl font-bold text-emerald-500">{drivingCount}</p>
              </div>
              <p className="text-xs text-muted-foreground">Active</p>
            </CardContent>
          </Card>
          <Card className="border-amber-500/20">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <p className="text-2xl font-bold text-amber-500">{idleCount}</p>
              </div>
              <p className="text-xs text-muted-foreground">Idle</p>
            </CardContent>
          </Card>
          <Card className={maintenanceCount > 0 ? 'border-red-500/20' : 'border-emerald-500/20'}>
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${maintenanceCount > 0 ? 'bg-red-500' : 'bg-emerald-500'}`} />
                <p className={`text-2xl font-bold ${maintenanceCount > 0 ? 'text-red-500' : 'text-emerald-500'}`}>{maintenanceCount}</p>
              </div>
              <p className="text-xs text-muted-foreground">Maintenance</p>
            </CardContent>
          </Card>
        </div>

        {/* Fleet Health Dashboard */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Vehicle Health Overview */}
          <Card className="col-span-1 sm:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" /> Vehicle Health Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Good', count: fleetVehicles.filter(v => !v.maintenanceWarning && v.fuelLevel > 30).length, color: 'text-emerald-500', bg: 'bg-emerald-500/10', ring: 'stroke-emerald-500' },
                  { label: 'Warning', count: fleetVehicles.filter(v => v.maintenanceWarning || (v.fuelLevel <= 30 && v.fuelLevel > 20)).length, color: 'text-amber-500', bg: 'bg-amber-500/10', ring: 'stroke-amber-500' },
                  { label: 'Critical', count: fleetVehicles.filter(v => v.fuelLevel <= 20 || v.hosRemaining < 3).length, color: 'text-red-500', bg: 'bg-red-500/10', ring: 'stroke-red-500' },
                  { label: 'Offline', count: fleetVehicles.filter(v => eldStatusMap[v.id] === 'offline').length, color: 'text-gray-400', bg: 'bg-gray-500/10', ring: 'stroke-gray-400' },
                ].map((item) => (
                  <div key={item.label} className={cn('text-center p-3 rounded-lg relative overflow-hidden', item.bg)}>
                    <div className="relative mx-auto w-14 h-14 mb-1">
                      <svg className="w-14 h-14 -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="6" className="text-muted/20" />
                        <circle
                          cx="50" cy="50" r="40" fill="none"
                          className={cn('gauge-ring gauge-ring-animate', item.ring)}
                          strokeWidth="6" strokeLinecap="round"
                          strokeDasharray={251}
                          strokeDashoffset={251 - (251 * (item.count / totalCount))}
                          style={{ '--gauge-circumference': '251' } as React.CSSProperties}
                        />
                      </svg>
                      <span className={cn('absolute inset-0 flex items-center justify-center text-lg font-bold', item.color)}>
                        {item.count}
                      </span>
                    </div>
                    <p className={cn('text-xs font-medium', item.color)}>{item.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Inspection Checklist */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Daily Inspection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { label: 'Tire Pressure', checked: true },
                  { label: 'Brake System', checked: true },
                  { label: 'Lights & Signals', checked: true },
                  { label: 'Fluid Levels', checked: false },
                  { label: 'Coupling Devices', checked: true },
                  { label: 'Emergency Kit', checked: false },
                ].map((item, i) => (
                  <div key={item.label} className="flex items-center gap-2.5">
                    <div className={cn(
                      'h-5 w-5 rounded flex items-center justify-center transition-all',
                      item.checked ? 'bg-emerald-500' : 'bg-muted/50'
                    )}>
                      {item.checked && (
                        <svg className="h-3 w-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <path d="M5 12l5 5L20 7" className="inspection-checkmark" style={{ animationDelay: `${i * 0.1}s` }} />
                        </svg>
                      )}
                    </div>
                    <span className={cn('text-xs', item.checked ? 'text-foreground' : 'text-muted-foreground line-through')}>{item.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Maintenance Timeline */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Wrench className="h-4 w-4 text-amber-500" /> Maintenance Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-amber-500/30 via-primary/20 to-muted/20" />
              <div className="space-y-3">
                {[
                  { truck: 'T-101', service: 'Oil Change', due: 'Due now', status: 'overdue', icon: Wrench },
                  { truck: 'T-103', service: 'Brake Inspection', due: 'In 2 days', status: 'upcoming', icon: Shield },
                  { truck: 'T-105', service: 'Tire Rotation', due: 'In 5 days', status: 'scheduled', icon: Navigation },
                  { truck: 'T-107', service: 'ELD Recertification', due: 'In 12 days', status: 'scheduled', icon: Radio },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.1 }}
                    className="flex items-start gap-3 pl-0.5"
                  >
                    <div className={cn(
                      'h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 z-10',
                      item.status === 'overdue' ? 'bg-red-500/10 text-red-500' :
                      item.status === 'upcoming' ? 'bg-amber-500/10 text-amber-500' : 'bg-primary/10 text-primary'
                    )}>
                      <item.icon className="h-3 w-3" />
                    </div>
                    <div className="flex-1 min-w-0 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{item.truck} — {item.service}</p>
                        <p className="text-xs text-muted-foreground">{item.due}</p>
                      </div>
                      <Badge variant="secondary" className={cn(
                        'text-[9px]',
                        item.status === 'overdue' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                        item.status === 'upcoming' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-primary/10 text-primary border-primary/20'
                      )}>
                        {item.status}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Truck List Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Truck #</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>ELD</TableHead>
                    <TableHead>HOS</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-right">Speed</TableHead>
                    <TableHead>Fuel</TableHead>
                    <TableHead>Current Load</TableHead>
                    <TableHead>Next Appt</TableHead>
                    <TableHead>Maintenance</TableHead>
                    <TableHead>Alerts</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fleetVehicles.map((vehicle, rowIndex) => {
                    const status = statusConfig[vehicle.driverStatus];
                    const alerts = getAlerts(vehicle);
                    const isEvenRow = rowIndex % 2 === 0;
                    return (
                      <TableRow
                        key={vehicle.id}
                        className={cn(
                          'cursor-pointer hover:bg-muted/30 transition-colors',
                          isEvenRow ? 'bg-muted/5' : '',
                          vehicle.maintenanceWarning ? 'health-warning' : '',
                          vehicle.fuelLevel <= 20 || vehicle.hosRemaining < 3 ? 'health-critical' : '',
                          !vehicle.maintenanceWarning && vehicle.fuelLevel > 30 ? 'health-good' : ''
                        )}
                        onClick={() => handleVehicleClick(vehicle)}
                      >
                        <TableCell className="font-mono font-medium text-sm">{vehicle.truckNumber}</TableCell>
                        <TableCell className="text-sm">{vehicle.driverName}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={`text-[10px] gap-1.5 ${status.bgColor}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${status.dotColor}`} />
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <ELDStatusBadge vehicleId={vehicle.id} />
                        </TableCell>
                        <TableCell>
                          <HOSBar hours={vehicle.hosRemaining} />
                        </TableCell>
                        <TableCell className="text-sm">
                          {vehicle.location}, {vehicle.state}
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          {vehicle.speed > 0 ? (
                            <span className="flex items-center justify-end gap-1">
                              <Gauge className="h-3 w-3 text-emerald-500" />
                              {vehicle.speed} mph
                            </span>
                          ) : (
                            <span className="flex items-center justify-end gap-1 text-muted-foreground">
                              <CircleParking className="h-3 w-3 text-muted-foreground/50" />
                              Idle
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <FuelBar level={vehicle.fuelLevel} />
                        </TableCell>
                        <TableCell className="text-sm max-w-[200px] truncate">
                          {vehicle.currentLoad}
                        </TableCell>
                        <TableCell className="max-w-[180px]">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-xs text-muted-foreground truncate block cursor-default">
                                {vehicle.nextAppointment}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs">
                              <p className="text-xs">{vehicle.nextAppointment}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          {vehicle.maintenanceWarning ? (
                            <Badge variant="secondary" className="text-[9px] bg-amber-500/10 text-amber-500 border-amber-500/20 gap-1">
                              <Wrench className="h-2.5 w-2.5" />
                              {vehicle.maintenanceWarning.split(' ').slice(0, 3).join(' ')}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">OK</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {alerts.length > 0 ? (
                            <div className="flex items-center gap-1">
                              {alerts.map((alert, i) => (
                                <span
                                  key={i}
                                  className={`h-5 w-5 rounded-full flex items-center justify-center ${
                                    alert.severity === 'danger'
                                      ? 'bg-red-500/10 text-red-500'
                                      : 'bg-amber-500/10 text-amber-500'
                                  }`}
                                  title={alert.type}
                                >
                                  {alert.icon}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Detail Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            {selectedVehicle && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-primary" />
                    {selectedVehicle.truckNumber}
                  </DialogTitle>
                </DialogHeader>

                <div className="mt-2 space-y-6">
                  {/* Driver & Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                        <User className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{selectedVehicle.driverName}</p>
                        <p className="text-sm text-muted-foreground">Driver</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className={`gap-1.5 ${statusConfig[selectedVehicle.driverStatus].bgColor}`}>
                        <span className={`h-2 w-2 rounded-full ${statusConfig[selectedVehicle.driverStatus].dotColor}`} />
                        {statusConfig[selectedVehicle.driverStatus].label}
                      </Badge>
                      <ELDStatusBadge vehicleId={selectedVehicle.id} />
                    </div>
                  </div>

                  <Separator />

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <Card className="bg-muted/30">
                      <CardContent className="p-4 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" /> HOS Remaining
                        </div>
                        <p className={`text-xl font-bold ${selectedVehicle.hosRemaining < 3 ? 'text-red-500' : selectedVehicle.hosRemaining < 6 ? 'text-amber-500' : 'text-emerald-500'}`}>
                          {selectedVehicle.hosRemaining}h
                        </p>
                        <Progress
                          value={(selectedVehicle.hosRemaining / 14) * 100}
                          className={`h-1.5 ${selectedVehicle.hosRemaining < 3 ? '[&>div]:bg-red-500' : selectedVehicle.hosRemaining < 6 ? '[&>div]:bg-amber-500' : '[&>div]:bg-emerald-500'}`}
                        />
                      </CardContent>
                    </Card>
                    <Card className="bg-muted/30">
                      <CardContent className="p-4 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Fuel className="h-3 w-3" /> Fuel Level
                        </div>
                        <p className={`text-xl font-bold ${selectedVehicle.fuelLevel < 30 ? 'text-red-500' : selectedVehicle.fuelLevel < 50 ? 'text-amber-500' : 'text-emerald-500'}`}>
                          {selectedVehicle.fuelLevel}%
                        </p>
                        <Progress
                          value={selectedVehicle.fuelLevel}
                          className={`h-1.5 ${selectedVehicle.fuelLevel < 30 ? '[&>div]:bg-red-500' : selectedVehicle.fuelLevel < 50 ? '[&>div]:bg-amber-500' : '[&>div]:bg-emerald-500'}`}
                        />
                      </CardContent>
                    </Card>
                  </div>

                  {/* Vehicle Details */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold flex items-center gap-1.5">
                      <Activity className="h-4 w-4 text-primary" /> Vehicle Details
                    </h3>
                    <div className="space-y-2.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> Location</span>
                        <span className="font-medium">{selectedVehicle.location}, {selectedVehicle.state}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1.5"><Navigation className="h-3.5 w-3.5" /> Speed</span>
                        <span className="font-medium">
                          {selectedVehicle.speed > 0 ? (
                            <span className="flex items-center gap-1">
                              <Gauge className="h-3.5 w-3.5 text-emerald-500" />
                              {selectedVehicle.speed} mph
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <CircleParking className="h-3.5 w-3.5" />
                              Idle
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1.5"><Package className="h-3.5 w-3.5" /> Current Load</span>
                        <span className="font-medium text-right max-w-[200px]">{selectedVehicle.currentLoad}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1.5"><CalendarClock className="h-3.5 w-3.5" /> Next Appointment</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="font-medium text-right max-w-[200px] text-xs truncate cursor-default">
                              {selectedVehicle.nextAppointment}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <p className="text-xs">{selectedVehicle.nextAppointment}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1.5"><Milestone className="h-3.5 w-3.5" /> Mileage</span>
                        <span className="font-medium">{(Math.floor(Math.random() * 300000) + 100000).toLocaleString()} mi</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1.5"><Wrench className="h-3.5 w-3.5" /> Next Service</span>
                        <span className="font-medium">{selectedVehicle.maintenanceWarning ?? 'No upcoming service'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1.5"><Radio className="h-3.5 w-3.5" /> ELD Status</span>
                        <ELDStatusBadge vehicleId={selectedVehicle.id} />
                      </div>
                    </div>
                  </div>

                  {/* Alerts */}
                  {getAlerts(selectedVehicle).length > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <h3 className="text-sm font-semibold flex items-center gap-1.5">
                          <AlertTriangle className="h-4 w-4 text-amber-500" /> Active Alerts
                        </h3>
                        {getAlerts(selectedVehicle).map((alert, i) => (
                          <div
                            key={i}
                            className={`flex items-center gap-2 p-2 rounded-md text-sm ${
                              alert.severity === 'danger'
                                ? 'bg-red-500/5 text-red-500'
                                : 'bg-amber-500/5 text-amber-500'
                            }`}
                          >
                            {alert.icon}
                            <span>{alert.type}</span>
                          </div>
                        ))}
                        {selectedVehicle.maintenanceWarning && (
                          <div className="flex items-start gap-2 p-2 rounded-md text-sm bg-amber-500/5">
                            <Wrench className="h-3.5 w-3.5 text-amber-500 mt-0.5" />
                            <span className="text-amber-500">{selectedVehicle.maintenanceWarning}</span>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  <Separator />

                  {/* Practice Actions */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold flex items-center gap-1.5">
                      <Route className="h-4 w-4 text-primary" /> Practice Exercises
                    </h3>
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2"
                      onClick={() => {
                        toast.success('Dispatch exercise started! Review the load board to find a suitable load for this driver.', { duration: 4000 });
                        setDialogOpen(false);
                      }}
                    >
                      <Route className="h-4 w-4 text-primary" /> Dispatch Next Route
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2"
                      onClick={() => {
                        toast.success('Maintenance issue flagged! The shop has been notified.', { duration: 3000 });
                        setDialogOpen(false);
                      }}
                    >
                      <Wrench className="h-4 w-4 text-amber-500" /> Flag Maintenance Issue
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2"
                      onClick={() => {
                        const hosOk = selectedVehicle.hosRemaining >= 3;
                        toast[hosOk ? 'success' : 'error'](
                          hosOk
                            ? 'HOS compliance check passed! Driver has sufficient hours.'
                            : 'HOS compliance check FAILED! Driver does not have sufficient hours remaining.',
                          { duration: 4000 }
                        );
                      }}
                    >
                      <Shield className="h-4 w-4 text-emerald-500" /> HOS Compliance Check
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
