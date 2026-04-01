import React from 'react';
import { cn } from '../../utils/cn';
import Button from './Button';
import Spinner from './Spinner';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyState?: React.ReactNode;
  onRowClick?: (row: T) => void;
  keyExtractor: (row: T) => string;
  className?: string;
}

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 skeleton rounded" style={{ width: i === 0 ? '60%' : '80%' }} />
        </td>
      ))}
    </tr>
  );
}

export default function Table<T>({
  columns,
  data,
  loading = false,
  emptyState,
  onRowClick,
  keyExtractor,
  className,
}: TableProps<T>) {
  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <div className={cn('overflow-x-auto rounded-lg border border-border', className)}>
      <table className="w-full text-sm">
        <thead className="bg-slate-50 border-b border-border">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  'px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap',
                  alignClass[col.align ?? 'left'],
                )}
                style={col.width ? { width: col.width } : undefined}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-white">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <SkeletonRow key={i} cols={columns.length} />
            ))
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="py-16 text-center"
              >
                {emptyState ?? (
                  <p className="text-slate-400 text-sm">No data found</p>
                )}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={keyExtractor(row)}
                className={cn(
                  'transition-colors',
                  onRowClick
                    ? 'cursor-pointer hover:bg-primary-50'
                    : 'hover:bg-slate-50/50',
                )}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      'px-4 py-3 text-slate-700',
                      alignClass[col.align ?? 'left'],
                    )}
                  >
                    {col.render
                      ? col.render(row)
                      : String((row as Record<string, unknown>)[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
