'use client';

import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { useAppStore } from '@/lib/store/app-store';

export function NotificationBell() {
  const { notifications, setNotificationPanelOpen } = useAppStore();

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative h-9 w-9"
      onClick={() => setNotificationPanelOpen(true)}
    >
      <Bell className="h-4 w-4" />
      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
      <span className="sr-only">Notifications</span>
    </Button>
  );
}
