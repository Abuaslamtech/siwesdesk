import React from 'react';
import { cn } from '../../utils/cn';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: string;
  color?: 'default' | 'primary' | 'gold' | 'green' | 'red';
  loading?: boolean;
  className?: string;
}

const colorSchemes = {
  default: { icon: 'bg-slate-50 text-slate-600', text: 'text-slate-900' },
  primary: { icon: 'bg-primary-50 text-primary-700', text: 'text-primary-700' },
  gold:    { icon: 'bg-gold-50 text-gold-700', text: 'text-gold-700' },
  green:   { icon: 'bg-green-50 text-green-700', text: 'text-green-700' },
  red:     { icon: 'bg-red-50 text-red-600', text: 'text-red-600' },
};

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'default',
  loading = false,
  className,
}: StatCardProps) {
  const scheme = colorSchemes[color];

  if (loading) {
    return (
      <div className={cn('bg-white rounded-lg shadow-card border border-border p-5 space-y-3', className)}>
        <div className="h-4 skeleton rounded w-24" />
        <div className="h-8 skeleton rounded w-16" />
        <div className="h-3 skeleton rounded w-32" />
      </div>
    );
  }

  return (
    <div className={cn('bg-white rounded-lg shadow-card border border-border p-5', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{title}</p>
          <p className={cn('text-3xl font-heading font-bold mt-1', scheme.text)}>
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-1 truncate">{subtitle}</p>
          )}
          {trend && (
            <p className="text-xs text-green-600 mt-1 font-medium">{trend}</p>
          )}
        </div>
        {icon && (
          <div className={cn('p-2.5 rounded-lg flex-shrink-0', scheme.icon)}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
