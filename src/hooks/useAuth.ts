import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { userService, balanceService } from '@/lib/firebase-service';
import { useAuthStore } from '@/store/auth-store';

export function useAuth() {
  const { user, firebaseUser, isLoading, setUser, setFirebaseUser, setLoading, logout } = useAuthStore();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      if (firebaseUser) {
        try {
          const userData = await userService.getUser(firebaseUser.uid);
          setUser(userData);
        } catch (e) {
          console.error('Error fetching user:', e);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  return { user, firebaseUser, isLoading, logout };
}
