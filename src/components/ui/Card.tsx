import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const paddingClasses = {
  none: '',
  sm:   'p-4',
  md:   'p-5',
  lg:   'p-6',
};

export default function Card({
  children,
  className,
  padding = 'md',
  onClick,
}: CardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-lg shadow-card border border-border',
        paddingClasses[padding],
        onClick && 'cursor-pointer hover:shadow-md transition-shadow duration-150',
        className,
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter') onClick(); } : undefined}
    >
      {children}
    </div>
  );
}
