import React from 'react';
import { cn } from '../../utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
  required?: boolean;
}

export default function Input({
  label,
  error,
  hint,
  leftAddon,
  rightAddon,
  required,
  id,
  className,
  ...props
}: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-slate-700 select-none"
        >
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {leftAddon && (
          <div className="absolute left-3 text-slate-500 text-sm pointer-events-none">
            {leftAddon}
          </div>
        )}
        <input
          id={inputId}
          className={cn(
            'w-full rounded-md border bg-white text-slate-900 text-sm',
            'placeholder:text-slate-400 transition-all duration-150',
            'focus:outline-none focus:ring-2 focus:ring-primary-700/30 focus:border-primary-700',
            error
              ? 'border-red-400 focus:ring-red-400/30 focus:border-red-400'
              : 'border-border hover:border-slate-400',
            leftAddon ? 'pl-9' : 'pl-3',
            rightAddon ? 'pr-9' : 'pr-3',
            'h-10',
            className,
          )}
          {...props}
        />
        {rightAddon && (
          <div className="absolute right-3 text-slate-500 text-sm pointer-events-none">
            {rightAddon}
          </div>
        )}
      </div>
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">{error}</p>
      )}
      {!error && hint && (
        <p className="text-xs text-slate-500">{hint}</p>
      )}
    </div>
  );
}
