import { cn } from '../../utils/cn';

type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg';

interface SpinnerProps {
  size?: SpinnerSize;
  color?: 'primary' | 'white' | 'current';
  className?: string;
}

const sizeMap: Record<SpinnerSize, string> = {
  xs: 'w-3 h-3 border-[1.5px]',
  sm: 'w-4 h-4 border-2',
  md: 'w-5 h-5 border-2',
  lg: 'w-8 h-8 border-[3px]',
};

const colorMap: Record<string, string> = {
  primary: 'border-primary-200 border-t-primary-700',
  white:   'border-white/30 border-t-white',
  current: 'border-current/20 border-t-current',
};

export default function Spinner({
  size = 'md',
  color = 'primary',
  className,
}: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        'rounded-full animate-spin',
        sizeMap[size],
        colorMap[color],
        className,
      )}
    />
  );
}
