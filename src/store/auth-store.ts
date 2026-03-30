import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  firebaseUser: any | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setFirebaseUser: (fu: any | null) => void;
  setLoading: (v: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      firebaseUser: null,
      isLoading: true,
      setUser: (user) => set({ user }),
      setFirebaseUser: (firebaseUser) => set({ firebaseUser }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => set({ user: null, firebaseUser: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);
