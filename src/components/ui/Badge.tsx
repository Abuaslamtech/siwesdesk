import { cn } from '../../utils/cn';

type BadgeVariant = 'success' | 'warning' | 'error' | 'pending' | 'neutral' | 'info' | 'assigned';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

const variantClasses: Record<BadgeVariant, string> = {
  success:  'bg-green-100 text-green-700',
  warning:  'bg-amber-100 text-amber-700',
  error:    'bg-red-100 text-red-600',
  pending:  'bg-amber-100 text-amber-700',
  neutral:  'bg-slate-100 text-slate-500',
  info:     'bg-blue-100 text-blue-700',
  assigned: 'bg-primary-100 text-primary-700',
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'text-xs px-1.5 py-0.5',
  md: 'text-sm px-2.5 py-1',
};

export default function Badge({
  variant = 'neutral',
  size = 'sm',
  children,
  className,
  dot = false,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium whitespace-nowrap',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
    >
      {dot && (
        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
      )}
      {children}
    </span>
  );
}
