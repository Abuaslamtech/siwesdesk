import React from 'react';
import { cn } from '../../utils/cn';
import Spinner from './Spinner';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-primary-700 hover:bg-primary-800 active:bg-primary-900 text-white shadow-sm',
  secondary:
    'bg-white border border-primary-700 text-primary-700 hover:bg-primary-50 active:bg-primary-100',
  danger:
    'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-sm',
  ghost:
    'bg-transparent hover:bg-primary-50 text-primary-700',
};

const sizeClasses: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2.5',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-md',
        'transition-all duration-150 cursor-pointer select-none',
        'focus-visible:outline-2 focus-visible:outline-primary-700 focus-visible:outline-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Spinner size={size === 'lg' ? 'md' : 'sm'} color="current" />
      ) : (
        leftIcon
      )}
      {children}
      {!loading && rightIcon}
    </button>
  );
}
