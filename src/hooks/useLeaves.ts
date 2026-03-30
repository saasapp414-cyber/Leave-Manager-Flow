import { useEffect, useState } from 'react';
import { leaveService } from '@/lib/firebase-service';
import { useAuthStore } from '@/store/auth-store';
import type { LeaveRequest } from '@/types';

export function useMyLeaves() {
  const { user } = useAuthStore();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const unsub = leaveService.subscribeToUserLeaves(user.uid, (data) => {
      setLeaves(data);
      setLoading(false);
    });
    return unsub;
  }, [user?.uid]);

  return { leaves, loading };
}

export function useOrgLeaves() {
  const { user } = useAuthStore();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const unsub = leaveService.subscribeToOrgLeaves(user.organizationId, (data) => {
      setLeaves(data);
      setLoading(false);
    });
    return unsub;
  }, [user?.organizationId]);

  return { leaves, loading };
}
