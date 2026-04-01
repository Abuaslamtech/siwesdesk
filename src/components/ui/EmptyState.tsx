import React from 'react';
import { AlertCircle } from 'lucide-react';
import Button from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center gap-4">
      <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
        {icon ?? <AlertCircle className="w-6 h-6" />}
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
        {description && (
          <p className="text-sm text-slate-500 max-w-xs">{description}</p>
        )}
      </div>
      {action && (
        <Button variant="secondary" size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
