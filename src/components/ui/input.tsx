import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, className, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && <label className="block text-sm font-medium text-slate-300">{label}</label>}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">{leftIcon}</div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full bg-slate-800/80 border rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500',
              'focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50',
              'transition-all duration-200',
              error ? 'border-red-500/50' : 'border-slate-700/50 hover:border-slate-600/50',
              leftIcon && 'pl-10',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
        {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
