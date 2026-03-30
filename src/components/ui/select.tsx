import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && <label className="block text-sm font-medium text-slate-300">{label}</label>}
        <div className="relative">
          <select
            ref={ref}
            className={cn(
              'w-full bg-slate-800/80 border rounded-xl px-4 py-2.5 text-sm text-slate-100 appearance-none',
              'focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50',
              'transition-all duration-200',
              error ? 'border-red-500/50' : 'border-slate-700/50 hover:border-slate-600/50',
              className
            )}
            {...props}
          >
            {options.map(o => <option key={o.value} value={o.value} className="bg-slate-800">{o.label}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';
