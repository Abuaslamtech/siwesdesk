import React, { useState, useRef } from 'react';
import { cn } from '../../utils/cn';

interface TooltipProps {
  children: React.ReactElement;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export default function Tooltip({
  children,
  content,
  position = 'top',
}: TooltipProps) {
  const [visible, setVisible] = useState(false);

  const positionClasses: Record<string, string> = {
    top:    'bottom-full left-1/2 -translate-x-1/2 mb-1.5',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-1.5',
    left:   'right-full top-1/2 -translate-y-1/2 mr-1.5',
    right:  'left-full top-1/2 -translate-y-1/2 ml-1.5',
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && content && (
        <div
          className={cn(
            'absolute z-50 px-2.5 py-1.5 text-xs font-medium text-white bg-slate-800',
            'rounded-md whitespace-nowrap pointer-events-none shadow-sm',
            positionClasses[position],
          )}
          role="tooltip"
        >
          {content}
        </div>
      )}
    </div>
  );
}
