import { create } from 'zustand';
import type { LeaveRequest, Notification } from '@/types';

interface AppState {
  leaves: LeaveRequest[];
  notifications: Notification[];
  sidebarOpen: boolean;
  setLeaves: (leaves: LeaveRequest[]) => void;
  setNotifications: (notifs: Notification[]) => void;
  setSidebarOpen: (v: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  leaves: [],
  notifications: [],
  sidebarOpen: true,
  setLeaves: (leaves) => set({ leaves }),
  setNotifications: (notifications) => set({ notifications }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
}));
