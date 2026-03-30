import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  onClick?: () => void;
}

export function Card({ children, className, hover, glow, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-slate-900/80 border border-slate-800/80 rounded-2xl backdrop-blur-sm',
        hover && 'hover:border-slate-700/80 hover:shadow-card-hover transition-all duration-300 cursor-pointer',
        glow && 'hover:border-brand-500/30 hover:shadow-glow-sm',
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('p-6 pb-0', className)}>{children}</div>;
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('p-6', className)}>{children}</div>;
}
