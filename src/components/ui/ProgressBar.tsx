import { cn } from '../../utils/cn';

interface ProgressBarProps {
  value: number; // 0–100
  size?: 'sm' | 'md';
  color?: 'primary' | 'gold' | 'green' | 'red';
  showLabel?: boolean;
  className?: string;
  animated?: boolean;
}

const colorClasses: Record<string, string> = {
  primary: 'bg-primary-600',
  gold:    'bg-gold-400',
  green:   'bg-green-500',
  red:     'bg-red-500',
};

const sizeClasses: Record<string, string> = {
  sm: 'h-1.5',
  md: 'h-2.5',
};

export default function ProgressBar({
  value,
  size = 'md',
  color = 'primary',
  showLabel = false,
  className,
  animated = true,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className={cn(
          'flex-1 bg-slate-100 rounded-full overflow-hidden',
          sizeClasses[size],
        )}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={cn(
            'h-full rounded-full',
            colorClasses[color],
            animated && 'transition-all duration-500 ease-out',
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-slate-500 tabular-nums w-8 text-right">
          {clamped}%
        </span>
      )}
    </div>
  );
}
