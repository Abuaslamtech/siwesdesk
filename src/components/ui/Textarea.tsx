import React from 'react';
import { cn } from '../../utils/cn';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

export default function Textarea({
  label,
  error,
  hint,
  required,
  id,
  className,
  ...props
}: TextareaProps) {
  const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={textareaId}
          className="text-sm font-medium text-slate-700 select-none"
        >
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <textarea
        id={textareaId}
        rows={5}
        className={cn(
          'w-full rounded-md border bg-white text-slate-900 text-sm px-3 py-2.5',
          'placeholder:text-slate-400 resize-y transition-all duration-150',
          'focus:outline-none focus:ring-2 focus:ring-primary-700/30 focus:border-primary-700',
          error
            ? 'border-red-400'
            : 'border-border hover:border-slate-400',
          className,
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
      {!error && hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
