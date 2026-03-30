import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, differenceInBusinessDays, isWeekend, parseISO } from 'date-fns';
import type { LeaveType, LeaveStatus, UserRole } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, fmt = 'MMM dd, yyyy') {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, fmt);
}

export function calculateWorkingDays(startDate: string, endDate: string, holidays: string[] = []): number {
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  let count = 0;
  const current = new Date(start);
  while (current <= end) {
    const dateStr = format(current, 'yyyy-MM-dd');
    if (!isWeekend(current) && !holidays.includes(dateStr)) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  return count;
}

export const LEAVE_TYPE_CONFIG: Record<LeaveType, { label: string; color: string; bgColor: string; icon: string }> = {
  annual: { label: 'Annual Leave', color: 'text-blue-400', bgColor: 'bg-blue-500/20', icon: '🏖️' },
  sick: { label: 'Sick Leave', color: 'text-red-400', bgColor: 'bg-red-500/20', icon: '🤒' },
  maternity: { label: 'Maternity Leave', color: 'text-pink-400', bgColor: 'bg-pink-500/20', icon: '🤱' },
  paternity: { label: 'Paternity Leave', color: 'text-cyan-400', bgColor: 'bg-cyan-500/20', icon: '👨‍👶' },
  unpaid: { label: 'Unpaid Leave', color: 'text-orange-400', bgColor: 'bg-orange-500/20', icon: '📋' },
  emergency: { label: 'Emergency Leave', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20', icon: '🚨' },
  compensatory: { label: 'Compensatory Leave', color: 'text-purple-400', bgColor: 'bg-purple-500/20', icon: '⚖️' },
};

export const STATUS_CONFIG: Record<LeaveStatus, { label: string; color: string; bgColor: string; dotColor: string }> = {
  pending: { label: 'Pending', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20', dotColor: 'bg-yellow-400' },
  manager_approved: { label: 'Manager Approved', color: 'text-blue-400', bgColor: 'bg-blue-500/20', dotColor: 'bg-blue-400' },
  approved: { label: 'Approved', color: 'text-emerald-400', bgColor: 'bg-emerald-500/20', dotColor: 'bg-emerald-400' },
  rejected: { label: 'Rejected', color: 'text-red-400', bgColor: 'bg-red-500/20', dotColor: 'bg-red-400' },
  cancelled: { label: 'Cancelled', color: 'text-slate-400', bgColor: 'bg-slate-500/20', dotColor: 'bg-slate-400' },
};

export const ROLE_CONFIG: Record<UserRole, { label: string; color: string }> = {
  employee: { label: 'Employee', color: 'text-slate-300' },
  manager: { label: 'Manager', color: 'text-blue-400' },
  hr_admin: { label: 'HR Admin', color: 'text-purple-400' },
  super_admin: { label: 'Super Admin', color: 'text-brand-400' },
};

export function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export function canApproveLeave(role: UserRole): boolean {
  return ['manager', 'hr_admin', 'super_admin'].includes(role);
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}
