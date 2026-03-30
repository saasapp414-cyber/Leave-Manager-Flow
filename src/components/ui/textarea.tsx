import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && <label className="block text-sm font-medium text-slate-300">{label}</label>}
        <textarea
          ref={ref}
          className={cn(
            'w-full bg-slate-800/80 border rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 resize-none',
            'focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50',
            'transition-all duration-200',
            error ? 'border-red-500/50' : 'border-slate-700/50 hover:border-slate-600/50',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
