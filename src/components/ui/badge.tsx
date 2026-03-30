import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'ghost';
  className?: string;
  dot?: boolean;
  dotColor?: string;
}

const variants = {
  default: 'bg-slate-700/50 text-slate-300 border border-slate-600/50',
  success: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  warning: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  danger: 'bg-red-500/20 text-red-400 border border-red-500/30',
  info: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  ghost: 'bg-transparent text-slate-400',
};

export function Badge({ children, variant = 'default', className, dot, dotColor }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium', variants[variant], className)}>
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', dotColor || 'bg-current')} />}
      {children}
    </span>
  );
}
