import React from 'react';
import { cn } from '../../utils/cn';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  placeholder?: string;
  options: { value: string; label: string }[];
}

export default function Select({
  label,
  error,
  hint,
  required,
  placeholder,
  options,
  id,
  className,
  ...props
}: SelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={selectId}
          className="text-sm font-medium text-slate-700 select-none"
        >
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <select
        id={selectId}
        className={cn(
          'w-full rounded-md border bg-white text-slate-900 text-sm h-10 px-3',
          'transition-all duration-150 cursor-pointer appearance-none',
          'focus:outline-none focus:ring-2 focus:ring-primary-700/30 focus:border-primary-700',
          error
            ? 'border-red-400 focus:ring-red-400/30 focus:border-red-400'
            : 'border-border hover:border-slate-400',
          // Arrow icon via bg
          "bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E\")] bg-no-repeat bg-[right_0.5rem_center] bg-[length:20px] pr-8",
          className,
        )}
        {...props}
      >
        {placeholder && (
          <option value="">{placeholder}</option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
      {!error && hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
