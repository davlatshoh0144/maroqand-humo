'use client';

import { useMemo } from 'react';
import { useAppStore } from '@/lib/store/app-store';
import type { AppNotification, NotificationType } from '@/lib/types';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Bell,
  BookOpen,
  ClipboardList,
  Trophy,
  Settings,
  MessageSquare,
  Check,
  BellOff,
} from 'lucide-react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';

/** Get icon component for notification type */
function getNotifIcon(type: NotificationType) {
  switch (type) {
    case 'course_update':
      return <BookOpen className="h-4 w-4 text-primary" />;
    case 'assignment':
      return <ClipboardList className="h-4 w-4 text-amber-500" />;
    case 'achievement':
      return <Trophy className="h-4 w-4 text-emerald-500" />;
    case 'system':
      return <Settings className="h-4 w-4 text-muted-foreground" />;
    case 'discussion_reply':
      return <MessageSquare className="h-4 w-4 text-primary" />;
    default:
      return <Bell className="h-4 w-4 text-muted-foreground" />;
  }
}

/** Get background color for notification type icon container */
function getNotifIconBg(type: NotificationType) {
  switch (type) {
    case 'course_update':
      return 'bg-primary/10';
    case 'assignment':
      return 'bg-amber-500/10';
    case 'achievement':
      return 'bg-emerald-500/10';
    case 'system':
      return 'bg-muted';
    case 'discussion_reply':
      return 'bg-primary/10';
    default:
      return 'bg-muted';
  }
}

/** Format timestamp to relative time */
function formatRelativeTime(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay === 1) return 'Yesterday';
  if (diffDay < 7) return `${diffDay}d ago`;
  return then.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** Group key for a notification */
function getGroupKey(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffDay === 0) return 'Today';
  if (diffDay === 1) return 'Yesterday';
  return 'Earlier';
}

/** Stagger animation variants */
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] } },
};

/** A single notification item */
function NotificationItem({
  notification,
  onMarkRead,
}: {
  notification: AppNotification;
  onMarkRead: (id: string) => void;
}) {
  return (
    <motion.div variants={itemVariants}>
      <button
        className="w-full text-left flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
        onClick={() => onMarkRead(notification.id)}
      >
        {/* Icon with unread indicator */}
        <div className="relative mt-0.5 shrink-0">
          {!notification.read && (
            <span className="absolute -top-0.5 -left-0.5 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-background z-10" />
          )}
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-lg ${getNotifIconBg(notification.type)}`}
          >
            {getNotifIcon(notification.type)}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-1">
          <p
            className={`text-sm leading-tight ${
              notification.read
                ? 'text-muted-foreground'
                : 'font-medium text-foreground'
            }`}
          >
            {notification.title}
          </p>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {notification.message}
          </p>
          <p className="text-[10px] text-muted-foreground/70">
            {formatRelativeTime(notification.timestamp)}
          </p>
        </div>
      </button>
    </motion.div>
  );
}

export function NotificationCenter() {
  const {
    notifications,
    notificationPanelOpen,
    setNotificationPanelOpen,
    markNotificationRead,
    markAllNotificationsRead,
  } = useAppStore();

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Group notifications by Today / Yesterday / Earlier
  const grouped = useMemo(() => {
    const groups: Record<string, AppNotification[]> = {
      Today: [],
      Yesterday: [],
      Earlier: [],
    };
    // Sort by timestamp descending
    const sorted = [...notifications].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    for (const n of sorted) {
      const key = getGroupKey(n.timestamp);
      if (groups[key]) {
        groups[key].push(n);
      } else {
        groups.Earlier.push(n);
      }
    }
    return groups;
  }, [notifications]);

  return (
    <Sheet open={notificationPanelOpen} onOpenChange={setNotificationPanelOpen}>
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="px-4 pt-5 pb-3 space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SheetTitle className="text-lg font-bold">Notifications</SheetTitle>
              {unreadCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                  {unreadCount}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground hover:text-foreground"
                onClick={markAllNotificationsRead}
              >
                <Check className="mr-1 h-3 w-3" />
                Mark all as read
              </Button>
            )}
          </div>
          <SheetDescription className="text-xs text-muted-foreground">
            Stay updated on your courses, assignments, and achievements
          </SheetDescription>
        </SheetHeader>

        <Separator />

        {notifications.length > 0 ? (
          <ScrollArea className="flex-1">
            <div className="px-2 py-2">
              <AnimatePresence>
                {Object.entries(grouped).map(
                  ([groupLabel, items]) =>
                    items.length > 0 && (
                      <div key={groupLabel} className="mb-3">
                        <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                          {groupLabel}
                        </p>
                        <motion.div
                          variants={containerVariants}
                          initial="hidden"
                          animate="visible"
                        >
                          {items.map((notification) => (
                            <NotificationItem
                              key={notification.id}
                              notification={notification}
                              onMarkRead={markNotificationRead}
                            />
                          ))}
                        </motion.div>
                      </div>
                    )
                )}
              </AnimatePresence>
            </div>
          </ScrollArea>
        ) : (
          /* Empty state */
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted/30">
                <BellOff className="h-8 w-8 text-muted-foreground/40" />
              </div>
              <div>
                <p className="font-semibold text-foreground">No notifications</p>
                <p className="text-sm text-muted-foreground mt-1">
                  You&apos;re all caught up! New notifications will appear here.
                </p>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
