import { Bell, Search, Plus } from 'lucide-react';
import { useState } from 'react';
import { useAppStore } from '@/store/app-store';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { notificationService } from '@/lib/firebase-service';

interface HeaderProps {
  title: string;
  subtitle?: string;
  action?: { label: string; onClick: () => void };
}

export function Header({ title, subtitle, action }: HeaderProps) {
  const { notifications, setNotifications } = useAppStore();
  const { user } = useAuthStore();
  const [showNotifs, setShowNotifs] = useState(false);
  const unread = notifications.filter(n => !n.isRead).length;

  const markRead = async (id: string) => {
    await notificationService.markRead(id);
    setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  return (
    <header className="flex items-center justify-between px-8 py-5 border-b border-slate-800/50 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-20">
      <div>
        <h1 className="text-xl font-bold text-slate-100">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        {action && (
          <Button onClick={action.onClick} size="md">
            <Plus className="w-4 h-4" />
            {action.label}
          </Button>
        )}
        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative w-9 h-9 rounded-xl bg-slate-800/80 border border-slate-700/50 flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-slate-700/80 transition-all"
          >
            <Bell className="w-4 h-4" />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand-500 text-white text-xs flex items-center justify-center">
                {unread}
              </span>
            )}
          </button>
          {showNotifs && (
            <div className="absolute right-0 top-12 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-100">Notifications</p>
                {unread > 0 && <span className="text-xs text-brand-400">{unread} unread</span>}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-slate-500 text-sm">No notifications</div>
                ) : notifications.map(n => (
                  <div
                    key={n.id}
                    onClick={() => markRead(n.id)}
                    className={`px-4 py-3 border-b border-slate-800/50 cursor-pointer hover:bg-slate-800/50 transition-colors ${!n.isRead ? 'bg-brand-500/5' : ''}`}
                  >
                    <div className="flex items-start gap-2">
                      {!n.isRead && <div className="w-1.5 h-1.5 rounded-full bg-brand-400 mt-1.5 flex-shrink-0" />}
                      <div className={!n.isRead ? '' : 'pl-3.5'}>
                        <p className="text-xs font-medium text-slate-200">{n.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                        <p className="text-xs text-slate-600 mt-1">{formatDate(n.createdAt, 'MMM dd, hh:mm a')}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
