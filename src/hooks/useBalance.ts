import { useEffect, useState } from 'react';
import { balanceService } from '@/lib/firebase-service';
import { useAuthStore } from '@/store/auth-store';
import type { LeaveBalance } from '@/types';

export function useBalance(userId?: string) {
  const { user } = useAuthStore();
  const targetId = userId || user?.uid;
  const [balance, setBalance] = useState<LeaveBalance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!targetId) return;
    const year = new Date().getFullYear();
    const unsub = balanceService.subscribeToBalance(targetId, year, (data) => {
      setBalance(data);
      setLoading(false);
    });
    return unsub;
  }, [targetId]);

  return { balance, loading };
}
