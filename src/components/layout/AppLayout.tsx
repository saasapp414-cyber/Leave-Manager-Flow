import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { useAuthStore } from '@/store/auth-store';
import { useAppStore } from '@/store/app-store';
import { notificationService } from '@/lib/firebase-service';

export function AppLayout() {
  const { user } = useAuthStore();
  const { setNotifications } = useAppStore();

  useEffect(() => {
    if (!user) return;
    const unsub = notificationService.subscribeToNotifications(user.uid, setNotifications);
    return unsub;
  }, [user?.uid]);

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-gradient-mesh">
        <Outlet />
      </main>
    </div>
  );
}
